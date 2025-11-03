import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createClient as createAdminClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserRegistrationRequest {
  email: string
  password: string
  fullName?: string
  username?: string
  inviteCode?: string
  sendWelcomeEmail?: boolean
  generateAvatar?: boolean
}

interface UserRegistrationResponse {
  success: boolean
  user?: {
    id: string
    email: string
    created_at: string
  }
  profile?: {
    id: string
    user_id: string
    email: string
    full_name?: string
    username?: string
    avatar_url?: string
  }
  message: string
  welcomeEmailQueued?: boolean
  avatarGenerated?: boolean
}

// Generate a default avatar based on username or email
function generateAvatarUrl(name: string): string {
  const baseUrl = 'https://ui-avatars.com/api/'
  const params = new URLSearchParams({
    name: name,
    size: '128',
    background: '007bff',
    color: 'fff',
    bold: 'true',
    format: 'png'
  })
  return `${baseUrl}?${params.toString()}`
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      email,
      password,
      fullName,
      username,
      inviteCode,
      sendWelcomeEmail = true,
      generateAvatar = true
    }: UserRegistrationRequest = await req.json()

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password
    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const supabaseAdmin = createAdminClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if invite code is valid (if provided)
    let inviteCodeId = null
    if (inviteCode) {
      const { data: inviteData, error: inviteError } = await supabaseClient
        .from('invite_codes')
        .select('id, uses_left, is_active, expires_at')
        .eq('code', inviteCode)
        .single()

      if (inviteError || !inviteData) {
        return new Response(
          JSON.stringify({ error: 'Invalid invite code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!inviteData.is_active || inviteData.uses_left <= 0 ||
          (inviteData.expires_at && new Date(inviteData.expires_at) < new Date())) {
        return new Response(
          JSON.stringify({ error: 'Invite code is expired or already used' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      inviteCodeId = inviteData.id
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingUser?.user) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if username already exists (if provided)
    if (username) {
      const { data: existingUsername } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUsername) {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create user with admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    })

    if (userError || !userData.user) {
      console.error('User creation error:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = userData.user

    // Generate avatar URL if requested
    let avatarUrl = null
    if (generateAvatar) {
      const displayName = fullName || username || email.split('@')[0]
      avatarUrl = generateAvatarUrl(displayName)
    }

    // Update profile with additional information
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: fullName,
        username: username || email.split('@')[0],
        avatar_url: avatarUrl,
        invite_code_id: inviteCodeId,
        email_verified: true
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail the registration if profile update fails, just log it
    }

    // Use invite code if provided
    if (inviteCodeId) {
      const { error: useInviteError } = await supabaseClient.rpc('use_invite_code', {
        code_param: inviteCode,
        user_id_param: user.id
      })

      if (useInviteError) {
        console.error('Invite code usage error:', useInviteError)
        // Don't fail registration, but log the error
      }
    }

    // Queue welcome email if requested
    let welcomeEmailQueued = false
    if (sendWelcomeEmail) {
      try {
        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            templateName: 'welcome',
            templateData: {
              fullName,
              email,
              appName: 'Burger Shop Demo'
            }
          })
        })

        if (emailResponse.ok) {
          welcomeEmailQueued = true
        }
      } catch (emailError) {
        console.error('Welcome email queue error:', emailError)
        // Don't fail registration if email fails
      }
    }

    // Log the registration
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'user_registration',
        table_name: 'profiles',
        new_values: {
          email,
          full_name: fullName,
          username: username,
          invite_code_used: !!inviteCode,
          welcome_email_queued: welcomeEmailQueued,
          avatar_generated: generateAvatar
        },
      })

    const response: UserRegistrationResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      message: 'User registration successful',
      welcomeEmailQueued,
      avatarGenerated: generateAvatar
    }

    if (profileData) {
      response.profile = {
        id: profileData.id,
        user_id: profileData.user_id,
        email: profileData.email,
        full_name: profileData.full_name,
        username: profileData.username,
        avatar_url: profileData.avatar_url
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('User registration function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
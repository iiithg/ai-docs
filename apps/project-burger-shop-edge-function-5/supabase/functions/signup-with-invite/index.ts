import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createClient as createAdminClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignupWithInviteRequest {
  email: string
  password: string
  inviteCode: string
  fullName?: string
  username?: string
}

interface SignupWithInviteResponse {
  success: boolean
  message: string
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
  }
  inviteCodeInfo?: {
    code: string
    remaining_uses: number
  }
}

function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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
      inviteCode,
      fullName,
      username
    }: SignupWithInviteRequest = await req.json()

    // Validate required fields
    if (!email || !password || !inviteCode) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and invite code are required' }),
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

    // Start transaction by using RPC function or manual steps
    // Step 1: Validate and lock invite code
    const { data: inviteData, error: inviteError } = await supabaseClient
      .from('invite_codes')
      .select('id, code, max_uses, used_count, uses_left, is_active, expires_at')
      .eq('code', inviteCode.toUpperCase().trim())
      .single()

    if (inviteError || !inviteData) {
      return new Response(
        JSON.stringify({ error: 'Invalid invite code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate invite code
    if (!inviteData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Invite code is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (inviteData.uses_left <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invite code has been fully used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invite code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingUser?.user) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Check if username already exists (if provided)
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

    // Step 4: Create user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        invite_code: inviteData.code
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

    try {
      // Step 5: Update invite code usage (in a transaction-like manner)
      const { error: updateInviteError } = await supabaseClient
        .from('invite_codes')
        .update({
          used_count: inviteData.used_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteData.id)
        .eq('used_count', inviteData.used_count) // Ensure it hasn't changed since we read it

      if (updateInviteError) {
        // Rollback user creation
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        console.error('Invite code update error:', updateInviteError)
        return new Response(
          JSON.stringify({ error: 'Failed to use invite code - user creation rolled back' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Step 6: Update user profile with invite code reference
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          full_name: fullName,
          username: username || email.split('@')[0],
          invite_code_id: inviteData.id,
          email_verified: true
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't fail the registration, but log it
      }

      // Step 7: Queue welcome email
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
              appName: 'Burger Shop Demo - Invite Only'
            }
          })
        })

        if (!emailResponse.ok) {
          console.error('Welcome email queue failed')
        }
      } catch (emailError) {
        console.error('Welcome email queue error:', emailError)
      }

      // Step 8: Log the successful registration
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'user_registration_with_invite',
          table_name: 'profiles',
          old_values: { invite_code: inviteData.code },
          new_values: {
            email,
            full_name: fullName,
            username: username,
            invite_code_id: inviteData.id
          },
        })

      // Get updated invite code info
      const { data: updatedInviteData } = await supabaseClient
        .from('invite_codes')
        .select('code, uses_left')
        .eq('id', inviteData.id)
        .single()

      const response: SignupWithInviteResponse = {
        success: true,
        message: 'User registration successful with invite code',
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        inviteCodeInfo: updatedInviteData ? {
          code: updatedInviteData.code,
          remaining_uses: updatedInviteData.uses_left
        } : undefined
      }

      if (profileData) {
        response.profile = {
          id: profileData.id,
          user_id: profileData.user_id,
          email: profileData.email,
          full_name: profileData.full_name,
          username: profileData.username
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

    } catch (rollbackError) {
      // If anything fails after user creation, try to rollback
      console.error('Post-creation error, attempting rollback:', rollbackError)
      try {
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        // Also rollback invite code usage
        await supabaseClient
          .from('invite_codes')
          .update({
            used_count: inviteData.used_count,
            updated_at: new Date().toISOString()
          })
          .eq('id', inviteData.id)
      } catch (rollbackFailure) {
        console.error('Rollback failed:', rollbackFailure)
      }

      return new Response(
        JSON.stringify({ error: 'Registration failed and has been rolled back' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Signup with invite function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
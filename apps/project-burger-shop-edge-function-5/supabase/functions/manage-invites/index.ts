import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateInviteRequest {
  description?: string
  maxUses?: number
  expiresAt?: string
  recipientEmail?: string
}

interface InviteResponse {
  id: string
  code: string
  description: string
  max_uses: number
  used_count: number
  uses_left: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const method = req.method

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin (you can implement your own admin check logic)
    // For demo purposes, we'll allow any authenticated user to manage invites
    // In production, you might want to check against an admin role

    // Handle different HTTP methods
    switch (method) {
      case 'GET': {
        // List invite codes
        const { data: invites, error: invitesError } = await supabaseClient
          .from('invite_codes')
          .select('*')
          .order('created_at', { ascending: false })

        if (invitesError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch invite codes' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ invites }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'POST': {
        // Create new invite code
        const {
          description = '',
          maxUses = 1,
          expiresAt,
          recipientEmail
        }: CreateInviteRequest = await req.json()

        // Validate max uses
        if (maxUses < 1 || maxUses > 1000) {
          return new Response(
            JSON.stringify({ error: 'Max uses must be between 1 and 1000' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate expiration date if provided
        let expirationDate = null
        if (expiresAt) {
          expirationDate = new Date(expiresAt)
          if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
            return new Response(
              JSON.stringify({ error: 'Expiration date must be in the future' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          expirationDate = expirationDate.toISOString()
        }

        // Generate unique code
        let code = generateRandomCode()
        let attempts = 0
        const maxAttempts = 10

        // Ensure code is unique
        while (attempts < maxAttempts) {
          const { data: existingCode } = await supabaseClient
            .from('invite_codes')
            .select('id')
            .eq('code', code)
            .single()

          if (!existingCode) break

          code = generateRandomCode()
          attempts++
        }

        if (attempts >= maxAttempts) {
          return new Response(
            JSON.stringify({ error: 'Failed to generate unique invite code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create invite code
        const { data: newInvite, error: createError } = await supabaseClient
          .from('invite_codes')
          .insert({
            code,
            description,
            max_uses: maxUses,
            is_active: true,
            expires_at: expirationDate,
            created_by: user.id
          })
          .select()
          .single()

        if (createError || !newInvite) {
          return new Response(
            JSON.stringify({ error: 'Failed to create invite code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send invite email if recipient email provided
        if (recipientEmail) {
          try {
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: recipientEmail,
                templateName: 'invite-code',
                templateData: {
                  fullName: recipientEmail.split('@')[0],
                  inviteCode: code,
                  appName: 'Burger Shop Demo'
                }
              })
            })

            if (emailResponse.ok) {
              console.log('Invite email sent successfully')
            }
          } catch (emailError) {
            console.error('Failed to send invite email:', emailError)
            // Don't fail the creation if email fails
          }
        }

        // Log the action
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'invite_code_created',
            table_name: 'invite_codes',
            new_values: {
              code,
              description,
              max_uses: maxUses,
              expires_at: expirationDate,
              recipient_email: recipientEmail
            },
          })

        return new Response(
          JSON.stringify(newInvite),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'PUT': {
        // Update invite code
        const inviteId = url.searchParams.get('id')
        if (!inviteId) {
          return new Response(
            JSON.stringify({ error: 'Invite ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const updateData = await req.json()

        // Prevent updating certain fields
        delete updateData.code
        delete updateData.used_count
        delete updateData.created_by
        delete updateData.created_at

        const { data: updatedInvite, error: updateError } = await supabaseClient
          .from('invite_codes')
          .update(updateData)
          .eq('id', inviteId)
          .select()
          .single()

        if (updateError || !updatedInvite) {
          return new Response(
            JSON.stringify({ error: 'Failed to update invite code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Log the action
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'invite_code_updated',
            table_name: 'invite_codes',
            record_id: inviteId,
            new_values: updateData,
          })

        return new Response(
          JSON.stringify(updatedInvite),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'DELETE': {
        // Delete/deactivate invite code
        const inviteId = url.searchParams.get('id')
        if (!inviteId) {
          return new Response(
            JSON.stringify({ error: 'Invite ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: deletedInvite, error: deleteError } = await supabaseClient
          .from('invite_codes')
          .update({ is_active: false })
          .eq('id', inviteId)
          .select()
          .single()

        if (deleteError || !deletedInvite) {
          return new Response(
            JSON.stringify({ error: 'Failed to deactivate invite code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Log the action
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'invite_code_deactivated',
            table_name: 'invite_codes',
            record_id: inviteId,
          })

        return new Response(
          JSON.stringify({ message: 'Invite code deactivated successfully' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Manage invites function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
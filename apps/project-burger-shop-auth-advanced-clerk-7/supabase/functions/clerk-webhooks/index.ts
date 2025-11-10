import { createClient } from 'npm:@supabase/supabase-js'
import { verifyWebhook } from 'npm:@clerk/backend/webhooks'

Deno.serve(async (req) => {
  // Verify webhook signature
  const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET')

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const event = await verifyWebhook(req, { signingSecret: webhookSecret })

  // Create supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response('Supabase credentials not configured', { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  switch (event.type) {
    case 'user.created': {
      // Handle user creation
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            id: event.data.id,
            first_name: event.data.first_name,
            last_name: event.data.last_name,
            avatar_url: event.data.image_url,
            email_address: event.data.email_addresses?.[0]?.email_address,
            username: event.data.username,
            created_at: new Date(event.data.created_at).toISOString(),
            updated_at: new Date(event.data.updated_at).toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ user }), { status: 200 })
    }

    case 'user.updated': {
      // Handle user update
      const { data: user, error } = await supabase
        .from('users')
        .update({
          first_name: event.data.first_name,
          last_name: event.data.last_name,
          avatar_url: event.data.image_url,
          email_address: event.data.email_addresses?.[0]?.email_address,
          username: event.data.username,
          updated_at: new Date(event.data.updated_at).toISOString(),
        })
        .eq('id', event.data.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ user }), { status: 200 })
    }

    case 'user.deleted': {
      // Handle user deletion
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', event.data.id)

      if (error) {
        console.error('Error deleting user:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    case 'organization.created': {
      // Handle organization creation
      const { data, error } = await supabase
        .from('organizations')
        .insert([
          {
            id: event.data.id,
            name: event.data.name,
            slug: event.data.slug,
            created_at: new Date(event.data.created_at).toISOString(),
            updated_at: new Date(event.data.updated_at).toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating organization:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organization.updated': {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: event.data.name,
          slug: event.data.slug,
          updated_at: new Date(event.data.updated_at).toISOString(),
        })
        .eq('id', event.data.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating organization:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organization.deleted': {
      // Handle organization deletion
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', event.data.id)

      if (error) {
        console.error('Error deleting organization:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    case 'organizationMembership.created': {
      const { data, error } = await supabase
        .from('organization_memberships')
        .insert([
          {
            id: event.data.id,
            user_id: event.data.public_user_data?.user_id,
            organization_id: event.data.organization?.id,
            role: event.data.role,
            created_at: new Date(event.data.created_at).toISOString(),
            updated_at: new Date(event.data.updated_at).toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating organization membership:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organizationMembership.updated': {
      const { data, error } = await supabase
        .from('organization_memberships')
        .update({
          user_id: event.data.public_user_data?.user_id,
          organization_id: event.data.organization?.id,
          role: event.data.role,
          updated_at: new Date(event.data.updated_at).toISOString(),
        })
        .eq('id', event.data.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating organization membership:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ data }), { status: 200 })
    }

    case 'organizationMembership.deleted': {
      // Handle organization membership deletion
      const { error } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', event.data.id)

      if (error) {
        console.error('Error deleting organization membership:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    default: {
      // Unhandled event type
      console.log('Unhandled event type:', JSON.stringify(event, null, 2))
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }
  }
})
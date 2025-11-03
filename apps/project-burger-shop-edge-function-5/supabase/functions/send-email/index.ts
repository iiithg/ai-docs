import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string | string[]
  subject: string
  content?: string
  templateName?: string
  templateData?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email templates
const templates: Record<string, (data: any) => EmailTemplate> = {
  welcome: (data: { fullName?: string; email: string; appName?: string }) => ({
    subject: `Welcome to ${data.appName || 'Our App'}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${data.appName || 'Our App'}!</h2>
        <p>Hi ${data.fullName || 'there'},</p>
        <p>Thank you for signing up for ${data.appName || 'our application'}. We're excited to have you on board!</p>
        <p>Your account has been successfully created with the email: <strong>${data.email}</strong></p>
        <p>If you have any questions or need help getting started, please don't hesitate to reach out to our support team.</p>
        <br>
        <p>Best regards,<br>The ${data.appName || 'Our App'} Team</p>
      </div>
    `,
    text: `Welcome to ${data.appName || 'Our App'}!\n\nHi ${data.fullName || 'there'},\n\nThank you for signing up for ${data.appName || 'our application'}. We're excited to have you on board!\n\nYour account has been successfully created with the email: ${data.email}\n\nIf you have any questions or need help getting started, please don't hesitate to reach out to our support team.\n\nBest regards,\nThe ${data.appName || 'Our App'} Team`
  }),

  'reset-password': (data: { fullName?: string; resetLink: string; appName?: string }) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hi ${data.fullName || 'there'},</p>
        <p>We received a request to reset your password for your ${data.appName || 'application'} account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p><small>This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.</small></p>
        <br>
        <p>Best regards,<br>The ${data.appName || 'Our App'} Team</p>
      </div>
    `,
    text: `Reset Your Password\n\nHi ${data.fullName || 'there'},\n\nWe received a request to reset your password for your ${data.appName || 'application'} account.\n\nClick the link below to reset your password:\n${data.resetLink}\n\nThis link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.\n\nBest regards,\nThe ${data.appName || 'Our App'} Team`
  }),

  'invite-code': (data: { fullName?: string; inviteCode: string; appName?: string }) => ({
    subject: 'Your Invitation Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're Invited!</h2>
        <p>Hi ${data.fullName || 'there'},</p>
        <p>You've been invited to join ${data.appName || 'our exclusive app'}!</p>
        <p>Use the following invitation code to register:</p>
        <div style="background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="color: #007bff; letter-spacing: 2px; font-size: 24px; margin: 0;">${data.inviteCode}</h3>
        </div>
        <p><small>This invitation code may have limited uses or expire. Please use it soon.</small></p>
        <br>
        <p>Best regards,<br>The ${data.appName || 'Our App'} Team</p>
      </div>
    `,
    text: `You're Invited!\n\nHi ${data.fullName || 'there'},\n\nYou've been invited to join ${data.appName || 'our exclusive app'}!\n\nUse the following invitation code to register:\n${data.inviteCode}\n\nThis invitation code may have limited uses or expire. Please use it soon.\n\nBest regards,\nThe ${data.appName || 'Our App'} Team`
  })
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, content, templateName, templateData, priority = 'normal' }: EmailRequest = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Recipient email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!subject && !templateName) {
      return new Response(
        JSON.stringify({ error: 'Either subject or templateName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (templateName && !templates[templateName]) {
      return new Response(
        JSON.stringify({ error: `Template '${templateName}' not found` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authenticated user (if available)
    const authHeader = req.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      const { data: { user }, error } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (!error && user) {
        userId = user.id
      }
    }

    // Prepare email content
    let finalSubject = subject
    let finalContent = content
    let htmlContent = null

    if (templateName && templates[templateName]) {
      const template = templates[templateName](templateData || {})
      finalSubject = template.subject
      finalContent = template.text
      htmlContent = template.html
    }

    // Handle multiple recipients
    const recipients = Array.isArray(to) ? to : [to]

    // Queue emails for each recipient
    const emailQueues = recipients.map(recipientEmail =>
      supabaseClient
        .from('email_queue')
        .insert({
          to_email: recipientEmail,
          subject: finalSubject,
          content: htmlContent || finalContent,
          template_name: templateName,
          template_data: templateData || {},
          status: 'pending'
        })
    )

    // Wait for all emails to be queued
    const results = await Promise.allSettled(emailQueues)

    // Check if any failed
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length > 0) {
      console.error('Some emails failed to queue:', failures)
      return new Response(
        JSON.stringify({ error: 'Failed to queue some emails' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the email send request
    if (userId) {
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'email_queued',
          table_name: 'email_queue',
          new_values: {
            recipients,
            template: templateName,
            priority
          },
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email${recipients.length > 1 ? 's' : ''} queued successfully`,
        queuedCount: recipients.length,
        recipients,
        template: templateName
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Send email function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
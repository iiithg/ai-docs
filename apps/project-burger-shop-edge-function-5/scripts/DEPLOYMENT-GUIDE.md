# Edge Functions Deployment Guide

This guide explains how to deploy and configure all the Edge Functions after running the database initialization script.

## 🚀 Quick Start

### 1. Run Database Initialization

```bash
# Via Supabase Dashboard SQL Editor
# Copy and paste contents of init.sql

# Or via psql
psql -f scripts/init.sql $DATABASE_URL
```

### 2. Deploy All Edge Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy weather
supabase functions deploy llm-chat
supabase functions deploy send-email
supabase functions deploy user-registration
supabase functions deploy signup-with-invite
supabase functions deploy manage-invites
```

### 3. Configure Environment Variables

Create a `.env` file in your project root with:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Email Service Configuration (optional)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM_EMAIL=noreply@yourapp.com
EMAIL_FROM_NAME=Burger Shop Demo
```

## 📡 Edge Functions Details

### 1. Weather Service
**File:** `supabase/functions/weather/index.ts`
**Endpoint:** `GET /functions/v1/weather`
**Purpose:** External API integration demo

```bash
# Test
curl "https://your-project-ref.supabase.co/functions/v1/weather?lat=37.7749&lon=-122.4194"
```

**Environment Variables:** None required
**Dependencies:** Open-Meteo API (external)

### 2. LLM Chat Integration
**File:** `supabase/functions/llm-chat/index.ts`
**Endpoint:** `POST /functions/v1/llm-chat`
**Purpose:** OpenAI GPT integration

```bash
# Test
curl -X POST "https://your-project-ref.supabase.co/functions/v1/llm-chat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, how are you?"}]}'
```

**Environment Variables:** `OPENAI_API_KEY`
**Dependencies:** OpenAI API

### 3. Email Service
**File:** `supabase/functions/send-email/index.ts`
**Endpoint:** `POST /functions/v1/send-email`
**Purpose:** Template-based email system

```bash
# Test
curl -X POST "https://your-project-ref.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","templateName":"welcome","templateData":{"fullName":"John Doe"}}'
```

**Environment Variables:** Email service credentials (optional)
**Dependencies:** Uses `email_queue` table

### 4. User Registration
**File:** `supabase/functions/user-registration/index.ts`
**Endpoint:** `POST /functions/v1/user-registration`
**Purpose:** Automated user registration with profiles

```bash
# Test
curl -X POST "https://your-project-ref.supabase.co/functions/v1/user-registration" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securepassword123","fullName":"John Doe"}'
```

**Environment Variables:** `SUPABASE_SERVICE_ROLE_KEY`
**Dependencies:** Auth, profiles, email queue

### 5. Invite-Only Registration
**File:** `supabase/functions/signup-with-invite/index.ts`
**Endpoint:** `POST /functions/v1/signup-with-invite`
**Purpose:** Controlled user registration with invite codes

```bash
# Test
curl -X POST "https://your-project-ref.supabase.co/functions/v1/signup-with-invite" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securepassword123","inviteCode":"WELCOME2024","fullName":"John Doe"}'
```

**Environment Variables:** `SUPABASE_SERVICE_ROLE_KEY`
**Dependencies:** Auth, profiles, invite codes, email queue

### 6. Invite Management
**File:** `supabase/functions/manage-invites/index.ts`
**Endpoint:** `/functions/v1/manage-invites`
**Purpose:** CRUD operations for invitation codes

```bash
# List invites
curl -X GET "https://your-project-ref.supabase.co/functions/v1/manage-invites" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create invite
curl -X POST "https://your-project-ref.supabase.co/functions/v1/manage-invites" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Welcome invite","maxUses":10,"recipientEmail":"user@example.com"}'
```

**Environment Variables:** None required
**Dependencies:** Auth, profiles, email queue

## 🔧 Configuration

### Environment Variables Setup

1. **Supabase Dashboard → Settings**
   - Add secrets for Edge Functions
   - Configure CORS origins

2. **Local Development (.env)**
   ```bash
   supabase functions serve --env-file .env
   ```

3. **Production Deployment**
   ```bash
   supabase secrets set OPENAI_API_KEY=your-key
   supabase secrets set EMAIL_SERVICE_API_KEY=your-email-key
   ```

### Database Functions Available

After running `init.sql`, you have access to these useful functions:

```sql
-- Check Edge Function status
SELECT * FROM get_edge_function_status();

-- Get system statistics
SELECT * FROM get_system_stats();

-- Generate an invite code
SELECT generate_invite_code(8);

-- Use an invite code (for testing)
SELECT use_invite_code('WELCOME2024', 'user-uuid');

-- Cleanup old data
SELECT cleanup_old_audit_logs();
SELECT cleanup_processed_emails();
```

## 🧪 Testing

### Local Testing

```bash
# Start local development server
supabase functions serve --env-file .env

# Test each function
curl http://localhost:54321/functions/v1/weather?lat=37.7749&lon=-122.4194
```

### Production Testing

```bash
# After deployment, test production endpoints
curl https://your-project-ref.supabase.co/functions/v1/weather?lat=37.7749&lon=-122.4194
```

### Monitoring

- **Function Logs:** Supabase Dashboard → Functions → Logs
- **Database Monitoring:** `audit_logs` and `email_queue` tables
- **Performance:** Edge Functions metrics in Dashboard
- **Error Tracking:** Automatic error logging in audit_logs

## 🔒 Security Considerations

### Row Level Security

All tables have proper RLS policies:
- `invite_codes` - Controlled access based on creation and validation
- `profiles` - Users can only access their own data for updates
- `audit_logs` - Users can read their own logs
- `email_queue` - Service role only access

### Environment Variables

Always use Supabase secrets for production:
```bash
supabase secrets set OPENAI_API_KEY=your-production-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### CORS Configuration

Configure CORS in Supabase Dashboard:
- Add your frontend domain
- Allow appropriate HTTP methods
- Set secure headers

## 📊 Monitoring

### Database Monitoring

```sql
-- Check function status
SELECT * FROM edge_functions_info;

-- Monitor email queue
SELECT status, COUNT(*) FROM email_queue GROUP BY status;

-- Track invite code usage
SELECT code, uses_left FROM invite_codes WHERE is_active = true;

-- Audit recent activities
SELECT action, COUNT(*) FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action;
```

### Function Monitoring

Monitor via:
- **Supabase Dashboard:** Function logs, metrics, error rates
- **Database Views:** `get_edge_function_status()`, `get_system_stats()`
- **Custom Alerts:** Set up alerts for failed functions

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] Test all functions locally
- [ ] Configure all environment variables
- [ ] Set up proper CORS policies
- [ ] Review RLS policies
- [ ] Configure database backups

### Deployment
- [ ] Deploy all Edge Functions
- [ ] Set up production secrets
- [ ] Configure monitoring
- [ ] Test all endpoints
- [ ] Verify email delivery (if configured)

### Post-Deployment
- [ ] Monitor function logs
- [ ] Set up alerting for failures
- [ ] Configure database maintenance
- [ ] Document API endpoints
- [ ] Set up usage analytics

## 🔧 Troubleshooting

### Common Issues

1. **Function Deployment Fails**
   ```bash
   # Check function logs
   supabase functions logs <function-name>
   ```

2. **Environment Variables Missing**
   ```bash
   # List available secrets
   supabase secrets list
   ```

3. **Database Connection Issues**
   ```bash
   # Check database URL
   supabase db shell
   ```

4. **CORS Errors**
   - Check CORS configuration in Supabase Dashboard
   - Verify frontend domain is allowed

### Debug Commands

```bash
# View function logs
supabase functions logs --follow

# Test specific function locally
supabase functions serve <function-name> --env-file .env

# Check database connection
supabase db shell --command "SELECT 1"
```

## 📚 Further Reading

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Function Secrets Management](https://supabase.com/docs/guides/functions/secrets)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Function Monitoring](https://supabase.com/docs/guides/functions/monitoring)

---

**🎉 Your advanced Edge Functions are ready for production!**
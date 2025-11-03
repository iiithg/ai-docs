# Project Burger Shop Edge Function - Advanced Features Demo

This project demonstrates advanced Supabase Edge Functions with real-world use cases including LLM integration, email services, user automation, and invite-only registration systems.

**App path:** `apps/project-burger-shop-edge-function-5`

## 🚀 Features

### 1. **LLM Chat Integration** (`llm-chat`)
- Integration with OpenAI's GPT models
- Support for different models (GPT-3.5, GPT-4)
- Chat history management
- Usage tracking and logging
- CORS support for frontend integration

### 2. **Email Service** (`send-email`)
- Async email queue system
- HTML and text email templates
- Multiple recipient support
- Template-based emails (welcome, password reset, invitations)
- Email delivery status tracking

### 3. **Automated User Registration** (`user-registration`)
- Complete user registration workflow
- Profile creation with avatar generation
- Welcome email automation
- Validation and error handling
- Audit logging

### 4. **Invite-Only Registration System** (`signup-with-invite`)
- Invitation code validation
- Transaction-based user creation
- Automatic invite code usage tracking
- Rollback on failure
- Email notifications

### 5. **Invite Code Management** (`manage-invites`)
- CRUD operations for invite codes
- Bulk invite generation
- Usage tracking and analytics
- Email invitation sending
- Admin management interface

### 6. **Weather Service** (`weather`)
- Weather data proxy (original demo)
- External API integration example
- Caching support

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- OpenAI API key (for LLM features)
- Email service credentials (optional, for email features)

### Installation

```bash
cd apps/project-burger-shop-edge-function-5
npm install
```

### Environment Variables

Create `.env.local` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM Configuration
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (optional - uses in-app templates if not set)
# Configure your preferred email service (SendGrid, AWS SES, etc.)
```

### Database Setup

Run the database initialization script:

```bash
# Via Supabase Dashboard SQL Editor
# Copy and paste contents of scripts/init.sql

# Or via psql
psql -f scripts/init.sql $DATABASE_URL
```

## 🚀 Development

### Local Development

```bash
# Start Next.js development server
npm run dev

# Start Edge Functions locally (requires Supabase CLI)
supabase functions serve --env-file supabase/.env
```

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific functions
supabase functions deploy llm-chat
supabase functions deploy send-email
supabase functions deploy user-registration
supabase functions deploy signup-with-invite
supabase functions deploy manage-invites
supabase functions deploy weather

# List deployed functions
supabase functions list
```

## 📡 API Endpoints

### LLM Chat
```
POST /functions/v1/llm-chat
```

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "message": {
    "role": "assistant",
    "content": "Hello! I'm doing well, thank you for asking..."
  },
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  }
}
```

### Send Email
```
POST /functions/v1/send-email
```

**Request:**
```json
{
  "to": "user@example.com",
  "templateName": "welcome",
  "templateData": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "appName": "Burger Shop Demo"
  }
}
```

### User Registration
```
POST /functions/v1/user-registration
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "username": "johndoe",
  "sendWelcomeEmail": true,
  "generateAvatar": true
}
```

### Sign Up with Invite
```
POST /functions/v1/signup-with-invite
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "inviteCode": "WELCOME2024",
  "fullName": "John Doe",
  "username": "johndoe"
}
```

### Manage Invites
```
GET    /functions/v1/manage-invites     # List all invites
POST   /functions/v1/manage-invites     # Create new invite
PUT    /functions/v1/manage-invites?id=xxx  # Update invite
DELETE /functions/v1/manage-invites?id=xxx  # Deactivate invite
```

**Create Invite Request:**
```json
{
  "description": "Welcome invite for early adopters",
  "maxUses": 10,
  "expiresAt": "2024-12-31T23:59:59Z",
  "recipientEmail": "user@example.com"
}
```

### Weather (Original Demo)
```
GET /functions/v1/weather?lat=37.7749&lon=-122.4194
```

## 🗄️ Database Schema

### Core Tables

#### `invite_codes`
- Invitation code management
- Usage tracking
- Expiration handling
- Creator attribution

#### `profiles`
- Extended user profiles
- Social features support
- Preferences storage
- Invite code tracking

#### `audit_logs`
- Action tracking
- User activity logging
- Change history
- Compliance support

#### `email_queue`
- Async email processing
- Delivery status tracking
- Template management
- Retry logic

## 🔧 Configuration

### Custom Email Templates

Add new email templates in `send-email/index.ts`:

```typescript
const templates: Record<string, (data: any) => EmailTemplate> = {
  'custom-template': (data) => ({
    subject: 'Custom Subject',
    html: `<p>Custom HTML content</p>`,
    text: 'Custom text content'
  })
}
```

### LLM Model Configuration

Configure available models and parameters in `llm-chat/index.ts`:

```typescript
const supportedModels = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo-preview'
]
```

### Custom Authentication

Implement custom authentication logic by modifying the user verification sections in each function.

## 🧪 Testing

### Local Testing

```bash
# Test LLM chat
curl -X POST http://localhost:54321/functions/v1/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test email sending
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","content":"Hello World"}'

# Test user registration
curl -X POST http://localhost:54321/functions/v1/user-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Production Testing

Use the Supabase Function URLs for testing deployed functions.

## 🔒 Security Considerations

- All functions validate input and handle errors gracefully
- Email templates are sanitized to prevent XSS
- Invite codes are validated and tracked
- User registration includes proper authentication
- API keys are stored as environment variables
- CORS is configured for cross-origin requests

## 📊 Monitoring

Each function includes comprehensive logging:

- Request/response logging
- Error tracking
- Usage metrics
- Audit trail creation
- Performance monitoring

Monitor via:
- Supabase Dashboard logs
- Database audit_logs table
- Email queue status
- Function metrics

## 🚀 Production Deployment

1. **Environment Setup**
   - Configure all required environment variables
   - Set up email service credentials
   - Configure OpenAI API key

2. **Database Setup**
   - Run initialization script
   - Set up proper RLS policies
   - Configure audit logging

3. **Function Deployment**
   - Deploy all functions
   - Test each endpoint
   - Set up monitoring

4. **Security Review**
   - Review CORS settings
   - Validate authentication flows
   - Check rate limiting requirements

## 🤝 Contributing

When adding new functions:
1. Create directory in `supabase/functions/`
2. Implement with proper error handling
3. Add comprehensive logging
4. Update documentation
5. Include database schema changes if needed

## 📚 Further Reading

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Deno Runtime Documentation](https://deno.land/manual)

---

**🎉 Advanced Edge Functions Demo - showcasing real-world Supabase capabilities!**
# Project Burger Shop Storage Uploads - Advanced File Management & Edge Functions

This project demonstrates advanced Supabase Storage capabilities combined with comprehensive Edge Functions for real-world applications including file uploads, user management, email services, LLM integration, and invite-only registration systems.

**App path:** `apps/project-burger-shop-storage-uploads-4`

## 🚀 Features

### Storage & File Management
- **Avatar Upload System** - Upload user profile images to Supabase Storage
- **Access Control** - Row Level Security (RLS) policies for secure file access
- **Public/Private URLs** - Support for both public and signed URLs
- **Anonymous Uploads** - Guest uploads with controlled access
- **File Size & Type Validation** - Client and server-side validation

### Advanced Edge Functions
- **🤖 LLM Chat Integration** - OpenAI GPT model integration
- **📧 Email Service** - Template-based email system with queue
- **👤 User Registration Automation** - Complete signup workflow with profiles
- **🎟️ Invite-Only Registration** - Controlled access with invitation codes
- **🎫 Invite Management** - CRUD operations for invitation codes
- **🌤️ Weather Service** - External API integration demo

### Database Features
- **Extended Profiles** - User profiles with avatars and preferences
- **Invite System** - Code-based invitation management
- **Audit Logging** - Comprehensive activity tracking
- **Email Queue** - Asynchronous email processing
- **Storage Utilities** - Helper functions for file management

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- Supabase Project with Storage enabled
- OpenAI API key (for LLM features)

### Installation

```bash
cd apps/project-burger-shop-storage-uploads-4
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
OPENAI_API_KEY=sk-your-openai-api-key

# Email Service Configuration (optional)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM_EMAIL=noreply@yourapp.com
EMAIL_FROM_NAME=Your App Name

# App Configuration
NEXT_PUBLIC_APP_NAME=Burger Shop Demo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the complete initialization script:

```bash
# Via Supabase Dashboard SQL Editor
# Copy and paste contents of scripts/init.sql

# Or via psql
psql -f scripts/init.sql $DATABASE_URL
```

The initialization script includes:
- Storage bucket setup and policies
- Database tables for all features
- Edge Functions support structures
- Sample data and utilities
- RLS policies for security

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
supabase functions deploy weather
supabase functions deploy llm-chat
supabase functions deploy send-email
supabase functions deploy user-registration
supabase functions deploy signup-with-invite
supabase functions deploy manage-invites

# List deployed functions
supabase functions list
```

## 📁 Storage Configuration

### Bucket Setup

The `avatars` bucket is configured with the following policies:

- **Public Read Access** - Anyone can view avatar images
- **User-Specific Write Access** - Users can only upload to their own folder (`user_id/`)
- **Anonymous Guest Uploads** - Non-authenticated users can upload to `guest/` folder
- **Self-Management** - Users can update/delete their own files

### File Path Structure

```
avatars/
├── {user_id}/
│   ├── avatar.jpg
│   ├── profile.png
│   └── ...
└── guest/
    ├── {uuid}-avatar.jpg
    └── ...
```

### Storage Utility Functions

```sql
-- Get public URL for avatar
SELECT get_avatar_url(user_id, 'avatar.jpg');

-- Generate signed URL for private access
SELECT get_signed_avatar_url(user_id, 'avatar.jpg', 3600);
```

## 📡 API Endpoints

### Storage Upload
- **Route:** `/profile` - Upload and manage avatar images
- **Methods:** POST (upload), DELETE (remove)

### Edge Functions

#### LLM Chat
```
POST /functions/v1/llm-chat
```

#### Send Email
```
POST /functions/v1/send-email
```

#### User Registration
```
POST /functions/v1/user-registration
```

#### Sign Up with Invite
```
POST /functions/v1/signup-with-invite
```

#### Manage Invites
```
GET    /functions/v1/manage-invites
POST   /functions/v1/manage-invites
PUT    /functions/v1/manage-invites?id=xxx
DELETE /functions/v1/manage-invites?id=xxx
```

#### Weather Service
```
GET /functions/v1/weather?lat=37.7749&lon=-122.4194
```

## 🗄️ Database Schema

### Core Tables

#### `invite_codes`
- Invitation code management
- Usage tracking and expiration
- Creator attribution

#### `profiles`
- Extended user profiles
- Avatar URL storage
- Social features support

#### `audit_logs`
- Action tracking and compliance
- User activity logging
- Change history

#### `email_queue`
- Asynchronous email processing
- Template management
- Delivery status tracking

### Storage Tables

#### `storage.objects` (Supabase built-in)
- File metadata and paths
- Bucket organization
- Access control through policies

## 🔧 Configuration

### Storage Policies

The storage policies are automatically created by the init script:

```sql
-- Public read access for avatars
CREATE POLICY "avatars read all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can only access their own folder
CREATE POLICY "avatars write self" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' AND
    split_part(name, '/', 1) = auth.uid()::text
  );

-- Anonymous users can upload to guest folder
CREATE POLICY "avatars anon upload guest" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'anon' AND
    split_part(name, '/', 1) = 'guest'
  );
```

### Custom Email Templates

Add new templates in the `send-email` Edge Function:

```typescript
const templates = {
  'custom-template': (data) => ({
    subject: 'Custom Subject',
    html: '<p>Custom HTML content</p>',
    text: 'Custom text content'
  })
}
```

## 🧪 Testing

### Storage Testing

```bash
# Test avatar upload (via UI or API)
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/avatar.jpg"
```

### Edge Function Testing

```bash
# Test LLM chat
curl -X POST http://localhost:54321/functions/v1/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test email sending
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","templateName":"welcome"}'
```

## 🔒 Security Features

### Storage Security
- **Row Level Security** on storage objects
- **Path-based Access Control** - users can only access their own folders
- **File Type Validation** - restricted to image formats
- **Size Limits** - configurable upload size limits
- **Anonymous Upload Controls** - isolated guest folder

### Data Security
- **RLS Policies** on all database tables
- **JWT Authentication** for all operations
- **Input Validation** and sanitization
- **Audit Logging** for compliance
- **Rate Limiting** capabilities

## 📊 Monitoring & Maintenance

### Database Functions

```sql
-- Check Edge Function status
SELECT * FROM get_edge_function_status();

-- Cleanup old audit logs (keep 90 days)
SELECT cleanup_old_audit_logs();

-- Cleanup processed emails (keep 7 days)
SELECT cleanup_processed_emails();
```

### Monitoring

Monitor via:
- **Supabase Dashboard** - Storage usage and function logs
- **Database Tables** - audit_logs and email_queue status
- **Edge Function Metrics** - Request/response logs
- **Storage Analytics** - File upload/download statistics

## 🚀 Production Deployment

### 1. **Storage Setup**
   - Create storage bucket via Dashboard or SQL
   - Configure appropriate file size limits
   - Set up CDN if needed for global distribution

### 2. **Security Configuration**
   - Review and tighten RLS policies
   - Configure signed URLs for private content
   - Set up proper CORS policies

### 3. **Edge Functions Deployment**
   - Deploy all functions with proper secrets
   - Configure monitoring and alerting
   - Set up error tracking

### 4. **Maintenance Tasks**
   - Schedule regular cleanup of old logs
   - Monitor storage usage and costs
   - Update email templates as needed

## 🎯 Use Cases

This demo demonstrates real-world applications:

- **Social Media Platforms** - User avatars and profiles
- **SaaS Applications** - User management with invites
- **Content Management** - File uploads with access control
- **Customer Support** - LLM-powered chat systems
- **Marketing Automation** - Email campaigns and user onboarding

## 📚 Further Reading

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**🎉 Advanced Storage & Edge Functions Demo - showcasing production-ready Supabase capabilities!**
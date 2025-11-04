# Project Burger Shop Edge Functions - 5

🍔 **AI Chat, Email & Text-to-Image** - Comprehensive Edge Functions demo with LLM integration, email services, and image generation

This project demonstrates **Supabase Edge Functions** capabilities with three serverless functions: AI-powered chat using OpenAI-compatible APIs, email service with templates, and text-to-image generation, showcasing modern serverless architecture patterns.

## 🚀 Features

### Supabase Edge Functions Integration
This project showcases the following **Supabase features**:

- **⚡ Serverless Functions**: Deno runtime with TypeScript support
- **🤖 LLM Chat Integration**: OpenAI-compatible chat completions
- **📧 Email Service**: Template-based email sending with queue support
- **🎨 Text-to-Image**: AI-powered image generation
- **🔐 JWT Authentication**: Optional token-based function security
- **🌐 CORS Support**: Built-in cross-origin request handling
- **⚙️ Dynamic Configuration**: Runtime endpoint configuration via UI

### Application Features
- **💬 AI Chat Interface**: Real-time conversations with customizable models
- **📨 Email Templates**: Professional email composition and delivery
- **🖼️ Image Generation**: Create images from text prompts
- **🎛️ Function Testing**: Built-in testing interface for all functions
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔧 Custom Endpoints**: Override default function URLs for testing

## 🛠️ Prerequisites

- **Node.js 18+** - Required for development
- **Supabase Project** - For Edge Functions deployment
- **API Keys** - OpenAI API key for LLM chat, image generation service key

## 🏃‍♂️ Quick Start

### 1. Frontend Setup

```bash
cd apps/project-burger-shop-edge-function-5
npm install
npm run dev
```

Open `http://localhost:3000` and configure settings in the top-right corner:
- **Supabase URL**: `https://YOUR-PROJECT.supabase.co`
- **Anon Key**: Your project's anonymous key
- **Access Token**: Optional JWT for authenticated functions

### 2. Environment Variables (Optional)

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Edge Functions Deployment

### Step 1: Create Functions in Supabase Dashboard

1. Navigate to **Supabase Dashboard** → **Functions**
2. Create the following three functions:
   - **`llm-chat`** - Copy from `scripts/llm-chat.ts`
   - **`send-email`** - Copy from `scripts/send-email.ts`
   - **`txt2img`** - Copy from `scripts/txt2img.ts`

### Step 2: Configure Environment Variables

For each function, set these environment variables in **Functions → Settings**:

#### `llm-chat` Function
```bash
OPENAI_API_KEY=your-openai-api-key
```

#### `send-email` Function
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### `txt2img` Function
```bash
NANOBANANA_API_KEY=your-nanobanana-api-key
NANOBANANA_API_URL=https://api.nanobanana.com/v1 (optional)
```

### Step 3: Authentication Configuration

**Important**: Set **"Verify JWT with legacy secret"** to **OFF** in function settings.

**Why**: We recommend implementing fine-grained authentication within your functions rather than relying on legacy JWT verification.

### Step 4: Test Functions

Before using the frontend:
1. Use the **"Run/Test"** button in Supabase Dashboard
2. Verify each function returns `200 OK` responses
3. Check that responses match expected formats

## 📁 Project Structure

### Frontend Application
- **`app/llm-chat/page.tsx`** — AI chat interface
- **`app/send-email/page.tsx`** — Email composition and testing
- **`app/txt2img/page.tsx`** — Text-to-image generation
- **`components/Settings.tsx`** — Dynamic configuration panel

### Edge Functions (scripts/)
- **`scripts/llm-chat.ts`** — OpenAI-compatible chat completions
- **`scripts/send-email.ts`** — Email service with template support
- **`scripts/txt2img.ts`** — Image generation API integration

## 🎯 API Endpoints

### LLM Chat
```
POST /functions/v1/llm-chat
Content-Type: application/json
Authorization: Bearer <optional-jwt>

{
  "messages": [{"role": "user", "content": "Hello!"}],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Send Email
```
POST /functions/v1/send-email
Content-Type: application/json
Authorization: Bearer <optional-jwt>

{
  "to": "user@example.com",
  "templateName": "welcome",
  "templateData": {"name": "John", "amount": 100}
}
```

### Text to Image
```
POST /functions/v1/txt2img
Content-Type: application/json
Authorization: Bearer <optional-jwt>

{
  "prompt": "A cute burger shop with happy customers",
  "model": "dall-e-3"
}
```

## 🛡️ Authentication & Security

### Function Authentication Options

1. **Public Functions** - No authentication required
2. **JWT Verification** - Verify Supabase JWT tokens
3. **Custom Logic** - Implement your own auth rules

### Security Best Practices

- **Never expose service role keys** in client-side code
- **Use environment variables** for sensitive configuration
- **Implement rate limiting** for production functions
- **Validate all inputs** before processing
- **Use HTTPS** for all function calls

## ⚠️ Troubleshooting

### Common Issues

**`TypeError: Failed to fetch`**
- **Cause**: CORS preflight failure or missing authentication headers
- **Solution**:
  - Ensure functions include proper CORS headers
  - Save Anon Key in frontend Settings (auto-appends `apikey`)
  - If using JWT auth, provide Access Token in Settings
  - Check Network tab for OPTIONS/POST responses

**`401 Missing authorization header`**
- **Cause**: Function requires authentication but none provided
- **Solution**:
  - Add JWT token in Settings Access Token field
  - Disable function's "Verify JWT with legacy secret" option
  - Or implement custom auth logic in the function

**Text-to-Image Duplicate Images**
- **Cause**: API returns both Markdown and raw `data:image` formats
- **Solution**: Frontend automatically deduplicates and displays unique images

**Function Not Responding**
- **Check**: Function is deployed and active in Supabase Dashboard
- **Verify**: Environment variables are correctly set
- **Test**: Use Supabase Dashboard's built-in function tester
- **Monitor**: Check function logs for error messages

### Debug Mode

Enable detailed logging by checking browser DevTools:
1. Open **Network** tab
2. Examine function requests and responses
3. Check **Console** for application logs
4. Review Supabase Dashboard → Functions → Logs

## 🔧 Customization

### Adding New Functions

1. Create new TypeScript file in `scripts/`
2. Implement function with proper CORS headers
3. Deploy via Supabase Dashboard
4. Add frontend interface in `app/` directory

### Custom Email Templates

Add new templates in `send-email` function:

```typescript
const templates = {
  'custom-template': (data) => ({
    subject: 'Custom Subject',
    html: '<p>Custom HTML content with {{variables}}</p>',
    text: 'Custom text content'
  })
}
```

### Model Configuration

Customize AI models by modifying function environment variables:
- **OpenAI Models**: `gpt-4`, `gpt-3.5-turbo`, etc.
- **Temperature**: Control response creativity (0.0-1.0)
- **Max Tokens**: Limit response length

## 📚 Further Learning

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Guide](https://deno.land/runtime)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**🎉 Advanced Edge Functions Demo - showcasing production-ready serverless capabilities!**


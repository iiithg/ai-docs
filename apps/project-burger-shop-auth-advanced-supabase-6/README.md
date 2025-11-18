# Project Burger Shop Advanced Auth (Supabase) - 6

🍔 **Advanced Authentication with Supabase** - A comprehensive demo showcasing Google/GitHub OAuth, email/password login, server-side sessions with middleware, and JWT-protected APIs, all built exclusively with Supabase Auth.

This project provides a robust authentication solution using Supabase, demonstrating advanced features like social logins, secure server-side sessions, and protected API routes.

## 🚀 Features

### Supabase Auth Integration
- **🔐 Multi-Provider OAuth**: Seamless login with Google and GitHub.
- **📧 Email/Password Auth**: Classic email and password registration with profile creation.
- **🍪 Server-Side Sessions**: Secure session management using cookies and Next.js middleware.
- **🛡️ Protected Routes**: Middleware-enforced access control for authenticated users.
- **🔑 JWT-Protected API**: `/api/jwt-echo` endpoint that validates and decodes JWTs using `SUPABASE_JWT_SECRET`.
- **👤 User Profiles**: Automatic profile creation in the `profiles` table upon registration.

### Application Features
- **🌐 Social & Traditional Login**: Flexible authentication options for users.
- **🔒 Secure by Default**: Server-side session handling enhances security.
- **⚙️ Middleware Integration**: Clean and scalable route protection.
- **🔧 Developer-Friendly**: Easy-to-understand implementation of advanced auth patterns.

## 🛠️ Quick Start

### 1. Environment Setup
Create a `.env.local` file by copying the example:
```bash
cp .env.example .env.local
```
Update the file with your Supabase project credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```
- **JWT Secret**: Found in Supabase Dashboard → Settings → API.
- **OAuth Callback URL**: Ensure `http://localhost:3000/auth/callback` is added to your Supabase project's OAuth provider settings.

### 2. Database Setup
This project requires a `profiles` table to store user data. Run the following SQL script in your Supabase SQL Editor to create it:
```sql
-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. Run the Application
```bash
cd apps/project-burger-shop-auth-advanced-supabase-6
npm install
npm run dev
```
- Navigate to `/auth/login` to sign in via OAuth or email.
- After logging in, you will be redirected to the protected `/entry` page.

## 📁 Project Structure
- **`app/`**: Contains the application's routes and UI.
  - **`auth/`**: Handles authentication flows (login, callback).
  - **`entry/page.tsx`**: A protected page accessible only to authenticated users.
  - **`api/jwt-echo/route.ts`**: A JWT-protected API route.
- **`middleware.ts`**: Implements server-side session management and route protection.
- **`lib/supabase/`**: Configures the Supabase clients for server and client-side use.

## 🎯 Technical Implementation
- **Middleware (`middleware.ts`)**: Intercepts requests to refresh the user's session cookie, ensuring they remain logged in. It also protects routes by redirecting unauthenticated users to the login page.
- **Server-Side Supabase Client**: A server-side client is used in Server Components and Route Handlers to securely interact with Supabase.
- **JWT API Route (`/api/jwt-echo`)**: This route demonstrates how to protect an API endpoint by verifying a JWT. It uses the `SUPABASE_JWT_SECRET` to decode the token and return its claims, confirming the user's identity.

## 🧰 Troubleshooting OAuth “Database error saving new user”
If Google/GitHub login bounces back with  
`error=server_error&error_description=Database+error+saving+new+user`, it almost always means the `profiles` table/trigger do not match the code. Fix it by:
1) Re-run `scripts/init.sql` in the Supabase SQL Editor to recreate `public.profiles` with columns `id uuid primary key references auth.users(id)`, `name`, `optional_info`, plus the `handle_new_user` trigger and RLS policies.
2) Ensure there is **no** mismatching column like `user_id` or `full_name`; the app inserts/queries `id`, `name`, `optional_info`.
3) Clear Supabase cookies/localStorage in the browser and retry OAuth.

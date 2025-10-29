# Database Setup Scripts for Realtime Chat Demo (Project 3)

This directory contains SQL scripts needed to set up the database for the realtime chat application.

## 📋 Available Scripts

### `init.sql` - **Main Initialization Script**
This is the **primary script** you need to execute in your Supabase project. It contains all necessary SQL commands to set up the chat functionality from scratch or update an existing setup.

### `reset.sql` - **Complete Reset Script**
Use this script when you need to completely remove and recreate the chat functionality. It performs a full cleanup and then creates a fresh setup.

**🎉 No Authentication Required!** This chat application allows anyone to join and send messages without user registration or login.

## 🚀 How to Execute the Scripts

### Option A: Command Line (Recommended)
```bash
# For initial setup or updates
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql

# For complete reset (use with caution)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/reset.sql
```

### Option B: Supabase SQL Editor

#### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one)

#### Step 2: Execute the SQL Script
1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **New Query** to create a new SQL query
3. Copy the entire content of `init.sql` file (or `reset.sql` for complete reset)
4. Paste it into the SQL Editor
5. Click **Run** button to execute the script

#### Step 3: Enable Realtime (Important!)
1. Go to **Database** → **Replication** in the left sidebar
2. Find the `chat_messages` table in the list
3. Toggle **ON** the realtime replication for `chat_messages` table
4. This enables real-time subscriptions for the chat functionality

## 🔍 What the Scripts Do

### `init.sql` (Initialization)
1. **Creates `chat_messages` table** with these columns:
   - `id`: UUID primary key (auto-generated)
   - `room`: Text field for chat room (defaults to 'lobby')
   - `username`: Text field for user's display name
   - `content`: Text content of the message
   - `created_at`: Timestamp (auto-generated)

2. **Configures permissions for public access**:
   - Disables Row Level Security (RLS)
   - Grants SELECT and INSERT permissions to anonymous users
   - Cleans up any old policies

3. **Enables realtime functionality**:
   - Sets up replica identity
   - Adds table to realtime publication
   - Reloads schema cache

### `reset.sql` (Complete Reset)
1. **Complete cleanup**: Removes all policies, permissions, and the table
2. **Fresh recreation**: Creates the table and configuration from scratch
3. **Verification**: Ensures everything is properly set up

## 🔑 Getting Your Supabase Credentials

After setting up the database, you'll need these credentials for your application:

1. **Project URL**: Found in **Settings** → **API** → **Project URL**
2. **Anon Key**: Found in **Settings** → **API** → **Project API keys** → **anon public**

## ⚠️ Troubleshooting

### Common Issues:

1. **"permission denied for table chat_messages"**
   - Solution: Re-run `init.sql` to ensure proper permissions are granted

2. **Real-time not working**
   - Solution: Ensure you've enabled replication for the `chat_messages` table in Database → Replication

3. **Messages not appearing or table structure issues**
   - Solution: Use `reset.sql` for a complete fresh start

### When to Use Each Script:

- **Use `init.sql` for**:
  - Initial setup
  - Updates to existing setup
  - Fixing permission issues
  - Adding realtime functionality

- **Use `reset.sql` for**:
  - Complete fresh start
  - Troubleshooting persistent issues
  - When table structure is corrupted
  - Before deploying to a clean environment

### Verification Steps:

1. Check if the table exists: Go to **Table Editor** and look for `chat_messages`
2. Test permissions: Try inserting a test row in the Table Editor
3. Verify RLS: The table should show "RLS disabled" in the Table Editor
4. Check realtime: Ensure the table appears in Database → Replication

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase logs in **Logs** → **Database**
2. Ensure you've copied the complete script content
3. Make sure you've enabled realtime replication for the table
4. For persistent issues, try using `reset.sql` for a fresh start
5. Check that your `DATABASE_URL` is correctly configured for CLI usage

---

**Note**: These scripts are specifically designed for the realtime chat demo (Project 3) and are idempotent - safe to run multiple times. Use `init.sql` for regular setup and `reset.sql` only when you need a complete fresh start.
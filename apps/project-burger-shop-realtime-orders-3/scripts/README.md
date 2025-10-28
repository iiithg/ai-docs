# Database Setup Scripts for Realtime Chat Demo

This directory contains SQL scripts needed to set up the database for the realtime chat application.

## 📋 Required Script

### `init-chat-complete.sql`
This is the **main script** you need to execute in your Supabase project. It contains all necessary SQL commands to set up the chat functionality.

**🎉 No Authentication Required!** This chat application allows anyone to join and send messages without user registration or login.

## 🚀 How to Execute the Script in Supabase

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one if you don't have one)

### Step 2: Authentication Setup (Optional)
**Note:** Authentication is NOT required for this chat application. Users can join anonymously.
- You can skip authentication setup entirely
- The chat works with anonymous users using randomly generated usernames

### Step 3: Execute the SQL Script
1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **New Query** to create a new SQL query
3. Copy the entire content of `init-chat-complete.sql` file
4. Paste it into the SQL Editor
5. Click **Run** button to execute the script

### Step 4: Verify Script Execution
After running the script, you should see:
- A success message: `"Chat initialization complete - table created, RLS enabled, policies set"`
- The `chat_messages` table should appear in your **Table Editor**

### Step 5: Enable Realtime (Important!)
1. Go to **Database** → **Replication** in the left sidebar
2. Find the `chat_messages` table in the list
3. Toggle **ON** the realtime replication for `chat_messages` table
4. This enables real-time subscriptions for the chat functionality

## 🔍 What the Script Does

The `init-chat-complete.sql` script performs the following operations:

1. **Creates `chat_messages` table** with these columns:
   - `id`: UUID primary key (auto-generated)
   - `room`: Text field for chat room (defaults to 'lobby')
   - `username`: Text field for user's display name (no authentication required)
   - `content`: Text content of the message
   - `created_at`: Timestamp (auto-generated)

2. **Disables Row Level Security (RLS)** for public access

3. **Removes authentication requirements**:
   - Anyone can read messages (no login required)
   - Anyone can send messages (no login required)
   - Uses anonymous access with randomly generated usernames

4. **Grants public access permissions** to anonymous users

## 🔑 Getting Your Supabase Credentials

After setting up the database, you'll need these credentials for your application:

1. **Project URL**: Found in **Settings** → **API** → **Project URL**
2. **Anon Key**: Found in **Settings** → **API** → **Project API keys** → **anon public**

## ⚠️ Troubleshooting

### Common Issues:

1. **"permission denied for table chat_messages"**
   - Solution: Re-run the script to ensure proper permissions are granted to anonymous users

2. **Real-time not working**
   - Solution: Ensure you've enabled replication for the `chat_messages` table in Database → Replication

3. **Messages not appearing**
   - Solution: Check that the table structure matches (should have `username` field, not `user_id`)

### Verification Steps:

1. Check if the table exists: Go to **Table Editor** and look for `chat_messages`
2. Test permissions: Try inserting a test row in the Table Editor
3. Verify RLS: The table should show "RLS disabled" in the Table Editor (for public access)
4. Check table structure: Ensure the table has `username` field instead of `user_id`

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase logs in **Logs** → **Database**
2. Ensure you've copied the complete script content
3. Make sure you've enabled realtime replication for the table
4. Verify the table structure has `username` field (not `user_id`)
5. Check that RLS is disabled for public access

---

**Note**: This script is specifically designed for the realtime chat demo (Project 3) and includes all necessary security configurations for a production-ready chat application.
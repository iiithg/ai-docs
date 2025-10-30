# 🚀 Real-time Chat Feature Setup Guide

## 🚨 Quick Fix for Common Errors

### ❌ "Could not find the 'username' column" Error

**Problem**: Error finding `username` column when sending messages
**Cause**: Database table structure doesn't match the code

**Solution**:
1. Run in Supabase SQL Editor:
```sql
-- Copy and paste contents from scripts/fix-table-structure.sql
```
2. Re-enable real-time replication for `chat_messages` table in **Database > Replication**
3. Refresh page and try again

## 📋 Problem Diagnosis

If you encounter the following issues:

- ✅ Can see multiple online users
- ❌ Cannot see other users' mouse positions
- ❌ Message sending fails

## 🔧 Solution Steps

### 1. Database Setup

First, run in Supabase SQL Editor:

```sql
-- Run complete initialization script
\i scripts/init-chat.sql
```

Or directly copy and paste the contents of `scripts/init-chat.sql` into the SQL Editor and execute.

### 2. Enable Real-time Features

In Supabase Console:

1. **Go to Database > Replication**
2. **Find `chat_messages` table**
3. **Click the toggle on the right to enable real-time replication**

### 3. Check RLS Policies

Ensure the following policies are created:

```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
```

You should see two policies:
- `chat read auth`
- `chat write auth`

### 4. Environment Variable Configuration

Set correct Supabase configuration in `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

**Important**: Ensure URL is not placeholder `https://your-project-ref.supabase.co`

### 5. Restart Development Server

After modifying environment variables, restart Next.js development server:

```bash
npm run dev
```

## 🐛 Debugging Tips

### Check Browser Console

Open browser developer tools and check console output:

- `Presence subscription status: SUBSCRIBED` - Online status subscription successful
- `Chat subscription status: SUBSCRIBED` - Chat messages subscription successful
- `Sending cursor update:` - Mouse position is being sent
- `Cursor update:` - Receiving other users' mouse positions

### Common Errors

1. **`Invalid JWT`** - Check if ANON_KEY is correct
2. **`relation "chat_messages" does not exist`** - Run database initialization script
3. **`permission denied`** - Check if RLS policies are correctly set

### Testing Steps

1. Open two different browser windows (or incognito mode)
2. Visit `/chat` page
3. Both windows should see each other online
4. Moving mouse should show other user's mouse position
5. Sending messages should be visible in both windows

## 📊 Feature Verification Checklist

- [ ] Database table `chat_messages` created
- [ ] RLS policies set up
- [ ] Real-time replication enabled
- [ ] Environment variables configured correctly
- [ ] Development server restarted
- [ ] No errors in browser console
- [ ] Multi-window testing successful

## 🆘 Still Having Issues?

If you still can't solve the problem following the above steps, please check:

1. If Supabase project is within free plan limits
2. If network connection is stable
3. If browser supports WebSocket
4. If firewall or proxy is blocking connections

## 🔄 Reset Configuration

If you need to reconfigure Supabase connection, click the "Reconfigure Supabase" button on the left side of the chat page.
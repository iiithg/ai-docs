# Realtime Chat with Multi-Cursor Tracking

A collaborative restaurant lobby chat application featuring real-time messaging and live mouse cursor tracking. Users can chat with each other while seeing everyone's mouse movements in real-time.

## 🌟 Features

- **Real-time Chat**: Persistent messaging with instant delivery
- **Live Cursor Tracking**: See other users' mouse movements with color-coded indicators
- **Online User Presence**: Display of all active users with unique animal names and colors
- **Dynamic Supabase Configuration**: Set up database connection through the UI
- **Anonymous Access**: No authentication required - users get random nicknames
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚀 Quick Start

### Option 1: Dynamic Configuration (Recommended)
1. Start the application: `npm run dev`
2. Visit `http://localhost:8080/chat`
3. Configure Supabase through the UI interface
4. No environment variables needed!

### Option 2: Environment Variables
- `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🏃‍♂️ Getting Started

```bash
# Install dependencies
npm install

# Start development server (default port: 3000, custom port: 8080)
npm run dev -- --port 8080

# Visit the application
# Default: http://localhost:3000/chat
# Custom port: http://localhost:8080/chat
```

**Note**: Visit `/chat` directly - **No authentication required!**

## 🗄️ Database Setup

### Step 1: Run SQL Script
Choose the appropriate option for your situation:

**Option A: New Setup (Fresh Start)**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/init-chat-complete.sql
```

**Option B: Fix "username column not found" Error**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/fix-table-structure.sql
```

**Option C: Clean Up Old Tables Only**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/cleanup-old-tables.sql
-- This only removes old tables, you'll need to run init-chat-complete.sql after
```

**Option D: Complete Reset (Clean + Recreate)**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/reset-chat-tables.sql
-- This does everything: cleanup old tables + create new ones
```

### Step 2: Enable Realtime
1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable realtime for `chat_messages` table

### Step 3: Monitor Messages
You can view chat messages in multiple places:
- **Supabase Table Editor**: Database → `chat_messages` table
- **Application UI**: Main chat interface in the browser
- **Browser Console**: Open DevTools → Console to see real-time message logs
- **Network Tab**: DevTools → Network to see WebSocket connections

## ⚠️ Troubleshooting

**Error: "Could not find the 'username' column"**
- Your table has old structure with `user_id` instead of `username`
- **Quick fix**: Run `scripts/reset-chat-tables.sql` (recommended)
- **Manual fix**: Run `scripts/cleanup-old-tables.sql` then `scripts/init-chat-complete.sql`
- After running any script, remember to enable Realtime replication for `chat_messages` table

**Error: "Could not find the table 'public.chat_messages' in the schema cache"**
- **Cause**: PostgREST schema cache didn't refresh after creating the table, or the `anon` role lacks privileges (PostgREST hides tables without privileges).
- **Fix A** (refresh cache): In Supabase SQL editor, run `select pg_notify('pgrst', 'reload schema');`
- **Fix B** (verify grants): Ensure `init-chat-complete.sql` ran successfully and that it includes:
  - `GRANT USAGE ON SCHEMA public TO anon;`
  - `GRANT SELECT, INSERT ON public.chat_messages TO anon;`
- **Fix C** (existence check): Run `select to_regclass('public.chat_messages');` — should return `public.chat_messages`.

**Connection Issues**
- Check browser console for error messages
- Verify Supabase URL and keys are correct
- Ensure realtime is enabled for the chat_messages table

**Cursor Tracking Not Working**
- Move your mouse to trigger cursor broadcasts
- Check browser console for "Sending cursor update" logs
- Verify other users are online in the sidebar

## 📱 Application Pages

### `/chat` - Main Chat Interface
- **Configuration Form**: Dynamic Supabase setup
- **Message Display**: Real-time chat with persistence
- **Online Users List**: Shows all active users with colors
- **Live Cursors**: Visual cursor tracking overlay
- **Message Input**: Send messages with Enter key or button

### `/` - Landing Page
- Entry point with navigation to chat
- Brief application description

## 🏗️ Technical Architecture

### Real-time Features
- **Messages**: `postgres_changes` subscription for `INSERT` events
- **Presence**: `channel('lobby_presence')` tracks online users
- **Cursors**: `broadcast` events send mouse coordinates (20fps throttled)
- **Anonymous Users**: Random animal names + unique colors

### File Structure
```
app/
├── page.tsx              # Landing page
└── chat/
    └── page.tsx          # Main chat implementation
scripts/
├── init-chat-complete.sql      # Full database setup
├── fix-table-structure.sql     # Fix column issues
├── cleanup-old-tables.sql      # Remove old tables
└── reset-chat-tables.sql       # Complete reset (recommended)
```

### Key Components
- **Dynamic Configuration**: Runtime Supabase setup through UI
- **Anonymous Identity**: Random user generation with localStorage persistence
- **Real-time Subscriptions**: Three Supabase realtime features working together
- **Throttled Broadcasting**: Mouse movements limited to 20fps for performance

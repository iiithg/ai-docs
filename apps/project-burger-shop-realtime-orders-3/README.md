# Project Burger Shop Realtime Chat - 3

🍔 **Realtime Restaurant Lobby Chat** - Multi-user live messaging with presence detection and cursor tracking

This project demonstrates **Supabase Realtime** capabilities with a restaurant lobby chat system featuring persistent messages and real-time cursor presence, showcasing modern web technologies for collaborative user experiences.

## 🚀 Features

### Supabase Realtime Integration
This project showcases the following **Supabase features**:

- **📡 Realtime Subscriptions**: Live chat messages using Postgres Changes
- **👥 Presence Detection**: Track online users and their cursor positions
- **🔄 Broadcast Channels**: Real-time cursor movement broadcasting
- **💾 Persistent Storage**: Messages stored in PostgreSQL database
- **🔐 Authentication Ready**: Optional user authentication integration
- **⚡ Dynamic Configuration**: Runtime Supabase configuration via UI

### Application Features
- **💬 Live Chat System**: Real-time messaging with instant delivery
- **🖱️ Cursor Tracking**: Visual representation of other users' mouse positions
- **👤 Online User Presence**: See who's currently active in the lobby
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🎨 Modern UI**: Clean interface with Tailwind CSS

## 🛠️ Quick Start

### Option 1: Dynamic Configuration (Recommended)
1. Start the application (see Run section below)
2. Navigate to `/chat` and click the settings button (⚙️)
3. Enter your Supabase URL and Anon Key
4. Settings are automatically saved to localStorage

### Option 2: Environment Variables
- Copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🏃‍♂️ Run

```bash
cd apps/project-burger-shop-realtime-orders-3
npm install
npm run dev
```

Open `http://localhost:3000/chat` - **No authentication required!**

## 🗄️ Database Setup

### 🚀 One-time Initialization (Recommended)

The simplest approach is to run the complete initialization script:

1. Open the Supabase Dashboard and select your project
2. Go to SQL Editor → New query
3. Copy the entire contents of `scripts/init-chat-complete.sql`
4. Paste into the SQL Editor and click Run

### 📋 Alternative Setup Options

**Fix Table Structure Issues**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/reset-chat-tables.sql
-- This completely resets tables and creates new structure
```

**Clean Up Old Tables Only**
```sql
-- Run this in Supabase SQL Editor
-- File: scripts/cleanup-old-tables.sql
-- Follow with init-chat-complete.sql for fresh setup
```

### 🔐 Enable Realtime

After database setup:
1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable realtime for `chat_messages` table

## 📁 Project Structure

### Core Application Files
- **`app/page.tsx`** — Entry point with navigation to chat
- **`app/chat/page.tsx`** — Complete chat implementation with realtime features
- **`lib/supabase/`** — Supabase client configuration

### Database Scripts
- **`scripts/init-chat-complete.sql`** — Complete database initialization
- **`scripts/reset-chat-tables.sql`** — Clean reset for troubleshooting
- **`scripts/cleanup-old-tables.sql`** — Remove old table structures
- **`scripts/fix-table-structure.sql`** — Fix column mismatches

## 🎯 Technical Implementation

### Realtime Architecture
This project demonstrates several **Supabase Realtime** patterns:

1. **Message Subscriptions**: `chat_messages` table with Postgres Changes
2. **Presence Channels**: Track online users in `presence:lobby`
3. **Broadcast System**: Real-time cursor position sharing
4. **Authentication Integration**: Optional user identification
5. **Error Handling**: Robust connection management

### Database Schema

#### chat_messages
```sql
- id: uuid (primary key)
- username: text (user display name)
- message: text (chat content)
- created_at: timestamp (auto-generated)
- user_id: uuid (optional auth reference)
```

## ⚠️ Troubleshooting

### Common Issues

**Error: "Could not find the 'username' column"**
- **Cause**: Table has old structure with `user_id` instead of `username`
- **Solution**: Run `scripts/reset-chat-tables.sql` (recommended)
- **Alternative**: Run `scripts/cleanup-old-tables.sql` then `scripts/init-chat-complete.sql`

**Realtime Not Working**
- **Check**: Ensure Realtime is enabled for `chat_messages` table
- **Verify**: Go to Database → Replication in Supabase Dashboard
- **Confirm**: Table should have realtime toggle enabled

**Connection Issues**
- **Verify**: Supabase URL and API key configuration
- **Check**: Network connectivity and CORS settings
- **Test**: Use browser DevTools to examine WebSocket connections

## 🌐 Pages

### `/chat`
Complete chat experience featuring:
- **Message Display**: Initial message load + real-time subscription
- **Input Interface**: Message composition and sending
- **Presence Overlay**: Visual cursor tracking for other users
- **Authentication Bar**: Optional sign-in/sign-up/sign-out
- **Settings Panel**: Dynamic Supabase configuration

## 📚 Further Learning

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Postgres Changes Guide](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Presence & Broadcast](https://supabase.com/docs/guides/realtime/presence)

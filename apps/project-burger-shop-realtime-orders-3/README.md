# Realtime Chat (-3)

A "restaurant lobby" chat: multi-user live messages (persisted) and mouse cursors (presence/broadcast).

## 🚀 Quick Start

### Option 1: Dynamic Configuration (Recommended)
1. Start the application: `npm run dev`
2. Visit `/chat` and configure Supabase through the UI
3. No environment variables needed!

### Option 2: Environment Variables
- `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Run
```bash
npm install
npm run dev
```
- Visit `/chat` directly - **No authentication required!**

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

## ⚠️ Troubleshooting

**Error: "Could not find the 'username' column"**
- Your table has old structure with `user_id` instead of `username`
- **Quick fix**: Run `scripts/reset-chat-tables.sql` (recommended)
- **Manual fix**: Run `scripts/cleanup-old-tables.sql` then `scripts/init-chat-complete.sql`
- After running any script, remember to enable Realtime replication for `chat_messages` table

## Pages
- `/chat`:
  - Messages: initial `select` + Postgres Changes subscription for `INSERT`.
  - Presence: `channel('presence:lobby')` tracks online users; broadcast sends cursor `{x,y}`; overlay renders others’ cursors.
  - Auth bar: minimal sign-in/sign-up/sign-out.

## Structure
- `app/page.tsx` — entry & link
- `app/chat/page.tsx` — chat implementation
- `scripts/*.sql` — table, policies, init script

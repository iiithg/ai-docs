# Project: Realtime Chat with Multi-Cursor Tracking

**Project Path**: `apps/project-burger-shop-realtime-orders-3`

A collaborative restaurant lobby chat application demonstrating advanced Supabase Realtime capabilities. Users can engage in persistent text conversations while visualizing each other's mouse movements in real-time.

## 🎯 Project Goal

Create a "restaurant lobby" chat experience where users can:
- Send and receive persistent text messages
- See live mouse cursors from all connected users
- Track online presence with unique identities
- Configure database connections dynamically through the UI

## 🔧 Technical Scope

### Core Features
- **Dynamic Configuration**: Users configure Supabase URL and API Key through settings UI
- **Anonymous Identity System**: No authentication required - users receive random animal names and colors
- **Persistent Messaging**: Text messages stored in database with real-time delivery
- **Live Cursor Tracking**: Real-time broadcast of mouse positions (presence/broadcast)
- **Online Presence Management**: Real-time user list with join/leave events

### User Experience Flow
1. **Configuration Screen**: First-time setup with Supabase credentials
2. **Connection Validation**: Test database connectivity before chat access
3. **Anonymous Identity**: Automatic generation of user persona (animal name + color)
4. **Real-time Interface**: Seamless chat and cursor tracking experience

## 📊 Data Model

### `public.chat_messages` Table
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room TEXT NOT NULL DEFAULT 'lobby',
  username TEXT NOT NULL,           -- Display name (animal name)
  content TEXT NOT NULL,            -- Message content
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Note**: Updated structure uses `username` column instead of `user_id` for simplified anonymous access.

### Access Model (demo)
For this demo we keep it simple: RLS is disabled on `chat_messages`, and `anon` is granted `SELECT` and `INSERT`. Enable RLS and add policies if you need tighter control.
```sql
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON chat_messages TO anon;
```

## 🏗️ Frontend Architecture

### Application Flow
1. **Settings Configuration** (`/chat` initial view)
   - Supabase URL and Anon Key input
   - Connection validation with error handling
   - LocalStorage persistence for credentials

2. **Chat Interface** (post-configuration)
   - Anonymous user identity assignment
   - Real-time message subscription
   - Multi-user presence and cursor tracking

### Real-time Implementation

#### Message System
```typescript
// Initial load + subscription
supabase
  .channel('chat_messages_channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages'
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

#### Presence & Cursor System
```typescript
// Presence tracking
const channel = supabase.channel('lobby_presence', {
  config: {
    presence: { key: anonymousUser.id },
    broadcast: { self: true }
  }
});

// Cursor broadcasting (20fps throttled)
document.addEventListener('mousemove', (e) => {
  channel.send({
    type: 'broadcast',
    event: 'cursor',
    payload: {
      id: anonymousUser.id,
      x: e.clientX,
      y: e.clientY
    }
  });
});
```

## 🎨 User Interface Components

### Chat Page (`app/chat/page.tsx`)
- **Configuration Form**: Supabase connection setup with validation
- **Message List**: Real-time message display with timestamps
- **Online Users Panel**: Active users with color indicators
- **Cursor Overlay**: Live visualization of all users' mouse positions
- **Message Input**: Send functionality with Enter key support

### Anonymous Identity System
```typescript
const ANIMAL_NAMES = ['🐶 Dog', '🐱 Cat', '🐭 Mouse', ...];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', ...];

function generateAnonymousUser() {
  return {
    id: `anon_${Math.random().toString(36).substr(2, 9)}`,
    name: ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
}
```

## ⚙️ Configuration Management

### Dynamic Configuration
- **No Environment Variables**: All configuration done through UI
- **LocalStorage Persistence**: Credentials saved across sessions
- **Connection Testing**: Validation before chat access
- **Reset Capability**: Clear configuration and start fresh

### Configuration Form Fields
- **Project URL**: Supabase project endpoint
- **Anon Public Key**: Public API key for anonymous access
- **Connection Test**: Validate database connectivity

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev -- --port 8080

# Access application
http://localhost:8080/chat
```

### Database Setup
1. **Run SQL Scripts**: Use appropriate script from `scripts/` directory
2. **Enable Realtime**: Database → Replication → Enable for `chat_messages`
3. **Configure Application**: Use UI to connect to Supabase

### SQL Script Options (scripts/)
- `init.sql` — Fresh installation (idempotent)
- `reset.sql` — Complete reset and recreate (use for troubleshooting)

## 🔍 Real-time Features Deep Dive

### Three Supabase Realtime Capabilities

1. **Postgres Changes** (Messages)
   - Listens for `INSERT` events on `chat_messages`
   - Automatic message broadcasting to all clients
   - Persistent storage with real-time updates

2. **Presence** (Online Users)
   - Tracks user join/leave events
   - Maintains online user state across connections
   - Automatic cleanup on disconnect

3. **Broadcast** (Cursor Tracking)
   - Low-latency coordinate sharing
   - 20fps throttling for performance
   - No persistence - real-time only

### Performance Optimizations
- **Throttling**: Mouse movements limited to 20fps
- **Efficient Rendering**: React state updates with minimal re-renders
- **Connection Management**: Proper cleanup on component unmount
- **Memory Management**: Cursor positions stored efficiently

## 🔧 Development Notes

### Port Configuration
- **Default Port**: 3000
- **Custom Port**: 8080 (configured for this demo)
- **URL**: `http://localhost:8080/chat`

### Message Monitoring Locations
- **Supabase Dashboard**: Database → Table Editor
- **Browser Console**: DevTools → Console (real-time logs)
- **Network Tab**: DevTools → Network (WebSocket connections)
- **Application UI**: Main chat interface

### Extension Possibilities
- **Multiple Rooms**: Extend `room` column for different chat areas
- **User Authentication**: Replace anonymous system with real user accounts
- **Message Types**: Add support for images, files, reactions
- **Private Messaging**: Direct messaging between users
- **Moderation Tools**: Message filtering and user management

## 🐛 Troubleshooting

### Common Issues
- **Table Structure**: Ensure `username` column exists (not `user_id`)
- **Realtime Enabled**: Verify replication is enabled for `chat_messages`
- **Permissions**: Check RLS policies and anon role grants
- **Schema Cache**: Run `select pg_notify('pgrst', 'reload schema');` if needed

### Debug Tools
- **Browser Console**: Real-time event logs
- **Supabase Logs**: Database and realtime connection logs
- **Network Tab**: WebSocket connection status

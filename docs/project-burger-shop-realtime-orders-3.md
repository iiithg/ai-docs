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

## 🛠️ Technical Implementation & Supabase APIs

### Real-time Chat Implementation

#### Technical Principles
The real-time chat functionality is built on Supabase's **Postgres Changes** mechanism, which enables real-time message delivery through database change events.

#### Core Implementation

**1. Database Table Structure & Replication Setup**
*File: `scripts/init.sql`*

```sql
-- Configure RLS (Row Level Security)
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Set up real-time replication identity
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
```

**2. Frontend Real-time Subscription**
*File: `app/chat/page.tsx:116-147`*

```typescript
// Listen for database INSERT events
const subscription = supabase
  .channel('chat_messages_channel')  // Create dedicated channel
  .on('postgres_changes', {
    event: 'INSERT',                  // Only listen to insert events
    schema: 'public',                 // Database schema
    table: 'chat_messages'           // Target table name
  }, (payload: any) => {
    // Handle new message event
    const newMessage = payload.new as Message;
    setMessages(prev => {
      // Duplicate prevention logic
      const exists = prev.some(msg =>
        msg.id === newMessage.id ||
        (msg.username === newMessage.username &&
         msg.content === newMessage.content &&
         Math.abs(new Date(msg.created_at).getTime() -
                  new Date(newMessage.created_at).getTime()) < 1000)
      );
      return exists ? prev : [...prev, newMessage];
    });
  })
  .subscribe((status: string) => {
    console.log('Chat subscription status:', status);
  });
```

**3. Optimistic Update Mechanism**
*File: `app/chat/page.tsx:285-341`*

```typescript
// Immediately display message when sent, wait for database confirmation
const tempMessage: Message = {
  id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  username: anonymousUser.name,
  content: newMessage.trim(),
  created_at: new Date().toISOString()
};

// Optimistic UI update
setMessages(prev => [...prev, tempMessage]);
setNewMessage('');

// Async database write
const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    username: anonymousUser.name,
    content: newMessage.trim(),
    room: 'lobby'
  })
  .select();

// Handle result: replace temp message on success, rollback on error
if (error) {
  setMessages(prev => prev.filter(msg => msg.id !== tempId));
  setNewMessage(content); // Restore input content
} else if (data && data.length > 0) {
  setMessages(prev => prev.map(msg =>
    msg.id === tempId ? data[0] : msg
  ));
}
```

#### Key Supabase APIs

**1. `supabase.channel(name)`**
- Creates real-time communication channel
- Supports multiple event types: `postgres_changes`, `presence`, `broadcast`

**2. `channel.on(event, filter, callback)`**
- `postgres_changes`: Listen for database changes
- `presence`: User online presence management
- `broadcast`: Custom message broadcasting

**3. `channel.subscribe()`**
- Activates channel subscription
- Returns subscription status (`SUBSCRIBED`, `TIMED_OUT`, `CLOSED`)

### Mouse Synchronization Implementation

#### Technical Principles
Mouse synchronization uses Supabase's **Broadcast** functionality for low-latency peer-to-peer coordinate broadcasting without database storage.

#### Core Implementation

**1. Presence + Broadcast Hybrid Channel**
*File: `app/chat/page.tsx:153-159`*

```typescript
const channel = supabase.channel('lobby_presence', {
  config: {
    presence: { key: anonymousUser.id },  // User identity key
    broadcast: { self: true }              // Receive own broadcasts
  }
});
```

**2. Online User State Management**
*File: `app/chat/page.tsx:167-183`*

```typescript
// Presence event handling
channel.on('presence', { event: 'sync' }, () => {
  const state: any = channel.presenceState();
  const flat: Record<string, PresenceUser> = {};
  // Flatten multi-dimensional array
  Object.values(state).forEach((arr: any) =>
    arr.forEach((u: any) => { flat[u.id] = { ...u }; })
  );
  setOnline(flat); // Update online user state
});

// User join event
channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('User joined:', key, newPresences);
});

// User leave event
channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('User left:', key, leftPresences);
});
```

**3. Mouse Position Broadcasting Mechanism**
*File: `app/chat/page.tsx:210-240`*

```typescript
// Mouse movement event handling (with throttling optimization)
useEffect(() => {
  let lastSent = 0;
  const throttleMs = 50; // 20fps = 1000/50ms

  const handleMouseMove = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastSent < throttleMs) return; // Throttle control
    lastSent = now;

    const payload = {
      id: anonymousUser.id,
      x: e.clientX,
      y: e.clientY,
      name: anonymousUser.name,
      color: anonymousUser.color
    };

    // Send broadcast message
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor',      // Custom event type
      payload
    });
  };

  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
}, [anonymousUser]);

// Receive other users' mouse positions
channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
  console.log('Cursor update:', payload);
  setOnline(prev => ({
    ...prev,
    [payload.id]: {
      ...(prev[payload.id] || {
        id: payload.id,
        name: 'Unknown',
        color: '#666'
      }),
      x: payload.x,
      y: payload.y
    }
  }));
});
```

**4. Real-time State Tracking**
*File: `app/chat/page.tsx:196-203`*

```typescript
// Start tracking user state after subscription completes
channel.subscribe(async (status: string) => {
  console.log('Presence subscription status:', status);
  if (status === 'SUBSCRIBED') {
    // Start tracking current user
    const me: PresenceUser = {
      id: anonymousUser.id,
      name: anonymousUser.name,
      color: anonymousUser.color
    };
    await channel.track(me);  // Register user with Presence system
  }
});
```

#### Key Supabase APIs

**1. `channel.send(options)`**
- Sends broadcast messages
- `type: 'broadcast'`: Broadcast type
- `event`: Custom event identifier
- `payload`: Data to transmit

**2. `channel.track(state)`**
- Registers user state with Presence system
- Handles connection state management automatically
- Auto-cleanup on disconnect

**3. `channel.presenceState()`**
- Retrieves current online user states
- Returns nested array format of state data

**4. Event Types Explained**
- `postgres_changes`: Database change events
- `presence_sync`: State synchronization events
- `presence_join`: User join events
- `presence_leave`: User leave events
- `broadcast`: Custom broadcast events

### Architecture Advantages

**1. Three-Layer Real-time Complementarity**
- **Postgres Changes**: Persistent data sync (messages)
- **Presence**: User state management (online list)
- **Broadcast**: Temporary data transmission (mouse positions)

**2. Performance Optimization Strategies**
- Mouse event throttling (20fps) to prevent network congestion
- Optimistic updates for enhanced user experience
- Automatic reconnection and error recovery mechanisms
- Memory-efficient state management

**3. Extensibility Design**
- Supports multi-room functionality extensions
- Anonymous user system can be replaced with authenticated users
- Modular event handling architecture
- Easy to add new event types

## 📁 Implementation File Locations

### Core Files
- **Chat Interface**: `app/chat/page.tsx` - Complete real-time implementation (531 lines)
- **Database Schema**: `scripts/init.sql` - Database initialization and real-time setup
- **Component**: `app/components/UserAvatar.tsx` - User avatar display component
- **Setup Guide**: `REALTIME_SETUP.md` - Troubleshooting and configuration guide

### Key Code Sections by Feature

**Real-time Chat Implementation:**
- Message subscription: `app/chat/page.tsx:116-147`
- Message sending with optimistic updates: `app/chat/page.tsx:285-341`
- Duplicate message prevention logic: `app/chat/page.tsx:126-141`

**Mouse Synchronization Implementation:**
- Channel setup with presence & broadcast: `app/chat/page.tsx:153-159`
- Mouse event throttling and broadcasting: `app/chat/page.tsx:210-240`
- Online user presence management: `app/chat/page.tsx:167-183`

**UI Components:**
- Configuration form: `app/chat/page.tsx:344-429`
- Cursor overlay rendering: `app/chat/page.tsx:435-453`
- Online users sidebar: `app/chat/page.tsx:456-484`

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

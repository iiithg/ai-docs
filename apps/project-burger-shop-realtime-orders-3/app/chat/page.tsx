'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

interface PresenceUser {
  id: string;
  name: string;
  color: string;
  x?: number;
  y?: number;
}

interface AnonymousUser {
  id: string;
  name: string;
  color: string;
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const ANIMAL_NAMES = ['🐶 Dog', '🐱 Cat', '🐭 Mouse', '🐹 Hamster', '🐰 Rabbit', '🦊 Fox', '🐻 Bear', '🐼 Panda', '🐨 Koala', '🐯 Tiger', '🦁 Lion', '🐮 Cow', '🐷 Pig', '🐸 Frog', '🐵 Monkey'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

function generateAnonymousUser(): AnonymousUser {
  const randomName = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    id: `anon_${Math.random().toString(36).substr(2, 9)}`,
    name: randomName,
    color: randomColor
  };
}

export default function ChatPage() {
  // Supabase configuration state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(null);
  const [configForm, setConfigForm] = useState({ url: '', anonKey: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  // Chat state
  const [supabase, setSupabase] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [online, setOnline] = useState<Record<string, PresenceUser>>({});
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [ready, setReady] = useState(false);
  
  const channelRef = useRef<any>(null);
  const myColor = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);

  // Initialize Supabase configuration
  useEffect(() => {
    // Only try to get config from localStorage
    const savedConfig = localStorage.getItem('supabase-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setSupabaseConfig(config);
        setConfigForm(config);
      } catch (error) {
        console.error('Failed to parse saved config:', error);
        localStorage.removeItem('supabase-config');
      }
    }
    // Always start with configuration form if no saved config
  }, []);

  // Initialize Supabase client when config is available
  useEffect(() => {
    if (supabaseConfig) {
      try {
        const client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
        setSupabase(client);
        setAnonymousUser(generateAnonymousUser());
      } catch (error) {
        console.error('Failed to create Supabase client:', error);
        setConnectionError('Invalid Supabase configuration');
      }
    }
  }, [supabaseConfig]);

  // Load initial messages + subscribe
  useEffect(() => {
    if (!supabase) return;
    setReady(true);
    
    (async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(200);
        
        if (error) {
          console.error('Error loading messages:', error);
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    })();
    
    const sub = supabase
      .channel('chat_messages_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload: any) => {
        console.log('New message received:', payload.new);
        const newMessage = payload.new as Message;

        // Only add the message if it's not already in the list
        // This prevents duplicate messages when using optimistic updates
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg =>
            msg.id === newMessage.id ||
            (msg.username === newMessage.username &&
             msg.content === newMessage.content &&
             Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 1000)
          );

          if (!exists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      })
      .subscribe((status: string) => {
        console.log('Chat subscription status:', status);
      });
    
    return () => { supabase.removeChannel(sub); };
  }, [supabase]);

  // Presence + cursors
  useEffect(() => {
    if (!supabase || !anonymousUser) return;
    
    const ch = supabase.channel('lobby_presence', { 
      config: { 
        presence: { key: anonymousUser.id },
        broadcast: { self: true }
      } 
    });
    channelRef.current = ch;
    
    const me: PresenceUser = { 
      id: anonymousUser.id, 
      name: anonymousUser.name, 
      color: anonymousUser.color
    };
    
    ch.on('presence', { event: 'sync' }, () => {
      console.log('Presence sync');
      const state: any = ch.presenceState();
      const flat: Record<string, PresenceUser> = {};
      Object.values(state).forEach((arr: any) => arr.forEach((u: any) => { flat[u.id] = { ...u }; }));
      console.log('Online users:', flat);
      setOnline(flat);
    });
    
    ch.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      console.log('User joined:', key, newPresences);
    });
    
    ch.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      console.log('User left:', key, leftPresences);
    });
    
    ch.on('broadcast', { event: 'cursor' }, ({ payload }: any) => {
      console.log('Cursor update:', payload);
      setOnline((prev) => ({ 
        ...prev, 
        [payload.id]: { 
          ...(prev[payload.id] || { id: payload.id, name: 'Unknown', color: '#666' }), 
          x: payload.x, 
          y: payload.y 
        } 
      }));
    });
    
    ch.subscribe(async (status: string) => {
      console.log('Presence subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Tracking presence for:', me);
        await ch.track(me);
      }
    });
    
    return () => { 
      console.log('Cleaning up presence channel');
      supabase.removeChannel(ch); 
    };
  }, [supabase, anonymousUser]);

  // Mouse tracking
  useEffect(() => {
    if (!channelRef.current || !anonymousUser) return;
    
    let lastSent = 0;
    const throttleMs = 50; // Throttle to 20fps
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent < throttleMs) return;
      lastSent = now;
      
      const payload = { 
        id: anonymousUser.id, 
        x: e.clientX, 
        y: e.clientY,
        name: anonymousUser.name,
        color: anonymousUser.color
      };
      
      console.log('Sending cursor update:', payload);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor',
        payload
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [anonymousUser]);

  const testConnection = async () => {
    if (!configForm.url || !configForm.anonKey) {
      setConnectionError('请填写 Supabase URL 和 Anon Key');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      const testClient = createClient(configForm.url, configForm.anonKey);
      
      // Test connection by trying to fetch from chat_messages table
      const { error } = await testClient.from('chat_messages').select('count').limit(1);
      
      if (error) {
        throw new Error(`连接测试失败: ${error.message}`);
      }

      // Save configuration
      const config = { url: configForm.url, anonKey: configForm.anonKey };
      localStorage.setItem('supabase-config', JSON.stringify(config));
      setSupabaseConfig(config);
      
    } catch (error: any) {
      setConnectionError(error.message || '连接失败，请检查配置');
    } finally {
      setIsConnecting(false);
    }
  };

  const resetConfiguration = () => {
    localStorage.removeItem('supabase-config');
    setSupabaseConfig(null);
    setSupabase(null);
    setAnonymousUser(null);
    setMessages([]);
    setOnline({});
    setReady(false);
    setConfigForm({ url: '', anonKey: '' });
    setConnectionError('');
  };

  const send = async () => {
    if (!newMessage.trim() || !supabase || !anonymousUser) {
      console.log('Send blocked:', {
        hasMessage: !!newMessage.trim(),
        hasSupabase: !!supabase,
        hasUser: !!anonymousUser
      });
      return;
    }

    const content = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage: Message = {
      id: tempId,
      username: anonymousUser.name,
      content,
      created_at: new Date().toISOString()
    };

    // Optimistically add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    const messageData = {
      username: anonymousUser.name,
      content,
      room: 'lobby'
    };

    console.log('Attempting to send message:', messageData);

    try {
      const { data, error } = await supabase.from('chat_messages').insert(messageData).select();

      if (error) {
        console.error('Error sending message:', error);
        // Remove the optimistic message and show error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        setNewMessage(content); // Restore the message content
        alert(`发送消息失败: ${error.message}`);
      } else {
        console.log('Message sent successfully:', data);
        // Replace temporary message with real one from database
        if (data && data.length > 0) {
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? data[0] : msg
          ));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(content); // Restore the message content
      alert(`发送消息异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // Show configuration form if not configured
  if (!supabaseConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🍔 Burger Chat</h1>
            <p className="text-gray-600">实时聊天 + 鼠标跟踪演示</p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 设置步骤：</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. 登录 <a href="https://supabase.com" target="_blank" className="underline">Supabase</a> 并创建项目</li>
              <li>2. 在 Settings → API 获取配置信息</li>
              <li>3. 在 SQL 编辑器运行数据库脚本</li>
              <li>4. 启用 Database → Replication</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project URL
              </label>
              <input
                type="url"
                value={configForm.url}
                onChange={(e) => setConfigForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">从 Settings → API → Project URL 复制</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anon Public Key
              </label>
              <textarea
                value={configForm.anonKey}
                onChange={(e) => setConfigForm(prev => ({ ...prev, anonKey: e.target.value }))}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">从 Settings → API → anon public 复制</p>
            </div>
            
            {connectionError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                <strong>连接失败：</strong>{connectionError}
              </div>
            )}
            
            <button
              onClick={testConnection}
              disabled={isConnecting || !configForm.url.trim() || !configForm.anonKey.trim()}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isConnecting ? '连接中...' : '🚀 连接并开始聊天'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">📝 需要运行的 SQL 脚本：</p>
            <div className="text-xs bg-gray-800 text-green-400 p-3 rounded font-mono overflow-x-auto">
              <div>-- 创建聊天消息表</div>
              <div>CREATE TABLE chat_messages (</div>
              <div>&nbsp;&nbsp;id uuid DEFAULT gen_random_uuid() PRIMARY KEY,</div>
              <div>&nbsp;&nbsp;user_id text NOT NULL,</div>
              <div>&nbsp;&nbsp;user_name text NOT NULL,</div>
              <div>&nbsp;&nbsp;content text NOT NULL,</div>
              <div>&nbsp;&nbsp;room text DEFAULT 'lobby',</div>
              <div>&nbsp;&nbsp;created_at timestamptz DEFAULT now()</div>
              <div>);</div>
              <div className="mt-2">-- 启用 RLS 和策略</div>
              <div>ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;</div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 完整脚本在 <code>scripts/init-chat.sql</code> 文件中
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 to-red-50 flex">
      {/* Cursor overlays */}
      {Object.values(online).map((user) => 
        user.x && user.y && user.id !== anonymousUser?.id ? (
          <div
            key={user.id}
            className="fixed pointer-events-none z-50 transition-all duration-75"
            style={{ left: user.x, top: user.y, transform: 'translate(-50%, -50%)' }}
          >
            <div className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-xs bg-black text-white px-1 py-0.5 rounded shadow-lg">
                {user.name}
              </span>
            </div>
          </div>
        ) : null
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg text-gray-900">🍔 Burger Chat</h2>
          <p className="text-sm text-gray-600">
            {anonymousUser?.name} ({Object.keys(online).length} online)
          </p>
          <button
            onClick={resetConfiguration}
            className="mt-2 text-xs text-orange-600 hover:text-orange-800"
          >
            Reconfigure Supabase
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Online Users</h3>
          <div className="space-y-2">
            {Object.values(online).map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex space-x-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{msg.username}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={send}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

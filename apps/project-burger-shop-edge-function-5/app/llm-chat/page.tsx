"use client";
import { useState } from 'react';
import { fetchJsonVerbose, formatUnknownError } from '@/app/lib/fetcher';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('supabase_url') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

export default function LlmChatPage() {
  const [input, setInput] = useState('Tell me a burger joke.');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are a helpful burger shop assistant.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [endpoint, setEndpoint] = useState('');

  async function send() {
    setLoading(true); setError('');
    try {
      const base = getBaseUrl();
      const url = (endpoint && endpoint.trim().length > 0)
        ? endpoint.trim()
        : ((base ? `${base}` : '') + '/functions/v1/llm-chat');
      const data = await fetchJsonVerbose(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: input }],
          model: 'gpt-3.5-turbo',
          temperature: 0.5,
          max_tokens: 256,
        }),
        tag: 'llm-chat'
      });
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input },
        data.message as ChatMessage,
      ]);
      setInput('');
    } catch (e: any) {
      setError(e?.message || formatUnknownError(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">LLM Chat (Edge Function)</h1>
      <div className="space-y-2">
        <label className="block text-sm">Message</label>
        <textarea
          className="w-full rounded border px-3 py-2 h-24"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <label className="block text-sm">Endpoint URL (可选，覆盖默认)</label>
        <input className="w-full rounded border px-3 py-2" placeholder="https://<project>.supabase.co/functions/v1/llm-chat" value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
        <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}
      <div className="space-y-2">
        <div className="font-medium">Conversation</div>
        <div className="rounded border bg-white p-3 space-y-2">
          {messages.filter((m, i) => !(i === 0 && m.role === 'system')).map((m, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold mr-2">{m.role === 'assistant' ? 'Assistant' : 'You'}:</span>
              <span className="text-neutral-700 whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-neutral-500">Calls <code>/functions/v1/llm-chat</code>. Requires OPENAI_API_KEY on the function side.</div>
    </div>
  );
}

"use client";
import Link from 'next/link';
import Settings from '@/app/components/Settings';

export default function Home() {
  const demos = [
    {
      title: 'LLM Chat',
      description: 'OpenAI‑compatible chat completions',
      href: "/llm-chat",
      emoji: '🤖'
    },
    {
      title: 'Send Emails',
      description: 'Queue/send via Edge Function',
      href: "/email",
      emoji: '📧'
    },
    {
      title: 'Text → Image',
      description: 'Generate images via OpenAI‑compatible API',
      href: '/txt2img',
      emoji: '🖼️'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI & Email via Edge Functions</h1>
          <p className="text-gray-600 mt-2">OpenAI‑compatible chat, text‑to‑image, and email queue</p>
        </div>
        <Settings />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 mb-2">🚀 Features</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• OpenAI‑compatible chat completions</li>
          <li>• Text‑to‑image via compatible API</li>
          <li>• Email queue and templating</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map((demo) => (
          <Link
            key={demo.href}
            href={demo.href}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{demo.emoji}</span>
              <h3 className="font-semibold text-gray-900">{demo.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{demo.description}</p>
            <div className="mt-4">
              <span className="text-burger-red font-medium text-sm">Open →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Setup Required</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Set Supabase URL and Anon Key via Settings or <code>.env.local</code></li>
          <li>Create these Edge Functions in your Supabase project: <code>llm-chat</code>, <code>send-email</code>, <code>txt2img</code></li>
          <li>Configure function env vars in Dashboard: <code>OPENAI_API_KEY</code>, <code>NANOBANANA_API_URL</code>/<code>NANOBANANA_API_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code> (for email queue)</li>
        </ol>
      </div>
    </div>
  );
}

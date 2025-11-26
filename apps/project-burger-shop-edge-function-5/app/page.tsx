"use client";
import Link from 'next/link';

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Burger Shop Edge Functions</h1>
        <p className="text-gray-600 mt-2">AI chat, email sending, and image generation powered by Supabase Edge Functions</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 mb-2">🚀 Features</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• LLM Chat - OpenAI-compatible chat completions</li>
          <li>• Send Email - Email delivery via Edge Function</li>
          <li>• Text to Image - AI image generation</li>
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
          <li>Deploy Edge Functions from <code>/scripts</code> directory: <code>llm-chat.ts</code>, <code>send-email.ts</code>, <code>txt2img.ts</code></li>
          <li>Configure function environment variables in Supabase Dashboard: <code>OPENAI_API_KEY</code>, <code>RESEND_API_KEY</code>, <code>NANOBANANA_API_URL</code>/<code>NANOBANANA_API_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
        </ol>
      </div>
    </div>
  );
}

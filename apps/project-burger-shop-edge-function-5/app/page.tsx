"use client";
import Link from 'next/link';
import Settings from '@/app/components/Settings';

export default function Home() {
  const demos = [
    {
      title: "LLM Chat",
      description: "Test OpenAI GPT integration",
      href: "/llm-chat",
      emoji: "🤖"
    },
    {
      title: "Email Service",
      description: "Send emails with templates",
      href: "/email",
      emoji: "📧"
    },
    {
      title: "User Registration",
      description: "Automated user signup with profiles",
      href: "/register",
      emoji: "👤"
    },
    {
      title: "Invite Registration",
      description: "Signup with invitation codes",
      href: "/invite-signup",
      emoji: "🎟️"
    },
    {
      title: "Manage Invites",
      description: "Create and manage invitation codes",
      href: "/manage-invites",
      emoji: "🎫"
    },
    {
      title: "Weather",
      description: "Weather data proxy (original demo)",
      href: "/weather",
      emoji: "🌤️"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Edge Functions</h1>
          <p className="text-gray-600 mt-2">Real-world Supabase Edge Functions demo</p>
        </div>
        <Settings defaultOpen />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 mb-2">🚀 Features Demonstrated</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• LLM integration (OpenAI GPT)</li>
          <li>• Email service with templates</li>
          <li>• Automated user registration</li>
          <li>• Invite-only registration system</li>
          <li>• Transaction-based operations</li>
          <li>• External API integration</li>
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
              <span className="text-burger-red font-medium text-sm">Try it →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Setup Required</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Configure Supabase environment variables</li>
          <li>Run database initialization script (<code>scripts/init.sql</code>)</li>
          <li>Deploy Edge Functions using Supabase CLI</li>
          <li>Configure OpenAI API key for LLM features</li>
          <li>Set up email service for email features</li>
        </ol>
      </div>
    </div>
  );
}


"use client";
import Link from 'next/link';
import Settings from '@/app/components/Settings';

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edge Function Demo</h1>
        <Settings defaultOpen />
      </div>
      <p className="text-neutral-700">Try the weather proxy function.</p>
      <Link href="/weather" className="inline-block px-4 py-2 bg-burger-red text-white rounded">Open Weather</Link>
    </div>
  );
}


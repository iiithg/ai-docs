"use client";
import Link from 'next/link';
import Settings from '@/app/components/Settings';

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Storage Uploads Demo</h1>
        <Settings onSettingsChange={() => {}} defaultOpen />
      </div>
      <p className="text-neutral-700">Go to your profile to upload an avatar.</p>
      <Link href="/profile" className="inline-block px-4 py-2 bg-burger-red text-white rounded">Open Profile</Link>
    </div>
  );
}

"use client";
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function ClerkLoginCatchAll() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Clerk Login</h1>
        <p className="text-sm text-neutral-600">Authentication using Clerk.</p>
      </div>
      <div className="rounded border bg-white p-4 flex justify-center">
        <SignIn routing="path" path="/clerk/login" afterSignInUrl="/entry" afterSignUpUrl="/entry" />
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { routeHandlerClient } from '@/lib/supabase/server';

// Handles the OAuth callback: exchanges the "code" for a session cookie
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (error) return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, url.origin));

  if (code) {
    const supabase = routeHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL('/protected', url.origin));
}


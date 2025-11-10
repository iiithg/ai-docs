import { NextResponse } from 'next/server';
import { routeHandlerClient } from '@/lib/supabase/server';

// Handles the OAuth callback: exchanges the "code" for a session cookie
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (error) return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, url.origin));

  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasEnv) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent('supabase_not_configured')}`, url.origin));
  }

  if (code) {
    const supabase = routeHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL('/entry', url.origin));
}

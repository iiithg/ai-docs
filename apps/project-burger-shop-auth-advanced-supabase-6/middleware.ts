import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isProtected = req.nextUrl.pathname.startsWith('/entry');
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is missing, avoid crashing in middleware
  if (!urlEnv || !keyEnv) {
    // Let the Entry page render its own "not configured" message
    return res;
  }

  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ['/entry']
};

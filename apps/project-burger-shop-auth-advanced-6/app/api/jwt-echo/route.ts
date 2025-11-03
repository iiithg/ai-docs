import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Minimal JWT verification for Supabase access tokens.
// Requires SUPABASE_JWT_SECRET from Supabase Settings → API.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });
  }
  const token = auth.slice('Bearer '.length);

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server not configured (SUPABASE_JWT_SECRET missing)' }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    return NextResponse.json({ ok: true, sub: decoded.sub, exp: decoded.exp, aud: decoded.aud, role: decoded.role });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}


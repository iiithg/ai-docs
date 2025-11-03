import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { path, expiresIn = 3600 } = await req.json();
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server signing not configured' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin.storage
      .from('avatars')
      .createSignedUrl(path, Math.max(60, Math.min(60 * 60 * 24 * 7, Number(expiresIn)))) ; // min 1m, max 7d

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to sign URL', path }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl, path, expiresIn });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error', stack: e?.stack }, { status: 500 });
  }
}

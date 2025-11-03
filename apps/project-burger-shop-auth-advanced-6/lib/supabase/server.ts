import { cookies } from 'next/headers';
import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export function serverComponentClient() {
  return createServerComponentClient({ cookies });
}

export function routeHandlerClient() {
  return createRouteHandlerClient({ cookies });
}


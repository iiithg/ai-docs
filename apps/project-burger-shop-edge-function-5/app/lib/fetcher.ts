export function formatUnknownError(err: unknown, extra?: Record<string, any>): string {
  try {
    const parts: string[] = [];
    if (err && typeof err === 'object') {
      const anyErr = err as any;
      const name = anyErr.name || 'Error';
      const message = anyErr.message || String(err);
      parts.push(`${name}: ${message}`);
      if (anyErr.stack) parts.push(String(anyErr.stack));
    } else {
      parts.push(String(err));
    }
    if (extra && Object.keys(extra).length) {
      parts.push(`Context: ${JSON.stringify(extra)}`);
    }
    return parts.join('\n');
  } catch {
    return 'Unknown error';
  }
}

export async function fetchJsonVerbose(input: RequestInfo | URL, init?: RequestInit & { tag?: string }): Promise<any> {
  const urlStr = typeof input === 'string' ? input : (input as any)?.url || '';
  const meta = {
    method: init?.method || 'GET',
    url: urlStr,
    headers: init?.headers || undefined,
  };
  // Augment headers for Supabase Edge Functions (anon apikey + optional access token)
  const headers: Record<string, string> = {};
  // Copy existing headers if provided
  if (init?.headers && typeof init.headers === 'object') {
    Object.assign(headers, init.headers as Record<string, string>);
  }
  try {
    const isSupabaseFn = /\.supabase\.(co|in)\/.+\/functions\/v1\//.test(urlStr);
    if (isSupabaseFn) {
      const anon = (typeof window !== 'undefined' && (localStorage.getItem('supabase_anon_key') || '')) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      if (anon && !('apikey' in headers)) headers['apikey'] = anon;
      const access = typeof window !== 'undefined' ? (localStorage.getItem('supabase_access_token') || '') : '';
      if (access && !('Authorization' in headers)) headers['Authorization'] = `Bearer ${access}`;
    }
  } catch {}
  const finalInit: RequestInit = { ...init, headers };
  try {
    const res = await fetch(input as any, finalInit);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    const tryParse = () => {
      try { return text ? JSON.parse(text) : null; } catch { return null; }
    };
    const json = tryParse();
    if (!res.ok) {
      const details = [
        `HTTP ${res.status} ${res.statusText}`,
        `URL: ${meta.url}`,
        `Method: ${meta.method}`,
        init?.tag ? `Tag: ${init.tag}` : '',
        `Response-CT: ${contentType || 'unknown'}`,
        text ? `Body: ${text}` : 'Body: <empty>'
      ].filter(Boolean).join('\n');
      const msg = json?.error ? `${json.error}\n${details}` : details;
      const error = new Error(msg);
      throw error;
    }
    return json ?? text;
  } catch (err) {
    // Network/CORS or other fatal errors
    const msg = formatUnknownError(err, meta);
    throw new Error(msg);
  }
}

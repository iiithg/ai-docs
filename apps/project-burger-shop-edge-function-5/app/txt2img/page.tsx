"use client";
import { useMemo, useState } from 'react';
import { fetchJsonVerbose, formatUnknownError } from '@/app/lib/fetcher';

function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('supabase_url') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

type ParsedImage = { url?: string; dataUrl?: string; note?: string };

function parseImages(upstream: any): ParsedImage[] {
  const out: ParsedImage[] = [];
  const seenUrl = new Set<string>();
  const seenData = new Set<string>();
  try {
    const content = upstream?.choices?.[0]?.message?.content ?? [];

    // Case 1: provider returns a string (e.g., Markdown with data:image URL)
    if (typeof content === 'string') {
      const s = content as string;
      // Extract Markdown image URLs: ![alt](url)
      const mdImgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = mdImgRe.exec(s)) !== null) {
        const link = match[1];
        if (link.startsWith('data:image')) {
          if (!seenData.has(link)) { out.push({ dataUrl: link }); seenData.add(link); }
        } else {
          if (!seenUrl.has(link)) { out.push({ url: link }); seenUrl.add(link); }
        }
      }
      // Also catch raw data URLs without markdown wrapper
      const dataRe = /(data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)/g;
      while ((match = dataRe.exec(s)) !== null) {
        const d = match[1];
        if (!seenData.has(d)) { out.push({ dataUrl: d }); seenData.add(d); }
      }
      // Also catch plain http(s) image links present in text
      const httpRe = /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s)]*)?)/gi;
      while ((match = httpRe.exec(s)) !== null) {
        const u = match[1];
        if (!seenUrl.has(u)) { out.push({ url: u }); seenUrl.add(u); }
      }
      return out;
    }

    // Case 2: provider returns array content items (OpenAI content-array shape)
    for (const item of content as any[]) {
      if (!item) continue;
      const url = item.image_url?.url || item.url || item.image_url;
      const b64 = item.b64_json || item.data || item.base64;
      if (url) {
        if (!seenUrl.has(url)) { out.push({ url }); seenUrl.add(url); }
      } else if (b64) {
        const d = `data:image/png;base64,${b64}`;
        if (!seenData.has(d)) { out.push({ dataUrl: d }); seenData.add(d); }
      }
    }
  } catch {}
  return out;
}

export default function Txt2ImgPage() {
  const base = useMemo(getBaseUrl, []);
  const [prompt, setPrompt] = useState("A cat holding a sign that says 'AIID is the best gogogo!!!!'");
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [endpoint, setEndpoint] = useState('');
  const [images, setImages] = useState<ParsedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true); setError(''); setImages([]);
    try {
      const url = (endpoint && endpoint.trim().length > 0)
        ? endpoint.trim()
        : ((base ? `${base}` : '') + '/functions/v1/txt2img');
      const data = await fetchJsonVerbose(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
        tag: 'txt2img'
      });
      const parsed = parseImages(data?.upstream);
      setImages(parsed);
      if (parsed.length === 0) {
        setError('No image entries found in upstream response.');
      }
    } catch (e: any) {
      setError(e?.message || formatUnknownError(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Text to Image (OpenAI‑compatible)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm">Prompt</label>
          <textarea className="w-full rounded border px-3 py-2 h-28" value={prompt} onChange={e=>setPrompt(e.target.value)} />
          <label className="block text-sm">Model</label>
          <input className="w-full rounded border px-3 py-2" value={model} onChange={e=>setModel(e.target.value)} />
          <label className="block text-sm">Endpoint URL (可选，覆盖默认)</label>
          <input className="w-full rounded border px-3 py-2" placeholder="https://<project>.supabase.co/functions/v1/dynamic-endpoint" value={endpoint} onChange={e=>setEndpoint(e.target.value)} />
          <button onClick={generate} disabled={loading || !prompt.trim()} className="px-4 py-2 bg-burger-red text-white rounded disabled:bg-neutral-300">
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div>
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded mb-2">{error}</div>}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {images.map((img, i) => (
                <div key={i} className="rounded border bg-white p-2">
                  {img.url && <img src={img.url} alt={`img-${i}`} className="w-full h-auto" />}
                  {img.dataUrl && <img src={img.dataUrl} alt={`img-${i}`} className="w-full h-auto" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-neutral-500">Calls <code>/functions/v1/txt2img</code> which proxies an OpenAI‑compatible endpoint (<code>NANOBANANA_API_URL</code>).</div>
    </div>
  );
}

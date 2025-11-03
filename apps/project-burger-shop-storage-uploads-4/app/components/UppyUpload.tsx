"use client";
import { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Tus from '@uppy/tus';
import Webcam from '@uppy/webcam';
import Url from '@uppy/url';
import Unsplash from '@uppy/unsplash';
import { SupabaseClient } from '@supabase/supabase-js';
import { getStoredSupabaseSettings } from '@/lib/supabase/dynamic-client';

// Import Uppy styles
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';
import '@uppy/webcam/css/style.css';

interface UppyUploadProps {
  supabase: SupabaseClient | null;
  user?: { id: string; email?: string | null } | null;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  hideTitle?: boolean; // hide internal heading to avoid duplicate titles
  showDetailsOnSuccess?: boolean; // show dual-link details by default
}

export default function UppyUpload({ 
  supabase, 
  user, 
  onUploadSuccess, 
  onUploadError,
  hideTitle = false,
  showDetailsOnSuccess = false,
}: UppyUploadProps) {
  const uppyRef = useRef<Uppy | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const endpointRef = useRef<string>('');
  const [publicUrlView, setPublicUrlView] = useState<string>('');
  const [publicUrlOk, setPublicUrlOk] = useState<boolean>(false);
  const [signedUrlView, setSignedUrlView] = useState<string>('');
  const [showDetails] = useState<boolean>(true);
  const [debugText, setDebugText] = useState<string>('');

  function buildHelpfulError(file: any, error: any) {
    try {
      const bucket = file?.meta?.bucketName || 'avatars';
      const objectName = file?.meta?.objectName || '(unknown object)';
      const endpoint = endpointRef.current;
      const m: string = String(error?.message || 'Upload failed');
      const codeMatch = m.match(/response code: (\d+)/i);
      const textMatch = m.match(/response text: ([^,\)]+)/i);
      const code = codeMatch?.[1] || 'n/a';
      const respText = textMatch?.[1] || 'n/a';
      const isRLS = /row-level security/i.test(respText) || /row level security/i.test(m);

      const details = [
        `Bucket: ${bucket}`,
        `Object: ${objectName}`,
        `Endpoint: ${endpoint}`,
        `Status: ${code}`,
        `Server says: ${respText}`,
      ].join(' \n');

      let hint = respText.toLowerCase().includes('bucket not found')
        ? `Hint: Bucket "${bucket}" does not exist in your project. Create it (public is fine for avatars) or change the bucket name. See STORAGE_SETUP.md.`
        : 'Check Supabase URL/key in Settings and your Storage bucket/policies.';

      if (isRLS) {
        const roleNote = user ? 'authenticated' : 'anon';
        const sqlSimple = `create policy "avatars insert" on storage.objects for insert to public with check (bucket_id = 'avatars');`;
        const sqlFolderAware = `create policy "avatars insert scoped" on storage.objects for insert to public with check (bucket_id='avatars' and ((auth.role()='authenticated' and split_part(name,'/',1)=auth.uid()::text) or (auth.role()='anon' and split_part(name,'/',1)='guest')));`;
        hint = [
          `RLS blocked the insert (role: ${roleNote}). Fix policies in Storage > Policies for bucket "${bucket}".`,
          `Option A (demo, simplest):`,
          sqlSimple,
          `Option B (recommended, folder-scoped):`,
          sqlFolderAware,
        ].join('\n');
      }

      return `Upload failed: ${m}\n\n${details}\n${hint}`;
    } catch {
      return `Upload failed: ${error?.message || 'Unknown error'}`;
    }
  }

  async function getAccessibleUrl(client: SupabaseClient, objectName: string) {
    // Strategy: prefer real public availability; otherwise try signed URL; never return a public URL that 404s.
    const { data: pub } = client.storage.from('avatars').getPublicUrl(objectName);
    const publicUrl = pub?.publicUrl as string | undefined;
    // Derive policy-related values for debugging
    const folder = (objectName || '').split('/')[0] || '';
    const ext = (objectName.split('.').pop() || '').toLowerCase();
    const bucket = 'avatars';
    const { data: sessionData } = await client.auth.getSession();
    const currentRole = sessionData?.session?.user ? 'authenticated' : 'anon';
    const bucketOk = bucket === 'avatars';
    const folderOk = folder.toLowerCase() === 'public';
    const extOk = ext === 'jpg';
    const roleOk = currentRole === 'anon';
    setDebugText([
      'Debug — Policy Check (simulated client-side):',
      `  Role: ${currentRole}`,
      `  Bucket: ${bucket}  -> ${bucketOk ? 'PASS' : 'FAIL'}`,
      `  Folder: ${folder}  (expect: public) -> ${folderOk ? 'PASS' : 'FAIL'}`,
      `  Ext: .${ext}  (expect: .jpg) -> ${extOk ? 'PASS' : 'FAIL'}`,
      `  Condition auth.role() = 'anon' -> ${roleOk ? 'PASS' : 'FAIL'}`,
    ].join('\n'));
    // 1) Check if the public URL actually resolves
    const debugLines: string[] = [`objectName: ${objectName}`];
    const ttlSeconds = 60 * 60; // 1 hour
    // Try listing to confirm visibility of the object under current role
    try {
      const baseName = objectName.split('/').pop() || '';
      const { data: listed, error: listErr } = await client.storage
        .from('avatars')
        .list((objectName || '').split('/')[0] || '', { search: baseName, limit: 1 });
      if (listErr) {
        debugLines.push(`list('${(objectName || '').split('/')[0] || ''}', search='${baseName}') -> error: ${listErr.message}`);
      } else {
        debugLines.push(`list('${(objectName || '').split('/')[0] || ''}', search='${baseName}') -> ${(listed?.length || 0)} item(s)`);
      }
    } catch (e: any) {
      debugLines.push(`list check failed: ${e?.message || e}`);
    }
    if (publicUrl) {
      try {
        const head = await fetch(publicUrl, { method: 'HEAD' });
        debugLines.push(`HEAD ${publicUrl} -> ${head.status}`);
        if (head.ok) {
          setPublicUrlView(publicUrl);
          setPublicUrlOk(true);
          setDebugText(prev => prev ? prev + '\n' + debugLines.join('\n') : debugLines.join('\n'));
          return { url: publicUrl, note: 'Public URL', publicUrl, publicOk: true };
        } else {
          setPublicUrlView(publicUrl);
          setPublicUrlOk(false);
        }
      } catch (e: any) {
        debugLines.push(`HEAD ${publicUrl} failed: ${e?.message || e}`);
      }
    }
    // 2) Try signed URL (1 hour) with client role
    let signErr: any = null;
    const delays = [200, 500, 1000, 1500, 2000];
    debugLines.push(`client.createSignedUrl request: { bucket: 'avatars', path: '${objectName}', expiresIn: ${ttlSeconds} }`);
    for (let i = 0; i < delays.length; i++) {
      const { data: signed, error } = await client.storage
        .from('avatars')
        .createSignedUrl(objectName, ttlSeconds);
      signErr = error;
      if (error) debugLines.push(`client createSignedUrl try#${i+1} -> ${error.message || JSON.stringify(error)}`);
      if (signed?.signedUrl) {
        setSignedUrlView(signed.signedUrl as string);
        debugLines.push('client createSignedUrl -> success');
        setDebugText(prev => prev ? prev + '\n' + debugLines.join('\n') : debugLines.join('\n'));
        return { url: signed.signedUrl as string, note: 'Signed URL (1h)', publicUrl, publicOk: false, signedUrl: signed.signedUrl };
      }
      // small delay before retry (handles slight propagation delay after TUS finalize)
      await new Promise(r => setTimeout(r, delays[i]));
    }
    // 2b) Server-side signing fallback (uses service role if configured)
    try {
      debugLines.push(`server.sign request: { path: '${objectName}', expiresIn: ${ttlSeconds} }`);
      const res = await fetch('/api/storage/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: objectName, expiresIn: ttlSeconds }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.url) {
          setSignedUrlView(json.url as string);
          debugLines.push('server /api/storage/sign -> success');
          setDebugText(prev => prev ? prev + '\n' + debugLines.join('\n') : debugLines.join('\n'));
          return { url: json.url as string, note: 'Signed URL (server · 1h)', publicUrl, publicOk: false };
        }
        debugLines.push('server /api/storage/sign -> ok but body missing url');
      } else {
        const text = await res.text();
        debugLines.push(`server /api/storage/sign -> ${res.status} ${text}`);
      }
    } catch (e: any) {
      debugLines.push(`server /api/storage/sign failed: ${e?.message || e}`);
    }
    setDebugText(prev => prev ? prev + '\n' + debugLines.join('\n') : debugLines.join('\n'));
    // 3) Return empty with diagnostic note
    return { url: '', note: signErr?.message || 'Bucket is private and current role lacks select to create a signed URL.', publicUrl, publicOk: false };
  }

  useEffect(() => {
    if (!supabase || !dashboardRef.current) return;

    // Get Supabase configuration from stored settings or environment
    const storedSettings = getStoredSupabaseSettings();
    const supabaseUrl = storedSettings.url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = storedSettings.key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      setMessage('Supabase configuration missing. Please configure in Settings.');
      return;
    }
    
    // Extract project ID from URL
    const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const endpoint = `https://${projectId}.supabase.co/storage/v1/upload/resumable`;
    endpointRef.current = endpoint;
    
    // Create Uppy instance
    const uppy = new Uppy({
      restrictions: {
        maxFileSize: 2 * 1024 * 1024, // 2MB
        allowedFileTypes: ['image/*'],
        maxNumberOfFiles: 3, // Allow multiple files
      },
      autoProceed: false,
    });

    // Configure Dashboard
    uppy.use(Dashboard, {
      target: dashboardRef.current,
      inline: true,
      width: '100%',
      height: 400, // Increased height for better UI
      hideProgressDetails: false,
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      showRemoveButtonAfterComplete: true,
      note: 'Images only, up to 2MB each, max 3 files',
    });

    // Add Webcam plugin
    uppy.use(Webcam, {
      countdown: 3,
      modes: ['picture'], // Only picture mode for images
      mirror: true,
    });

    // Add URL import plugin
    uppy.use(Url, {
      companionUrl: 'https://companion.uppy.io', // Using public companion server
    });

    // Add Unsplash plugin
    uppy.use(Unsplash, {
      companionUrl: 'https://companion.uppy.io',
    });

    // Configure TUS for resumable uploads
    uppy.use(Tus, {
      endpoint,
      headers: {
        authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      // Disable resumable cache so selecting the same local file does not "resume"
      // an already-completed upload (which would make it look like nothing changed).
      resume: false,
      removeFingerprintOnSuccess: true,
      uploadDataDuringCreation: true,
      chunkSize: 6 * 1024 * 1024, // 6MB chunks as recommended by Supabase
      allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
      onError: function (error) {
        console.error('TUS Upload failed:', error);
        const friendly = buildHelpfulError(undefined, error);
        setMessage(friendly);
        onUploadError?.(friendly);
      },
    });

    // Handle file added
    uppy.on('file-added', (file) => {
      const uuid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      const timestamp = Date.now();

      // To satisfy your existing RLS: folder must be 'public' and extension 'jpg'
      const objectName = `public/avatar-${timestamp}-${uuid}.jpg`;

      const supabaseMetadata = {
        bucketName: 'avatars',
        objectName,
        contentType: file.type, // Keep original content-type; RLS checks extension only
        cacheControl: '3600',
      };

      file.meta = {
        ...file.meta,
        ...supabaseMetadata,
      };

      console.log('File added with metadata (policy-compatible):', file);
      setMessage('');
    });

    // Handle upload success
    uppy.on('upload-success', async (file, response) => {
      try {
        const objectName = file?.meta?.objectName as string;
        if (!objectName) {
          throw new Error('Object name not found');
        }
        // Compute both URLs (public + signed) and pick the best one
        const { url: accessibleUrl, note } = await getAccessibleUrl(supabase, objectName);
        // If we cannot build an accessible link (private bucket without select policy),
        // keep the upload as success but explain why links are unavailable.
        if (!accessibleUrl) {
          setMessage(`✅ File uploaded, but no accessible link could be generated. ${note || ''} Options: make bucket public (read), add select for signing, or sign on server.`);
        }

        // For multiple files, we'll update with the latest uploaded file
        // In a real app, you might want to store multiple avatar URLs
        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: accessibleUrl })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
            setMessage(`✅ File uploaded successfully! (Profile update failed: ${updateError.message})`);
          } else {
            setMessage(`✅ File uploaded and profile updated! (${note})`);
          }
        } else {
          if (accessibleUrl) {
            setMessage(`✅ File uploaded successfully! (Anonymous upload · ${note})`);
          } else {
            setMessage('✅ File uploaded, but no accessible link could be generated. If bucket is private, allow select to create signed URLs or make the bucket public.');
          }
        }

        if (accessibleUrl) onUploadSuccess?.(accessibleUrl);
        console.log('Upload completed successfully:', accessibleUrl || '(no URL)');

      } catch (error: any) {
        console.error('Post-upload processing failed:', error);
        setMessage(`Upload completed but processing failed: ${error.message}`);
        onUploadError?.(error.message);
      }
    });

    // Handle upload error
    uppy.on('upload-error', (file, error) => {
      console.error('Upload error:', error);
      const friendly = buildHelpfulError(file, error);
      setMessage(friendly);
      onUploadError?.(friendly);
    });

    // Handle complete
    uppy.on('complete', (result) => {
      console.log('Upload complete:', result);
      if (result.failed && result.failed.length > 0) {
        setMessage(`${result.failed.length} upload(s) failed`);
      }
    });

    uppyRef.current = uppy;

    // Cleanup
    return () => {
      if (uppyRef.current) {
        uppyRef.current.destroy();
        uppyRef.current = null;
      }
    };
  }, [supabase, user, onUploadSuccess, onUploadError]);

  if (!supabase) {
    return (
      <div className="p-4 rounded border bg-yellow-50 text-yellow-800">
        Please configure Supabase first (click Settings).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hideTitle && (
        <div className="font-medium">Upload avatar</div>
      )}
      
      <div ref={dashboardRef} className="uppy-dashboard-container" />
      
      {message && (
        <div className={`text-sm p-2 rounded ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800' 
            : message.includes('failed') || message.includes('error')
            ? 'bg-red-50 text-red-800'
            : 'bg-blue-50 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {(publicUrlView || signedUrlView) && (
        <div className="text-xs space-y-1">
          <div className="text-neutral-500">Links</div>
          {publicUrlView && (
            <div>
              <span className={`inline-block px-1.5 py-0.5 mr-2 rounded border ${publicUrlOk ? 'border-green-300 text-green-700 bg-green-50' : 'border-yellow-300 text-yellow-700 bg-yellow-50'}`}>
                Public {publicUrlOk ? 'OK' : 'blocked'}
              </span>
              <a href={publicUrlView} target="_blank" className="text-blue-600 break-all">{publicUrlView}</a>
              {!publicUrlOk && (
                <div className="mt-1 text-neutral-500">blocked = private bucket or missing read policy; please use the Signed link.</div>
              )}
            </div>
          )}
          {signedUrlView && (
            <div>
              <span className="inline-block px-1.5 py-0.5 mr-2 rounded border border-blue-300 text-blue-700 bg-blue-50">Signed (1h)</span>
              <a href={signedUrlView} target="_blank" className="text-blue-600 break-all">{signedUrlView}</a>
            </div>
          )}
          {debugText && (
            <pre className="mt-2 p-2 bg-neutral-50 border text-[11px] leading-4 whitespace-pre-wrap text-neutral-700">{debugText}</pre>
          )}
        </div>
      )}
      
      <div className="text-xs text-neutral-500">
        📷 Camera • 🔗 URL Import • 🎨 Unsplash • Resumable uploads • Max 2MB each • PNG/JPG/GIF/WEBP • Bucket: <code>avatars</code>
        <br />
        <br />Note: OneDrive and Google Drive require API key configuration to use
      </div>
    </div>
  );
}

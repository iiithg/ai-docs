"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBrowserClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const ready = useMemo(() => Boolean(supabase && supabaseUrl && supabaseKey), [supabase, supabaseUrl, supabaseKey]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client as SupabaseClient | null);
    let lsUrl = '';
    let lsKey = '';
    if (typeof window !== 'undefined') {
      lsUrl = localStorage.getItem('supabase_url') || '';
      lsKey = localStorage.getItem('supabase_anon_key') || '';
    }
    setSupabaseUrl(lsUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setSupabaseKey(lsKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    if (client) {
      client.auth.getSession().then(({ data }) => {
        setSession(data.session ?? null);
      });
      client.auth.onAuthStateChange((event, s) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSession(s ?? null);
        }
      });
    }
  }, []);

  async function updatePassword() {
    setErr(null); setMessage(null); setLoading(true);
    if (!supabase) { setErr('Supabase configuration missing or invalid. Use ⚙️ or check .env'); setLoading(false); return; }
    if (!session) { setErr('Open the password reset link from your email to continue'); setLoading(false); return; }
    if (!password || !confirm) { setErr('Please enter and confirm your new password'); setLoading(false); return; }
    if (password !== confirm) { setErr('Passwords do not match'); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setErr(error.message); setLoading(false); return; }
    setMessage('Password updated. You can now sign in.'); setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter a new password after opening the email link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!ready && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Supabase configuration missing or invalid. Use ⚙️ Settings or check .env
                </AlertDescription>
              </Alert>
            )}
            {!session && ready && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Open the password reset link from your email to continue
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button
                onClick={updatePassword}
                disabled={loading || !ready}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>

            {err && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {err}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Back to{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

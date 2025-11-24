"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Settings from '../../components/Settings';
import GoogleButton from '../../components/social-auth-buttons/GoogleButton';
import GitHubButton from '../../components/social-auth-buttons/GitHubButton';
import { createBrowserClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2, Settings as SettingsIcon, LogIn, UserPlus } from 'lucide-react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

export default function LoginPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ready = useMemo(() => Boolean(supabase && supabaseUrl && supabaseKey), [supabase, supabaseUrl, supabaseKey]);

  // email/password auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [optionalInfo, setOptionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client);
    // Prefer localStorage for UI echo; fall back to env
    let lsUrl = '';
    let lsKey = '';
    if (typeof window !== 'undefined') {
      lsUrl = localStorage.getItem('supabase_url') || '';
      lsKey = localStorage.getItem('supabase_anon_key') || '';
    }
    setSupabaseUrl(lsUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setSupabaseKey(lsKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    
    // Auto redirect if already signed in
    if (client) {
      client.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSession(data.session);
          window.location.href = '/entry';
        }
      });

      // Listen for auth changes
      client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    }
  }, []);

  const handleSettingsChange = (url: string, key: string) => {
    // Recreate client with new settings by reloading page (keeps demo simple)
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      window.location.reload();
    }
  };
  async function signInWith(provider: 'google' | 'github') {
    setErr(null);
    setMessage(null);
    if (!supabase) { setErr('Please configure Supabase URL and anon key via ⚙️'); return; }
    const redirectTo = `${window.location.origin}/auth/callback`;
    // Preflight: don't redirect immediately; check provider config first
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true }
    });
    if (error) {
      const msg = String(error.message || 'Login failed');
      if (msg.toLowerCase().includes('provider is not enabled')) {
        setErr(`Provider is not enabled in Supabase Dashboard. Go to Authentication → Providers, enable ${provider}, save, and retry.`);
      } else {
        setErr(msg);
      }
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setErr('No redirect URL obtained. Please check your configuration');
    }
  }

  async function signOut() {
    setErr(null);
    setMessage(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message); else setMessage('Signed out');
  }

  const handleGoogleLogin = () => signInWith('google');
  const handleGitHubLogin = () => signInWith('github');


  async function requestPasswordReset() {
    setErr(null); setMessage(null);
    if (!supabase) { setErr('Supabase configuration missing or invalid. Use ⚙️ or check .env'); return; }
    if (!email) { setErr('Please enter your email to reset password'); return; }
    const redirectTo = `${window.location.origin}/auth/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) { setErr(error.message); } else { window.location.href = `/auth/reset/sent?email=${encodeURIComponent(email)}`; }
  }
  async function emailSignIn() {
    setErr(null); setMessage(null); setLoading(true);
    if (!supabase) { setErr('Supabase configuration missing or invalid. Use ⚙️ or check .env'); setLoading(false); return; }
    if (!email || !password) { setErr('Please enter email and password'); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); setLoading(false); }
    else { setMessage('Signed in successfully'); setLoading(false); window.location.href = '/entry'; }
  }

  async function emailSignUp() {
    setErr(null); setMessage(null); setLoading(true);
    if (!supabase) { setErr('Supabase configuration missing or invalid. Use ⚙️ or check .env'); setLoading(false); return; }
    if (!email || !password || !name || !optionalInfo) {
      setErr('Registration requires email, password, name, and optional info (all required)'); setLoading(false); return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, optional_info: optionalInfo } }
    });
    if (error) { setErr(error.message); setLoading(false); return; }
    const userId = data.user?.id;
    try {
      if (userId) {
        // ensure a profile row exists; requires scripts/init.sql policies
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: userId,
          name,
          optional_info: optionalInfo
        }, { onConflict: 'id' });
        if (upsertErr) throw upsertErr;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? '');
      setErr(`Sign-up succeeded but profile write failed: ${msg}`); setLoading(false); return;
    }
    setMessage('Sign-up successful. Please verify your email (if enabled) or visit protected pages'); setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="relative space-y-1 pb-6">
            <div className="absolute top-4 right-4">
              <Settings
                url={supabaseUrl}
                anonKey={supabaseKey}
                onSettingsChange={handleSettingsChange}
              >
                <SettingsIcon className="w-5 h-5 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors" />
              </Settings>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account or create a new one
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
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Button 
                    onClick={emailSignIn} 
                    disabled={loading || !ready}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="flex justify-end">
                    <Button variant="link" type="button" onClick={requestPasswordReset} className="px-0">
                      Forgot password?
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-optional">Optional Info</Label>
                    <Input
                      id="signup-optional"
                      type="text"
                      placeholder="Additional information"
                      value={optionalInfo}
                      onChange={(e) => setOptionalInfo(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <Button 
                    onClick={emailSignUp} 
                    disabled={loading || !ready}
                    className="w-full h-11 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
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
            
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <GoogleButton onClick={handleGoogleLogin} disabled={loading || !ready} />
            <GitHubButton onClick={handleGitHubLogin} disabled={loading || !ready} />

            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Ready to start?{' '}
                <Link 
                  href="/entry" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Go to entry page →
                </Link>
              </p>
            </div>
            
            {!ready && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  No Supabase configuration detected. Check .env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                </AlertDescription>
              </Alert>
            )}
            
            {session && (
              <div className="pt-2">
                <Button 
                  onClick={signOut} 
                  disabled={!ready} 
                  variant="outline"
                  className="w-full"
                >
                  Sign out
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

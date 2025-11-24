"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

export default function ResetRequestedPage() {
  const [masked, setMasked] = useState<string>('your email inbox');
  const [status, setStatus] = useState<'sent' | 'maybe'>('sent');
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('reset_email') || '';
      const st = (sessionStorage.getItem('reset_status') as 'sent' | 'maybe') || 'sent';
      setStatus(st);
      if (raw) {
        const at = raw.indexOf('@');
        if (at > 0) {
          const name = raw.slice(0, at);
          const domain = raw.slice(at + 1);
          const maskedName = name.length <= 2 ? `${name[0]}*` : `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name[name.length - 1]}`;
          setMasked(`${maskedName}@${domain}`);
        } else {
          setMasked('your email inbox');
        }
      }
    } catch {}
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Check your email</CardTitle>
            <CardDescription className="text-center text-gray-600">We have sent a password reset link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {status === 'sent'
                  ? <>A password reset email was sent to {masked}. Please open the email and click the link to continue.</>
                  : <>If that email is associated with an account, you will receive a password reset link. Please check your inbox.</>
                }
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Back to{' '}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">Login</Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

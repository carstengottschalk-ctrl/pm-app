'use client';

import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import dynamic from 'next/dynamic';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, 'Password is required'),
});

function LoginPageInner() {
  const { signIn } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Note: Middleware will automatically redirect authenticated users from /login to /dashboard
  // No client-side redirect needed - just show success message

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      // Show success message immediately
      setSuccessMessage('Logging in...');

      // Wait for sign in to complete
      await signIn(values.email, values.password);

      // Show success message - middleware will handle redirect
      setSuccessMessage('Login successful! Redirecting to dashboard...');
    } catch (error) {
      // Only show error if it's not an AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        // AbortError usually means navigation already happened
        console.log('Login request was aborted due to navigation');
        return;
      }

      // Show error message in the form
      setSuccessMessage(null);
      throw error; // Let AuthForm handle the error
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        <AuthForm
          title="Sign in"
          description="Enter your credentials to access your account"
          schema={loginSchema}
          defaultValues={{ email: '', password: '' }}
          onSubmit={handleLogin}
          submitButtonText="Sign in"
          fields={[
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'name@example.com',
              autoComplete: 'email',
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: '••••••••',
              autoComplete: 'current-password',
            },
          ]}
          footer={
            <div className="space-y-4">
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
'use client';

import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import dynamic from 'next/dynamic';

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function SignupPageInner() {
  const { signUp } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Note: Middleware will automatically redirect authenticated users from /signup to /dashboard
  // No client-side redirect needed - just show success message

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      // Show success message immediately
      setSuccessMessage('Creating account...');

      // Wait for sign up to complete
      await signUp(values.email, values.password);

      // Show success message - middleware will handle redirect
      setSuccessMessage('Account created! Redirecting to dashboard...');
    } catch (error) {
      // Only show error if it's not an AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        // AbortError usually means navigation already happened
        console.log('Signup request was aborted due to navigation');
        return;
      }

      // Show error message in the form
      setSuccessMessage(null);
      throw error; // Let AuthForm handle the error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container max-w-md px-4 space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PM</span>
            </div>
            <span className="font-bold text-2xl">Project Manager</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Get started with your free account today
          </p>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        <AuthForm
          title="Sign up"
          description="Enter your details to create your account"
          schema={signupSchema}
          defaultValues={{ email: '', password: '', confirmPassword: '' }}
          onSubmit={handleSignup}
          submitButtonText="Create account"
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
              autoComplete: 'new-password',
            },
            {
              name: 'confirmPassword',
              label: 'Confirm Password',
              type: 'password',
              placeholder: '••••••••',
              autoComplete: 'new-password',
            },
          ]}
          footer={
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(SignupPageInner), { ssr: false });
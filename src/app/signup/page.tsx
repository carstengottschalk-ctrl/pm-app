'use client';

import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      // Show success message immediately
      setSuccessMessage('Creating account...');

      // Wait for sign up to complete
      await signUp(values.email, values.password);

      // Determine where to redirect
      const redirectTo = searchParams.get('redirectedFrom') || '/dashboard';

      // Redirect after successful sign up
      window.location.href = redirectTo;
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
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">
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
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const router = useRouter();
  const { signUp } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    await signUp(values.email, values.password);
    setSuccessMessage('Account created successfully! Redirecting to dashboard...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
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
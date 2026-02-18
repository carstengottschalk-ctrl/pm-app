'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    await resetPassword(values.email);
    setIsSuccess(true);
  };

  if (isSuccess) {
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
            <h1 className="text-4xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground mt-3 text-lg">
              We&apos;ve sent you a password reset link
            </p>
          </div>

          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              If an account exists with this email, you will receive a password reset link shortly.
              Please check your inbox and follow the instructions.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive an email? Check your spam folder or try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => setIsSuccess(false)}
                className="text-sm text-primary hover:underline"
              >
                Try another email
              </button>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Enter your email address and we&apos;ll send you a reset link
          </p>
        </div>

        <AuthForm
          title="Forgot password"
          description="We'll send you a link to reset your password"
          schema={forgotPasswordSchema}
          defaultValues={{ email: '' }}
          onSubmit={handleResetPassword}
          submitButtonText="Send reset link"
          fields={[
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'name@example.com',
              autoComplete: 'email',
            },
          ]}
          footer={
            <div className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
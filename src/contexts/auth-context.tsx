'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import { mockAuth, MockUser } from '@/lib/mock-auth';

// Check if we should use mock auth
const shouldUseMockAuth = () => {
  if (typeof window === 'undefined') {
    return false; // Server-side, can't check properly
  }

  // Check if force mock auth is enabled
  const forceMockAuth = process.env.NEXT_PUBLIC_FORCE_MOCK_AUTH === 'true';
  if (forceMockAuth) {
    console.log('shouldUseMockAuth: Force mock auth enabled via environment variable');
    return true;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here';

  console.log('shouldUseMockAuth:', {
    supabaseUrl: supabaseUrl ? '***' : 'undefined',
    supabaseAnonKey: supabaseAnonKey ? '***' : 'undefined',
    isSupabaseConfigured,
    forceMockAuth
  });

  return !isSupabaseConfigured;
};

export interface AuthState {
  user: User | MockUser | null;
  isLoading: boolean;
  error: string | null;
  profile: any | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<User | MockUser | null>;
  signIn: (email: string, password: string) => Promise<User | MockUser | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<User | MockUser | null>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<User | MockUser | null>;
  updateProfile: (updates: { display_name?: string; timezone?: string; date_format?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    profile: null,
  });

  // Check if we should use mock auth
  const useMockAuth = shouldUseMockAuth();

  useEffect(() => {
    console.log('AuthProvider: Initializing auth... useMockAuth:', useMockAuth);

    if (useMockAuth) {
      console.log('Using mock authentication');
      // Initialize mock auth
      const mockState = mockAuth.getState();
      setAuthState(prev => ({
        ...prev,
        user: mockState.user,
        isLoading: false,
      }));

      // Subscribe to mock auth changes
      const unsubscribe = mockAuth.subscribe((mockState) => {
        console.log('Mock auth state changed:', mockState);
        setAuthState(prev => ({
          ...prev,
          user: mockState.user,
          isLoading: mockState.isLoading,
          error: mockState.error,
        }));
      });

      return () => unsubscribe();
    } else {
      console.log('Using Supabase authentication');
      // Get initial session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('AuthProvider: Initial session:', session ? 'Found' : 'Not found', session?.user?.email);
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          isLoading: false,
        }));

        // Load profile if user exists
        if (session?.user) {
          loadUserProfile(session.user.id);
        }
      });

      // Listen for auth changes from Supabase
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, 'session:', session ? 'Yes' : 'No', 'user email:', session?.user?.email, 'session expiry:', session?.expires_at);

        try {
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null,
            isLoading: false,
            error: null,
          }));

          console.log('Auth state updated in context, user set to:', session?.user?.email || 'null');

          // Load profile if user exists
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setAuthState(prev => ({
              ...prev,
              profile: null,
            }));
          }
        } catch (error) {
          // Silently catch abort errors that may occur during navigation
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.warn('Auth state change was aborted during navigation');
            return;
          }
          console.error('Error in auth state change:', error);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [useMockAuth]);

  const loadUserProfile = async (userId: string) => {
    if (useMockAuth) {
      console.log('loadUserProfile: Skipping for mock auth');
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setAuthState(prev => ({
        ...prev,
        profile,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('signUp: Attempting to sign up with email:', email, 'useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('signUp: Using mock authentication');
        const user = await mockAuth.signUp(email, password);
        console.log('signUp: Mock auth success, user:', user.email);
        return user;
      } else {
        console.log('signUp: Using Supabase authentication');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // Note: In Supabase, email confirmation might be required
        // For now, we'll consider the user signed up successfully
        console.log('signUp: Supabase success, user:', data.user?.email);
        return data.user;
      }
    } catch (error) {
      let errorMessage = 'Sign up failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      console.error('signUp: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('signUp: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('signIn: Attempting to sign in with email:', email, 'useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('signIn: Using mock authentication');
        const user = await mockAuth.signIn(email, password);
        console.log('signIn: Mock auth success, user:', user.email);
        return user;
      } else {
        console.log('signIn: Using Supabase authentication');
        console.log('signIn: Calling supabase.auth.signInWithPassword');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('signIn: Supabase response:', { data, error });

        if (error) {
          console.error('signIn: Supabase error:', error);
          throw error;
        }

        console.log('signIn: Success, user:', data.user?.email);

        // Try to get session immediately after sign in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('signIn: Session after sign in:', sessionData?.session ? 'Found' : 'Not found', 'sessionError:', sessionError);
        if (sessionData?.session) {
          console.log('signIn: Session user email:', sessionData.session.user?.email);
        }

        return data.user;
      }
    } catch (error) {
      // Check if it's an AbortError (navigation interrupted the request)
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('Auth request was aborted, likely due to navigation');
        // Don't set error state for abort errors
        throw new Error('Login was interrupted. Please try again.');
      }

      let errorMessage = 'Invalid email or password';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      console.error('signIn: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('signIn: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    console.log('signOut: useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('signOut: Using mock authentication');
        await mockAuth.signOut();
      } else {
        console.log('signOut: Using Supabase authentication');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Sign out failed';
      console.error('signOut: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('signOut: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    console.log('resetPassword: email:', email, 'useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('resetPassword: Using mock authentication');
        await mockAuth.resetPassword(email);
      } else {
        console.log('resetPassword: Using Supabase authentication');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Password reset failed';
      console.error('resetPassword: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('resetPassword: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateEmail = async (newEmail: string, password: string) => {
    console.log('updateEmail: newEmail:', newEmail, 'useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('updateEmail: Using mock authentication');
        const user = await mockAuth.updateEmail(newEmail, password);
        console.log('updateEmail: Mock auth success, user:', user.email);
        return user;
      } else {
        console.log('updateEmail: Using Supabase authentication');
        // First verify the password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authState.user?.email || '',
          password,
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }

        // Update email
        const { data, error } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (error) throw error;

        // Note: Supabase will send a confirmation email
        // The email won't change until the user confirms
        console.log('updateEmail: Supabase success, user:', data.user?.email);
        return data.user;
      }
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Email update failed';
      console.error('updateEmail: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('updateEmail: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    console.log('updatePassword: useMockAuth:', useMockAuth);
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('updatePassword: Using mock authentication');
        await mockAuth.updatePassword(currentPassword, newPassword);
        // Mock auth doesn't return a user, return current user
        return authState.user;
      } else {
        console.log('updatePassword: Using Supabase authentication');
        // If we have a current password, verify it first (for regular password change)
        if (currentPassword && authState.user?.email) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: authState.user.email,
            password: currentPassword,
          });

          if (signInError) {
            throw new Error('Current password is incorrect');
          }
        }

        // Update password (works for both regular change and reset)
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        console.log('updatePassword: Supabase success, user:', data.user?.email);
        return data.user;
      }
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Password update failed';
      console.error('updatePassword: Auth error:', errorMessage);
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('updatePassword: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (updates: { display_name?: string; timezone?: string; date_format?: string }) => {
    console.log('updateProfile: updates:', updates, 'useMockAuth:', useMockAuth);
    if (!authState.user) {
      throw new Error('Not authenticated');
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useMockAuth) {
        console.log('updateProfile: Using mock authentication - simulating update');
        // For mock auth, just update the local profile state
        const updatedProfile = { ...authState.profile, ...updates };
        setAuthState(prev => ({
          ...prev,
          profile: updatedProfile,
        }));
        console.log('updateProfile: Mock profile updated');
        return updatedProfile;
      } else {
        console.log('updateProfile: Using Supabase authentication');
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', authState.user.id)
          .select()
          .single();

        if (error) throw error;

        setAuthState(prev => ({
          ...prev,
          profile: data,
        }));

        console.log('updateProfile: Supabase profile updated');
        return data;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    } finally {
      console.log('updateProfile: Setting isLoading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        profile: authState.profile,
        isLoading: authState.isLoading,
        error: authState.error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateEmail,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
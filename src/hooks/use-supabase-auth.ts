'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  profile: any | null;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    profile: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        isLoading: false,
        error: null,
      }));

      // Load profile if user exists
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({
          ...prev,
          profile: null,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
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
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
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
      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Sign up failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Invalid email or password',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Sign out failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Password reset failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateEmail = async (newEmail: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
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
      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Email update failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authState.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        error: authError.message || 'Password update failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (updates: { display_name?: string; timezone?: string; date_format?: string }) => {
    if (!authState.user) {
      throw new Error('Not authenticated');
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
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

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Profile update failed',
      }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
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
  };
}
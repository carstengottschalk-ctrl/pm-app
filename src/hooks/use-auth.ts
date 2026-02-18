'use client';

// Re-export the Supabase auth hook as the main auth hook
// This allows us to switch between mock and real auth easily
export { useSupabaseAuth as useAuth } from './use-supabase-auth';
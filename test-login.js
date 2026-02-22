#!/usr/bin/env node

/**
 * Test script to verify login with test user
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  console.log('🔐 Testing login with test user...');
  console.log('Email: mustermann@test.de');
  console.log('Password: 12345678');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'mustermann@test.de',
      password: '12345678'
    });

    if (error) {
      console.log(`❌ Login failed: ${error.message}`);

      if (error.message.includes('Email not confirmed')) {
        console.log('\n⚠️ Email confirmation required!');
        console.log('To disable email confirmation in Supabase:');
        console.log('1. Go to Authentication → Settings');
        console.log('2. Under "Email Auth", disable "Confirm email"');
        console.log('3. Or use the Supabase dashboard to confirm the email manually');
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('\n⚠️ Invalid credentials or user not found');
        console.log('Check if the user was created successfully');
      }

      return;
    }

    console.log('✅ Login successful!');
    console.log(`User ID: ${data.user.id}`);
    console.log(`Email: ${data.user.email}`);
    console.log(`Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`Session expires: ${data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'Never'}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log(`Profile error: ${profileError.message}`);
    } else {
      console.log(`Profile: ${JSON.stringify(profile, null, 2)}`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('Logged out');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testLogin();
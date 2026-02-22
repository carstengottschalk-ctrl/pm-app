#!/usr/bin/env node

/**
 * Simple script to create a test user using Supabase REST API
 * This script shows multiple options for creating a test user
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('   Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Test User Creation Tool');
console.log('==========================');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log('');

async function checkExistingUser(email) {
  console.log(`🔍 Checking if user ${email} already exists...`);

  try {
    // Try to sign in (will fail if user doesn't exist or password is wrong)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password'
    });

    if (error && error.message.includes('Invalid login credentials')) {
      console.log('✅ User does not exist or password is incorrect');
      return false;
    } else if (error) {
      console.log(`ℹ️ Error checking user: ${error.message}`);
      return null;
    } else {
      console.log('⚠️ User already exists!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function createUserViaSignUp() {
  console.log('\n📝 Option 1: Create user via signup (requires email confirmation)');
  console.log('   Note: Email confirmation may be required depending on Supabase settings');

  const email = 'mustermann@test.de';
  const password = '12345678';

  const exists = await checkExistingUser(email);
  if (exists === true) {
    console.log('   User already exists, skipping creation.');
    return;
  }

  console.log(`   Creating user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Max Mustermann',
        role: 'test_user'
      }
    }
  });

  if (error) {
    console.log(`   ❌ Error: ${error.message}`);

    if (error.message.includes('already registered')) {
      console.log('   ℹ️ User is already registered');
    }
  } else {
    console.log('   ✅ Signup successful!');
    console.log(`   User ID: ${data.user?.id || 'Not returned'}`);

    if (data.session) {
      console.log('   Session created successfully');
    }

    if (data.user?.email_confirmed_at) {
      console.log('   Email already confirmed');
    } else {
      console.log('   ⚠️ Email confirmation may be required');
      console.log('   Check your email or Supabase Auth settings');
    }
  }
}

async function showManualInstructions() {
  console.log('\n📋 Option 2: Manual creation via Supabase Dashboard');
  console.log('===================================================');
  console.log('1. Go to: https://app.supabase.com');
  console.log('2. Login and select your project');
  console.log('3. Go to Authentication → Users');
  console.log('4. Click "Add User"');
  console.log('5. Fill in:');
  console.log('   - Email: mustermann@test.de');
  console.log('   - Password: 12345678');
  console.log('   - Check "Confirm email"');
  console.log('6. Click "Create User"');
  console.log('');
  console.log('📋 Option 3: Using Service Role Key');
  console.log('====================================');
  console.log('1. Get service_role key from Supabase Dashboard:');
  console.log('   Settings → API → service_role key');
  console.log('2. Add to .env.local:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-key-here');
  console.log('3. Run: node create-test-user.js');
}

async function main() {
  console.log('\nChoose an option:');
  console.log('1. Try to create user via signup');
  console.log('2. Show manual instructions');
  console.log('3. Exit');

  rl.question('\nEnter choice (1-3): ', async (choice) => {
    switch (choice) {
      case '1':
        await createUserViaSignUp();
        break;
      case '2':
        await showManualInstructions();
        break;
      case '3':
        console.log('Goodbye!');
        break;
      default:
        console.log('Invalid choice');
    }

    rl.close();
  });
}

// Handle promise rejection
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  rl.close();
});

main();
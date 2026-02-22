#!/usr/bin/env node

/**
 * Script to confirm a user's email in Supabase using service role key
 * This allows the test user to login without email confirmation
 *
 * Usage: node confirm-user-email.js
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);
  console.error('\nTo get the Service Role Key:');
  console.error('1. Go to your Supabase project dashboard: https://app.supabase.com');
  console.error('2. Select your project: bmxtixowqhojvtmftjti');
  console.error('3. Navigate to Settings > API');
  console.error('4. Copy the "service_role" key (not the anon key)');
  console.error('5. Add it to your .env.local file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.error('\nOr disable email confirmation in Supabase dashboard:');
  console.error('1. Go to Authentication > Settings');
  console.error('2. Under "Email Auth", disable "Confirm email"');
  console.error('3. Save changes');
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userEmail = 'mustermann@test.de';

async function confirmUserEmail() {
  console.log('📧 Confirming email for test user...');
  console.log(`   Email: ${userEmail}`);

  try {
    // First, get the existing user
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(userEmail);

    if (getUserError) {
      console.error('❌ Error fetching user:', getUserError.message);
      console.error('\n💡 Possible solutions:');
      console.error('1. Make sure the user exists (run: node create-test-user.js)');
      console.error('2. Check your Supabase project connection');
      process.exit(1);
    }

    if (!userData.user) {
      console.error('❌ User not found:', userEmail);
      console.error('\n💡 Create the user first:');
      console.error('   node create-test-user.js');
      process.exit(1);
    }

    const user = userData.user;
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Created: ${user.created_at}`);

    if (user.email_confirmed_at) {
      console.log('✅ Email already confirmed!');
      console.log('\n🔐 You can now login with:');
      console.log(`   Email: ${userEmail}`);
      console.log(`   Password: 12345678`);
      console.log('\n🔗 Login URL: http://localhost:3000/login');
      return;
    }

    // Update user to confirm email
    console.log('\n🔄 Confirming email...');
    const currentTime = new Date().toISOString();
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        // Alternatively, we can set email_confirmed_at directly via API
      }
    );

    if (updateError) {
      console.error('❌ Error confirming email:', updateError.message);
      console.error('\n💡 Alternative: Disable email confirmation in Supabase dashboard:');
      console.error('   Authentication > Settings > disable "Confirm email"');
      process.exit(1);
    }

    console.log('✅ Email confirmed successfully!');
    console.log('\n🔐 You can now login with:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: 12345678`);
    console.log('\n🔗 Login URL: http://localhost:3000/login');
    console.log('\n🎉 Test user is ready to use!');

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: verifyData } = await supabaseAdmin.auth.admin.getUserById(user.id);
    if (verifyData.user?.email_confirmed_at) {
      console.log('✅ Verification passed: Email confirmed at', verifyData.user.email_confirmed_at);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative method using direct SQL (if admin API doesn't work)
async function confirmEmailAlternative() {
  console.log('\n💡 Alternative: Disable email confirmation entirely');
  console.log('==================================================');
  console.log('1. Go to Supabase Dashboard: https://app.supabase.com');
  console.log('2. Select your project: bmxtixowqhojvtmftjti');
  console.log('3. Go to Authentication > Settings');
  console.log('4. Under "Email Auth", find "Confirm email"');
  console.log('5. Toggle it OFF (disable)');
  console.log('6. Save changes');
  console.log('\nNote: This affects all users, not just the test user.');
  console.log('Existing users will still need email confirmation.');
}

confirmUserEmail().catch(console.error);
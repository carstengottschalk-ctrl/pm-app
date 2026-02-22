# How to Confirm Test User Email

## Current Status
✅ Test user created successfully:
- **Email**: mustermann@test.de
- **Password**: 12345678
- **User ID**: 067097ce-f5c3-46ba-9718-3fb5cb4ff1e2
- **Email confirmation**: Required (not confirmed yet)

## Option 1: Confirm Email via Supabase Dashboard (Recommended)

### Step-by-Step:
1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com
   - Login with your Supabase account
   - Select project: **bmxtixowqhojvtmftjti**

2. **Navigate to Authentication → Users**
   - In left sidebar, click "Authentication"
   - Click "Users"

3. **Find the test user**
   - Search for: `mustermann@test.de`
   - Or look for user ID: `067097ce-f5c3-46ba-9718-3fb5cb4ff1e2`

4. **Confirm email**
   - Click on the user to open details
   - Look for "Email Confirmed" field
   - If it says "No", click "Confirm email" button
   - Or manually set "Confirmed at" to current time

5. **Verify confirmation**
   - After confirming, the status should show "Yes"
   - The user can now login without email confirmation

## Option 2: Disable Email Confirmation (For Development)

### Step-by-Step:
1. **Go to Authentication → Settings**
   - In Supabase dashboard, go to "Authentication"
   - Click "Settings" tab

2. **Disable email confirmation**
   - Scroll to "Email Auth" section
   - Find "Confirm email" toggle
   - Turn it OFF (disable)

3. **Save changes**
   - Changes are saved automatically
   - Existing users still need confirmation
   - New users won't require confirmation

4. **Re-create test user** (if needed)
   - Delete existing user first
   - Create new user with signup
   - No email confirmation required

## Option 3: Use Service Role Key (Advanced)

### If you have service role key:
1. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-key-here
   ```

2. Run the admin script:
   ```bash
   node create-test-user.js
   ```

   This creates a pre-confirmed user.

## Option 4: Manual SQL Update (For Developers)

### Run in Supabase SQL Editor:
```sql
-- Confirm email for test user
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'mustermann@test.de';

-- Verify update
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'mustermann@test.de';
```

## Test Login After Confirmation

After confirming the email, test login with:
```bash
node test-login.js
```

Expected output:
```
✅ Login successful!
User ID: 067097ce-f5c3-46ba-9718-3fb5cb4ff1e2
Email: mustermann@test.de
Email confirmed: Yes
```

## User Details for Reference
- **Email**: mustermann@test.de
- **Password**: 12345678
- **User ID**: 067097ce-f5c3-46ba-9718-3fb5cb4ff1e2
- **Created**: Just now
- **Metadata**: { "name": "Max Mustermann", "role": "test_user" }

## Next Steps
1. Confirm email using Option 1 (easiest)
2. Test login with `node test-login.js`
3. Use credentials in your application:
   - Login page: http://localhost:3000/login
   - Email: mustermann@test.de
   - Password: 12345678
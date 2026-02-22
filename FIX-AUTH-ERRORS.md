# Fix Authentication Errors for Project Creation

## Problem
When trying to create a project, you get "Authentication required" errors:
1. Runtime Error: `Authentication required` in `use-projects.ts`
2. Console Error: `Authentication required` in `use-projects.ts`

## Root Cause
Mock authentication is enabled (`NEXT_PUBLIC_FORCE_MOCK_AUTH=true`), but API routes require real Supabase authentication. Mock auth only works in the frontend, not in API routes.

## Solution Chosen
Disable mock authentication and use the real Supabase test user.

## Steps to Fix

### ✅ Step 1: Mock Authentication Disabled
I've already updated `.env.local` to disable mock auth:
```
NEXT_PUBLIC_FORCE_MOCK_AUTH=false
```

### ✅ Step 2: Test User Already Created
A test user exists in Supabase:
- **Email**: mustermann@test.de
- **Password**: 12345678
- **User ID**: 067097ce-f5c3-46ba-9718-3fb5cb4ff1e2

### ⚠️ Step 3: Confirm Email (Required)
The test user's email is not confirmed. Choose **ONE** of these options:

#### Option A: Confirm Email via Service Role Key (Recommended)
1. **Get Service Role Key**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select project: **bmxtixowqhojvtmftjti**
   - Settings → API → Copy **service_role** key
   - Add to `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your-copied-key-here
     ```

2. **Run confirmation script**:
   ```bash
   node confirm-user-email.js
   ```

#### Option B: Disable Email Confirmation (Easier)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **bmxtixowqhojvtmftjti**
3. Authentication → Settings
4. Under "Email Auth", disable **Confirm email**
5. Save changes

#### Option C: Confirm Email Manually in Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **bmxtixowqhojvtmftjti**
3. Authentication → Users
4. Find `mustermann@test.de`
5. Click "Confirm email"

### 🔧 Step 4: Restart Development Server
After confirming email, restart your dev server:
```bash
npm run dev
```

### 🔐 Step 5: Login with Test User
1. Open [http://localhost:3000/login](http://localhost:3000/login)
2. Login with:
   - Email: mustermann@test.de
   - Password: 12345678
3. You should now be able to create projects

## Verification

### Test Login
```bash
node test-login.js
```
Expected output: `✅ Login successful!`

### Test Project Creation
1. Login to the app
2. Go to Projects page
3. Click "Create Project"
4. Fill form and submit
5. Should work without authentication errors

## Files Created/Modified

| File | Purpose |
|------|---------|
| `.env.local` | Disabled mock auth |
| `confirm-user-email.js` | Script to confirm email via service key |
| `FIX-AUTH-ERRORS.md` | This documentation |

## Troubleshooting

### "Authentication required" still appears
1. Make sure `.env.local` has `NEXT_PUBLIC_FORCE_MOCK_AUTH=false`
2. Restart dev server: `npm run dev`
3. Clear browser cache and localStorage
4. Check that you're logged in (dashboard should show user email)

### "Email not confirmed"
- Run `node test-login.js` to verify email status
- Make sure you completed Step 3 above

### "Invalid login credentials"
- Password might be wrong (should be 12345678)
- User might not exist (run `node create-test-user.js`)

## Notes
- Mock authentication files (`create-mock-user.js`, `mock-user-setup.html`) still exist but won't be used
- For future development, you can re-enable mock auth by setting `NEXT_PUBLIC_FORCE_MOCK_AUTH=true`
- The test user has no expiration date as requested
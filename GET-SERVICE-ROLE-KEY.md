# How to Get Supabase Service Role Key

## Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://app.supabase.com
2. Login with your Supabase account
3. Select your project: **bmxtixowqhojvtmftjti**

## Step 2: Navigate to API Settings
1. In the left sidebar, click on **Settings** (gear icon)
2. Click on **API** in the settings menu

## Step 3: Find Service Role Key
1. Scroll down to the **Project API keys** section
2. Look for **service_role** key (NOT the anon/public key)
3. Click the **Copy** button next to the service_role key

## Step 4: Add to .env.local
1. Open your `.env.local` file in the project root
2. Add the following line at the end:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-copied-service-role-key-here
   ```
3. Save the file

## Step 5: Run the Test User Script
After adding the service role key, run:
```bash
node create-test-user.js
```

## Important Security Notes
⚠️ **WARNING**: The service_role key has full admin access to your Supabase project
- Never commit this key to version control
- Never expose this key in client-side code
- Only use it for server-side administration tasks
- Consider rotating the key if accidentally exposed

## Alternative: Create User via Supabase Dashboard
If you prefer not to use the service role key, you can create the test user manually:

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **Add User**
3. Fill in:
   - Email: mustermann@test.de
   - Password: 12345678
   - Check "Confirm email"
4. Click **Create User**

## Test User Details
- **Email**: mustermann@test.de
- **Password**: 12345678
- **Email confirmed**: Yes (no expiration)
- **Name**: Max Mustermann (in metadata)
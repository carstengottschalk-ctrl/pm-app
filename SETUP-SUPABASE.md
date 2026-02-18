# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Choose a region close to your users
4. Set a secure database password
5. Wait for your project to be provisioned

## 2. Get Your Project Credentials

1. Go to your project settings (gear icon)
2. Navigate to "API" section
3. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Run Database Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/2026021801_create_profiles_table.sql`
3. Run the SQL to create the profiles table and set up RLS policies

## 5. Configure Authentication Settings

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure:
   - **Site URL**: Your app URL (e.g., http://localhost:3000 for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
   - **Email Templates**: Customize if desired

## 6. Test the Setup

1. Start your Next.js app: `npm run dev`
2. Visit `http://localhost:3000`
3. Try signing up a new user
4. Check the Auth users table in Supabase to see the user was created
5. Check the profiles table to see the profile was automatically created

## Troubleshooting

### "User already registered" error
- Check if email confirmation is enabled in Supabase Auth settings
- For development, you can disable email confirmation

### Profile not created automatically
- Check the triggers in the SQL migration ran correctly
- Check RLS policies allow users to insert their own profiles

### Session not persisting
- Check middleware is correctly configured
- Verify cookies are being set properly

## Security Notes

1. **Never commit `.env.local`** to version control
2. Use environment variables in production (Vercel, etc.)
3. Regularly review RLS policies
4. Monitor Auth logs in Supabase dashboard
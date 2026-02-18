# Supabase Setup Guide

This guide will help you set up Supabase for the Project Management App.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: `pm-app` (or your preferred name)
   - **Database Password**: Create a secure password
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Select "Free" for development

## 2. Get API Keys

1. After project creation, go to **Project Settings** > **API**
2. Copy the following values:
   - **URL**: `https://your-project-id.supabase.co`
   - **anon/public** key

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 4. Run Database Migrations

The database schema is already defined in `supabase/migrations/2026021801_create_profiles_table.sql`. This migration will:

1. Create the `profiles` table
2. Enable Row Level Security (RLS)
3. Create RLS policies for user access
4. Create indexes for performance
5. Set up triggers for automatic profile creation and email sync

To apply the migration:

### Option A: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click "New query"
4. Copy and paste the contents of `supabase/migrations/2026021801_create_profiles_table.sql`
5. Click "Run"

### Option B: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## 5. Configure Authentication

1. Go to **Authentication** > **Settings** in Supabase dashboard
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Configure **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`
   - Your production domain when deployed

4. Enable **Email Auth Provider** (should be enabled by default)
5. Configure **Email Templates** if needed

## 6. Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try signing up with a new email
4. Check Supabase **Authentication** > **Users** to see the new user
5. Check **Table Editor** > `profiles` to see the automatically created profile

## 7. Production Deployment

### Vercel Deployment
1. When deploying to Vercel, add the environment variables in **Project Settings** > **Environment Variables**
2. Update Supabase **Redirect URLs** to include your production domain

### Required Production Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## 8. Security Considerations

### Row Level Security (RLS)
The `profiles` table has RLS enabled with the following policies:
- Users can only view their own profile
- Users can only update their own profile
- Users can only insert their own profile (via trigger)

### Authentication Flow
- Uses PKCE flow for enhanced security
- Sessions expire after 7 days of inactivity
- Password reset tokens are short-lived
- Email confirmation can be enabled for production

## 9. Troubleshooting

### Common Issues

1. **"Invalid login credentials" even with correct password**
   - Check if email confirmation is required in Supabase Auth settings
   - Verify redirect URLs are configured correctly

2. **Profile not created automatically**
   - Check if the trigger `on_auth_user_created` exists
   - Verify the `handle_new_user` function was created

3. **CORS errors**
   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly
   - Check Supabase **Authentication** > **URL Configuration**

4. **Database connection errors**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
   - Check if your IP is allowed in Supabase **Network Restrictions**

### Debugging
- Check browser console for errors
- Check Supabase **Logs** for authentication events
- Use the Supabase dashboard **Table Editor** to inspect data

## 10. Next Steps

Once authentication is working:
1. Implement project management features (PROJ-2)
2. Add time tracking (PROJ-3)
3. Implement budget tracking (PROJ-4)
4. Set up email notifications for production
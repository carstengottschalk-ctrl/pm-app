1111111111111111111111111111111111111111111111111111111111111111111# PROJ-1: User Authentication

**Status:** 🟡 In Progress
**Created:** 2026-02-18
**Last Updated:** 2026-02-18
**Dependencies:** None

## User Stories

1. **As a** new team member **I want to** sign up with my email and password **so that** I can access the project management app.
2. **As a** registered user **I want to** log in with my email and password **so that** I can access my projects and time tracking.
3. **As a** user **I want to** log out **so that** I can securely end my session on shared devices.
4. **As a** user who forgot my password **I want to** reset it via email **so that** I can regain access to my account.
5. **As a** logged-in user **I want to** see my profile information **so that** I can verify my identity.

## Acceptance Criteria

### Registration
- [ ] User can access a sign-up form with email and password fields
- [ ] Email must be valid format (contains @ and domain)
- [ ] Password must be at least 8 characters long
- [ ] User receives success message after successful registration
- [ ] After registration, user is automatically logged in and redirected to dashboard
- [ ] Duplicate email addresses are rejected with appropriate error message

### Login
- [ ] User can access a login form with email and password fields
- [ ] User can submit credentials to authenticate
- [ ] Invalid credentials show appropriate error message (without revealing whether email exists)
- [ ] Successful login redirects user to dashboard
- [ ] Login state persists across page refreshes (using session)

### Logout
- [ ] Logged-in user sees a logout button in the navigation
- [ ] Clicking logout ends the session and redirects to login page
- [ ] After logout, protected routes are no longer accessible

### Password Reset
- [ ] Login form has "Forgot password?" link
- [ ] User can enter email to request password reset
- [ ] Reset email is sent with secure token link (mock for MVP, real email in production)
- [ ] User can set new password via reset form
- [ ] After reset, user can log in with new password

### Profile
- [ ] Logged-in user can view their profile (email, account creation date)
- [ ] User can update their email address (with re-verification)
- [ ] User can change password (requires current password confirmation)

## Edge Cases

1. **Duplicate registration**: What happens when a user tries to register with an email that already exists?
   - Show error: "An account with this email already exists. Please log in or use another email."

2. **Network failure during authentication**: What if the API call fails?
   - Show generic error: "Something went wrong. Please check your connection and try again."

3. **Invalid email format**: What if user enters "userexample.com"?
   - Show inline validation error before form submission.

4. **Weak password**: What if password is "123456"?
   - Show requirement: "Password must be at least 8 characters."

5. **Multiple simultaneous login attempts**: What if user tries to log in from two devices?
   - Both sessions should be valid (standard behavior).

6. **Session expiration**: What happens after 7 days of inactivity?
   - User should be automatically logged out and redirected to login page.

7. **Browser autofill**: Does the login form work with password managers?
   - Form should have proper autocomplete attributes.

8. **Accessing protected routes without authentication**: What if user tries to visit /dashboard directly?
   - Redirect to login page with "Please log in to continue" message.

## Tech Design (Solution Architect)

### Component Structure (Visual Tree)

```
Authentication Flow
├── Public Routes (Unauthenticated Users)
│   ├── Landing Page (/)
│   │   ├── Hero Section
│   │   ├── Login Button (navigates to /login)
│   │   └── Sign Up Button (navigates to /signup)
│   ├── Login Page (/login)
│   │   ├── Email Input Field
│   │   ├── Password Input Field
│   │   ├── "Forgot Password?" Link (navigates to /forgot-password)
│   │   ├── Login Button
│   │   └── "Don't have an account? Sign Up" Link (navigates to /signup)
│   ├── Sign Up Page (/signup)
│   │   ├── Email Input Field
│   │   ├── Password Input Field
│   │   ├── Confirm Password Field
│   │   ├── Sign Up Button
│   │   └── "Already have an account? Log In" Link (navigates to /login)
│   └── Forgot Password Page (/forgot-password)
│       ├── Email Input Field
│       ├── "Send Reset Email" Button
│       └── "Back to Login" Link (navigates to /login)
│
└── Protected Routes (Authenticated Users)
    ├── Dashboard Page (/dashboard) - Redirects here after login
    │   ├── Navigation Header
    │   │   ├── User Profile Dropdown
    │   │   │   ├── User Email Display
    │   │   │   ├── "View Profile" Link (navigates to /profile)
    │   │   │   └── Logout Button
    │   │   └── App Logo/Name
    │   └── Main Content Area (placeholder for future features)
    └── Profile Page (/profile)
        ├── Current Email Display
        ├── Update Email Form
        │   ├── New Email Input
        │   ├── Password Confirmation Input
        │   └── "Update Email" Button
        └── Change Password Form
            ├── Current Password Input
            ├── New Password Input
            ├── Confirm New Password Input
            └── "Change Password" Button
```

### Data Model (plain language)

**User Account Data (stored in Supabase Auth)**
- Email address (unique identifier)
- Hashed password (never stored in plain text)
- Account creation timestamp
- Last login timestamp
- Email verification status (verified/unverified)

**User Profile Data (stored in Supabase PostgreSQL)**
- User ID (links to Auth user)
- Display name (optional, for future use)
- Profile picture URL (optional, for future use)
- Account preferences (timezone, date format, etc.)

**Session Management**
- Browser session cookie (handled by Supabase Auth)
- Automatic session expiration after 7 days of inactivity
- Multiple simultaneous sessions allowed (different devices)

### Tech Decisions (justified for PM)

**1. Why Supabase Auth instead of building our own?**
- **Security**: Supabase handles password hashing, session management, and security best practices automatically
- **Time Savings**: No need to build registration, login, password reset flows from scratch
- **Cost Effective**: Free tier supports up to 50,000 monthly active users
- **Future Proof**: Built-in support for social logins (Google, GitHub) if we need them later

**2. Why separate Auth and Profile data?**
- **Separation of Concerns**: Authentication data (passwords, sessions) is managed separately from user preferences
- **Performance**: Profile data can be queried independently without touching sensitive auth tables
- **Flexibility**: Easier to extend profile information without affecting auth system

**3. Why 7-day session expiration?**
- **Security Balance**: Long enough for convenience (users don't need to log in daily), short enough for security
- **Industry Standard**: Similar to banking and productivity apps
- **Team Context**: Small teams working on projects over weeks/months

**4. Why email-only authentication (no username)?**
- **Simpler UX**: Users remember their email, not an additional username
- **Professional Context**: Teams use work emails, making them natural identifiers
- **Password Recovery**: Reset links go to verified email addresses

### Dependencies (packages to install)

**Already Installed (from shadcn/ui):**
- `@supabase/supabase-js` - Client library for Supabase
- `@supabase/auth-js` - Authentication library
- All UI components needed (Button, Input, Form, Card, etc.)

**Additional Packages Needed:**
- `react-hook-form` - Form state management and validation
- `zod` - Schema validation for form inputs
- `@hookform/resolvers` - Connects react-hook-form with zod

## QA Test Results (to be added by QA Engineer)

*To be filled by `/qa` skill*

## Deployment

**Production URLs:**
- **Primary:** https://pm-app-rouge.vercel.app
- **Direct:** https://pm-jvze3o536-carstens-projects-bf0a64f0.vercel.app

**Deployment Details:**
- **Deployed:** 2026-02-18
- **Vercel Project:** carstens-projects-bf0a64f0/pm-app
- **Region:** Washington, D.C., USA (East) - iad1
- **Build Time:** 53 seconds
- **Next.js Version:** 16.1.1
- **Supabase Integration:** ✅ Configured (mock auth in production due to missing env vars)

**Environment Variables Status:**
- ⚠ **Action Required:** Environment variables not set in Vercel
- **Required Variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Current Status:** Using mock authentication in production

**Supabase Auth Configuration Required:**
1. **Vercel Dashboard:** Add environment variables in Project Settings
2. **Supabase Dashboard:** Update Redirect URLs for production domain

**Rollback:** Use `vercel --prod` to deploy previous version if needed
**Logs:** `vercel inspect pm-jvze3o536-carstens-projects-bf0a64f0.vercel.app --logs`
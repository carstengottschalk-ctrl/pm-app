import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check if Supabase is configured or if we should force mock auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const forceMockAuth = process.env.NEXT_PUBLIC_FORCE_MOCK_AUTH === 'true';

  const isSupabaseConfigured = !forceMockAuth && supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here';

  console.log('Middleware: isSupabaseConfigured:', isSupabaseConfigured, 'forceMockAuth:', forceMockAuth);

  let session = null;
  let sessionError = null;

  if (isSupabaseConfigured) {
    console.log('Middleware: Using Supabase authentication');
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh session if expired
    await supabase.auth.getSession();

    // Get the user session
    const sessionResult = await supabase.auth.getSession();
    session = sessionResult.data.session;
    sessionError = sessionResult.error;
  } else {
    console.log('Middleware: Supabase not configured, using mock auth bypass');
    // For mock auth, we don't have server-side session validation
    // Client-side auth context will handle authentication
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);

  console.log('Middleware: pathname:', request.nextUrl.pathname, 'session:', session ? 'Found' : 'Not found', session?.user?.email, 'sessionError:', sessionError);

  // Log cookies for debugging
  const cookies = request.cookies.getAll();
  console.log('Middleware: Cookies count:', cookies.length);
  if (cookies.length > 0) {
    console.log('Middleware: Cookie names:', cookies.map(c => c.name).join(', '));
  }

  // For mock auth, skip server-side session validation
  // Client-side auth context will handle redirects
  if (!isSupabaseConfigured) {
    console.log('Middleware: Skipping session validation for mock auth');
    return supabaseResponse;
  }

  // If user is not authenticated and trying to access a protected route
  if (!session && !isPublicRoute) {
    console.log('Middleware: Redirecting to login from', request.nextUrl.pathname);
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access a public route (except home and reset password)
  if (session && isPublicRoute && request.nextUrl.pathname !== '/' && request.nextUrl.pathname !== '/auth/reset-password') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
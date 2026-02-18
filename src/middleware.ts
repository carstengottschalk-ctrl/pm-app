import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/auth/callback', '/auth/reset-password'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);

  // Get the user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Middleware: pathname:', request.nextUrl.pathname, 'session:', session ? 'Found' : 'Not found', session?.user?.email);

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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  // The session secret from environment variables
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  // Check if the session cookie is valid
  const isSessionValid = sessionCookie === sessionSecret;

  // If the user is trying to access an admin page and doesn't have a valid session,
  // redirect them to the login page.
  if (pathname.startsWith('/admin01') && !isSessionValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Optional: add a redirect param
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in (has a valid session) and tries to access the login page,
  // redirect them to the admin dashboard.
  if (pathname === '/login' && isSessionValid) {
    return NextResponse.redirect(new URL('/admin01', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin01/:path*', '/login'],
};

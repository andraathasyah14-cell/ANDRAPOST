
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session');
  const { pathname } = request.nextUrl;

  // If the user is trying to access an admin page and doesn't have a session cookie,
  // redirect them to the login page.
  if (pathname.startsWith('/admin01') && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Optional: add a redirect param
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in and tries to access the login page,
  // redirect them to the admin dashboard.
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/admin01', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin01/:path*', '/login'],
};

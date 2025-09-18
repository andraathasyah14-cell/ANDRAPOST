
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.has('__session');

  // If trying to access admin area and there is no session cookie, redirect to login
  if (pathname.startsWith('/admin01') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page but a session cookie exists, redirect to admin
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/admin01', request.url));
  }

  return NextResponse.next();
}

// The matcher enables the middleware for admin and login routes.
export const config = {
  matcher: ['/admin01/:path*', '/login'],
};

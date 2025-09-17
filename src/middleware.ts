
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is no longer used in the new simplified auth system.
// It is kept here as a reference but is not active.
// The matching config is removed to disable it.

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
      console.error("FATAL: ADMIN_SESSION_SECRET is not set in .env. Middleware cannot run securely.");
      if (pathname.startsWith('/admin01')) {
          return NextResponse.redirect(new URL('/login?error=config_error', request.url));
      }
      return NextResponse.next();
  }

  const isSessionValid = sessionCookie === sessionSecret;

  if (pathname.startsWith('/admin01') && !isSessionValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && isSessionValid) {
    return NextResponse.redirect(new URL('/admin01', request.url));
  }

  return NextResponse.next();
}

// The matcher is removed to disable the middleware entirely.
export const config = {
  matcher: [],
};

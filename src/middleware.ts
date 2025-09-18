
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

async function verifySessionCookie(req: NextRequest) {
  const sessionCookie = req.cookies.get('__session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const user = await verifySessionCookie(request);

  // If trying to access admin area and not logged in, redirect to login
  if (pathname.startsWith('/admin01') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page but already logged in, redirect to admin
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin01', request.url));
  }

  return NextResponse.next();
}

// The matcher enables the middleware for admin and login routes.
export const config = {
  matcher: ['/admin01/:path*', '/login'],
};


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
// This block is safe for the edge runtime as long as the main `firebase-admin` entry is not used directly.
// The functions below will use a named app instance if available.
if (!getApps().length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : undefined;
        
        // Use default credentials if service account key is not available.
        // This is safer for edge environments.
        initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
    } catch (e) {
        console.error('Firebase Admin initialization error in middleware:', e);
    }
}


async function verifySessionCookie(req: NextRequest) {
  const sessionCookie = req.cookies.get('__session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    // getAuth() is safe to call here.
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // This check has to be performed on every request to protected routes.
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

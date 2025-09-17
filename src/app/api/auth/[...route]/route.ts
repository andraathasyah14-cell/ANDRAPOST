
// src/app/api/auth/[...route]/route.ts
import { admin, initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin
initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const route = pathname.split('/').pop();

  if (!admin) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
  }

  try {
    if (route === 'login') {
      const authorization = request.headers.get('Authorization');
      if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        
        const options = {
          name: '__session',
          value: sessionCookie,
          maxAge: expiresIn,
          httpOnly: true,
          secure: true,
        };

        cookies().set(options);
        return NextResponse.json({ status: 'success' });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else if (route === 'logout') {
      const sessionCookieName = '__session';
      const sessionCookie = cookies().get(sessionCookieName)?.value;
      if (sessionCookie) {
        cookies().delete(sessionCookieName);
        try {
            const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie);
            await admin.auth().revokeRefreshTokens(decodedClaims.sub);
        } catch (error) {
            console.warn("Failed to revoke refresh tokens, cookie might be expired.", error);
        }
      }
      return NextResponse.json({ status: 'success' });
    } else {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

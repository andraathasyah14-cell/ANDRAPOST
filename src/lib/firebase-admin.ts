// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This is a more robust pattern for initializing the Firebase Admin SDK in a Next.js environment.
// It prevents re-initialization during hot-reloads in development.
// It also ensures that we only try to use the SDK after it has been successfully initialized.

interface FirebaseAdmin {
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  auth: admin.auth.Auth;
  admin: typeof admin;
}

// We use a global variable to cache the initialized Firebase admin instance.
// This is a common pattern in serverless environments to reuse connections.
declare global {
  // eslint-disable-next-line no-var
  var __firebase_admin_sdk: FirebaseAdmin | undefined | null;
}

export function initializeFirebaseAdmin(): FirebaseAdmin | null {
  // If we've already tried and failed, don't try again.
  if (global.__firebase_admin_sdk === null) {
    return null;
  }

  if (global.__firebase_admin_sdk) {
    return global.__firebase_admin_sdk;
  }
  
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin credentials (project_id, client_email, private_key) are not fully set in environment variables. Firebase Admin initialization skipped.');
        global.__firebase_admin_sdk = null;
        return null;
    }
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      console.log('Firebase Admin SDK initialized successfully.');
    }
  } catch (error: any) {
    // Log a more informative error message
    console.error('Firebase admin initialization error:', error.message);
    // Mark initialization as failed by setting the global to null
    global.__firebase_admin_sdk = null;
    return null;
  }

  const db = admin.firestore();
  const storage = admin.storage();
  const auth = admin.auth();
  
  const firebaseAdminSDK: FirebaseAdmin = { db, storage, auth, admin };

  global.__firebase_admin_sdk = firebaseAdminSDK;

  return firebaseAdminSDK;
}

const sdk = initializeFirebaseAdmin();

// Export the initialized instance directly for use in other server-side modules
export const admin = sdk?.admin ?? null;
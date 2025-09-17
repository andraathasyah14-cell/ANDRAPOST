
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This is a more robust pattern for initializing the Firebase Admin SDK in a Next.js environment.
// It prevents re-initialization during hot-reloads in development.
// It also ensures that we only try to use the SDK after it has been successfully initialized.

interface FirebaseAdmin {
  db: admin.firestore.Firestore;
  storage: admin.storage.Storage;
  admin: typeof admin;
}

// We use a global variable to cache the initialized Firebase admin instance.
// This is a common pattern in serverless environments to reuse connections.
declare global {
  // eslint-disable-next-line no-var
  var __firebase_admin_sdk: FirebaseAdmin | undefined | null;
}

function initializeFirebaseAdmin(): FirebaseAdmin | null {
  // If we've already tried and failed, don't try again.
  if (global.__firebase_admin_sdk === null) {
    return null;
  }

  if (global.__firebase_admin_sdk) {
    return global.__firebase_admin_sdk;
  }

  // When running in a Google Cloud environment (like Firebase Studio or App Hosting),
  // the SDK can automatically detect the service account credentials.
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      console.log('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin initialization skipped.');
      global.__firebase_admin_sdk = null;
      return null;
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
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
  
  const firebaseAdminSDK: FirebaseAdmin = { db, storage, admin };

  global.__firebase_admin_sdk = firebaseAdminSDK;

  return firebaseAdminSDK;
}

const sdk = initializeFirebaseAdmin();

export const db = sdk?.db ?? null;
export const admin = sdk?.admin ?? null;

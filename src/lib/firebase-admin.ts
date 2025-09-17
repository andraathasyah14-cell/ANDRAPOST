
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This is a more robust pattern for initializing the Firebase Admin SDK in a Next.js environment.
// It prevents re-initialization during hot-reloads in development.
// It also ensures that we only try to use the SDK after it has been successfully initialized.

interface FirebaseAdmin {
  db: admin.firestore.Firestore;
  admin: typeof admin;
}

// We use a global variable to cache the initialized Firebase admin instance.
// This is a common pattern in serverless environments to reuse connections.
declare global {
  // eslint-disable-next-line no-var
  var __firebase_admin_sdk: FirebaseAdmin | undefined;
}

function initializeFirebaseAdmin(): FirebaseAdmin {
  if (global.__firebase_admin_sdk) {
    return global.__firebase_admin_sdk;
  }

  // When running in a Google Cloud environment (like Firebase Studio or App Hosting),
  // the SDK can automatically detect the service account credentials.
  try {
    if (!admin.apps.length) {
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized successfully.');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // If initialization fails, we throw the error to prevent the app from running
    // with a broken configuration.
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }

  const db = admin.firestore();
  
  const firebaseAdminSDK: FirebaseAdmin = { db, admin };

  global.__firebase_admin_sdk = firebaseAdminSDK;

  return firebaseAdminSDK;
}

const { db } = initializeFirebaseAdmin();

export { db };

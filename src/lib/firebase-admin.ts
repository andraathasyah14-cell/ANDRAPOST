
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

function initializeAdminApp(): App {
  const adminAppName = 'admin';
  // Check if the admin app is already initialized to avoid re-initialization
  if (getApps().some(app => app.name === adminAppName)) {
    return getApps().find(app => app.name === adminAppName)!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const credentials = JSON.parse(serviceAccountKey);
      console.log("Initializing Firebase Admin with service account key...");
      return initializeApp({
        credential: cert(credentials),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      }, adminAppName);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid JSON string. Falling back to default credentials.", e);
    }
  }

  // In environments like Vercel, or if service account key is not set or invalid,
  // use default credentials. This is the recommended approach for deployed environments.
  console.log("Initializing Firebase Admin with default credentials...");
  return initializeApp({
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, adminAppName);
}

const adminApp = initializeAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

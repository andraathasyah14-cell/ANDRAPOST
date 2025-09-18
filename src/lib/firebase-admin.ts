// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function initializeAdminApp(): App {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    // In environments like Vercel, GOOGLE_APPLICATION_CREDENTIALS might be set differently
    // or default credentials are used. For local, service account key is best.
    console.log("Initializing Firebase Admin with default credentials...");
    return initializeApp({
       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
       storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    }, 'admin');
  }

  const credentials = JSON.parse(serviceAccountKey);
  
  console.log("Initializing Firebase Admin with service account key...");
  return initializeApp({
    credential: cert(credentials),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, 'admin');
}

const adminApp = initializeAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

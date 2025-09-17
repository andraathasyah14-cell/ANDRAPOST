// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration from environment variables
const firebaseConfigOptions: Record<string, string | undefined> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Filter out any keys that have undefined or empty values
const filteredConfig: FirebaseOptions = Object.entries(firebaseConfigOptions)
  .reduce((acc, [key, value]) => {
    if (value) {
      acc[key as keyof FirebaseOptions] = value;
    }
    return acc;
  }, {} as FirebaseOptions);


// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(filteredConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // For Cloud Firestore
export const storage = getStorage(app); // For Cloud Storage
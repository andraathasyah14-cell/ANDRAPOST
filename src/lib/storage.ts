// src/lib/storage.ts
'use client';

import { storage } from './firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Handles the upload of a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored.
 * @returns The public URL of the uploaded file.
 */
export async function handleImageUpload(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Create a unique file name to avoid collisions
  const uniqueFileName = `${path}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, uniqueFileName);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    // Provide a more specific error message if possible
    if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'storage/unauthorized') {
            throw new Error('Permission denied. Please check your Firebase Storage security rules.');
        }
    }
    throw new Error('Failed to upload image. Please try again.');
  }
}

'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage as firebaseStorage } from '@/lib/firebase-client';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

function createUploadTask(
  file: File,
  onProgress: ProgressHandler
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!firebaseStorage) {
        return reject(new Error("Firebase Storage is not initialized. Check your client config."));
    }
    const fileId = window.crypto.randomUUID();
    const storageRef = ref(firebaseStorage, `uploads/${fileId}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const startTime = Date.now();

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Progress logic
        const percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const timeElapsed = (Date.now() - startTime) / 1000; // in seconds
        const speedBps = timeElapsed > 0 ? snapshot.bytesTransferred / timeElapsed : 0;

        let speed = '0 KB/s';
        if (speedBps > 1024 * 1024) {
          speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
        } else if (speedBps > 1024) {
          speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
        } else {
          speed = `${speedBps.toFixed(2)} B/s`;
        }

        onProgress({ percentage, speed });
      },
      (error) => {
        // Error logic
        console.error('Upload failed:', error);
        reject(
          new Error(
            `Upload failed. Code: ${error.code}. Message: ${error.message}. Please check Storage security rules and configuration.`
          )
        );
      },
      async () => {
        // Completion logic
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error('Failed to get download URL:', error);
          reject(new Error('Upload complete, but failed to get download URL.'));
        }
      }
    );
  });
}

/**
 * Handles the client-side upload of a new file.
 * @param file The file to upload.
 * @param onProgress A callback function to receive progress updates.
 * @returns The public URL of the uploaded file.
 */
export function handleImageUpload(
  file: File,
  onProgress: ProgressHandler
): Promise<string> {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  if (!allowedTypes.includes(file.type)) {
    return Promise.reject(
      new Error('Invalid file type. Please upload a valid image file.')
    );
  }

  return createUploadTask(file, onProgress);
}


/**
 * Replaces an old image in Firebase Storage with a new one.
 * It first deletes the old image (if it's a Firebase Storage URL) and then uploads the new one.
 * @param oldImageUrl The full URL of the image to be replaced.
 * @param newFile The new file to upload.
 * @param onProgress A callback to track upload progress of the new file.
 * @returns The public URL of the newly uploaded file.
 */
export async function handleImageReplacement(
  oldImageUrl: string | undefined | null,
  newFile: File,
  onProgress: ProgressHandler
): Promise<string> {
  
  if (oldImageUrl && oldImageUrl.includes('storage.googleapis.com')) {
    try {
      const oldRef = ref(firebaseStorage, oldImageUrl);
      await deleteObject(oldRef);
      console.log("Successfully deleted old image:", oldImageUrl);
    } catch (error: any) {
      // It's okay if the old image doesn't exist. We can ignore that error.
      if (error.code !== 'storage/object-not-found') {
        console.warn("Could not delete old image, it might not exist or there's a permission issue:", error);
      }
    }
  }

  // Now, upload the new file and return its URL
  return handleImageUpload(newFile, onProgress);
}
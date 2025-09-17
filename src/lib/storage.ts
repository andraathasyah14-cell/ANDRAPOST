// src/lib/storage.ts
'use client';

import { storage } from './firebase-client';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from 'firebase/storage';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

/**
 * Handles the resumable upload of a file to Firebase Storage with progress tracking.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored.
 * @param onProgress A callback function to receive progress updates.
 * @returns The public URL of the uploaded file.
 */
export function handleImageUpload(
  file: File,
  path: string,
  onProgress: ProgressHandler
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    const uniqueFileName = `${path}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, uniqueFileName);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    let startTime = Date.now();
    let lastBytesTransferred = 0;

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const now = Date.now();
        const timeElapsed = (now - startTime) / 1000; // in seconds
        const bytesSinceLastUpdate = snapshot.bytesTransferred - lastBytesTransferred;

        // Calculate speed, avoid division by zero
        const speedBps = timeElapsed > 0 ? snapshot.bytesTransferred / timeElapsed : 0;
        
        let speed = '';
        if (speedBps > 1024 * 1024) {
            speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
        } else if (speedBps > 1024) {
            speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
        } else {
            speed = `${speedBps.toFixed(2)} B/s`;
        }

        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
        onProgress({ percentage, speed });

        // Update for next calculation
        // This part is less critical for average speed but can be used for instantaneous speed
        // lastBytesTransferred = snapshot.bytesTransferred;
        // startTime = now;
      },
      (error) => {
        console.error("Error uploading image to Firebase Storage:", error);
        let errorMessage = 'Failed to upload image. Please try again.';
        if (error.code === 'storage/unauthorized') {
          errorMessage = 'Permission denied. Please check your Firebase Storage security rules.';
        }
        reject(new Error(errorMessage));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (urlError) {
          reject(new Error('Failed to get download URL.'));
        }
      }
    );
  });
}

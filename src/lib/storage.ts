'use client';

import { storage } from '@/lib/firebase-client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

/**
 * Handles the client-side upload of a file directly to Firebase Storage.
 * @param file The file to upload.
 * @param onProgress A callback function to receive progress updates.
 * @returns The public URL of the uploaded file.
 */
export function handleImageUpload(
  file: File,
  onProgress: ProgressHandler
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return reject(new Error('Invalid file type. Please upload a JPG or PNG file.'));
    }
    
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `uploads/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const startTime = Date.now();

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress function
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
        // Error function
        console.error("Firebase Storage Upload Error:", error);
        let errorMessage = 'Upload failed. Please check your network and Firebase Storage rules.';
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Permission denied. Please check your Firebase Storage security rules to allow writes.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was canceled.';
            break;
          case 'storage/unknown':
            errorMessage = 'An unknown error occurred during upload. Check browser console for details.';
            break;
        }
        reject(new Error(errorMessage));
      },
      () => {
        // Complete function
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
}


'use client';

import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { randomUUID } from 'crypto';
import { storage as clientStorage } from '@/lib/firebase-client';


export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

/**
 * Handles the client-side upload of a new file directly using the Client SDK.
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
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return Promise.reject(new Error('File is too large. Maximum size is 5MB.'));
  }

  // Use clientStorage which is guaranteed to be initialized.
  const storage = clientStorage;
  const filePath = `uploads/${randomUUID()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    let startTime = Date.now();

    uploadTask.on('state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Progress logic
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const timeElapsed = (Date.now() - startTime) / 1000;
        const speedBps = timeElapsed > 0 ? snapshot.bytesTransferred / timeElapsed : 0;

        let speed = '0 KB/s';
        if (speedBps > 1024 * 1024) {
          speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
        } else {
          speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
        }
        
        onProgress({ percentage, speed });
      },
      (error) => {
        // Error logic
        console.error("Upload failed:", error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error("You don't have permission to upload files."));
            break;
          case 'storage/canceled':
            reject(new Error("Upload was canceled."));
            break;
          default:
            reject(new Error("An unknown error occurred during upload."));
            break;
        }
      },
      () => {
        // Completion logic
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        }).catch(reject);
      }
    );
  });
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
  // Use clientStorage which is guaranteed to be initialized.
  const storage = clientStorage;

  // We only attempt to delete if it's a valid Firebase Storage URL.
  // Placeholder images (picsum.photos) or invalid URLs are ignored.
  if (oldImageUrl && (oldImageUrl.includes('firebasestorage.googleapis.com') || oldImageUrl.includes('storage.googleapis.com'))) {
    try {
      const oldRef = ref(storage, oldImageUrl);
      await deleteObject(oldRef);
      console.log('Successfully deleted old image:', oldImageUrl);
    } catch (error: any) {
      // It's okay if the old image doesn't exist. We can ignore that error.
      if (error.code !== 'storage/object-not-found') {
        console.warn(
          "Could not delete old image, it might not exist or there's a permission issue:",
          error
        );
      }
    }
  }

  // Now, upload the new file and return its public URL
  return handleImageUpload(newFile, onProgress);
}


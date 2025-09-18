
'use client';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage as clientStorage } from '@/lib/firebase-client';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;


function getStoragePath(file: File, collection: string) {
    const timestamp = new Date().toISOString();
    if (collection === 'publications' && file.type === 'application/pdf') {
        return `files/publications/${timestamp}-${file.name}`;
    }
    return `images/${collection}/${timestamp}-${file.name}`;
}

/**
 * Handles the client-side upload of a new file directly using the Client SDK.
 * @param file The file to upload.
 * @param collection The Firestore collection name to determine the storage path.
 * @param onProgress A callback function to receive progress updates.
 * @returns The public URL of the uploaded file.
 */
export function handleImageUpload(
  file: File,
  collection: 'opinions' | 'publications' | 'ongoing' | 'profile',
  onProgress: ProgressHandler
): Promise<string> {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  const allowedPdfTypes = ['application/pdf'];
  
  let allowedTypes = allowedImageTypes;
  if (collection === 'publications') {
      allowedTypes = [...allowedImageTypes, ...allowedPdfTypes];
  }


  if (!allowedTypes.includes(file.type)) {
    return Promise.reject(
      new Error('Invalid file type. Please upload a valid image or PDF file.')
    );
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return Promise.reject(new Error('File is too large. Maximum size is 10MB.'));
  }

  const storage = clientStorage;
  const filePath = getStoragePath(file, collection);
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
            reject(new Error("You don't have permission to upload files. Check your Storage Rules."));
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
 * @param collection The Firestore collection for the new file's path.
 * @param onProgress A callback to track upload progress of the new file.
 * @returns The public URL of the newly uploaded file.
 */
export async function handleImageReplacement(
  oldImageUrl: string | undefined | null,
  newFile: File,
  collection: 'opinions' | 'publications' | 'ongoing' | 'profile',
  onProgress: ProgressHandler
): Promise<string> {

  if (oldImageUrl && (oldImageUrl.includes('firebasestorage.googleapis.com') || oldImageUrl.includes('storage.googleapis.com'))) {
    try {
      const oldRef = ref(clientStorage, oldImageUrl);
      await deleteObject(oldRef);
      console.log('Successfully deleted old file:', oldImageUrl);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.warn(
          "Could not delete old file, it might not exist or there's a permission issue:",
          error
        );
      }
    }
  }

  // Now, upload the new file and return its public URL
  return handleImageUpload(newFile, collection, onProgress);
}

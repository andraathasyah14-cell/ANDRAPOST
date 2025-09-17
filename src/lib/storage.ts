
'use client';

import {
  deleteObject,
  getStorage,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { getSignedUploadUrl } from '@/lib/actions';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

async function createUploadTask(
  file: File,
  onProgress: ProgressHandler
): Promise<string> {
  // 1. Get a signed URL from our server
  const formData = new FormData();
  formData.append('fileName', file.name);
  formData.append('fileType', file.type);
  
  const signedUrlResult = await getSignedUploadUrl(null, formData);

  if (!signedUrlResult.success || !signedUrlResult.signedUrl || !signedUrlResult.publicUrl) {
    throw new Error(signedUrlResult.message || 'Gagal mendapatkan izin unggah dari server.');
  }

  const { signedUrl, publicUrl } = signedUrlResult;

  // 2. Upload the file to the signed URL
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let startTime = Date.now();

    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        const timeElapsed = (Date.now() - startTime) / 1000;
        const speedBps = timeElapsed > 0 ? event.loaded / timeElapsed : 0;

        let speed = '0 KB/s';
        if (speedBps > 1024 * 1024) {
          speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
        } else {
          speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
        }

        onProgress({ percentage, speed });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        // The file is now in Firebase Storage, return the public, permanent URL
        resolve(publicUrl);
      } else {
        console.error('Upload failed with status:', xhr.status, xhr.responseText);
        reject(new Error(`Gagal mengunggah file. Server merespons dengan status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      console.error('Network error during upload.');
      reject(new Error('Terjadi kesalahan jaringan saat mengunggah file.'));
    };

    xhr.send(file);
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
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return Promise.reject(new Error('File is too large. Maximum size is 5MB.'));
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
  // Call getStorage() inside the function to ensure Firebase App is initialized.
  const storage = getStorage();

  // We only attempt to delete if it's a valid Firebase Storage URL.
  // Placeholder images (picsum.photos) or invalid URLs are ignored.
  if (oldImageUrl && oldImageUrl.includes('storage.googleapis.com')) {
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


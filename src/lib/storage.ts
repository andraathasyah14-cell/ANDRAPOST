
'use client';

import { getSignedUploadUrl } from '@/lib/actions';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

/**
 * Handles the client-side upload of a file using a server-generated signed URL.
 * @param file The file to upload.
 * @param onProgress A callback function to receive progress updates.
 * @returns The public URL of the uploaded file.
 */
export function handleImageUpload(
  file: File,
  onProgress: ProgressHandler
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return reject(new Error('Invalid file type. Please upload a valid image file.'));
    }

    // 1. Get a signed URL from the server
    const formData = new FormData();
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    const signedUrlResult = await getSignedUploadUrl(null, formData);

    if (!signedUrlResult.success) {
      return reject(new Error(signedUrlResult.message || 'Failed to get a signed URL from the server.'));
    }

    const { signedUrl, publicUrl } = signedUrlResult;

    // 2. Upload the file to the signed URL using fetch with progress
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);

    const startTime = Date.now();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        const timeElapsed = (Date.now() - startTime) / 1000; // in seconds
        const speedBps = timeElapsed > 0 ? event.loaded / timeElapsed : 0;
        
        let speed = '0 KB/s';
        if (speedBps > 1024 * 1024) {
          speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
        } else if (speedBps > 1024) {
          speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
        } else {
          speed = `${speedBps.toFixed(2)} B/s`;
        }
        
        onProgress({ percentage, speed });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(publicUrl);
      } else {
        console.error("Upload failed:", xhr.statusText, xhr.responseText);
        reject(new Error(`Upload failed with status: ${xhr.status}. ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      console.error("Upload failed due to a network error.");
      reject(new Error('Upload failed. Please check your network connection.'));
    };

    xhr.send(file);
  });
}

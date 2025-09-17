'use client';

import { getSignedUploadUrl } from '@/lib/actions';

export type UploadProgress = {
  percentage: number;
  speed: string; // e.g., "500 KB/s"
};

type ProgressHandler = (progress: UploadProgress) => void;

/**
 * Handles the upload of a file using a server-generated signed URL.
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

    try {
      // 1. Get the signed URL from the server
      const result = await getSignedUploadUrl({
        fileName: file.name,
        fileType: file.type,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { signedUrl, publicUrl } = result;

      // 2. Upload the file to the signed URL using fetch with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      const startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const now = Date.now();
          const timeElapsed = (now - startTime) / 1000; // in seconds
          const speedBps = timeElapsed > 0 ? event.loaded / timeElapsed : 0;
          
          let speed = '0 KB/s';
          if (speedBps > 1024 * 1024) {
              speed = `${(speedBps / (1024 * 1024)).toFixed(2)} MB/s`;
          } else if (speedBps > 1024) {
              speed = `${(speedBps / 1024).toFixed(2)} KB/s`;
          } else {
              speed = `${speedBps.toFixed(2)} B/s`;
          }

          const percentage = (event.loaded / event.total) * 100;
          onProgress({ percentage, speed });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          // 3. Resolve with the public URL
          resolve(publicUrl);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('An error occurred during the upload. Please check your network connection.'));
      };

      xhr.send(file);

    } catch (error) {
      console.error("Error during signed URL upload process:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
      reject(new Error(errorMessage));
    }
  });
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
}

export const compressImage = (file: File): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    // Basic file type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          // Step 1: Calculate target dimensions (max 800px)
          let targetWidth = img.width;
          let targetHeight = img.height;
          const MAX_INITIAL = 800;

          if (targetWidth > targetHeight) {
            if (targetWidth > MAX_INITIAL) {
              targetHeight = Math.round(targetHeight * (MAX_INITIAL / targetWidth));
              targetWidth = MAX_INITIAL;
            }
          } else {
            if (targetHeight > MAX_INITIAL) {
              targetWidth = Math.round(targetWidth * (MAX_INITIAL / targetHeight));
              targetHeight = MAX_INITIAL;
            }
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not initialize image processing canvas.'));
            return;
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Pass 1: Try quality 0.65
          let quality = 0.65;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let sizeInBytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
          let sizeKb = Math.round(sizeInBytes / 1024);

          // Pass 2: If > 320 KB, step down resolution & quality
          if (sizeKb > 320) {
            const SECOND_MAX = 640;
            if (targetWidth > targetHeight) {
              targetHeight = Math.round(targetHeight * (SECOND_MAX / targetWidth));
              targetWidth = SECOND_MAX;
            } else {
              targetWidth = Math.round(targetWidth * (SECOND_MAX / targetHeight));
              targetHeight = SECOND_MAX;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            quality = 0.55;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            sizeInBytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
            sizeKb = Math.round(sizeInBytes / 1024);
          }

          // Hard limit guard (Firestore single doc limit is 1MB)
          if (sizeKb > 700) {
            reject(new Error(`Compressed photo size (${sizeKb} KB) is too large. Please select a smaller photo.`));
            return;
          }

          resolve({
            dataUrl,
            sizeKb
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to process image file.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
  });
};

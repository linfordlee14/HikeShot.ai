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
          // Helper to render image at specific max dimension and quality
          const renderAtResolution = (maxDim: number, quality: number): { dataUrl: string; sizeKb: number } => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round(height * (maxDim / width));
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round(width * (maxDim / height));
                height = maxDim;
              }
            }

            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Could not initialize image processing canvas.');
            }

            // Fill white background for transparent formats converted to JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            // Calculate Base64 payload size in KB accurately
            const sizeInBytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
            const sizeKb = Math.round(sizeInBytes / 1024);

            return { dataUrl, sizeKb };
          };

          // Step 1: Initial pass at 1600px max dimension, 0.75 quality
          let result = renderAtResolution(1600, 0.75);

          // Step 2: Target 100–300 KB. If > 320 KB, recompress at 1280px / 0.65
          if (result.sizeKb > 320) {
            result = renderAtResolution(1280, 0.65);
          }

          // Step 3: If still > 320 KB, recompress at 1000px / 0.60
          if (result.sizeKb > 320) {
            result = renderAtResolution(1000, 0.60);
          }

          // Step 4: If still > 400 KB, recompress at 800px / 0.55
          if (result.sizeKb > 400) {
            result = renderAtResolution(800, 0.55);
          }

          // Step 5: Strict rejection limit of 500 KB to guarantee safety and Firestore performance
          if (result.sizeKb > 500) {
            reject(new Error(`Compressed photo size (${result.sizeKb} KB) exceeds the 500 KB limit. Please choose a different photo.`));
            return;
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to process image file.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
  });
};

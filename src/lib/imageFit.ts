/**
 * Image aspect ratio & framing utility for RUH STONE product photography.
 * Automatically fits any uploaded photo into the standard 4:5 product box
 * without cropping important parts of the handcrafted object.
 */

export interface FitOptions {
  mode?: 'contain' | 'cover';
  bgColor?: string; // '#ECE4D6' | '#FAF7F2' | '#FFFFFF' | 'blur' | 'sample'
  targetWidth?: number;
  targetHeight?: number;
  padding?: number; // 0 to 0.2 (e.g. 0.03 = 3% breathing room)
  zoom?: number; // scale multiplier, e.g. 1.0
}

export const ATELIER_BACKGROUNDS = [
  { id: '#ECE4D6', label: 'Atelier Sand (#ECE4D6)', description: 'Matches Ruh Stone product card background' },
  { id: '#FAF7F2', label: 'Warm Ivory (#FAF7F2)', description: 'Matches website editorial page background' },
  { id: 'blur', label: 'Ambient Studio Blur', description: 'Soft blurred depth background matching the photo' },
  { id: 'sample', label: 'Auto-Sample Photo Edge', description: 'Blends seamlessly with photo background color' },
  { id: '#FFFFFF', label: 'Pure White (#FFFFFF)', description: 'Ideal for studio catalog cutouts' },
];

/**
 * Fits an uploaded File into a 4:5 aspect ratio box using an HTML5 Canvas.
 * Returns a new File object in JPEG format ready for upload.
 */
export async function fitImageFileToBox(
  file: File,
  options: FitOptions = {}
): Promise<File> {
  // If not an image file, return original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const {
    mode = 'contain',
    bgColor = '#ECE4D6',
    targetWidth = 1200,
    targetHeight = 1500,
    padding = 0.03,
    zoom = 1.0,
  } = options;

  return new Promise((resolve) => {
    // Timeout safeguard (5 seconds max)
    const timeout = setTimeout(() => {
      resolve(file);
    }, 5000);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        // 1. Draw Background
        if (bgColor === 'blur') {
          // Draw blurred backdrop
          ctx.save();
          ctx.filter = 'blur(45px) brightness(0.96)';
          const bgScale = Math.max(targetWidth / img.width, targetHeight / img.height) * 1.15;
          const bgW = img.width * bgScale;
          const bgH = img.height * bgScale;
          const bgX = (targetWidth - bgW) / 2;
          const bgY = (targetHeight - bgH) / 2;
          ctx.drawImage(img, bgX, bgY, bgW, bgH);
          ctx.restore();

          // Warm atelier wash over blur
          ctx.fillStyle = 'rgba(250, 247, 242, 0.42)';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (bgColor === 'sample') {
          // Sample corner pixels to find backdrop tone
          try {
            const sampleCanvas = document.createElement('canvas');
            sampleCanvas.width = img.width;
            sampleCanvas.height = img.height;
            const sctx = sampleCanvas.getContext('2d');
            if (sctx) {
              sctx.drawImage(img, 0, 0);
              const p1 = sctx.getImageData(Math.min(4, img.width - 1), Math.min(4, img.height - 1), 1, 1).data;
              const p2 = sctx.getImageData(Math.max(0, img.width - 5), Math.min(4, img.height - 1), 1, 1).data;
              const p3 = sctx.getImageData(Math.min(4, img.width - 1), Math.max(0, img.height - 5), 1, 1).data;
              const p4 = sctx.getImageData(Math.max(0, img.width - 5), Math.max(0, img.height - 5), 1, 1).data;
              const r = Math.round((p1[0] + p2[0] + p3[0] + p4[0]) / 4);
              const g = Math.round((p1[1] + p2[1] + p3[1] + p4[1]) / 4);
              const b = Math.round((p1[2] + p2[2] + p3[2] + p4[2]) / 4);
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else {
              ctx.fillStyle = '#ECE4D6';
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
          } catch {
            ctx.fillStyle = '#ECE4D6';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }
        } else {
          // Solid color background
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // 2. Draw Main Image into Box
        if (mode === 'contain') {
          // Fit entire photo inside box without any cropping
          const availW = targetWidth * (1 - padding * 2);
          const availH = targetHeight * (1 - padding * 2);
          const baseScale = Math.min(availW / img.width, availH / img.height);
          const finalScale = baseScale * zoom;

          const drawW = img.width * finalScale;
          const drawH = img.height * finalScale;
          const drawX = (targetWidth - drawW) / 2;
          const drawY = (targetHeight - drawH) / 2;

          if (bgColor === 'blur') {
            ctx.save();
            ctx.shadowColor = 'rgba(35, 32, 29, 0.15)';
            ctx.shadowBlur = 32;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.restore();
          } else {
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
          }
        } else {
          // Cover mode: fill the entire box
          const baseScale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const finalScale = baseScale * zoom;

          const drawW = img.width * finalScale;
          const drawH = img.height * finalScale;
          const drawX = (targetWidth - drawW) / 2;
          const drawY = (targetHeight - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
            const fittedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(fittedFile);
          },
          'image/jpeg',
          0.94
        );
      } catch (err) {
        console.error('Error fitting image to box:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Fits an image from a URL into a 4:5 box and returns a data URL or original URL
 */
export async function fitImageUrlToBox(
  url: string,
  options: FitOptions = {}
): Promise<string> {
  const {
    mode = 'contain',
    bgColor = '#ECE4D6',
    targetWidth = 1200,
    targetHeight = 1500,
    padding = 0.03,
    zoom = 1.0,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      resolve(url);
    }, 4000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.fillStyle = bgColor === 'blur' || bgColor === 'sample' ? '#ECE4D6' : bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (mode === 'contain') {
          const availW = targetWidth * (1 - padding * 2);
          const availH = targetHeight * (1 - padding * 2);
          const baseScale = Math.min(availW / img.width, availH / img.height);
          const finalScale = baseScale * zoom;

          const drawW = img.width * finalScale;
          const drawH = img.height * finalScale;
          const drawX = (targetWidth - drawW) / 2;
          const drawY = (targetHeight - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          const baseScale = Math.max(targetWidth / img.width, targetHeight / img.height);
          const finalScale = baseScale * zoom;
          const drawW = img.width * finalScale;
          const drawH = img.height * finalScale;
          const drawX = (targetWidth - drawW) / 2;
          const drawY = (targetHeight - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch {
        resolve(url); // CORS or canvas error fallback
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(url);
    };

    img.src = url;
  });
}

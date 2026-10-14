/**
 * High-performance image compressor for fast local caching and Firestore sync
 */
export const compressImage = (
  fileOrBase64: File | string,
  maxDimension: number = 1000,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's an external HTTP/HTTPS URL, return as-is
    if (typeof fileOrBase64 === 'string') {
      const trimmed = fileOrBase64.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return resolve(trimmed);
      }
    }

    const processSrc = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const TARGET_DIM = maxDimension;
          canvas.width = TARGET_DIM;
          canvas.height = TARGET_DIM;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(src);
          }

          // Fill clean background and center image in 1:1 ratio
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, TARGET_DIM, TARGET_DIM);

          const scale = Math.min(TARGET_DIM / img.width, TARGET_DIM / img.height);
          const drawWidth = Math.round(img.width * scale);
          const drawHeight = Math.round(img.height * scale);
          const drawX = Math.round((TARGET_DIM - drawWidth) / 2);
          const drawY = Math.round((TARGET_DIM - drawHeight) / 2);

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw image:', err);
          resolve(src);
        }
      };
      img.onerror = () => {
        console.warn('Image load error during compression, using raw source');
        resolve(src);
      };
      img.src = src;
    };

    if (typeof fileOrBase64 === 'string') {
      processSrc(fileOrBase64);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          processSrc(e.target.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrBase64);
    }
  });
};

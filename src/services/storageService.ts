import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper to compress an image file to a data URL if storage is unavailable or fails
export function fileToCompressedDataUrl(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a customer album photo to Firebase Storage under `orders/{orderId}/album/`
 */
export async function uploadOrderPhoto(orderId: string, file: File): Promise<string> {
  if (!storage) {
    console.warn('Firebase Storage not initialized, falling back to compressed image');
    return fileToCompressedDataUrl(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `orders/${orderId}/album/${timestamp}_${sanitizedName}`;
    const fileRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: { orderId, originalName: file.name },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Upload to Firebase Storage failed, falling back to compressed image:', error);
    return fileToCompressedDataUrl(file);
  }
}

/**
 * Upload a template thumbnail or asset to Firebase Storage under `templates/{slug}/`
 */
export async function uploadTemplatePhoto(templateSlug: string, file: File): Promise<string> {
  if (!storage) {
    console.warn('Firebase Storage not initialized, falling back to compressed image');
    return fileToCompressedDataUrl(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `templates/${templateSlug || 'general'}/${timestamp}_${sanitizedName}`;
    const fileRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: { templateSlug, originalName: file.name },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Upload template photo to Firebase Storage failed, falling back:', error);
    return fileToCompressedDataUrl(file);
  }
}

/**
 * Upload payment receipt proof to Firebase Storage under `orders/{orderId}/proof/`
 */
export async function uploadPaymentProof(orderId: string, file: File): Promise<string> {
  if (!storage) {
    return fileToCompressedDataUrl(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `orders/${orderId}/proof/${timestamp}_${sanitizedName}`;
    const fileRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: { orderId, originalName: file.name },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Upload proof failed, falling back:', error);
    return fileToCompressedDataUrl(file);
  }
}

/**
 * Upload multiple photos concurrently
 */
export async function uploadMultiplePhotos(
  orderId: string,
  files: File[]
): Promise<{ url: string; name: string; size: string }[]> {
  const uploadPromises = files.map(async (file) => {
    const url = await uploadOrderPhoto(orderId, file);
    return {
      url,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };
  });

  return Promise.all(uploadPromises);
}

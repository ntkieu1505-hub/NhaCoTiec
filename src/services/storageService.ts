import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload a customer album photo to Firebase Storage under `orders/{orderId}/album/`
 */
export async function uploadOrderPhoto(orderId: string, file: File): Promise<string> {
  if (!storage) {
    console.warn('Firebase Storage not initialized, using local blob URL');
    return URL.createObjectURL(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `orders/${orderId}/album/${timestamp}_${sanitizedName}`;
    const fileRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: { orderId, originalName: file.name },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Upload to Firebase Storage failed, falling back to local object URL:', error);
    return URL.createObjectURL(file);
  }
}

/**
 * Upload payment receipt proof to Firebase Storage under `orders/{orderId}/proof/`
 */
export async function uploadPaymentProof(orderId: string, file: File): Promise<string> {
  if (!storage) {
    return URL.createObjectURL(file);
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `orders/${orderId}/proof/${timestamp}_${sanitizedName}`;
    const fileRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: { orderId, originalName: file.name },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Upload proof failed, falling back to local object URL:', error);
    return URL.createObjectURL(file);
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

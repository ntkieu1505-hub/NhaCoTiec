/**
 * Utility functions to download images and files reliably in browser
 */

export async function downloadImage(url: string, filename: string): Promise<boolean> {
  if (!url) return false;

  try {
    // 1. If it's a data URL (base64)
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // 2. If it's a blob URL
    if (url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // 3. For remote URLs (Firebase Storage, CDN, etc.), fetch as blob to force download
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (error) {
    console.warn('Direct blob download failed, falling back to window.open / anchor:', error);
    // Fallback: create anchor with target blank
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}

export async function downloadAllImages(urls: string[], prefix = 'anh-cuoi'): Promise<void> {
  if (!urls || urls.length === 0) return;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpg';
    const filename = `${prefix}-${i + 1}.${ext}`;
    await downloadImage(url, filename);
    // Short pause between downloads to prevent browser popup block
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}

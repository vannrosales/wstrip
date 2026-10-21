/**
 * Share result object
 */
export type ShareResult =
  | { success: true; method: 'web-share' | 'clipboard' | 'download' }
  | { success: false; cancelled: boolean; error?: string };

/**
 * Downloads a Blob to the user's device as a file.
 */
export function downloadStrip(blob: Blob, filename = 'wstrip-photobooth.png'): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies the photostrip image to the system clipboard.
 */
export async function copyStripToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  try {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Shares the photostrip via the native Web Share API with files.
 */
export async function shareStrip(
  blob: Blob,
  filename = 'wstrip.png',
  title = 'My wStrip Photostrip'
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' });

  // Check if Web Share API with files is supported
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: 'Just snapped a photostrip with wStrip!',
      });
      return { success: true, method: 'web-share' };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      return {
        success: false,
        cancelled: false,
        error: err instanceof Error ? err.message : 'Unknown share error',
      };
    }
  }

  // Fallback 1: Try copying to clipboard
  const copied = await copyStripToClipboard(blob);
  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  // Fallback 2: Direct download
  downloadStrip(blob, filename);
  return { success: true, method: 'download' };
}

/**
 * Generates external social share URLs.
 */
export function getSocialShareLinks(shareUrl: string, text: string) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };
}


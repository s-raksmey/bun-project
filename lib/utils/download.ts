/**
 * Enhanced PDF Download Utilities
 * Handles proper file downloads with CORS support and fallbacks
 */

export interface DownloadOptions {
  fileName?: string;
}

/**
 * Opens a PDF file in a new tab for viewing
 * @param url - The URL of the PDF file
 */
export function viewPDF(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Downloads a PDF file to the user's device with proper save dialog
 * @param url - The URL of the PDF file
 * @param options - Download options
 */
export async function downloadPDF(url: string, options: DownloadOptions = {}): Promise<void> {
  let fileName = options.fileName || getFileNameFromUrl(url);
  // 1. Try File System Access API (native save dialog, no alerts)
  if ('showSaveFilePicker' in window) {
    try {
      // @ts-expect-error: showSaveFilePicker is not yet in the standard TypeScript DOM lib
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'PDF files',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });
      const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/pdf' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fileName = getFileNameFromUrl(url, response) || fileName;
      const blob = await response.blob();
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      // If user cancels or API fails, fall through to fallback
    }
  }
  // 2. Fallback: Use <a download> (default browser download, no alerts, no new tab)
  try {
    const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/pdf' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    fileName = getFileNameFromUrl(url, response) || fileName;
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return;
  } catch {
    // If fetch fails (e.g. CORS), fallback to opening in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
}

/**
 * Checks if the File System Access API is supported
 */

/**
 * Fallback download method using direct link
 */

/**
 * Download method without download attribute to potentially trigger browser's save dialog
 */

/**
 * Checks if a URL is same origin
 * @param url - The URL to check
 */

/**
 * Checks if a URL is downloadable (same origin or CORS-enabled)
 * @param url - The URL to check
 */
export async function isDownloadable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the filename from a URL or Content-Disposition header
 * @param url - The URL to extract filename from
 * @param response - Optional response object to check headers
 */
export function getFileNameFromUrl(url: string, response?: Response): string {
  // First, try to get filename from Content-Disposition header
  if (response) {
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1].replace(/['"]/g, '');
      }
    }
  }

  // Fallback: extract from URL
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename && filename.includes('.')) {
      return filename;
    }
  } catch {
    // Invalid URL, ignore
  }

  // Default filename
  return 'document.pdf';
}

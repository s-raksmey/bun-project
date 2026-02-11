/**
 * Enhanced PDF Download Utilities
 * Handles proper file downloads with CORS support and fallbacks
 */

export interface DownloadOptions {
  fileName?: string;
  fallbackToOpen?: boolean;
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
  const { fileName = 'document.pdf', fallbackToOpen = true } = options;

  // First, get the file as a blob
  let blob: Blob;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    blob = await response.blob();
  } catch (error) {
    console.error('Failed to fetch file:', error);
    
    if (fallbackToOpen) {
      // If we can't fetch, try direct link approach (may not show save dialog)
      return downloadWithDirectLink(url, fileName);
    } else {
      throw error;
    }
  }

  // Use the modern File System Access API if available (shows native save dialog)
  if (supportsFileSystemAccess()) {
    try {
      // Show the native file save dialog
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'PDF files',
            accept: {
              'application/pdf': ['.pdf'],
            },
          },
        ],
      });

      // Write the blob to the selected file
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      return; // Success with native save dialog
    } catch (error: any) {
      // User cancelled the dialog or other error
      if (error.name === 'AbortError') {
        console.log('User cancelled the save dialog');
        return; // User cancelled, don't show error
      }
      console.warn('File System Access API failed:', error);
      // Fall through to legacy method
    }
  }

  // Fallback: Use blob URL with download attribute (may download directly)
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the blob URL
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Checks if the File System Access API is supported
 */
function supportsFileSystemAccess(): boolean {
  return (
    'showSaveFilePicker' in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })()
  );
}

/**
 * Fallback download method using direct link
 */
function downloadWithDirectLink(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Checks if a URL is same origin
 * @param url - The URL to check
 */
function isSameOriginUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.href);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
}

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

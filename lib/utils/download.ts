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

  // ALWAYS try File System Access API first if supported (this shows the save dialog)
  if (supportsFileSystemAccess()) {
    try {
      // Show the native file save dialog FIRST
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

      // User selected a location, now get the file content
      let blob: Blob;
      
      // Check if URL is same origin to determine fetch strategy
      const isSameOrigin = isSameOriginUrl(url);
      
      if (isSameOrigin) {
        // Same-origin: Use fetch to get blob
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
          throw new Error(`Failed to fetch same-origin file: ${error}`);
        }
      } else {
        // Cross-origin: Show user message and open in new tab
        // Unfortunately, we can't fetch cross-origin files due to CORS
        alert(`Due to browser security restrictions, cross-origin PDFs will open in a new tab. Please use your browser's save function (Ctrl+S or Cmd+S) to save the file as: ${fileName}`);
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Write the blob to the selected file location
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      console.log(`File saved successfully as: ${fileName}`);
      return; // Success with native save dialog
      
    } catch (error: any) {
      // User cancelled the dialog
      if (error.name === 'AbortError') {
        console.log('User cancelled the save dialog');
        return; // User cancelled, don't show error
      }
      
      console.warn('File System Access API failed:', error);
      // Fall through to legacy methods
    }
  }

  // Fallback for browsers without File System Access API support
  console.log('File System Access API not supported, using fallback method');
  
  // Check if URL is same origin for fallback strategy
  const isSameOrigin = isSameOriginUrl(url);
  
  if (isSameOrigin) {
    // Same-origin fallback: fetch and use blob download
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

      const blob = await response.blob();
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
      
      return;
    } catch (error) {
      console.warn('Same-origin fallback failed:', error);
    }
  }

  // Final fallback: Open in new tab for cross-origin or when all else fails
  if (fallbackToOpen) {
    console.log('Using final fallback: opening in new tab');
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    throw new Error('Download failed: Unable to download file');
  }
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
 * Download method without download attribute to potentially trigger browser's save dialog
 */
function downloadWithoutDownloadAttribute(url: string, fileName: string): void {
  // Try opening the URL directly without download attribute
  // This may trigger the browser's native save dialog in some cases
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  
  // Add a title to help users understand what's happening
  link.title = `Download ${fileName}`;
  
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

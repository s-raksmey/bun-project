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
 * Downloads a PDF file to the user's device
 * @param url - The URL of the PDF file
 * @param options - Download options
 */
export async function downloadPDF(url: string, options: DownloadOptions = {}): Promise<void> {
  const { fileName = 'document.pdf', fallbackToOpen = true } = options;

  // Check if URL is same origin or if we should try blob approach
  const isSameOrigin = isSameOriginUrl(url);
  
  if (isSameOrigin) {
    try {
      // For same-origin URLs, try blob approach first
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
      
      // Create a blob URL and trigger download with proper browser dialog
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      // Ensure the download attribute is properly set to trigger save dialog
      link.setAttribute('download', fileName);
      
      // Add to DOM, trigger click, and cleanup
      document.body.appendChild(link);
      
      // Use a small delay to ensure the link is properly attached
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after download is triggered
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }, 10);
      
      return; // Success, exit early
    } catch (error) {
      console.warn('Blob download failed, trying direct download:', error);
    }
  }

  // Fallback: Direct download approach (works for most cases)
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Force download behavior to trigger browser save dialog
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    
    // Use a small delay to ensure proper download dialog
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
    }, 10);
    
  } catch (error) {
    console.error('Direct download failed:', error);
    
    if (fallbackToOpen) {
      // Last resort: open in new tab (but this should not happen for download)
      console.warn('All download methods failed, this should not happen for download');
      throw new Error('Download failed: Unable to download file');
    } else {
      throw error;
    }
  }
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

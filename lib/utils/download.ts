/**
 * Enhanced PDF Download Utilities
 * Handles proper file downloads with native save dialog and fallbacks
 */

export interface DownloadOptions {
  fileName?: string;
}

export interface DownloadResult {
  success: boolean;
  method: 'file-system-api' | 'download-link' | 'new-tab';
  error?: string;
}

export enum DownloadError {
  USER_CANCELLED = 'User cancelled the download',
  NETWORK_ERROR = 'Network error occurred while downloading',
  PERMISSION_DENIED = 'Permission denied to save file',
  UNSUPPORTED_BROWSER = 'Browser does not support file downloads',
  INVALID_URL = 'Invalid or inaccessible URL',
  UNKNOWN_ERROR = 'An unknown error occurred'
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
 * @returns Promise<DownloadResult> - Result of the download operation
 */
export async function downloadPDF(url: string, options: DownloadOptions = {}): Promise<DownloadResult> {
  if (!url || typeof url !== 'string') {
    return {
      success: false,
      method: 'new-tab',
      error: DownloadError.INVALID_URL
    };
  }

  let fileName = options.fileName || getFileNameFromUrl(url);

  // 1. Try File System Access API (native save dialog)
  if (supportsFileSystemAccess()) {
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

      const response = await fetch(url, { 
        method: 'GET', 
        headers: { 'Accept': 'application/pdf' } 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      fileName = getFileNameFromUrl(url, response) || fileName;
      const blob = await response.blob();
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      return {
        success: true,
        method: 'file-system-api'
      };
    } catch (error: any) {
      // Handle specific errors
      if (error.name === 'AbortError') {
        return {
          success: false,
          method: 'file-system-api',
          error: DownloadError.USER_CANCELLED
        };
      }
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          method: 'file-system-api',
          error: DownloadError.PERMISSION_DENIED
        };
      }
      // Fall through to fallback method
    }
  }

  // 2. Fallback: Use <a download> (traditional browser download)
  try {
    const response = await fetch(url, { 
      method: 'GET', 
      headers: { 'Accept': 'application/pdf' } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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
    
    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    return {
      success: true,
      method: 'download-link'
    };
  } catch (error: any) {
    // 3. Final fallback: Open in new tab
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        method: 'new-tab'
      };
    } catch {
      return {
        success: false,
        method: 'new-tab',
        error: DownloadError.UNKNOWN_ERROR
      };
    }
  }
}

/**
 * Checks if the File System Access API is supported
 * @returns boolean - True if the API is supported
 */
export function supportsFileSystemAccess(): boolean {
  return 'showSaveFilePicker' in window && 
         typeof window.showSaveFilePicker === 'function';
}

/**
 * Gets user-friendly error message for download failures
 * @param error - The error that occurred
 * @param method - The download method that was attempted
 * @returns string - User-friendly error message
 */
export function getDownloadErrorMessage(error: string, method: string): string {
  switch (error) {
    case DownloadError.USER_CANCELLED:
      return 'Download was cancelled. You can try again anytime.';
    case DownloadError.NETWORK_ERROR:
      return 'Network error occurred. Please check your connection and try again.';
    case DownloadError.PERMISSION_DENIED:
      return 'Permission denied. Please allow file downloads and try again.';
    case DownloadError.UNSUPPORTED_BROWSER:
      return 'Your browser doesn\'t support file downloads. Please try a different browser.';
    case DownloadError.INVALID_URL:
      return 'The file URL is invalid or inaccessible. Please contact support.';
    default:
      return method === 'new-tab' 
        ? 'Download failed. The file has been opened in a new tab instead.'
        : 'Download failed. Please try again or contact support.';
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

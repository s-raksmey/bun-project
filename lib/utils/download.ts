/**
 * Enhanced PDF Download Utilities
 * Handles proper file downloads with CORS support and fallbacks
 */

export interface DownloadOptions {
  fileName?: string;
  fallbackToOpen?: boolean;
}

/**
 * Downloads a PDF file to the user's device
 * @param url - The URL of the PDF file
 * @param options - Download options
 */
export async function downloadPDF(url: string, options: DownloadOptions = {}): Promise<void> {
  const { fileName = 'document.pdf', fallbackToOpen = true } = options;

  try {
    // First, try to fetch the file as a blob
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response is actually a PDF
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      throw new Error('Response is not a PDF file');
    }

    const blob = await response.blob();
    
    // Create a blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    // Add to DOM, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    console.error('Download failed:', error);
    
    if (fallbackToOpen) {
      // Fallback: Try using download attribute directly
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        // Last resort: open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      throw error;
    }
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

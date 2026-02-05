/**
 * Editor.js Upload Utilities for R2 Storage
 * Provides unified upload handlers for images, videos, and audio files
 */

interface EditorUploadResponse {
  success: 1 | 0;
  file?: {
    url: string;
    name?: string;
    size?: number;
    title?: string;
  };
  message?: string;
}

/**
 * Generic file uploader for Editor.js tools
 * Handles image, video, and audio uploads to R2
 */
export async function uploadByFile(file: File): Promise<EditorUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: 0,
        message: data.error || 'Upload failed',
      };
    }

    return {
      success: 1,
      file: {
        url: data.publicUrl,
        name: file.name,
        size: file.size,
        title: file.name,
      },
    };
  } catch (error) {
    console.error('[Editor Upload Error]', error);
    return {
      success: 0,
      message: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload by URL (fetch and re-upload to R2)
 * Useful for importing images from external sources
 */
export async function uploadByUrl(url: string): Promise<EditorUploadResponse> {
  try {
    // Fetch the image from URL
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: 0,
        message: 'Failed to fetch image from URL',
      };
    }

    const blob = await response.blob();
    const filename = url.split('/').pop() || 'uploaded-file';
    const file = new File([blob], filename, { type: blob.type });

    // Upload to R2
    return uploadByFile(file);
  } catch (error) {
    console.error('[Editor URL Upload Error]', error);
    return {
      success: 0,
      message: 'Failed to upload from URL',
    };
  }
}

/**
 * Image uploader configuration for @editorjs/image
 */
export const imageUploader = {
  uploadByFile,
  uploadByUrl,
};

/**
 * Attaches uploader configuration for @editorjs/attaches
 * Used for video and audio files
 */
export const attachesUploader = {
  uploadByFile: async (file: File) => {
    const result = await uploadByFile(file);
    
    if (result.success === 0) {
      throw new Error(result.message || 'Upload failed');
    }

    return {
      success: 1,
      file: {
        url: result.file?.url || '',
        size: result.file?.size || 0,
        name: result.file?.name || file.name,
        extension: file.name.split('.').pop() || '',
      },
    };
  },
};

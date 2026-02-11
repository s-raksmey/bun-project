/**
 * Editor.js Upload Utilities for R2 Storage
 * Provides unified upload handlers for images, videos, and audio files
*/

import { uploadFile } from '../storage/upload-utils';
import type { EditorUploadResponse } from '@/types/upload';
import { isPDFFile, PDFUploadResponse } from '@/types/pdf';


/**
 * Generic file uploader for Editor.js tools
 * Handles image, video, and audio uploads to R2
 */
export async function uploadByFile(file: File) {
  return uploadFile(file);
}

export const pdfUploader = async (file: File): Promise<PDFUploadResponse> => {
  if (!isPDFFile(file)) {
    throw new Error('Only PDF files are allowed.');
  }
  
  const result = await uploadFile(file);
  if (result.success !== 1 || !result.file) {
    throw new Error(result.message || 'Upload failed');
  }
  
  return {
    success: 1,
    file: {
      url: result.file.url,
      name: result.file.name || file.name,
      size: result.file.size || file.size,
      title: result.file.title || file.name,
    },
  };
};

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
    return uploadFile(file);
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
  uploadByFile: uploadFile,
  uploadByUrl,
};

/**
 * Comprehensive TypeScript definitions for PDF functionality
 * Consolidates all PDF-related types for better organization and consistency
 */

import { API, BlockToolConstructorOptions, PasteEvent } from '@editorjs/editorjs';

// Core PDF data interfaces
export interface PDFFileData {
  url: string;
  name: string;
  size: number;
  title?: string;
}

export interface PDFData {
  url: string;
  title?: string;
  file?: PDFFileData;
}

// Upload-related interfaces
export interface PDFUploadResponse {
  success: 1 | 0;
  file?: PDFFileData;
  message?: string;
}

export interface PDFUploadConfig {
  endpoint?: string;
  uploader?: (file: File) => Promise<PDFUploadResponse>;
  buttonText?: string;
  errorMessage?: string;
  types?: string;
  maxSize?: number;
}

// EditorJS tool interfaces
export interface PDFToolConfig extends PDFUploadConfig {
  // Additional tool-specific configuration
}

export interface PDFToolConstructorOptions extends BlockToolConstructorOptions<PDFData, PDFToolConfig> {
  data: PDFData;
  config?: PDFToolConfig;
  api: API;
  readOnly: boolean;
}

// Component prop interfaces
export interface PDFDisplayProps {
  data: PDFData;
  readOnly?: boolean;
  onEdit?: () => void;
  className?: string;
}

export interface PDFUploadProps {
  config: PDFUploadConfig;
  onUpload: (data: PDFData) => void;
  onError: (error: string) => void;
  className?: string;
}

export interface PDFViewerProps {
  url: string;
  fileName?: string;
  fileSize?: number;
  className?: string;
}

// Upload state interfaces
export interface PDFUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

// Validation and utility types
export type PDFMimeType = 
  | 'application/pdf'
  | 'application/x-pdf'
  | 'application/acrobat'
  | 'application/vnd.pdf'
  | 'text/pdf'
  | 'text/x-pdf';

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
}

// Constants
export const PDF_MIME_TYPES: readonly PDFMimeType[] = [
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'application/vnd.pdf',
  'text/pdf',
  'text/x-pdf',
] as const;

export const DEFAULT_PDF_CONFIG: PDFUploadConfig = {
  buttonText: 'Upload PDF',
  errorMessage: 'PDF upload failed',
  types: 'application/pdf',
  maxSize: 20 * 1024 * 1024, // 20MB
};

// Utility type guards
export const isPDFFile = (file: File): boolean => {
  return PDF_MIME_TYPES.includes(file.type as PDFMimeType);
};

export const isValidPDFData = (data: any): data is PDFData => {
  return data && typeof data === 'object' && typeof data.url === 'string' && data.url.length > 0;
};

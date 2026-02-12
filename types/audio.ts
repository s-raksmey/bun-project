/**
 * Comprehensive TypeScript definitions for Audio functionality
 * Consolidates all audio-related types for better organization and consistency
 */

import { API, BlockToolConstructorOptions, PasteEvent } from '@editorjs/editorjs';

// Core audio data interfaces
export interface AudioFileData {
  url: string;
  name: string;
  size: number;
  title?: string;
  artist?: string;
  duration?: number; // in seconds
  format?: string; // mp3, wav, ogg, etc.
}

export interface AudioData {
  url: string;
  title?: string;
  artist?: string;
  file?: AudioFileData;
}

// Upload-related interfaces
export interface AudioUploadResponse {
  success: 1 | 0;
  file?: AudioFileData;
  message?: string;
}

export interface AudioUploadConfig {
  endpoint?: string;
  uploader?: (file: File) => Promise<AudioUploadResponse>;
  buttonText?: string;
  errorMessage?: string;
  types?: string;
  maxSize?: number;
  allowedFormats?: AudioFormat[];
}

// EditorJS tool interfaces
export interface AudioToolConfig extends AudioUploadConfig {
  // Additional tool-specific configuration
  showControls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export interface AudioToolConstructorOptions extends BlockToolConstructorOptions<AudioData, AudioToolConfig> {
  data: AudioData;
  config?: AudioToolConfig;
  api: API;
  readOnly: boolean;
}

// Component prop interfaces
export interface AudioDisplayProps {
  data: AudioData;
  readOnly?: boolean;
  onEdit?: () => void;
  className?: string;
  config?: AudioToolConfig;
}

export interface AudioUploadProps {
  config: AudioUploadConfig;
  onUpload: (data: AudioData) => void;
  onError: (error: string) => void;
  className?: string;
}

export interface AudioPlayerProps {
  url: string;
  title?: string;
  artist?: string;
  fileName?: string;
  fileSize?: number;
  className?: string;
  config?: AudioToolConfig;
}

// Upload state interfaces
export interface AudioUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

// Validation and utility types
export type AudioMimeType = 
  | 'audio/mpeg'
  | 'audio/mp3'
  | 'audio/wav'
  | 'audio/wave'
  | 'audio/x-wav'
  | 'audio/ogg'
  | 'audio/vorbis'
  | 'audio/aac'
  | 'audio/mp4'
  | 'audio/m4a'
  | 'audio/webm'
  | 'audio/flac'
  | 'audio/x-flac';

export type AudioFormat = 
  | 'mp3'
  | 'wav'
  | 'ogg'
  | 'aac'
  | 'mp4'
  | 'm4a'
  | 'webm'
  | 'flac';

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
}

// Constants
export const AUDIO_MIME_TYPES: readonly AudioMimeType[] = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/vorbis',
  'audio/aac',
  'audio/mp4',
  'audio/m4a',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
] as const;

export const AUDIO_FORMATS: readonly AudioFormat[] = [
  'mp3',
  'wav',
  'ogg',
  'aac',
  'mp4',
  'm4a',
  'webm',
  'flac',
] as const;

export const DEFAULT_AUDIO_CONFIG: AudioUploadConfig = {
  buttonText: 'Upload Audio',
  errorMessage: 'Audio upload failed',
  types: 'audio/*',
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
};

export const DEFAULT_AUDIO_TOOL_CONFIG: AudioToolConfig = {
  ...DEFAULT_AUDIO_CONFIG,
  showControls: true,
  autoplay: false,
  loop: false,
  preload: 'metadata',
};

// Utility type guards
export const isAudioFile = (file: File): boolean => {
  return AUDIO_MIME_TYPES.includes(file.type as AudioMimeType);
};

export const isValidAudioData = (data: any): data is AudioData => {
  return data && typeof data === 'object' && typeof data.url === 'string' && data.url.length > 0;
};

export const getAudioFormatFromMimeType = (mimeType: string): AudioFormat | null => {
  const mimeToFormat: Record<string, AudioFormat> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/vorbis': 'ogg',
    'audio/aac': 'aac',
    'audio/mp4': 'mp4',
    'audio/m4a': 'm4a',
    'audio/webm': 'webm',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
  };
  
  return mimeToFormat[mimeType] || null;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

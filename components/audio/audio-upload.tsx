/**
 * Audio Upload Component
 * Handles audio file uploads with drag & drop and URL input
 */

'use client';

import React, { useState, useRef } from 'react';
import { AudioUploadProps, AudioUploadState } from '@/types/audio';
import { isAudioFile, getAudioFormatFromMimeType } from '@/types/audio';

export const AudioUpload: React.FC<AudioUploadProps> = ({
  config,
  onUpload,
  onError,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<AudioUploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!isAudioFile(file)) {
      onError('Please select a valid audio file');
      return;
    }

    if (config.maxSize && file.size > config.maxSize) {
      onError(`File size exceeds ${Math.round(config.maxSize / 1024 / 1024)}MB limit`);
      return;
    }

    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      let result;

      if (config.uploader) {
        result = await config.uploader(file);
      } else if (config.endpoint) {
        result = await uploadToEndpoint(file);
      } else {
        throw new Error('No upload method configured');
      }

      if (result.success === 1 && result.file) {
        // Get audio metadata
        const audioMetadata = await getAudioMetadata(file);
        
        const audioData = {
          url: result.file.url,
          title: result.file.title || file.name,
          artist: result.file.artist,
          file: {
            url: result.file.url,
            name: result.file.name || file.name,
            size: result.file.size || file.size,
            title: result.file.title || file.name,
            artist: result.file.artist,
            duration: audioMetadata.duration,
            format: getAudioFormatFromMimeType(file.type) || undefined,
          },
        };

        onUpload(audioData);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onError(errorMessage);
      setUploadState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0
      }));
    }
  };

  const uploadToEndpoint = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(config.endpoint!, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json();
  };

  const getAudioMetadata = async (file: File): Promise<{ duration?: number }> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(objectUrl);
        resolve({ duration: isFinite(duration) ? duration : undefined });
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        resolve({});
      });
      
      audio.src = objectUrl;
    });
  };

  const handleUrlUpload = async (url: string) => {
    if (!isValidUrl(url)) {
      onError('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    if (!isAudioUrl(url)) {
      onError('URL does not appear to be an audio file');
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      // Basic validation - try to access the URL
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('URL not accessible');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('audio/')) {
        throw new Error('URL does not point to an audio file');
      }

      const audioData = {
        url,
        title: extractTitleFromUrl(url)
      };

      onUpload(audioData);
      setUrlValue('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid audio URL';
      onError(`Invalid audio URL: ${errorMessage}`);
    } finally {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0
      }));
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isAudioUrl = (url: string): boolean => {
    const audioExtensions = /\.(mp3|wav|ogg|aac|m4a|webm|flac)(\?.*)?$/i;
    return audioExtensions.test(url);
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop() || '';
      return filename.replace(/\.[^/.]+$/, ''); // Remove extension
    } catch {
      return 'Audio File';
    }
  };

  // Event handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlValue.trim()) {
      handleUrlUpload(urlValue.trim());
    }
  };

  return (
    <div className={`audio-upload-container ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.types || 'audio/*'}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={uploadState.isUploading}
      />

      {/* Upload Area */}
      <div
        className={`audio-upload-area ${isDragOver ? 'audio-upload-area--dragover' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="audio-upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </div>
        <p className="audio-upload-text">
          {uploadState.isUploading 
            ? 'Uploading audio...' 
            : config.buttonText || 'Click to upload audio or drag and drop'
          }
        </p>
        <p className="audio-upload-hint">
          Supported formats: MP3, WAV, OGG, AAC, M4A, FLAC
          {config.maxSize && ` • Max size: ${Math.round(config.maxSize / 1024 / 1024)}MB`}
        </p>
      </div>

      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="audio-url-form">
        <input
          type="url"
          placeholder="Or paste audio URL here..."
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          className="audio-url-input"
          disabled={uploadState.isUploading}
        />
        {urlValue.trim() && (
          <button
            type="submit"
            className="audio-url-submit"
            disabled={uploadState.isUploading}
          >
            Add
          </button>
        )}
      </form>

      {/* Progress Bar */}
      {uploadState.isUploading && (
        <div className="audio-progress">
          <div className="audio-progress-bar">
            <div 
              className="audio-progress-fill"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
          <span className="audio-progress-text">
            {uploadState.progress > 0 ? `${uploadState.progress}%` : 'Processing...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <div className="audio-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {uploadState.error}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Audio Upload Component
 * Clean, minimal upload interface
 */

'use client';

import React, { useState, useRef } from 'react';
import { AudioUploadProps } from '@/types/audio';
import { isAudioFile } from '@/types/audio';

export const AudioUpload: React.FC<AudioUploadProps> = ({
  config,
  onUpload,
  onError,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
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
    setIsUploading(true);

    try {
      if (!config.uploader) {
        throw new Error('No upload method configured');
      }

      const result = await config.uploader(file);

      if (result.success === 1 && result.file) {
        const audioData = {
          url: result.file.url,
          title: result.file.title || file.name,
          file: {
            url: result.file.url,
            name: result.file.name || file.name,
            size: result.file.size || file.size,
            title: result.file.title || file.name,
          },
        };

        onUpload(audioData);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`simple-audio-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={config.types || 'audio/*'}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      <div className="upload-area">
        <button
          type="button"
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '⏳ Uploading...' : '🎵 Choose Audio File'}
        </button>
        <p className="upload-hint">
          MP3, WAV, OGG, AAC, M4A, FLAC
        </p>
      </div>
    </div>
  );
};


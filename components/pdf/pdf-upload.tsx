"use client";

import React, { useState, useRef, useCallback } from 'react';
import { PDFUploadProps, PDFUploadState, isPDFFile } from '@/types/pdf';

/**
 * Modern PDF Upload Component
 * Features drag-and-drop, URL input, progress tracking, and error handling
 */
export const PDFUpload: React.FC<PDFUploadProps> = ({
  config,
  onUpload,
  onError,
  className = '',
}) => {
  const [uploadState, setUploadState] = useState<PDFUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  const handleError = useCallback((error: string) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      error,
    }));
    onError(error);
  }, [onError]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!isPDFFile(file)) {
      handleError(config.errorMessage || 'Please select a PDF file');
      return;
    }

    if (config.maxSize && file.size > config.maxSize) {
      handleError(`File size exceeds ${(config.maxSize / 1024 / 1024).toFixed(0)}MB limit`);
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      if (!config.uploader) {
        throw new Error('No upload method configured');
      }

      const result = await config.uploader(file);

      if (result.success === 1 && result.file) {
        onUpload({
          url: result.file.url,
          file: {
            url: result.file.url,
            name: result.file.name || file.name,
            size: result.file.size || file.size,
            title: result.file.title || file.name,
          },
        });
        resetState();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [config, onUpload, handleError, resetState]);

  const handleUrlUpload = useCallback(async (url: string) => {
    if (!url.trim()) return;

    const urlPattern = /^https?:\/\/.+\.pdf(\?.*)?$/i;
    if (!urlPattern.test(url)) {
      handleError('Please enter a valid PDF URL');
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 50,
      error: null,
    });

    try {
      // Validate URL accessibility
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('URL not accessible');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('URL does not point to a PDF file');
      }

      onUpload({ url });
      resetState();
      setUrlInput('');
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Invalid PDF URL');
    }
  }, [onUpload, handleError, resetState]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleUrlUpload(urlInput);
  }, [urlInput, handleUrlUpload]);

  return (
    <div className={`pdf-upload-container ${className}`}>
      {/* File Upload Area */}
      <div
        className={`pdf-upload-zone ${isDragOver ? 'drag-over' : ''} ${uploadState.isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="pdf-file-input"
          style={{ display: 'none' }}
        />

        <div className="pdf-upload-content">
          {uploadState.isUploading ? (
            <div className="pdf-upload-progress">
              <div className="pdf-progress-spinner">
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="pdf-progress-text">Uploading PDF...</p>
            </div>
          ) : (
            <>
              <div className="pdf-upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <h3 className="pdf-upload-title">
                {config.buttonText || 'Upload PDF'}
              </h3>
              <p className="pdf-upload-description">
                Drag and drop your PDF file here, or click to browse
              </p>
              <p className="pdf-upload-hint">
                Only PDF files up to {config.maxSize ? `${(config.maxSize / 1024 / 1024).toFixed(0)}MB` : '20MB'} are allowed
              </p>
            </>
          )}
        </div>
      </div>

      {/* URL Input */}
      <div className="pdf-url-section">
        <div className="pdf-divider">
          <span className="pdf-divider-text">or</span>
        </div>
        
        <form onSubmit={handleUrlSubmit} className="pdf-url-form">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste PDF URL here..."
            className="pdf-url-input"
            disabled={uploadState.isUploading}
          />
          <button
            type="submit"
            disabled={!urlInput.trim() || uploadState.isUploading}
            className="pdf-url-submit"
          >
            Load
          </button>
        </form>
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="pdf-error-message">
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

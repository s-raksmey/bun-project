"use client";

import React, { useState } from 'react';
import { PDFDisplayProps } from '@/types/pdf';
import { downloadPDF } from '@/lib/utils/download';

/**
 * PDF Display Component
 * Handles the rendering of uploaded PDFs with download functionality
 */
export const PDFDisplay: React.FC<PDFDisplayProps> = ({
  data,
  readOnly = false,
  onEdit,
  className = '',
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const fileName = data.file?.name || data.title || 'document.pdf';
      await downloadPDF(data.url, { fileName });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`pdf-card-container ${className}`}>
      {/* Simple PDF Card */}
      <div className="pdf-card">
        {/* PDF Icon and Preview */}
        <div className="pdf-card-preview">
          <div className="pdf-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
          </div>
          <span className="pdf-card-label">PDF</span>
        </div>

        {/* PDF Info */}
        <div className="pdf-card-info">
          <div className="pdf-card-details">
            <h4 className="pdf-card-filename">
              {data.file?.name || data.title || 'PDF Document'}
            </h4>
            {data.file?.size && (
              <span className="pdf-card-filesize">
                ({formatFileSize(data.file.size)})
              </span>
            )}
          </div>
        </div>

        {/* PDF Actions */}
        <div className="pdf-card-actions">
          <button
            type="button"
            onClick={handleDownload}
            className="pdf-card-download-btn"
            title="Download PDF"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </>
            )}
          </button>

          {!readOnly && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="pdf-card-replace-btn"
              title="Replace PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Replace
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

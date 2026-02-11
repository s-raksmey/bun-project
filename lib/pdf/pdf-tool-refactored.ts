/**
 * Refactored PDF Tool for EditorJS
 * Clean, modular implementation with separated concerns
 */

import { BlockTool, PasteEvent } from '@editorjs/editorjs';
import { 
  PDFData, 
  PDFToolConstructorOptions, 
  PDFUploadConfig,
  isValidPDFData,
  DEFAULT_PDF_CONFIG 
} from '@/types/pdf';

export default class PDFTool implements BlockTool {
  private api: any;
  private readOnly: boolean;
  private data: PDFData;
  private config: PDFUploadConfig;
  private wrapper: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: 'PDF',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10,9 9,9 8,9"></polyline>
      </svg>`
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get pasteConfig() {
    return {
      patterns: {
        url: /https?:\/\/[^\s]+\.pdf(\?[^\s]*)?/i,
      },
      files: {
        mimeTypes: ['application/pdf'],
      },
      tags: ['a'],
    };
  }

  constructor({ data, config, api, readOnly }: PDFToolConstructorOptions) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = data || { url: '' };
    this.config = { ...DEFAULT_PDF_CONFIG, ...config };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('pdf-tool-wrapper');

    if (this.data && this.data.url) {
      this.renderPDFDisplay();
    } else {
      this.renderUploadInterface();
    }

    return this.wrapper;
  }

  private renderPDFDisplay(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';
    
    // Create PDF display container
    const displayContainer = document.createElement('div');
    displayContainer.className = 'pdf-display-container';

    // PDF viewer
    const viewerWrapper = document.createElement('div');
    viewerWrapper.className = 'pdf-viewer-wrapper';

    const pdfEmbed = document.createElement('object');
    pdfEmbed.data = this.data.url;
    pdfEmbed.type = 'application/pdf';
    pdfEmbed.className = 'pdf-embed';
    pdfEmbed.style.width = '100%';
    pdfEmbed.style.height = '600px';

    // Fallback content
    const fallback = document.createElement('div');
    fallback.className = 'pdf-fallback';
    fallback.innerHTML = `
      <div class="pdf-fallback-content">
        <div class="pdf-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3 class="pdf-fallback-title">PDF Document</h3>
        <p class="pdf-fallback-description">
          Your browser doesn't support embedded PDFs. You can download the file instead.
        </p>
      </div>
    `;

    pdfEmbed.appendChild(fallback);
    viewerWrapper.appendChild(pdfEmbed);

    // Info bar with actions
    const infoBar = document.createElement('div');
    infoBar.className = 'pdf-info-bar';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'pdf-file-info';
    
    const fileName = this.data.file?.name || this.data.title || 'PDF Document';
    const fileSize = this.data.file?.size ? ` (${(this.data.file.size / 1024 / 1024).toFixed(2)} MB)` : '';
    
    fileInfo.innerHTML = `
      <div class="pdf-file-details">
        <span class="pdf-file-name">${fileName}</span>
        ${fileSize ? `<span class="pdf-file-size">${fileSize}</span>` : ''}
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'pdf-actions';

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'pdf-download-btn';
    downloadBtn.title = 'Download PDF';
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download
    `;
    downloadBtn.addEventListener('click', this.handleDownload.bind(this));

    actions.appendChild(downloadBtn);

    // Replace button (if not read-only)
    if (!this.readOnly) {
      const replaceBtn = document.createElement('button');
      replaceBtn.type = 'button';
      replaceBtn.className = 'pdf-edit-btn';
      replaceBtn.title = 'Replace PDF';
      replaceBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Replace
      `;
      replaceBtn.addEventListener('click', () => this.renderUploadInterface());
      actions.appendChild(replaceBtn);
    }

    infoBar.appendChild(fileInfo);
    infoBar.appendChild(actions);

    displayContainer.appendChild(viewerWrapper);
    displayContainer.appendChild(infoBar);
    this.wrapper.appendChild(displayContainer);
  }

  private renderUploadInterface(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';

    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'pdf-upload-container';

    // Upload zone
    const uploadZone = document.createElement('div');
    uploadZone.className = 'pdf-upload-zone';
    uploadZone.innerHTML = `
      <div class="pdf-upload-content">
        <div class="pdf-upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3 class="pdf-upload-title">${this.config.buttonText || 'Upload PDF'}</h3>
        <p class="pdf-upload-description">Drag and drop your PDF file here, or click to browse</p>
        <p class="pdf-upload-hint">Only PDF files up to ${this.config.maxSize ? `${(this.config.maxSize / 1024 / 1024).toFixed(0)}MB` : '20MB'} are allowed</p>
      </div>
    `;

    // File input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', this.handleFileSelect.bind(this));

    // URL input section
    const urlSection = document.createElement('div');
    urlSection.className = 'pdf-url-section';
    urlSection.innerHTML = `
      <div class="pdf-divider">
        <span class="pdf-divider-text">or</span>
      </div>
      <div class="pdf-url-form">
        <input type="url" placeholder="Paste PDF URL here..." class="pdf-url-input" />
        <button type="button" class="pdf-url-submit">Load</button>
      </div>
    `;

    // Error display
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'pdf-error-message';
    errorDisplay.style.display = 'none';

    // Event listeners
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadZone.addEventListener('drop', this.handleDrop.bind(this));

    const urlInput = urlSection.querySelector('.pdf-url-input') as HTMLInputElement;
    const urlSubmit = urlSection.querySelector('.pdf-url-submit') as HTMLButtonElement;
    
    urlSubmit.addEventListener('click', () => this.handleUrlUpload(urlInput.value));
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUrlUpload(urlInput.value);
      }
    });

    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(uploadZone);
    uploadContainer.appendChild(urlSection);
    uploadContainer.appendChild(errorDisplay);
    this.wrapper.appendChild(uploadContainer);
  }

  private handleDownload(): void {
    const link = document.createElement('a');
    link.href = this.data.url;
    link.download = this.data.file?.name || 'document.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.handleFileUpload(target.files[0]);
    }
  }

  private async handleFileUpload(file: File): Promise<void> {
    if (file.type !== 'application/pdf') {
      this.showError(this.config.errorMessage || 'Please select a PDF file');
      return;
    }

    if (this.config.maxSize && file.size > this.config.maxSize) {
      this.showError(`File size exceeds ${(this.config.maxSize / 1024 / 1024).toFixed(0)}MB limit`);
      return;
    }

    this.showProgress('Uploading PDF...');

    try {
      if (!this.config.uploader) {
        throw new Error('No upload method configured');
      }

      const result = await this.config.uploader(file);

      if (result.success === 1 && result.file) {
        this.data = {
          url: result.file.url,
          file: {
            url: result.file.url,
            name: result.file.name || file.name,
            size: result.file.size || file.size,
            title: result.file.title || file.name,
          },
        };
        this.renderPDFDisplay();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  private async handleUrlUpload(url: string): Promise<void> {
    if (!url.trim()) return;

    const urlPattern = /^https?:\/\/.+\.pdf(\?.*)?$/i;
    if (!urlPattern.test(url)) {
      this.showError('Please enter a valid PDF URL');
      return;
    }

    this.showProgress('Loading PDF...');

    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('URL not accessible');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('URL does not point to a PDF file');
      }

      this.data = { url };
      this.renderPDFDisplay();
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Invalid PDF URL');
    }
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    const uploadZone = this.wrapper?.querySelector('.pdf-upload-zone');
    uploadZone?.classList.add('drag-over');
  }

  private handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    const uploadZone = this.wrapper?.querySelector('.pdf-upload-zone');
    uploadZone?.classList.remove('drag-over');
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    const uploadZone = this.wrapper?.querySelector('.pdf-upload-zone');
    uploadZone?.classList.remove('drag-over');

    if (event.dataTransfer && event.dataTransfer.files[0]) {
      this.handleFileUpload(event.dataTransfer.files[0]);
    }
  }

  private showProgress(message: string): void {
    const uploadZone = this.wrapper?.querySelector('.pdf-upload-zone');
    if (uploadZone) {
      uploadZone.classList.add('uploading');
      uploadZone.innerHTML = `
        <div class="pdf-upload-progress">
          <div class="pdf-progress-spinner">
            <svg class="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
              <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="pdf-progress-text">${message}</p>
        </div>
      `;
    }
  }

  private showError(message: string): void {
    const errorDisplay = this.wrapper?.querySelector('.pdf-error-message');
    if (errorDisplay) {
      errorDisplay.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        ${message}
      `;
      errorDisplay.style.display = 'block';
    }
  }

  save(): PDFData {
    return this.data;
  }

  validate(savedData: PDFData): boolean {
    return isValidPDFData(savedData);
  }

  onPaste(event: PasteEvent): void {
    const detail = event.detail;

    if ('key' in detail && detail.key === 'url' && 'data' in detail && detail.data) {
      this.handleUrlUpload(detail.data as string);
    } 
    else if ('key' in detail && detail.key === 'file' && 'file' in detail && detail.file) {
      const file = detail.file;
      if (file && typeof file === 'object' && 'type' in file && (file as File).type === 'application/pdf') {
        this.handleFileUpload(file as File);
      }
    }
  }
}

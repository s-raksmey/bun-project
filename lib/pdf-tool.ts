// lib/editorjs-pdf-tool.ts
import { API, BlockTool, BlockToolConstructorOptions, PasteEvent } from '@editorjs/editorjs';

// Types
export interface PDFFileData {
  url: string;
  name: string;
  size: number;
}

export interface PDFData {
  url: string;
  title?: string;
  file?: PDFFileData;
}

export interface PDFConfig {
  endpoint?: string;
  uploader?: (file: File) => Promise<UploadResponse>;
  buttonText?: string;
  errorMessage?: string;
  types?: string;
}

export interface UploadResponse {
  success: number;
  file: {
    url: string;
    name?: string;
    size?: number;
  };
}

export interface PDFToolConstructorOptions extends BlockToolConstructorOptions<PDFData, PDFConfig> {
  data: PDFData;
  config?: PDFConfig;
  api: API;
  readOnly: boolean;
}

export default class PDFTool implements BlockTool {
  private api: API;
  private readOnly: boolean;
  private data: PDFData;
  private config: PDFConfig;
  private wrapper: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: 'PDF',
      icon: '<svg width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="2" fill="#fff" stroke="#000"/><text x="4" y="14" font-size="10" fill="#000">PDF</text></svg>'
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
    this.config = config || {};
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('pdf-block');

    if (this.data && this.data.url) {
      this.renderPDF();
    } else {
      this.renderUploadForm();
    }

    return this.wrapper;
  }

  private renderPDF(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('pdf-container');

    const pdfEmbed = document.createElement('object');
    pdfEmbed.type = 'application/pdf';
    pdfEmbed.data = this.data.url;
    pdfEmbed.width = '100%';
    pdfEmbed.height = '600px';
    pdfEmbed.classList.add('pdf-embed');

    const fallback = document.createElement('div');
    fallback.classList.add('pdf-fallback');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = this.data.url;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    downloadLink.classList.add('pdf-download-link');
    downloadLink.textContent = this.data.file?.name || 'Download PDF';
    
    if (this.data.file?.size) {
      const sizeSpan = document.createElement('span');
      sizeSpan.classList.add('pdf-size');
      sizeSpan.textContent = ` (${(this.data.file.size / 1024 / 1024).toFixed(2)} MB)`;
      downloadLink.appendChild(sizeSpan);
    }

    fallback.appendChild(downloadLink);
    pdfEmbed.appendChild(fallback);
    container.appendChild(pdfEmbed);

    if (!this.readOnly) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.classList.add('pdf-edit-button');
      editButton.textContent = 'Replace PDF';
      editButton.addEventListener('click', () => {
        this.renderUploadForm();
      });
      container.appendChild(editButton);
    }

    this.wrapper.appendChild(container);
  }

  private renderUploadForm(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';

    const form = document.createElement('div');
    form.classList.add('pdf-upload-form');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.classList.add('pdf-file-input');
    fileInput.style.display = 'none';

    const uploadArea = document.createElement('div');
    uploadArea.classList.add('pdf-upload-area');
    uploadArea.innerHTML = `
      <div class="pdf-upload-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <p class="pdf-upload-text">${this.config.buttonText || 'Click to upload PDF or drag and drop'}</p>
      <p class="pdf-upload-hint">Only PDF files are allowed</p>
    `;

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'Or paste PDF URL here...';
    urlInput.classList.add('pdf-url-input');

    const progress = document.createElement('div');
    progress.classList.add('pdf-progress');
    progress.style.display = 'none';

    const error = document.createElement('div');
    error.classList.add('pdf-error');
    error.style.display = 'none';

    form.appendChild(fileInput);
    form.appendChild(uploadArea);
    form.appendChild(urlInput);
    form.appendChild(progress);
    form.appendChild(error);

    // Event Listeners
    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.handleFileUpload(target.files[0]);
      }
    });

    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      uploadArea.classList.add('pdf-upload-area--dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('pdf-upload-area--dragover');
    });

    uploadArea.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      uploadArea.classList.remove('pdf-upload-area--dragover');
      
      if (e.dataTransfer && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          this.handleFileUpload(file);
        } else {
          this.showError(this.config.errorMessage || 'Please upload a PDF file');
        }
      }
    });

    urlInput.addEventListener('paste', () => {
      setTimeout(() => {
        const url = urlInput.value.trim();
        if (url) {
          this.handleUrlUpload(url);
        }
      }, 100);
    });

    urlInput.addEventListener('blur', () => {
      const url = urlInput.value.trim();
      if (url) {
        this.handleUrlUpload(url);
      }
    });

    this.wrapper.appendChild(form);
  }

  private async handleFileUpload(file: File): Promise<void> {
    if (!this.wrapper) return;

    const progress = this.wrapper.querySelector('.pdf-progress') as HTMLElement;
    const error = this.wrapper.querySelector('.pdf-error') as HTMLElement;
    
    error.style.display = 'none';
    progress.style.display = 'block';
    progress.textContent = 'Uploading...';

    try {
      let result: UploadResponse;

      if (this.config.uploader) {
        result = await this.config.uploader(file);
      } else if (this.config.endpoint) {
        result = await this.uploadToEndpoint(file);
      } else {
        throw new Error('No upload method configured');
      }

      if (result.success === 1) {
        this.data = {
          url: result.file.url,
          file: {
            url: result.file.url,
            name: result.file.name || file.name,
            size: result.file.size || file.size
          }
        };
        this.renderPDF();
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      this.showError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      progress.style.display = 'none';
    }
  }

  private async handleUrlUpload(url: string): Promise<void> {
    if (!this.wrapper) return;

    const error = this.wrapper.querySelector('.pdf-error') as HTMLElement;
    error.style.display = 'none';

    if (!this.isValidUrl(url)) {
      this.showError('Please enter a valid HTTP/HTTPS URL');
      return;
    }

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
      this.renderPDF();
    } catch (err) {
      this.showError(`Invalid PDF URL: ${err instanceof Error ? err.message : 'Unable to access'}`);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async uploadToEndpoint(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(this.config.endpoint!, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  private showError(message: string): void {
    if (!this.wrapper) return;

    const error = this.wrapper.querySelector('.pdf-error') as HTMLElement;
    error.textContent = message;
    error.style.display = 'block';
  }

  save(): PDFData {
    return this.data;
  }

  validate(savedData: PDFData): boolean {
    return !!(savedData && savedData.url);
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
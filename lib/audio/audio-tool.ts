/**
 * Audio Tool for EditorJS
 * Clean, modular implementation with separated concerns
 */

import { BlockTool, PasteEvent } from '@editorjs/editorjs';
import { 
  AudioData, 
  AudioToolConstructorOptions, 
  AudioToolConfig,
  isValidAudioData,
  DEFAULT_AUDIO_TOOL_CONFIG,
  isAudioFile,
  getAudioFormatFromMimeType,
  formatDuration} from '@/types/audio';

export default class AudioTool implements BlockTool {
  private api: unknown;
  private readOnly: boolean;
  private data: AudioData;
  private config: AudioToolConfig;
  private wrapper: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: 'Audio',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>`
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get pasteConfig() {
    return {
      patterns: {
        url: /https?:\/\/[^\s]+\.(mp3|wav|ogg|aac|m4a|webm|flac)(\?[^\s]*)?/i,
      },
      files: {
        mimeTypes: [
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
          'audio/x-flac'
        ],
      },
      tags: ['a'],
    };
  }

  constructor({ data, config, api, readOnly }: AudioToolConstructorOptions) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = data || { url: '' };
    this.config = { ...DEFAULT_AUDIO_TOOL_CONFIG, ...config };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('audio-block');

    if (this.data && this.data.url) {
      this.renderAudioDisplay();
    } else {
      this.renderUploadForm();
    }

    return this.wrapper;
  }

  private renderAudioDisplay(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('clean-audio-container');

    // Audio player (matches the clean design from image_1)
    const audioPlayer = document.createElement('audio');
    audioPlayer.src = this.data.url;
    audioPlayer.controls = this.config.showControls !== false;
    audioPlayer.preload = this.config.preload || 'metadata';
    audioPlayer.loop = this.config.loop || false;
    audioPlayer.autoplay = this.config.autoplay || false;
    audioPlayer.classList.add('clean-audio-player');

    // Audio filename (below the player)
    const filenameElement = document.createElement('div');
    filenameElement.classList.add('clean-audio-filename');
    filenameElement.textContent = this.data.title || this.data.file?.title || this.data.file?.name || 'Audio File';

    // Audio metadata (duration and format)
    const metaElement = document.createElement('div');
    metaElement.classList.add('clean-audio-meta');
    
    const metaParts: string[] = [];
    if (this.data.file?.duration) {
      metaParts.push(formatDuration(this.data.file.duration));
    }
    if (this.data.file?.format) {
      metaParts.push(this.data.file.format.toUpperCase());
    }
    
    metaElement.textContent = metaParts.join(' • ');

    // Replace button (simple text button)
    let replaceBtn: HTMLElement | null = null;
    if (!this.readOnly) {
      replaceBtn = document.createElement('button');
      replaceBtn.classList.add('clean-audio-replace');
      replaceBtn.textContent = 'Replace';
      replaceBtn.addEventListener('click', () => {
        this.renderUploadForm();
      });
    }

    // Assemble the clean layout
    container.appendChild(audioPlayer);
    container.appendChild(filenameElement);
    if (metaParts.length > 0) {
      container.appendChild(metaElement);
    }
    if (replaceBtn) {
      container.appendChild(replaceBtn);
    }

    this.wrapper.appendChild(container);
  }

  private renderUploadForm(): void {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = '';

    const form = document.createElement('div');
    form.classList.add('clean-audio-upload-form');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = this.config.types || 'audio/*';
    fileInput.classList.add('clean-audio-file-input');
    fileInput.style.display = 'none';

    const uploadArea = document.createElement('div');
    uploadArea.classList.add('clean-audio-upload-area');
    uploadArea.innerHTML = `
      <div class="clean-audio-upload-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </div>
      <p class="clean-audio-upload-text">Upload Audio</p>
      <p class="clean-audio-upload-hint">MP3, WAV, OGG, AAC, M4A, FLAC</p>
    `;

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'Or paste audio URL';
    urlInput.classList.add('clean-audio-url-input');

    const progress = document.createElement('div');
    progress.classList.add('clean-audio-progress');
    progress.style.display = 'none';

    const error = document.createElement('div');
    error.classList.add('clean-audio-error');
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
      uploadArea.classList.add('audio-upload-area--dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('audio-upload-area--dragover');
    });

    uploadArea.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      uploadArea.classList.remove('audio-upload-area--dragover');
      
      if (e.dataTransfer && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (isAudioFile(file)) {
          this.handleFileUpload(file);
        } else {
          this.showError(this.config.errorMessage || 'Please upload an audio file');
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

    const progress = this.wrapper.querySelector('.clean-audio-progress') as HTMLElement;
    const error = this.wrapper.querySelector('.clean-audio-error') as HTMLElement;
    
    error.style.display = 'none';
    progress.style.display = 'block';
    progress.textContent = 'Uploading audio...';

    // Validate file type
    if (!isAudioFile(file)) {
      this.showError('Please select a valid audio file');
      progress.style.display = 'none';
      return;
    }

    // Validate file size
    if (this.config.maxSize && file.size > this.config.maxSize) {
      this.showError(`File size exceeds ${Math.round(this.config.maxSize / 1024 / 1024)}MB limit`);
      progress.style.display = 'none';
      return;
    }

    try {
      // Define the expected upload result type
      type UploadResult = {
        success: 1;
        file: {
          url: string;
          name?: string;
          size?: number;
          title?: string;
          artist?: string;
        };
        message?: string;
      };

      let result: unknown;

      if (this.config.uploader) {
        result = await this.config.uploader(file);
      } else if (this.config.endpoint) {
        result = await this.uploadToEndpoint(file);
      } else {
        throw new Error('No upload method configured');
      }

      // Type guard for expected result structure
      function isUploadResult(obj: unknown): obj is UploadResult {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'success' in obj &&
          (obj as { success: number }).success === 1 &&
          'file' in obj &&
          typeof (obj as { file: unknown }).file === 'object' &&
          (obj as { file: unknown }).file !== null
        );
      }

      if (isUploadResult(result)) {
        const fileResult = result.file;
        // Get audio metadata
        const audioMetadata = await this.getAudioMetadata(file);
        
        this.data = {
          url: fileResult.url,
          title: fileResult.title || file.name,
          artist: fileResult.artist,
          file: {
            url: fileResult.url,
            name: fileResult.name || file.name,
            size: fileResult.size || file.size,
            title: fileResult.title || file.name,
            artist: fileResult.artist,
            duration: audioMetadata.duration,
            format: getAudioFormatFromMimeType(file.type) || undefined,
          },
        };
        this.renderAudioDisplay();
      } else {
        throw new Error(
          typeof result === 'object' && result !== null && 'message' in result
            ? (result as { message?: string }).message
            : 'Upload failed'
        );
      }
    } catch (err) {
      this.showError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      progress.style.display = 'none';
    }
  }

  private async handleUrlUpload(url: string): Promise<void> {
    if (!this.wrapper) return;

    const error = this.wrapper.querySelector('.clean-audio-error') as HTMLElement;
    error.style.display = 'none';

    if (!this.isValidUrl(url)) {
      this.showError('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    if (!this.isAudioUrl(url)) {
      this.showError('URL does not appear to be an audio file');
      return;
    }

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

      this.data = { 
        url,
        title: this.extractTitleFromUrl(url)
      };
      this.renderAudioDisplay();
    } catch (err) {
      this.showError(`Invalid audio URL: ${err instanceof Error ? err.message : 'Unable to access'}`);
    }
  }

  private async getAudioMetadata(file: File): Promise<{ duration?: number }> {
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
  }



  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isAudioUrl(url: string): boolean {
    const audioExtensions = /\.(mp3|wav|ogg|aac|m4a|webm|flac)(\?.*)?$/i;
    return audioExtensions.test(url);
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop() || '';
      return filename.replace(/\.[^/.]+$/, ''); // Remove extension
    } catch {
      return 'Audio File';
    }
  }

  private async uploadToEndpoint(file: File): Promise<unknown> {
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

    const error = this.wrapper.querySelector('.clean-audio-error') as HTMLElement;
    if (error) {
      error.textContent = message;
      error.style.display = 'block';
    }
  }

  save(): AudioData {
    return this.data;
  }

  validate(savedData: AudioData): boolean {
    return isValidAudioData(savedData);
  }

  onPaste(event: PasteEvent): void {
    const detail = event.detail;

    if ('key' in detail && detail.key === 'url' && 'data' in detail && detail.data) {
      this.handleUrlUpload(detail.data as string);
    } 
    else if ('key' in detail && detail.key === 'file' && 'file' in detail && detail.file) {
      const file = detail.file;
      if (file && typeof file === 'object' && 'type' in file && isAudioFile(file as File)) {
        this.handleFileUpload(file as File);
      }
    }
  }
}

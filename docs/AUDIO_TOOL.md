# Audio Tool for Editor.js

A comprehensive audio tool for Editor.js that provides audio file upload, playback, and management capabilities with a clean, modern interface.

## Features

### 🎵 Audio Playback
- **Native HTML5 Audio Player** with custom controls
- **Play/Pause functionality** with visual feedback
- **Progress bar** with seek capability
- **Volume control** with visual indicator
- **Time display** showing current time and total duration
- **Loop and autoplay options** (configurable)

### 📁 File Upload
- **Drag & Drop support** for easy file uploads
- **Click to browse** file selection
- **URL input** for remote audio files
- **Multiple format support**: MP3, WAV, OGG, AAC, M4A, FLAC, WebM
- **File size validation** with configurable limits
- **Real-time upload progress** indication

### 📊 Metadata Display
- **Audio title** and artist information
- **File format** and size display
- **Duration** information
- **Automatic metadata extraction** from uploaded files

### 🎨 User Interface
- **Modern card-based design** with hover effects
- **Responsive layout** that works on all devices
- **Accessibility features** with proper ARIA labels
- **Dark mode support** via CSS media queries
- **Smooth animations** and transitions

### 🔧 Developer Features
- **TypeScript support** with comprehensive type definitions
- **Configurable options** for customization
- **Error handling** with user-friendly messages
- **Paste support** for URLs and files
- **EditorJS integration** with proper save/load functionality

## Installation

1. **Install the audio tool files:**
   ```bash
   # Copy the audio tool files to your project
   cp lib/audio/audio-tool.ts your-project/lib/audio/
   cp types/audio.ts your-project/types/
   cp components/audio/* your-project/components/audio/
   cp app/audio.css your-project/styles/
   ```

2. **Import the CSS styles:**
   ```css
   /* In your main CSS file */
   @import './audio.css';
   ```

3. **Register the tool with Editor.js:**
   ```javascript
   import AudioTool from './lib/audio/audio-tool';

   const editor = new EditorJS({
     tools: {
       audio: {
         class: AudioTool,
         config: {
           uploader: async (file) => {
             // Your upload logic here
             return {
               success: 1,
               file: {
                 url: 'https://example.com/uploaded-audio.mp3',
                 name: file.name,
                 size: file.size
               }
             };
           },
           maxSize: 50 * 1024 * 1024, // 50MB
           showControls: true,
           autoplay: false,
           loop: false
         }
       }
     }
   });
   ```

## Configuration Options

### AudioToolConfig

```typescript
interface AudioToolConfig {
  // Upload configuration
  endpoint?: string;                    // Upload endpoint URL
  uploader?: (file: File) => Promise<AudioUploadResponse>;
  buttonText?: string;                  // Upload button text
  errorMessage?: string;                // Default error message
  types?: string;                       // Accepted file types
  maxSize?: number;                     // Maximum file size in bytes
  allowedFormats?: AudioFormat[];       // Allowed audio formats

  // Player configuration
  showControls?: boolean;               // Show player controls (default: true)
  autoplay?: boolean;                   // Auto-play audio (default: false)
  loop?: boolean;                       // Loop audio (default: false)
  preload?: 'none' | 'metadata' | 'auto'; // Preload strategy (default: 'metadata')
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  buttonText: 'Upload Audio',
  errorMessage: 'Audio upload failed',
  types: 'audio/*',
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  showControls: true,
  autoplay: false,
  loop: false,
  preload: 'metadata'
};
```

## Usage Examples

### Basic Usage

```javascript
// Simple configuration with custom uploader
const editor = new EditorJS({
  tools: {
    audio: {
      class: AudioTool,
      config: {
        uploader: async (file) => {
          const formData = new FormData();
          formData.append('audio', file);
          
          const response = await fetch('/api/upload-audio', {
            method: 'POST',
            body: formData
          });
          
          return response.json();
        }
      }
    }
  }
});
```

### Advanced Configuration

```javascript
// Advanced configuration with all options
const editor = new EditorJS({
  tools: {
    audio: {
      class: AudioTool,
      config: {
        endpoint: '/api/upload-audio',
        buttonText: 'Choose Audio File',
        errorMessage: 'Failed to upload audio file',
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedFormats: ['mp3', 'wav', 'flac'],
        showControls: true,
        autoplay: false,
        loop: false,
        preload: 'metadata'
      }
    }
  }
});
```

### React Component Usage

```jsx
import { AudioDisplay } from './components/audio/audio-display';
import { AudioUpload } from './components/audio/audio-upload';

// Display audio
<AudioDisplay
  data={{
    url: 'https://example.com/audio.mp3',
    title: 'My Audio File',
    artist: 'Artist Name'
  }}
  config={{
    showControls: true,
    loop: false
  }}
/>

// Upload audio
<AudioUpload
  config={{
    maxSize: 50 * 1024 * 1024,
    uploader: uploadFunction
  }}
  onUpload={(audioData) => console.log('Uploaded:', audioData)}
  onError={(error) => console.error('Error:', error)}
/>
```

## Data Structure

### AudioData

```typescript
interface AudioData {
  url: string;                          // Audio file URL
  title?: string;                       // Audio title
  artist?: string;                      // Artist name
  file?: AudioFileData;                 // File metadata
}

interface AudioFileData {
  url: string;                          // File URL
  name: string;                         // File name
  size: number;                         // File size in bytes
  title?: string;                       // Audio title
  artist?: string;                      // Artist name
  duration?: number;                    // Duration in seconds
  format?: string;                      // Audio format (mp3, wav, etc.)
}
```

## Supported Audio Formats

| Format | MIME Type | Extension | Description |
|--------|-----------|-----------|-------------|
| MP3 | `audio/mpeg`, `audio/mp3` | `.mp3` | Most common format |
| WAV | `audio/wav`, `audio/wave` | `.wav` | Uncompressed audio |
| OGG | `audio/ogg`, `audio/vorbis` | `.ogg` | Open source format |
| AAC | `audio/aac` | `.aac` | Advanced Audio Coding |
| M4A | `audio/mp4`, `audio/m4a` | `.m4a` | Apple's audio format |
| FLAC | `audio/flac`, `audio/x-flac` | `.flac` | Lossless compression |
| WebM | `audio/webm` | `.webm` | Web-optimized format |

## Browser Compatibility

- **Modern Browsers**: Full support for all features
- **Safari**: Full support with native controls
- **Chrome/Edge**: Full support with custom controls
- **Firefox**: Full support with custom controls
- **Mobile Browsers**: Responsive design with touch-friendly controls

## Accessibility Features

- **Keyboard Navigation**: All controls accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Supports high contrast mode
- **Focus Indicators**: Clear focus indicators for all interactive elements
- **Semantic HTML**: Proper HTML structure for assistive technologies

## Customization

### CSS Custom Properties

```css
:root {
  --audio-primary-color: #007cba;
  --audio-background-color: #ffffff;
  --audio-border-color: #e1e5e9;
  --audio-text-color: #1a202c;
  --audio-meta-color: #718096;
}
```

### Custom Styling

```css
/* Override default styles */
.audio-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.audio-play-btn {
  background: linear-gradient(45deg, #007cba, #00a8e6);
}

.audio-progress-bar {
  height: 8px;
}
```

## Error Handling

The audio tool provides comprehensive error handling:

- **File Type Validation**: Ensures only audio files are uploaded
- **File Size Validation**: Respects configured size limits
- **Network Errors**: Handles upload and URL validation failures
- **User-Friendly Messages**: Clear error messages for users
- **Graceful Degradation**: Falls back to basic functionality when needed

## Performance Considerations

- **Lazy Loading**: Audio files are loaded only when needed
- **Metadata Preloading**: Only metadata is preloaded by default
- **Memory Management**: Proper cleanup of audio objects and URLs
- **Responsive Images**: Optimized for different screen sizes
- **Efficient Rendering**: Minimal DOM updates during playback

## Contributing

1. **Follow TypeScript best practices**
2. **Add proper type definitions** for new features
3. **Include comprehensive tests** for new functionality
4. **Update documentation** for any changes
5. **Follow the existing code style** and patterns

## License

This audio tool follows the same license as the main project.

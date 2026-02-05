/**
 * Editor.js Configuration
 * Pre-configured setup with all tools and R2 upload handlers
 */

import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Attaches from '@editorjs/attaches';
import { imageUploader, attachesUploader } from './editor-upload';

export const EDITOR_TOOLS = {
  header: {
    class: Header,
    config: {
      placeholder: 'Enter a header',
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
    inlineToolbar: true,
  },

  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered',
    },
  },

  image: {
    class: ImageTool,
    config: {
      uploader: imageUploader,
      captionPlaceholder: 'Image caption',
      buttonContent: 'Select an Image',
      types: 'image/jpeg,image/png,image/webp,image/gif',
    },
  },

  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        vimeo: true,
        twitter: true,
        instagram: true,
        codepen: true,
        github: true,
      },
    },
  },

  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: 'Quote author',
    },
  },

  code: {
    class: Code,
    config: {
      placeholder: 'Enter code',
    },
  },

  inlineCode: {
    class: InlineCode,
  },

  linkTool: {
    class: LinkTool,
    config: {
      endpoint: '/api/fetch-url', // Optional: for link preview
    },
  },

  attaches: {
    class: Attaches,
    config: {
      uploader: attachesUploader,
      buttonText: 'Upload File',
      errorMessage: 'File upload failed',
    },
  },
};

export const EDITOR_CONFIG = {
  holder: 'editorjs',
  tools: EDITOR_TOOLS,
  placeholder: 'Start writing...',
  autofocus: true,
  minHeight: 200,
  defaultBlock: 'paragraph',
  sanitizer: {
    b: true,
    i: true,
    u: true,
    s: true,
    a: {
      href: true,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    mark: true,
    code: true,
  },
  logLevel: 'ERROR' as const,
};

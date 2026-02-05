/**
 * Editor.js Configuration
 * Complete setup with ALL available tools and R2 upload handlers
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

// Additional tools (install if needed)
// import Table from '@editorjs/table';
// import Delimiter from '@editorjs/delimiter';
// import Marker from '@editorjs/marker';
// import Warning from '@editorjs/warning';
// import Checklist from '@editorjs/checklist';
// import RawTool from '@editorjs/raw';
// import Underline from '@editorjs/underline';

export const EDITOR_TOOLS = {
  // Text formatting
  header: {
    class: Header,
    config: {
      placeholder: 'Enter a header',
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2,
    },
    inlineToolbar: true,
    shortcut: 'CMD+SHIFT+H',
  },

  // Lists
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered',
    },
    shortcut: 'CMD+SHIFT+L',
  },

  // Media
  image: {
    class: ImageTool,
    config: {
      uploader: imageUploader,
      captionPlaceholder: 'Image caption',
      buttonContent: 'Select an Image',
      types: 'image/jpeg,image/png,image/webp,image/gif',
    },
  },

  // Embeds
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
        figma: true,
        gfycat: true,
      },
    },
  },

  // Content blocks
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: 'Quote author',
    },
    shortcut: 'CMD+SHIFT+O',
  },

  code: {
    class: Code,
    config: {
      placeholder: 'Enter code',
    },
    shortcut: 'CMD+SHIFT+C',
  },

  // Inline tools
  inlineCode: {
    class: InlineCode,
    shortcut: 'CMD+SHIFT+M',
  },

  // Links
  linkTool: {
    class: LinkTool,
    config: {
      endpoint: '/api/fetch-url', // Optional: for link preview
    },
  },

  // File attachments
  attaches: {
    class: Attaches,
    config: {
      uploader: attachesUploader,
      buttonText: 'Upload File',
      errorMessage: 'File upload failed',
    },
  },

  // Additional tools (commented out - install packages to enable)
  /*
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },

  delimiter: {
    class: Delimiter,
  },

  marker: {
    class: Marker,
    shortcut: 'CMD+SHIFT+M',
  },

  warning: {
    class: Warning,
    inlineToolbar: true,
    config: {
      titlePlaceholder: 'Title',
      messagePlaceholder: 'Message',
    },
  },

  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },

  raw: {
    class: RawTool,
    config: {
      placeholder: 'Enter raw HTML',
    },
  },

  underline: {
    class: Underline,
  },
  */
};

export const EDITOR_CONFIG = {
  holder: 'editorjs',
  tools: EDITOR_TOOLS,
  placeholder: 'Start writing your content...',
  autofocus: true,
  minHeight: 300,
};

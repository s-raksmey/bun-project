'use client';

import { useEffect, useRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import { EDITOR_CONFIG } from '@/lib/editor-config';

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  onReady?: () => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function Editor({
  data,
  onChange,
  onReady,
  placeholder,
  readOnly = false,
}: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  const initializeEditor = useCallback(async () => {
    if (!holderRef.current) return;
    
    // Prevent multiple initializations
    if (editorRef.current) {
      return;
    }

    try {
      const editor = new EditorJS({
        ...EDITOR_CONFIG,
        tools: EDITOR_CONFIG.tools as unknown as Record<string, EditorJS.ToolConstructable | EditorJS.ToolSettings>,
        holder: holderRef.current,
        data: data,
        placeholder: placeholder || EDITOR_CONFIG.placeholder,
        readOnly,
        onChange: async () => {
          if (onChange && editorRef.current) {
            const content = await editorRef.current.save();
            onChange(content);
          }
        },
        onReady: () => {
          editorRef.current = editor;
          onReady?.();
        },
      });
    } catch (error) {
      console.error('[Editor.js initialization error]', error);
    }
  }, [data, onChange, onReady, placeholder, readOnly]);

  useEffect(() => {
    initializeEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [initializeEditor]);

  return (
    <div className="editor-container w-full">
      <div 
        ref={holderRef} 
        className="editor-content"
      />
      
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .editor-container {
          width: 100%;
          position: relative;
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .editor-content {
          width: 100%;
          padding: 32px;
          min-height: 600px;
          overflow-y: auto;
          max-height: calc(100vh - 160px);
        }

        /* =================== EDITOR CORE STYLES =================== */
        .codex-editor {
          width: 100% !important;
          max-width: 100% !important;
        }

        .codex-editor__redactor {
          padding: 0 !important;
          min-height: auto !important;
          width: 100% !important;
        }

        .ce-block {
          width: 100% !important;
          max-width: 100% !important;
          margin-bottom: 16px !important;
          padding: 0 !important;
        }

        .ce-block__content {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* =================== TOOLBAR STYLES =================== */
        .ce-toolbar {
          width: 100% !important;
          max-width: 100% !important;
          position: sticky;
          top: 0;
          background: white;
          z-index: 100;
        }

        .ce-toolbar__content {
          width: 100% !important;
          max-width: 100% !important;
          background: white;
          border-bottom: 2px solid #f3f4f6;
          padding: 12px 0;
          margin-bottom: 24px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .ce-toolbar__plus {
          width: 32px;
          height: 32px;
          padding: 6px;
          border-radius: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          color: #3b82f6;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .ce-toolbar__plus:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
        }

        .ce-toolbar__settings-btn {
          width: 32px;
          height: 32px;
          padding: 6px;
          border-radius: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .ce-toolbar__settings-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        /* =================== INLINE TOOLBAR =================== */
        .ce-inline-toolbar {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12);
          padding: 6px;
          z-index: 1000;
          position: fixed !important;
          backdrop-filter: blur(8px);
        }

        .ce-inline-tool {
          width: 32px;
          height: 32px;
          padding: 6px;
          border-radius: 6px;
          color: #374151;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          background: transparent;
          border: none;
          line-height: 1;
        }

        .ce-inline-tool:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .ce-inline-tool--active {
          background: #dbeafe !important;
          color: #2563eb !important;
        }

        /* =================== POPOVER STYLES =================== */
        .ce-popover {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
          border-radius: 14px !important;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
          padding: 12px !important;
          z-index: 1001;
          position: fixed !important;
          max-width: 320px;
          backdrop-filter: blur(8px);
        }

        .ce-popover__container {
          max-height: 380px;
          overflow-y: auto;
          border-radius: 10px;
        }

        .ce-popover__container::-webkit-scrollbar {
          width: 6px;
        }

        .ce-popover__container::-webkit-scrollbar-track {
          background: transparent;
        }

        .ce-popover__container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .ce-popover__container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .ce-popover-item-separator {
          height: 1px;
          background: #e5e7eb;
          margin: 8px 0;
        }

        .ce-popover-item {
          border-radius: 10px;
          padding: 12px;
          margin: 4px 0;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          color: #111827;
        }

        .ce-popover-item:hover {
          background: #f3f4f6;
          transform: translateX(2px);
        }

        .ce-popover-item--active {
          background: #eff6ff;
        }

        .ce-popover-item--active:hover {
          background: #dbeafe;
        }

        .ce-popover-item__icon {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px;
          border-radius: 8px;
          background: #f3f4f6 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0;
        }

        .ce-popover-item__icon svg {
          width: 16px;
          height: 16px;
          color: #4b5563;
          fill: #4b5563;
        }

        .ce-popover-item:hover .ce-popover-item__icon {
          background: #dbeafe !important;
        }

        .ce-popover-item:hover .ce-popover-item__icon svg {
          color: #2563eb !important;
          fill: #2563eb !important;
        }

        .ce-popover-item--active .ce-popover-item__icon {
          background: #dbeafe !important;
        }

        .ce-popover-item--active .ce-popover-item__icon svg {
          color: #2563eb !important;
          fill: #2563eb !important;
        }

        .ce-popover-item__title {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #111827 !important;
          line-height: 1.4 !important;
          flex: 1;
          white-space: normal !important;
        }

        .ce-popover-item__secondary-title,
        .ce-popover-item__description {
          display: none !important;
        }

        /* =================== SEARCH FIELD =================== */
        .ce-popover__search {
          padding: 8px 0;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .cdx-search-field {
          border: 1px solid #e5e7eb !important;
          border-radius: 10px !important;
          padding: 10px 12px !important;
          font-size: 13px !important;
          background: #f9fafb !important;
          transition: all 0.2s ease;
          width: 100% !important;
          box-sizing: border-box !important;
          color: #111827 !important;
        }

        .cdx-search-field:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .cdx-search-field::placeholder {
          color: #9ca3af;
        }

        /* =================== TEXT ELEMENTS =================== */
        .ce-paragraph {
          line-height: 1.8;
          color: #111827;
          font-size: 15px;
          width: 100%;
          margin: 0;
        }

        .ce-paragraph[contentEditable=true][data-placeholder]:empty:before {
          color: #d1d5db;
          font-size: 15px;
        }

        .ce-header {
          font-weight: 700;
          margin: 0;
          width: 100%;
          color: #111827;
        }

        .ce-header h1 {
          font-size: 32px;
          line-height: 1.3;
        }

        .ce-header h2 {
          font-size: 24px;
          line-height: 1.4;
        }

        .ce-header h3 {
          font-size: 20px;
          line-height: 1.4;
        }

        .ce-header h4 {
          font-size: 16px;
          line-height: 1.5;
        }

        .ce-header h5,
        .ce-header h6 {
          font-size: 14px;
          line-height: 1.5;
        }

        /* =================== LISTS =================== */
        .ce-list {
          width: 100%;
          margin: 8px 0;
          padding-left: 24px;
        }

        .ce-list ul {
          list-style: disc;
        }

        .ce-list ol {
          list-style: decimal;
        }

        .ce-list li {
          margin-bottom: 6px;
          color: #111827;
          line-height: 1.7;
        }

        /* =================== QUOTES =================== */
        .cdx-quote {
          border-left: 4px solid #3b82f6;
          padding-left: 20px;
          color: #374151;
          font-style: italic;
          width: 100%;
          margin: 16px 0;
        }

        .cdx-quote [contentEditable=true][data-placeholder]:empty:before {
          color: #9ca3af;
        }

        /* =================== CODE BLOCK =================== */
        .ce-code {
          width: 100%;
          margin: 16px 0;
        }

        .ce-code__textarea {
          background-color: #0f172a !important;
          color: #e2e8f0 !important;
          border-radius: 10px;
          padding: 20px;
          font-family: 'Fira Code', 'Monaco', 'SF Mono', monospace;
          font-size: 13px;
          line-height: 1.6;
          border: 1px solid #1e293b;
          width: 100% !important;
          box-sizing: border-box !important;
          resize: vertical;
        }

        /* =================== IMAGES =================== */
        .image-tool {
          margin: 16px 0;
        }

        .image-tool__image {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 100%;
        }

        .image-tool__image-picture {
          transition: opacity 0.2s ease;
        }

        .image-tool__image-picture:hover {
          opacity: 0.95;
        }

        .image-tool__caption {
          border: none;
          padding: 12px 0;
          font-size: 13px;
          color: #6b7280;
          width: 100%;
          box-sizing: border-box;
        }

        /* =================== TABLES =================== */
        .ce-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .ce-table td,
        .ce-table th {
          padding: 12px;
          border: 1px solid #e5e7eb;
          color: #111827;
        }

        .ce-table th {
          background: #f9fafb;
          font-weight: 600;
        }

        /* =================== ATTACHES =================== */
        .cdx-attaches {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
          background: #f9fafb;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }

        .cdx-attaches:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .cdx-attaches__file-icon {
          background-color: #dbeafe;
          color: #2563eb;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .cdx-attaches__file-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
        }

        .cdx-attaches__file-size {
          font-size: 12px;
          color: #6b7280;
        }

        /* =================== DELIMITER =================== */
        .ce-delimiter {
          margin: 24px 0;
          background: transparent;
        }

        .ce-delimiter::before {
          content: '•••';
          display: flex;
          justify-content: center;
          color: #d1d5db;
          font-size: 20px;
          letter-spacing: 6px;
        }

        /* =================== DARK MODE =================== */
        @media (prefers-color-scheme: dark) {
          .editor-container {
            background: #0f172a;
          }

          .editor-content {
            color: #f3f4f6;
          }

          .ce-toolbar__content {
            background: #0f172a;
            border-bottom-color: #1e293b;
          }

          .ce-toolbar__plus,
          .ce-toolbar__settings-btn {
            background: #1f2937;
            border-color: #374151;
            color: #60a5fa;
          }

          .ce-toolbar__plus:hover,
          .ce-toolbar__settings-btn:hover {
            background: #1e3a8a;
            border-color: #60a5fa;
          }

          .ce-inline-toolbar {
            background: #1f2937;
            border-color: #374151;
            box-shadow: 0 10px 32px rgba(0, 0, 0, 0.4);
          }

          .ce-inline-tool {
            color: #e5e7eb;
          }

          .ce-inline-tool:hover {
            background: #374151;
            color: #f3f4f6;
          }

          .ce-inline-tool--active {
            background: #1e3a8a !important;
            color: #60a5fa !important;
          }

          .ce-popover {
            background: #1f2937 !important;
            border-color: #374151 !important;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4) !important;
          }

          .ce-popover-item-separator {
            background: #374151;
          }

          .ce-popover-item {
            color: #f3f4f6;
          }

          .ce-popover-item:hover {
            background: #374151;
            color: #ffffff;
          }

          .ce-popover-item--active {
            background: #1e3a8a;
            color: #93c5fd;
          }

          .ce-popover-item__icon {
            background: #374151 !important;
          }

          .ce-popover-item__icon svg {
            color: #9ca3af;
            fill: #9ca3af;
          }

          .ce-popover-item:hover .ce-popover-item__icon {
            background: #1e40af !important;
          }

          .ce-popover-item:hover .ce-popover-item__icon svg {
            color: #60a5fa !important;
            fill: #60a5fa !important;
          }

          .ce-popover-item--active .ce-popover-item__icon {
            background: #1e40af !important;
          }

          .ce-popover-item--active .ce-popover-item__icon svg {
            color: #60a5fa !important;
            fill: #60a5fa !important;
          }

          .cdx-search-field {
            background: #111827 !important;
            border-color: #374151 !important;
            color: #f3f4f6 !important;
          }

          .cdx-search-field:focus {
            border-color: #60a5fa !important;
            background: #1f2937 !important;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
          }

          .ce-paragraph {
            color: #e5e7eb;
          }

          .ce-paragraph[contentEditable=true][data-placeholder]:empty:before {
            color: #4b5563;
          }

          .ce-header {
            color: #f3f4f6;
          }

          .ce-list li {
            color: #e5e7eb;
          }

          .cdx-quote {
            border-left-color: #60a5fa;
            color: #cbd5e1;
          }

          .image-tool__image {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .image-tool__caption {
            color: #9ca3af;
          }

          .ce-table {
            border-color: #374151;
          }

          .ce-table td,
          .ce-table th {
            border-color: #374151;
            color: #e5e7eb;
          }

          .ce-table th {
            background: #1f2937;
          }

          .cdx-attaches {
            border-color: #374151;
            background: #111827;
          }

          .cdx-attaches:hover {
            background: #1e3a8a;
            border-color: #60a5fa;
          }

          .ce-delimiter::before {
            color: #374151;
          }
        }
      `}</style>
    </div>
  );
}

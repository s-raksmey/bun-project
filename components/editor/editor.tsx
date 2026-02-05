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
          overflow: hidden;
        }

        .editor-content {
          width: 100%;
          padding: 24px;
          min-height: 300px;
          overflow-y: auto;
          max-height: calc(100vh - 160px);
          line-height: 1.6;
          font-size: 16px;
          color: #374151;
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
          position: relative;
          background: transparent;
          z-index: 100;
        }

        .ce-toolbar__content {
          width: 100% !important;
          max-width: 100% !important;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0 0 16px 0;
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .ce-toolbar__plus {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #3b82f6;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 18px;
          font-weight: 400;
        }

        .ce-toolbar__plus:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-1px);
        }

        .ce-toolbar__settings-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ce-toolbar__settings-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        /* =================== INLINE TOOLBAR =================== */
        .ce-inline-toolbar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
          padding: 8px;
          z-index: 1000;
          position: fixed !important;
          backdrop-filter: blur(12px);
        }

        .ce-inline-tool {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          line-height: 1;
          font-size: 14px;
        }

        .ce-inline-tool:hover {
          background: #f1f5f9;
          color: #1e293b;
          transform: scale(1.05);
        }

        .ce-inline-tool--active {
          background: #eff6ff !important;
          color: #2563eb !important;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
        }

        /* =================== POPOVER STYLES =================== */
        .ce-popover {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 20px !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04) !important;
          padding: 16px !important;
          z-index: 1001;
          position: fixed !important;
          max-width: 340px;
          backdrop-filter: blur(16px);
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
          border-radius: 12px;
          padding: 14px 16px;
          margin: 2px 0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }

        .ce-popover-item:hover {
          background: #f8fafc;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .ce-popover-item--active {
          background: #eff6ff;
          color: #2563eb;
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
          color: #334155;
          font-size: 16px;
          width: 100%;
          margin: 12px 0;
          font-weight: 400;
        }

        .ce-paragraph[contentEditable=true][data-placeholder]:empty:before {
          color: #94a3b8;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
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

        /* =================== FOCUS STATES =================== */
        .ce-block--focused {
          background: rgba(59, 130, 246, 0.02);
          border-radius: 8px;
          padding: 4px 8px;
          margin: 8px -8px;
          transition: all 0.2s ease;
        }

        /* =================== SELECTION STYLES =================== */
        ::selection {
          background: rgba(59, 130, 246, 0.15);
          color: inherit;
        }

        /* =================== SCROLLBAR =================== */
        .editor-content::-webkit-scrollbar {
          width: 6px;
        }

        .editor-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .editor-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .editor-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

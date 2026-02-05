'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { OutputData } from '@editorjs/editorjs';

// Dynamic import to avoid SSR issues with Editor.js
const Editor = dynamic(() => import('@/components/editor/editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Loading editor...</p>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  const [editorData, setEditorData] = useState<OutputData>();
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = async () => {
    if (!editorData) return;

    setIsSaving(true);
    setSavedMessage('');

    try {
      // Here you would send the data to your API
      // Example: await fetch('/api/content', { method: 'POST', body: JSON.stringify(editorData) })
      
      console.log('Saving content:', editorData);
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSavedMessage('Content saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSavedMessage('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!editorData) return;
    
    const dataStr = JSON.stringify(editorData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'e') {
          e.preventDefault();
          handleExport();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorData, isSaving]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ultra-Minimal Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Simple Title */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Editor</span>
            </div>

            {/* Minimal Actions */}
            <div className="flex items-center gap-1">
              {/* Save Status */}
              {savedMessage && (
                <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-50 text-green-600">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  {savedMessage.includes('success') ? 'Saved' : 'Error'}
                </div>
              )}
              
              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!editorData}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-40"
              >
                Export
              </button>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!editorData || isSaving}
                className="px-2 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Ultra-Clean Editor Area */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded border border-gray-200 shadow-sm">
          {/* Minimal Status */}
          <div className="border-b border-gray-100 px-3 py-1.5 bg-gray-50/30">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{editorData?.blocks?.length || 0} blocks</span>
              <span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs">Tab</kbd> or 
                <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs ml-1">/</kbd> for tools
              </span>
            </div>
          </div>

          {/* Editor */}
          <Editor
            onChange={setEditorData}
            placeholder="Start writing..."
          />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-3">
        <div className="text-center text-xs text-gray-400">
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono">⌘S</kbd> Save • 
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono ml-1">⌘E</kbd> Export
        </div>
      </footer>
    </div>
  );
}

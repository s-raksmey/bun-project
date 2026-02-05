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
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center justify-between h-14">
            {/* Simple Title */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h1 className="text-base font-medium text-gray-900">Editor</h1>
            </div>

            {/* Simple Actions */}
            <div className="flex items-center gap-2">
              {/* Save Status */}
              {savedMessage && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-700 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {savedMessage.includes('success') ? 'Saved' : 'Error'}
                </div>
              )}
              
              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!editorData}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors disabled:opacity-40"
              >
                Export
              </button>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!editorData || isSaving}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Editor Area */}
      <main className="mx-auto max-w-4xl px-6 py-6">
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          {/* Simple Status Bar */}
          <div className="border-b border-gray-50 px-4 py-2 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{editorData?.blocks?.length || 0} blocks</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs">Tab</kbd> or <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-xs">/</kbd> for tools</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="relative">
            <Editor
              onChange={setEditorData}
              placeholder="Start writing..."
            />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mx-auto max-w-4xl px-6 py-4">
        <div className="text-center text-xs text-gray-400">
          <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded font-mono">Cmd+S</kbd> Save • 
          <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded font-mono ml-1">Cmd+E</kbd> Export
        </div>
      </footer>
    </div>
  );
}

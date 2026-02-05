'use client';

import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/70 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-950/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">✏️</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Editor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rich Text Editor</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {savedMessage && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    savedMessage.includes('success') 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {savedMessage}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleExport}
                disabled={!editorData}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                Export
              </button>
              
              <button
                onClick={handleSave}
                disabled={!editorData || isSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-gray-200/50 bg-white shadow-lg shadow-gray-900/5 dark:border-gray-800/50 dark:bg-gray-900 dark:shadow-gray-900/20 overflow-hidden">
          <Editor
            onChange={setEditorData}
            placeholder="Start writing your content here..."
          />
        </div>
      </main>

      {/* Footer Hint */}
      <footer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-800">Tab</kbd>
            <span>or</span>
            <kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-1 font-mono dark:border-gray-700 dark:bg-gray-800">/</kbd>
            <span>to open the menu</span>
          </div>
          <p>Ready to save {editorData?.blocks?.length || 0} blocks</p>
        </div>
      </footer>
    </div>
  );
}

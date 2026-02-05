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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Content Editor</h1>
                <p className="text-xs text-slate-500">Create beautiful content</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Save Status */}
              {savedMessage && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {savedMessage.includes('success') ? 'Saved' : 'Error'}
                  </span>
                </div>
              )}
              
              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={!editorData}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!editorData || isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/60 overflow-hidden">
          {/* Editor Toolbar */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Document</span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{editorData?.blocks?.length || 0} blocks</span>
                  <span>•</span>
                  <span>Auto-save enabled</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono">Tab</kbd>
                <span>or</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono">/</kbd>
                <span>for commands</span>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="relative">
            <Editor
              onChange={setEditorData}
              placeholder="Start writing your story..."
            />
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="mx-auto max-w-4xl px-6 py-6">
        <div className="text-center">
          <p className="text-sm text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">Cmd+S</kbd> to save • 
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono ml-1">Cmd+E</kbd> to export
          </p>
        </div>
      </footer>
    </div>
  );
}

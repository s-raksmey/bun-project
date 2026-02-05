'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadFile } from '@/storage/upload-utils';
import Image from 'next/image';

interface UploadedItem {
  url: string;
  type: 'image' | 'video';
}

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);

    const result = await uploadFile(file, setProgress);

    if (!result.success || !result.url) {
      setError(result.error ?? 'Upload failed');
      setProgress(null);
      return;
    }

    setItems(prev => [
      {
        url: result.url!,
        type: file.type.startsWith('video') ? 'video' : 'image',
      },
      ...prev,
    ]);

    setProgress(null);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }, []);

  return (
    <div className="space-y-8">
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white/80 p-12 text-center shadow-lg backdrop-blur-sm transition-all hover:border-blue-500 hover:bg-white hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-400 dark:hover:bg-gray-800/80"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={onChange}
        />

        {/* Upload Icon */}
        <div className="mb-4 rounded-full bg-blue-50 p-6 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
          <svg
            className="h-12 w-12 text-blue-500 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Upload Your Files
        </h3>
        
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Drag & drop your images or videos here, or click to browse
        </p>

        <button
          onClick={() => inputRef.current?.click()}
          className="group/btn relative overflow-hidden rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 dark:from-blue-500 dark:to-indigo-500"
        >
          <span className="relative z-10">Browse Files</span>
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform group-hover/btn:translate-x-full" />
        </button>

        {progress !== null && (
          <div className="mt-6 w-full max-w-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploading...
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 shadow-sm transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/20">
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Uploaded Files
            </h2>
            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {items.length} {items.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={item.url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt="Uploaded image"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="h-full w-full object-cover"
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                {/* Type Badge */}
                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {item.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
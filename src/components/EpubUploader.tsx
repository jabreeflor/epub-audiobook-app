'use client';

/**
 * EpubUploader Component - DEV-11
 * File upload component for selecting and parsing EPUB files
 */

import { useRef, ChangeEvent, DragEvent, useState } from 'react';
import { useEpubParser } from '@/hooks/useEpubParser';
import { Book } from '@/types';

interface EpubUploaderProps {
  onBookLoaded?: (book: Book) => void;
  onError?: (error: string) => void;
}

export function EpubUploader({ onBookLoaded, onError }: EpubUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { book, isLoading, error, progress, parseFile, reset } = useEpubParser();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await parseFile(file);
      if (result) {
        onBookLoaded?.(result);
      } else if (error) {
        onError?.(error);
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const result = await parseFile(file);
      if (result) {
        onBookLoaded?.(result);
      } else if (error) {
        onError?.(error);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (book) {
    return (
      <div className="p-6 bg-surface rounded-xl border border-white/10">
        <div className="flex items-start gap-4">
          {book.coverUrl && (
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{book.title}</h3>
            <p className="text-white/60 text-sm">{book.author}</p>
            <p className="text-white/40 text-xs mt-2">
              {book.chapters.length} chapters
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-white/60 hover:text-white 
                       border border-white/20 rounded-lg hover:border-white/40
                       transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative p-8 rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${isDragging 
          ? 'border-accent bg-accent/10' 
          : 'border-white/20 hover:border-white/40 bg-surface'
        }
        ${isLoading ? 'pointer-events-none' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub,application/epub+zip"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-white/80">Parsing EPUB...</p>
            <div className="mt-2 w-48 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-4 text-white/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <p className="text-white/80 font-medium">
              Drop your EPUB here
            </p>
            <p className="text-white/40 text-sm mt-1">
              or click to browse
            </p>
          </>
        )}
        
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

export default EpubUploader;

'use client';

/**
 * Reader Page - DEV-15
 * Main page for uploading and reading EPUB files
 */

import { useState } from 'react';
import { EpubUploader, ImmersiveReader } from '@/components';
import { useReadingProgress } from '@/hooks';
import { Book } from '@/types';

export default function ReaderPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [isReading, setIsReading] = useState(false);
  
  const { progress, saveProgress } = useReadingProgress(book?.id || '');

  const handleBookLoaded = (loadedBook: Book) => {
    setBook(loadedBook);
  };

  const handleStartReading = () => {
    setIsReading(true);
  };

  const handleCloseReader = () => {
    setIsReading(false);
  };

  const handleProgressChange = (totalProgress: number) => {
    // Progress is saved in the reader via chapter change
  };

  const handleChapterChange = (chapterIndex: number) => {
    if (book) {
      const totalProgress = ((chapterIndex + 1) / book.chapters.length) * 100;
      saveProgress(chapterIndex, 0, totalProgress);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">EPUB Audiobook Reader</h1>
          <p className="text-white/50 text-sm">Upload an EPUB to start reading</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!book ? (
          <EpubUploader onBookLoaded={handleBookLoaded} />
        ) : (
          <div className="space-y-6">
            {/* Book Info Card */}
            <div className="p-6 bg-surface rounded-xl border border-white/10">
              <div className="flex gap-6">
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{book.title}</h2>
                  <p className="text-white/60 mb-4">{book.author}</p>
                  
                  <div className="space-y-2 text-sm text-white/50">
                    <p>{book.chapters.length} chapters</p>
                    {progress && (
                      <p>
                        Last read: Chapter {progress.chapterIndex + 1} • 
                        {Math.round(progress.totalProgress)}% complete
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleStartReading}
                      className="px-6 py-2 bg-accent text-white font-medium rounded-lg
                                 hover:bg-accent/90 transition-colors"
                    >
                      {progress ? 'Continue Reading' : 'Start Reading'}
                    </button>
                    <button
                      onClick={() => setBook(null)}
                      className="px-4 py-2 border border-white/20 text-white/70 rounded-lg
                                 hover:border-white/40 transition-colors"
                    >
                      Change Book
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <h3 className="px-6 py-4 text-white font-medium border-b border-white/10">
                Chapters
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {book.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      handleChapterChange(index);
                      setIsReading(true);
                    }}
                    className={`
                      w-full px-6 py-3 text-left border-b border-white/5
                      hover:bg-white/5 transition-colors
                      ${progress?.chapterIndex === index ? 'bg-accent/10' : ''}
                    `}
                  >
                    <span className="text-white/40 text-sm mr-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white/80">{chapter.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Immersive Reader Overlay */}
      {book && isReading && (
        <ImmersiveReader
          book={book}
          initialChapterIndex={progress?.chapterIndex || 0}
          onChapterChange={handleChapterChange}
          onProgressChange={handleProgressChange}
          onClose={handleCloseReader}
        />
      )}
    </div>
  );
}

'use client';

/**
 * BookDetailView Component - DEV-20
 * Detailed view of a single book with chapters and actions
 */

import { useState } from 'react';
import { Book, Chapter } from '@/types';
import { estimateReadingTime, estimateListeningTime, getBookWordCount } from '@/lib/epub-parser';

interface BookDetailViewProps {
  book: Book;
  progress?: number; // 0-100
  currentChapterIndex?: number;
  onStartReading: (chapterIndex?: number) => void;
  onStartListening: (chapterIndex?: number) => void;
  onChapterSelect: (chapterIndex: number) => void;
  onBack: () => void;
  onDelete?: () => void;
}

export function BookDetailView({
  book,
  progress = 0,
  currentChapterIndex,
  onStartReading,
  onStartListening,
  onChapterSelect,
  onBack,
  onDelete,
}: BookDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'chapters' | 'info'>('chapters');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const wordCount = getBookWordCount(book);
  const readingTime = estimateReadingTime(book);
  const listeningTime = estimateListeningTime(book);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Blur */}
        {book.coverUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl"
            style={{ backgroundImage: `url(${book.coverUrl})` }}
          />
        )}
        
        <div className="relative">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onBack}
              className="p-2 text-white/70 hover:text-white transition-colors
                         bg-white/5 rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-white/50 hover:text-red-400 transition-colors
                           bg-white/5 rounded-lg hover:bg-white/10"
                aria-label="Delete book"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Book Info */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="flex-shrink-0 self-center sm:self-start">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-40 h-56 object-cover rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-40 h-56 bg-gradient-to-br from-accent/30 to-accent/10 
                                rounded-xl flex items-center justify-center">
                  <span className="text-6xl font-bold text-accent/50">
                    {book.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{book.title}</h1>
              <p className="text-white/60 mb-4">{book.author}</p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-white/50 mb-6">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{book.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{wordCount.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTime(readingTime)} read</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>{formatTime(listeningTime)} listen</span>
                </div>
              </div>

              {/* Progress */}
              {progress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/50">Progress</span>
                    <span className="text-white/70">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onStartReading(currentChapterIndex)}
                  className="flex-1 px-6 py-3 bg-accent text-white font-medium rounded-lg
                             hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {progress > 0 ? 'Continue Reading' : 'Start Reading'}
                </button>
                <button
                  onClick={() => onStartListening(currentChapterIndex)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white font-medium rounded-lg
                             hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {progress > 0 ? 'Continue Listening' : 'Start Listening'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 sticky top-0 bg-background z-10">
        <div className="flex max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'chapters' ? 'text-white' : 'text-white/50 hover:text-white/70'}
            `}
          >
            Chapters
            {activeTab === 'chapters' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${activeTab === 'info' ? 'text-white' : 'text-white/50 hover:text-white/70'}
            `}
          >
            Info
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto p-4">
        {activeTab === 'chapters' ? (
          <ChapterList
            chapters={book.chapters}
            currentChapterIndex={currentChapterIndex}
            onChapterSelect={onChapterSelect}
          />
        ) : (
          <BookInfo book={book} wordCount={wordCount} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-surface rounded-xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Book?</h3>
            <p className="text-white/60 mb-6">
              This will remove &quot;{book.title}&quot; from your library. Your reading progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white/70 rounded-lg
                           hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg
                           hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Chapter List Component
function ChapterList({
  chapters,
  currentChapterIndex,
  onChapterSelect,
}: {
  chapters: Chapter[];
  currentChapterIndex?: number;
  onChapterSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-1">
      {chapters.map((chapter, index) => {
        const isCurrent = index === currentChapterIndex;
        
        return (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(index)}
            className={`
              w-full px-4 py-3 text-left rounded-lg flex items-center gap-3
              transition-colors
              ${isCurrent 
                ? 'bg-accent/20 text-white' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <span className={`
              w-8 h-8 flex items-center justify-center rounded-full text-sm
              flex-shrink-0
              ${isCurrent ? 'bg-accent text-white' : 'bg-white/10 text-white/50'}
            `}>
              {index + 1}
            </span>
            <span className="flex-1 truncate">{chapter.title}</span>
            {isCurrent && (
              <span className="text-xs text-accent">Current</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Book Info Component
function BookInfo({
  book,
  wordCount,
}: {
  book: Book;
  wordCount: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white/50 mb-2">Title</h3>
        <p className="text-white">{book.title}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-white/50 mb-2">Author</h3>
        <p className="text-white">{book.author}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-white/50 mb-2">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-white">{book.chapters.length}</p>
            <p className="text-white/50 text-sm">Chapters</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-white">{wordCount.toLocaleString()}</p>
            <p className="text-white/50 text-sm">Words</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white/50 mb-2">Book ID</h3>
        <p className="text-white/70 font-mono text-sm">{book.id}</p>
      </div>
    </div>
  );
}

export default BookDetailView;

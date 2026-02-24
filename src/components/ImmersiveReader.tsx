'use client';

/**
 * ImmersiveReader Component - DEV-15
 * Full-screen, dark-themed reading experience for EPUB content
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Book, Chapter } from '@/types';
import { ReaderAudioBar } from './ReaderAudioBar';
import { BookmarkButton } from './BookmarkButton';
import { BookmarksList } from './BookmarksList';
import { useBookmarks } from '@/hooks/useBookmarks';

interface ImmersiveReaderProps {
  book: Book;
  initialChapterIndex?: number;
  onChapterChange?: (index: number) => void;
  onProgressChange?: (progress: number) => void;
  onClose?: () => void;
}

export function ImmersiveReader({
  book,
  initialChapterIndex = 0,
  onChapterChange,
  onProgressChange,
  onClose,
}: ImmersiveReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  const { bookmarks, toggleBookmark, removeBookmark, updateNote, hasBookmarkAt } = useBookmarks(book.id);

  const currentChapter = book.chapters[currentChapterIndex];
  const totalChapters = book.chapters.length;

  // Calculate overall book progress
  const bookProgress = ((currentChapterIndex + scrollProgress) / totalChapters) * 100;

  // Handle scroll to track reading progress
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = scrollHeight > clientHeight 
      ? scrollTop / (scrollHeight - clientHeight) 
      : 1;
    
    setScrollProgress(Math.min(1, Math.max(0, progress)));
    onProgressChange?.(bookProgress);
  }, [bookProgress, onProgressChange]);

  // Auto-hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Show controls on any interaction
  const handleInteraction = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Navigate chapters
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < totalChapters) {
      setCurrentChapterIndex(index);
      setScrollProgress(0);
      onChapterChange?.(index);
      
      // Scroll to top of new chapter
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [totalChapters, onChapterChange]);

  const goToPreviousChapter = useCallback(() => {
    goToChapter(currentChapterIndex - 1);
  }, [currentChapterIndex, goToChapter]);
  
  const goToNextChapter = useCallback(() => {
    goToChapter(currentChapterIndex + 1);
  }, [currentChapterIndex, goToChapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleInteraction();
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousChapter();
          break;
        case 'ArrowRight':
          goToNextChapter();
          break;
        case 'Escape':
          onClose?.();
          break;
        case '+':
        case '=':
          setFontSize(prev => Math.min(32, prev + 2));
          break;
        case '-':
          setFontSize(prev => Math.max(12, prev - 2));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, handleInteraction, onClose, goToPreviousChapter, goToNextChapter]);

  // Initialize controls timeout
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [resetControlsTimeout]);

  return (
    <div 
      className="fixed inset-0 bg-background z-50 flex flex-col"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Top Bar */}
      <header 
        className={`
          absolute top-0 left-0 right-0 z-10 px-4 py-3
          bg-gradient-to-b from-background via-background/80 to-transparent
          transition-opacity duration-300
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Close reader"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className="text-white/90 font-medium text-sm truncate">{book.title}</h1>
            <p className="text-white/50 text-xs">{currentChapter.title}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <BookmarkButton
              isBookmarked={hasBookmarkAt(currentChapterIndex, scrollProgress)}
              onToggle={() => toggleBookmark(currentChapterIndex, scrollProgress)}
            />
            <button
              onClick={() => setShowBookmarks(true)}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="View bookmarks"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Decrease font size"
            >
              <span className="text-sm font-medium">A-</span>
            </button>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Increase font size"
            >
              <span className="text-lg font-medium">A+</span>
            </button>
          </div>
        </div>
      </header>

      {/* Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div 
          className="h-full bg-accent transition-all duration-150"
          style={{ width: `${bookProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <main 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-20 md:px-8"
        style={{ fontSize: `${fontSize}px` }}
      >
        <article className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            {currentChapter.title}
          </h2>
          
          <div className="text-white/85 leading-relaxed whitespace-pre-wrap">
            {formatChapterContent(currentChapter.content)}
          </div>
          
          {/* End of chapter navigation */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              {currentChapterIndex > 0 ? (
                <button
                  onClick={goToPreviousChapter}
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous Chapter</span>
                </button>
              ) : <div />}
              
              {currentChapterIndex < totalChapters - 1 ? (
                <button
                  onClick={goToNextChapter}
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                >
                  <span>Next Chapter</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <p className="text-white/50 text-sm">End of book</p>
              )}
            </div>
          </div>
        </article>
      </main>

      {/* Audio Bar */}
      <ReaderAudioBar
        chapter={currentChapter}
        chapters={book.chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={goToChapter}
      />

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <BookmarksList
          bookmarks={bookmarks}
          chapterTitles={book.chapters.map(c => c.title)}
          onNavigate={(chIdx, scroll) => {
            goToChapter(chIdx);
            // Restore scroll position after chapter loads
            setTimeout(() => {
              if (contentRef.current) {
                const { scrollHeight, clientHeight } = contentRef.current;
                contentRef.current.scrollTop = scroll * (scrollHeight - clientHeight);
              }
            }, 100);
            setShowBookmarks(false);
          }}
          onDelete={removeBookmark}
          onUpdateNote={updateNote}
          onClose={() => setShowBookmarks(false)}
        />
      )}

      {/* Bottom Bar - Chapter Navigation */}
      <footer 
        className={`
          absolute bottom-0 left-0 right-0 z-10 px-4 py-3
          bg-gradient-to-t from-background via-background/80 to-transparent
          transition-opacity duration-300
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={goToPreviousChapter}
            disabled={currentChapterIndex === 0}
            className="p-2 text-white/60 hover:text-white disabled:text-white/20 
                       disabled:cursor-not-allowed transition-colors"
            aria-label="Previous chapter"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Chapter {currentChapterIndex + 1} of {totalChapters}
            </p>
            <p className="text-white/40 text-xs">
              {Math.round(bookProgress)}% complete
            </p>
          </div>
          
          <button
            onClick={goToNextChapter}
            disabled={currentChapterIndex === totalChapters - 1}
            className="p-2 text-white/60 hover:text-white disabled:text-white/20 
                       disabled:cursor-not-allowed transition-colors"
            aria-label="Next chapter"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

/**
 * Formats chapter content for display
 * Splits into paragraphs and adds proper spacing
 */
function formatChapterContent(content: string): React.ReactNode {
  // Split content into paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="mb-6">
      {paragraph}
    </p>
  ));
}

export default ImmersiveReader;

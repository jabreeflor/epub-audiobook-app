'use client';

/**
 * ChapterNavigation Component - DEV-17
 * Slide-out drawer for navigating between book chapters
 */

import { useState, useEffect, useRef } from 'react';
import { Chapter } from '@/types';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onChapterSelect: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  progress?: Record<string, number>; // chapterId -> progress (0-100)
}

export function ChapterNavigation({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  isOpen,
  onClose,
  progress = {},
}: ChapterNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const currentChapterRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter chapters by search query
  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to current chapter when opening
  useEffect(() => {
    if (isOpen && currentChapterRef.current) {
      setTimeout(() => {
        currentChapterRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChapterClick = (index: number) => {
    onChapterSelect(index);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        aria-hidden="true"
      />

      {/* Side Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-surface z-50
                   shadow-2xl border-l border-white/10 flex flex-col
                   animate-slide-in-right"
        role="dialog"
        aria-label="Chapter navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Chapters</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-lg
                         hover:bg-white/10"
              aria-label="Close chapter navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-white/40 focus:outline-none focus:border-accent
                         transition-colors"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 
                           hover:text-white/70"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChapters.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              No chapters match your search
            </div>
          ) : (
            <div className="py-2">
              {filteredChapters.map((chapter) => {
                const originalIndex = chapters.findIndex(c => c.id === chapter.id);
                const isCurrent = originalIndex === currentChapterIndex;
                const chapterProgress = progress[chapter.id] || 0;

                return (
                  <button
                    key={chapter.id}
                    ref={isCurrent ? currentChapterRef : null}
                    onClick={() => handleChapterClick(originalIndex)}
                    className={`
                      w-full px-4 py-3 text-left flex items-center gap-3
                      transition-colors relative
                      ${isCurrent 
                        ? 'bg-accent/20 text-white' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    {/* Chapter Number */}
                    <span className={`
                      w-8 h-8 flex items-center justify-center rounded-full text-sm
                      flex-shrink-0
                      ${isCurrent 
                        ? 'bg-accent text-white' 
                        : 'bg-white/10 text-white/50'
                      }
                    `}>
                      {originalIndex + 1}
                    </span>

                    {/* Chapter Title */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chapter.title}</p>
                      {chapterProgress > 0 && chapterProgress < 100 && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent/50"
                            style={{ width: `${chapterProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status Indicator */}
                    {chapterProgress >= 100 && (
                      <svg 
                        className="w-5 h-5 text-green-400 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}

                    {/* Current Indicator */}
                    {isCurrent && (
                      <div className="w-1 absolute left-0 top-0 bottom-0 bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface">
          <div className="text-sm text-white/50 text-center">
            {chapters.length} chapters • Chapter {currentChapterIndex + 1} of {chapters.length}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChapterNavigation;

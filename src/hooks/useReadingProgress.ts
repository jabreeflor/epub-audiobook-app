/**
 * useReadingProgress Hook - DEV-15
 * Persists and retrieves reading progress for books using localStorage
 */

import { useState, useEffect, useCallback } from 'react';

interface ReadingProgress {
  bookId: string;
  chapterIndex: number;
  scrollPosition: number;
  lastReadAt: number;
  totalProgress: number;
}

interface UseReadingProgressReturn {
  progress: ReadingProgress | null;
  saveProgress: (chapterIndex: number, scrollPosition: number, totalProgress: number) => void;
  clearProgress: () => void;
}

const STORAGE_KEY_PREFIX = 'epub-reader-progress-';

export function useReadingProgress(bookId: string): UseReadingProgressReturn {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const storageKey = `${STORAGE_KEY_PREFIX}${bookId}`;

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reading progress:', error);
    }
  }, [storageKey]);

  // Save progress to localStorage
  const saveProgress = useCallback((
    chapterIndex: number,
    scrollPosition: number,
    totalProgress: number
  ) => {
    const newProgress: ReadingProgress = {
      bookId,
      chapterIndex,
      scrollPosition,
      lastReadAt: Date.now(),
      totalProgress,
    };

    setProgress(newProgress);

    try {
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save reading progress:', error);
    }
  }, [bookId, storageKey]);

  // Clear progress from localStorage
  const clearProgress = useCallback(() => {
    setProgress(null);
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear reading progress:', error);
    }
  }, [storageKey]);

  return {
    progress,
    saveProgress,
    clearProgress,
  };
}

/**
 * Gets all saved reading progress entries
 */
export function getAllReadingProgress(): ReadingProgress[] {
  if (typeof window === 'undefined') return [];
  
  const entries: ReadingProgress[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          entries.push(JSON.parse(stored));
        }
      }
    }
  } catch (error) {
    console.error('Failed to get all reading progress:', error);
  }
  
  // Sort by last read date, most recent first
  return entries.sort((a, b) => b.lastReadAt - a.lastReadAt);
}

export default useReadingProgress;

'use client';

/**
 * useBookmarks Hook - DEV-14
 * Bookmark system with localStorage persistence for EPUB reader.
 */

import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  bookId: string;
  chapterIndex: number;
  scrollPosition: number;
  note: string;
  createdAt: number;
}

interface UseBookmarksReturn {
  /** All bookmarks for this book. */
  bookmarks: Bookmark[];
  /** Add a bookmark at the given position. Returns the new bookmark. */
  addBookmark: (chapterIndex: number, scrollPosition: number, note?: string) => Bookmark;
  /** Remove a bookmark by id. */
  removeBookmark: (id: string) => void;
  /** Update the note on an existing bookmark. */
  updateNote: (id: string, note: string) => void;
  /** Check if a bookmark exists near the given position. */
  hasBookmarkAt: (chapterIndex: number, scrollPosition: number) => boolean;
  /** Toggle bookmark at position — adds if missing, removes if present. Returns the bookmark or null. */
  toggleBookmark: (chapterIndex: number, scrollPosition: number) => Bookmark | null;
}

const STORAGE_KEY_PREFIX = 'epub-bookmarks-';

/**
 * Hook to manage bookmarks for a specific book.
 */
export function useBookmarks(bookId: string): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const storageKey = `${STORAGE_KEY_PREFIX}${bookId}`;

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
  }, [storageKey]);

  // Persist helper
  const persist = useCallback((next: Bookmark[]) => {
    setBookmarks(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [storageKey]);

  const addBookmark = useCallback((chapterIndex: number, scrollPosition: number, note = ''): Bookmark => {
    const bm: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookId,
      chapterIndex,
      scrollPosition: Math.round(scrollPosition * 1000) / 1000,
      note,
      createdAt: Date.now(),
    };
    const next = [...bookmarks, bm].sort((a, b) => {
      if (a.chapterIndex !== b.chapterIndex) return a.chapterIndex - b.chapterIndex;
      return a.scrollPosition - b.scrollPosition;
    });
    persist(next);
    return bm;
  }, [bookId, bookmarks, persist]);

  const removeBookmark = useCallback((id: string) => {
    persist(bookmarks.filter(b => b.id !== id));
  }, [bookmarks, persist]);

  const updateNote = useCallback((id: string, note: string) => {
    persist(bookmarks.map(b => b.id === id ? { ...b, note } : b));
  }, [bookmarks, persist]);

  const hasBookmarkAt = useCallback((chapterIndex: number, scrollPosition: number): boolean => {
    return bookmarks.some(
      b => b.chapterIndex === chapterIndex && Math.abs(b.scrollPosition - scrollPosition) < 0.02
    );
  }, [bookmarks]);

  const toggleBookmark = useCallback((chapterIndex: number, scrollPosition: number): Bookmark | null => {
    const existing = bookmarks.find(
      b => b.chapterIndex === chapterIndex && Math.abs(b.scrollPosition - scrollPosition) < 0.02
    );
    if (existing) {
      removeBookmark(existing.id);
      return null;
    }
    return addBookmark(chapterIndex, scrollPosition);
  }, [bookmarks, removeBookmark, addBookmark]);

  return { bookmarks, addBookmark, removeBookmark, updateNote, hasBookmarkAt, toggleBookmark };
}

export default useBookmarks;

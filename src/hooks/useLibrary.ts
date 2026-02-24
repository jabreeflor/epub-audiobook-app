/**
 * useLibrary Hook - DEV-19
 * Manages the book library with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Book } from '@/types';

interface LibraryBook extends Book {
  addedAt: number;
  lastReadAt?: number;
  progress?: number;
}

interface UseLibraryReturn {
  books: LibraryBook[];
  addBook: (book: Book) => LibraryBook;
  removeBook: (bookId: string) => void;
  updateBookProgress: (bookId: string, progress: number) => void;
  updateLastRead: (bookId: string) => void;
  getBook: (bookId: string) => LibraryBook | undefined;
  isLoaded: boolean;
}

const STORAGE_KEY = 'epub-reader-library';

export function useLibrary(): UseLibraryReturn {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load library from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBooks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load library:', error);
    }
    
    setIsLoaded(true);
  }, []);

  // Save library to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Failed to save library:', error);
    }
  }, [books, isLoaded]);

  const addBook = useCallback((book: Book): LibraryBook => {
    const libraryBook: LibraryBook = {
      ...book,
      addedAt: Date.now(),
      progress: 0,
    };

    setBooks(prev => {
      // Check if book already exists (by ID or title+author)
      const exists = prev.some(
        b => b.id === book.id || (b.title === book.title && b.author === book.author)
      );
      
      if (exists) {
        // Update existing book instead of adding duplicate
        return prev.map(b => 
          b.id === book.id || (b.title === book.title && b.author === book.author)
            ? { ...b, ...libraryBook, addedAt: b.addedAt }
            : b
        );
      }
      
      return [...prev, libraryBook];
    });

    return libraryBook;
  }, []);

  const removeBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  }, []);

  const updateBookProgress = useCallback((bookId: string, progress: number) => {
    setBooks(prev => prev.map(book =>
      book.id === bookId
        ? { ...book, progress: Math.min(100, Math.max(0, progress)) }
        : book
    ));
  }, []);

  const updateLastRead = useCallback((bookId: string) => {
    setBooks(prev => prev.map(book =>
      book.id === bookId
        ? { ...book, lastReadAt: Date.now() }
        : book
    ));
  }, []);

  const getBook = useCallback((bookId: string): LibraryBook | undefined => {
    return books.find(b => b.id === bookId);
  }, [books]);

  return {
    books,
    addBook,
    removeBook,
    updateBookProgress,
    updateLastRead,
    getBook,
    isLoaded,
  };
}

export type { LibraryBook };
export default useLibrary;

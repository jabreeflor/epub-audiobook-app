/**
 * useEpubParser Hook - DEV-11
 * React hook for parsing EPUB files with loading and error states
 */

import { useState, useCallback } from 'react';
import { parseEpub, isValidEpub } from '@/lib/epub-parser';
import { Book } from '@/types';

interface UseEpubParserState {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

interface UseEpubParserReturn extends UseEpubParserState {
  parseFile: (file: File) => Promise<Book | null>;
  reset: () => void;
}

export function useEpubParser(): UseEpubParserReturn {
  const [state, setState] = useState<UseEpubParserState>({
    book: null,
    isLoading: false,
    error: null,
    progress: 0,
  });

  const parseFile = useCallback(async (file: File): Promise<Book | null> => {
    // Validate file
    if (!isValidEpub(file)) {
      setState(prev => ({
        ...prev,
        error: 'Invalid file type. Please select an EPUB file.',
        isLoading: false,
      }));
      return null;
    }

    // Start loading
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 10,
    }));

    try {
      // Parse the EPUB
      setState(prev => ({ ...prev, progress: 30 }));
      
      const book = await parseEpub(file);
      
      setState(prev => ({ ...prev, progress: 90 }));

      // Validate parsed content
      if (!book.chapters || book.chapters.length === 0) {
        throw new Error('No readable chapters found in this EPUB.');
      }

      setState({
        book,
        isLoading: false,
        error: null,
        progress: 100,
      });

      return book;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to parse EPUB file. Please try a different file.';
      
      setState({
        book: null,
        isLoading: false,
        error: message,
        progress: 0,
      });

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      book: null,
      isLoading: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    parseFile,
    reset,
  };
}

export default useEpubParser;

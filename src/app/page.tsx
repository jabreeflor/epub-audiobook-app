'use client';

/**
 * Home Page - Main App Integration
 * Connects all components into a working flow
 */

import { useState, useCallback } from 'react';
import {
  LibraryScreen,
  EpubUploader,
  BookDetailView,
  ImmersiveReader,
  FloatingAudioPlayer,
  ChapterNavigation,
  SettingsPanel,
  InstallPrompt,
  defaultAppSettings,
} from '@/components';
import {
  useLibrary,
  useEpubParser,
  useReadingProgress,
  useTTS,
  useAppSettings,
  useTTSVoices,
} from '@/hooks';
import { Book } from '@/types';

type AppView = 'library' | 'upload' | 'detail' | 'reader';

export default function Home() {
  // App State
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const { books, addBook, removeBook, updateBookProgress, updateLastRead, getBook } = useLibrary();
  const { parseFile, isLoading: isParsing, error: parseError } = useEpubParser();
  const { settings, updateSettings } = useAppSettings();
  const voices = useTTSVoices();
  
  // Reading progress for selected book
  const { progress, saveProgress } = useReadingProgress(selectedBook?.id || '');
  
  // TTS
  const {
    play: ttsPlay,
    stop: ttsStop,
    pause: ttsPause,
    resume: ttsResume,
    isPlaying,
    isPaused,
    currentPosition,
    setRate,
    setVoice,
  } = useTTS();

  // Handlers
  const handleBookSelect = useCallback((book: Book) => {
    setSelectedBook(book);
    updateLastRead(book.id);
    setCurrentView('detail');
  }, [updateLastRead]);

  const handleAddBook = useCallback(() => {
    setCurrentView('upload');
  }, []);

  const handleBookLoaded = useCallback(async (book: Book) => {
    addBook(book);
    setSelectedBook(book);
    setCurrentView('detail');
  }, [addBook]);

  const handleStartReading = useCallback((chapterIndex?: number) => {
    if (!selectedBook) return;
    updateLastRead(selectedBook.id);
    setCurrentView('reader');
  }, [selectedBook, updateLastRead]);

  const handleStartListening = useCallback((chapterIndex?: number) => {
    if (!selectedBook) return;
    
    const chapter = selectedBook.chapters[chapterIndex ?? progress?.chapterIndex ?? 0];
    if (chapter) {
      // Set voice if configured
      const selectedVoice = voices.find(v => v.name === settings.ttsVoice);
      if (selectedVoice) {
        setVoice(selectedVoice);
      }
      setRate(settings.ttsRate);
      ttsPlay(chapter.content);
      setIsListening(true);
    }
  }, [selectedBook, progress, ttsPlay, settings, voices, setVoice, setRate]);

  const handleStopListening = useCallback(() => {
    ttsStop();
    setIsListening(false);
  }, [ttsStop]);

  const handleChapterChange = useCallback((index: number) => {
    if (!selectedBook) return;
    
    const totalProgress = ((index + 1) / selectedBook.chapters.length) * 100;
    saveProgress(index, 0, totalProgress);
    updateBookProgress(selectedBook.id, totalProgress);
    
    // If listening, start new chapter
    if (isListening) {
      ttsStop();
      const chapter = selectedBook.chapters[index];
      if (chapter) {
        const selectedVoice = voices.find(v => v.name === settings.ttsVoice);
        if (selectedVoice) {
          setVoice(selectedVoice);
        }
        setRate(settings.ttsRate);
        ttsPlay(chapter.content);
      }
    }
  }, [selectedBook, saveProgress, updateBookProgress, isListening, ttsStop, ttsPlay, settings, voices, setVoice, setRate]);

  const handleBack = useCallback(() => {
    if (currentView === 'reader') {
      setCurrentView('detail');
    } else if (currentView === 'detail' || currentView === 'upload') {
      setSelectedBook(null);
      setCurrentView('library');
    }
  }, [currentView]);

  const handleDeleteBook = useCallback(() => {
    if (selectedBook) {
      removeBook(selectedBook.id);
      setSelectedBook(null);
      setCurrentView('library');
    }
  }, [selectedBook, removeBook]);

  // Calculate book progress
  const bookProgress = selectedBook ? getBook(selectedBook.id)?.progress ?? 0 : 0;

  // Render based on current view
  return (
    <>
      {/* Main Content */}
      {currentView === 'library' && (
        <LibraryScreen
          books={books}
          onBookSelect={handleBookSelect}
          onBookDelete={(id) => removeBook(id)}
          onAddBook={handleAddBook}
        />
      )}

      {currentView === 'upload' && (
        <div className="min-h-screen bg-background">
          <header className="border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Add Book</h1>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-8">
            <EpubUploader
              onBookLoaded={handleBookLoaded}
              onError={(error) => console.error('Parse error:', error)}
            />
            {isParsing && (
              <p className="mt-4 text-white/60 text-center">Parsing EPUB...</p>
            )}
            {parseError && (
              <p className="mt-4 text-red-400 text-center">{parseError}</p>
            )}
          </main>
        </div>
      )}

      {currentView === 'detail' && selectedBook && (
        <BookDetailView
          book={selectedBook}
          progress={bookProgress}
          currentChapterIndex={progress?.chapterIndex}
          onStartReading={handleStartReading}
          onStartListening={handleStartListening}
          onChapterSelect={(index) => {
            handleChapterChange(index);
            setCurrentView('reader');
          }}
          onBack={handleBack}
          onDelete={handleDeleteBook}
        />
      )}

      {currentView === 'reader' && selectedBook && (
        <ImmersiveReader
          book={selectedBook}
          initialChapterIndex={progress?.chapterIndex ?? 0}
          onChapterChange={handleChapterChange}
          onClose={handleBack}
        />
      )}

      {/* Floating Audio Player (when listening) */}
      {isListening && selectedBook && (
        <FloatingAudioPlayer
          playbackState={{
            isPlaying,
            currentChapterIndex: progress?.chapterIndex ?? 0,
            currentPosition: currentPosition.charIndex,
            rate: settings.ttsRate,
          }}
          chapterTitle={selectedBook.chapters[progress?.chapterIndex ?? 0]?.title ?? 'Unknown'}
          bookTitle={selectedBook.title}
          duration={300} // Estimated duration
          onPlayPause={() => {
            if (isPlaying && !isPaused) {
              ttsPause();
            } else {
              ttsResume();
            }
          }}
          onSeek={() => {/* TTS doesn't support seeking */}}
          onSkipForward={() => {
            const nextIndex = (progress?.chapterIndex ?? 0) + 1;
            if (nextIndex < selectedBook.chapters.length) {
              handleChapterChange(nextIndex);
            }
          }}
          onSkipBackward={() => {
            const prevIndex = (progress?.chapterIndex ?? 0) - 1;
            if (prevIndex >= 0) {
              handleChapterChange(prevIndex);
            }
          }}
          onRateChange={(rate) => {
            setRate(rate);
            updateSettings({ ttsRate: rate });
          }}
          onClose={handleStopListening}
        />
      )}

      {/* Chapter Navigation Drawer */}
      {selectedBook && (
        <ChapterNavigation
          chapters={selectedBook.chapters}
          currentChapterIndex={progress?.chapterIndex ?? 0}
          onChapterSelect={(index) => {
            handleChapterChange(index);
            setShowChapterNav(false);
            if (currentView !== 'reader') {
              setCurrentView('reader');
            }
          }}
          isOpen={showChapterNav}
          onClose={() => setShowChapterNav(false)}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onChange={updateSettings}
        availableVoices={voices}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Global Settings Button (when in library) */}
      {currentView === 'library' && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-4 right-4 p-3 bg-surface rounded-full shadow-lg
                     border border-white/10 text-white/60 hover:text-white
                     transition-colors z-30"
          aria-label="Open settings"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </>
  );
}

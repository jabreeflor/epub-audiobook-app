'use client';

/**
 * ReaderAudioBar Component - DEV-13
 * Audio playback controls bar that integrates TTS with the ImmersiveReader.
 * Provides play/pause, rate control, sentence navigation, and auto-advance.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { Chapter } from '@/types';

interface ReaderAudioBarProps {
  /** Current chapter to read. */
  chapter: Chapter;
  /** All chapters in the book. */
  chapters: Chapter[];
  /** Index of the current chapter. */
  currentChapterIndex: number;
  /** Callback to navigate to a different chapter. */
  onChapterChange: (index: number) => void;
}

const RATE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Audio playback bar for the immersive reader.
 */
export function ReaderAudioBar({
  chapter,
  chapters,
  currentChapterIndex,
  onChapterChange,
}: ReaderAudioBarProps) {
  const tts = useTTS();
  const autoAdvanceRef = useRef(true);
  const currentChapterRef = useRef(currentChapterIndex);

  // Keep ref in sync
  currentChapterRef.current = currentChapterIndex;

  // Auto-advance: when TTS finishes and we were playing, go to next chapter
  useEffect(() => {
    if (
      !tts.isPlaying &&
      !tts.isPaused &&
      autoAdvanceRef.current &&
      tts.currentPosition.totalSentences > 0 &&
      tts.currentPosition.sentenceIndex >= tts.currentPosition.totalSentences - 1 &&
      currentChapterRef.current < chapters.length - 1
    ) {
      const nextIdx = currentChapterRef.current + 1;
      onChapterChange(nextIdx);
      // Play next chapter after a short delay for state to settle
      setTimeout(() => {
        tts.play(chapters[nextIdx].content);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.isPlaying, tts.isPaused]);

  // Stop TTS if chapter changes externally (e.g. manual navigation)
  useEffect(() => {
    tts.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex]);

  const handlePlayPause = useCallback(() => {
    if (tts.isPlaying && !tts.isPaused) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.resume();
    } else {
      autoAdvanceRef.current = true;
      tts.play(chapter.content);
    }
  }, [tts, chapter.content]);

  const handleStop = useCallback(() => {
    autoAdvanceRef.current = false;
    tts.stop();
  }, [tts]);

  const cycleRate = useCallback(() => {
    const idx = RATE_OPTIONS.indexOf(tts.rate);
    const next = RATE_OPTIONS[(idx + 1) % RATE_OPTIONS.length];
    tts.setRate(next);
  }, [tts]);

  const progress = tts.currentPosition.totalSentences > 0
    ? ((tts.currentPosition.sentenceIndex + 1) / tts.currentPosition.totalSentences) * 100
    : 0;

  return (
    <div className="bg-surface/95 backdrop-blur border-t border-white/10 px-4 py-2">
      {/* Sentence progress bar */}
      <div className="h-0.5 bg-white/10 rounded-full mb-2 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left: sentence info */}
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-xs truncate">
            {tts.isPlaying || tts.isPaused
              ? `Sentence ${tts.currentPosition.sentenceIndex + 1} / ${tts.currentPosition.totalSentences}`
              : 'Tap play to listen'}
          </p>
        </div>

        {/* Center: transport controls */}
        <div className="flex items-center gap-2">
          {/* Previous sentence */}
          <button
            onClick={tts.previousSentence}
            disabled={!tts.isPlaying && !tts.isPaused}
            className="p-1.5 text-white/60 hover:text-white disabled:text-white/20 transition-colors"
            aria-label="Previous sentence"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-2 bg-accent rounded-full text-white hover:bg-accent/80 transition-colors"
            aria-label={tts.isPlaying && !tts.isPaused ? 'Pause' : 'Play'}
          >
            {tts.isPlaying && !tts.isPaused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next sentence */}
          <button
            onClick={tts.nextSentence}
            disabled={!tts.isPlaying && !tts.isPaused}
            className="p-1.5 text-white/60 hover:text-white disabled:text-white/20 transition-colors"
            aria-label="Next sentence"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={!tts.isPlaying && !tts.isPaused}
            className="p-1.5 text-white/60 hover:text-white disabled:text-white/20 transition-colors"
            aria-label="Stop"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        </div>

        {/* Right: rate control */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={cycleRate}
            className="px-2 py-1 text-xs font-medium text-white/70 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded transition-colors"
            aria-label={`Playback speed ${tts.rate}x`}
          >
            {tts.rate}×
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReaderAudioBar;

'use client';

/**
 * AudioControls Component - DEV-12
 * Playback controls for the TTS engine: play/pause, skip, rate, voice selection.
 */

import { type UseTTSReturn } from '@/hooks/useTTS';

interface AudioControlsProps {
  tts: UseTTSReturn;
  /** Text to read when play is pressed. */
  text: string;
}

const RATE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function AudioControls({ tts, text }: AudioControlsProps) {
  const {
    play, pause, resume, stop,
    nextSentence, previousSentence,
    setRate, setVoice,
    voices, currentVoice, rate,
    isPlaying, isPaused, currentPosition,
  } = tts;

  const handlePlayPause = () => {
    if (isPaused) return resume();
    if (isPlaying) return pause();
    play(text);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface border border-white/10 p-4">
      {/* Main controls row */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous sentence */}
        <button
          onClick={previousSentence}
          disabled={!isPlaying || currentPosition.sentenceIndex === 0}
          className="p-2 text-white/60 hover:text-white disabled:text-white/20 
                     disabled:cursor-not-allowed transition-colors"
          aria-label="Previous sentence"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full bg-accent hover:bg-accent/80 text-white transition-colors"
          aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
        >
          {isPlaying && !isPaused ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className="p-2 text-white/60 hover:text-white disabled:text-white/20 
                     disabled:cursor-not-allowed transition-colors"
          aria-label="Stop"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        {/* Next sentence */}
        <button
          onClick={nextSentence}
          disabled={!isPlaying || currentPosition.sentenceIndex >= currentPosition.totalSentences - 1}
          className="p-2 text-white/60 hover:text-white disabled:text-white/20 
                     disabled:cursor-not-allowed transition-colors"
          aria-label="Next sentence"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Position indicator */}
      {currentPosition.totalSentences > 0 && (
        <p className="text-center text-white/50 text-xs">
          Sentence {currentPosition.sentenceIndex + 1} of {currentPosition.totalSentences}
        </p>
      )}

      {/* Rate & voice selectors */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Rate selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="tts-rate" className="text-white/50 text-xs whitespace-nowrap">
            Speed
          </label>
          <select
            id="tts-rate"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="bg-background border border-white/10 rounded-lg px-2 py-1 
                       text-white/80 text-xs focus:outline-none focus:border-accent"
          >
            {RATE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </div>

        {/* Voice selector */}
        {voices.length > 0 && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label htmlFor="tts-voice" className="text-white/50 text-xs whitespace-nowrap">
              Voice
            </label>
            <select
              id="tts-voice"
              value={currentVoice?.name ?? ''}
              onChange={(e) => {
                const v = voices.find((v) => v.name === e.target.value);
                if (v) setVoice(v);
              }}
              className="bg-background border border-white/10 rounded-lg px-2 py-1 
                         text-white/80 text-xs focus:outline-none focus:border-accent
                         truncate flex-1 min-w-0"
            >
              <option value="">Default</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioControls;

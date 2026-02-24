'use client';

/**
 * FloatingAudioPlayer Component - DEV-16
 * Floating pill-style audio player with waveform visualization
 */

import { useState, useCallback } from 'react';
import { PlaybackState } from '@/types';
import { WaveformVisualizer } from './WaveformVisualizer';

interface FloatingAudioPlayerProps {
  playbackState: PlaybackState;
  chapterTitle: string;
  bookTitle: string;
  duration: number; // in seconds
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onRateChange: (rate: number) => void;
  onExpand?: () => void;
  onClose?: () => void;
}

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function FloatingAudioPlayer({
  playbackState,
  chapterTitle,
  bookTitle,
  duration,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onRateChange,
  onExpand,
  onClose,
}: FloatingAudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRateMenu, setShowRateMenu] = useState(false);

  const { isPlaying, currentPosition, rate } = playbackState;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentPosition / duration) * 100 : 0;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newPosition = percentage * duration;
    onSeek(Math.max(0, Math.min(duration, newPosition)));
  }, [duration, onSeek]);

  const cyclePlaybackRate = () => {
    const currentIndex = playbackRates.indexOf(rate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    onRateChange(playbackRates[nextIndex]);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
      <div 
        className={`
          bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10
          pointer-events-auto transition-all duration-300
          ${isExpanded ? 'w-full max-w-lg' : 'w-full max-w-sm'}
        `}
      >
        {/* Waveform (shown when expanded) */}
        {isExpanded && (
          <div className="px-4 pt-4">
            <WaveformVisualizer 
              isPlaying={isPlaying} 
              progress={progress}
              onClick={handleProgressClick}
            />
          </div>
        )}

        {/* Progress Bar */}
        <div 
          className="h-1 bg-white/10 cursor-pointer mx-4 mt-3 rounded-full overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-accent transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Controls */}
        <div className="p-4 flex items-center gap-3">
          {/* Skip Backward */}
          <button
            onClick={onSkipBackward}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Skip backward 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-3 bg-accent rounded-full text-white hover:bg-accent/90 
                       transition-colors shadow-lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={onSkipForward}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Skip forward 10 seconds"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          {/* Track Info */}
          <div className="flex-1 min-w-0 mx-2">
            <p className="text-white text-sm font-medium truncate">{chapterTitle}</p>
            <p className="text-white/50 text-xs truncate">{bookTitle}</p>
          </div>

          {/* Time */}
          <div className="text-white/60 text-xs tabular-nums">
            {formatTime(currentPosition)} / {formatTime(duration)}
          </div>

          {/* Playback Rate */}
          <div className="relative">
            <button
              onClick={cyclePlaybackRate}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowRateMenu(!showRateMenu);
              }}
              className="px-2 py-1 text-xs font-medium text-white/70 hover:text-white 
                         bg-white/10 rounded-lg transition-colors"
              aria-label="Change playback speed"
            >
              {rate}x
            </button>
            
            {/* Rate Menu */}
            {showRateMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-surface rounded-lg 
                              border border-white/10 shadow-xl overflow-hidden">
                {playbackRates.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRateChange(r);
                      setShowRateMenu(false);
                    }}
                    className={`
                      block w-full px-4 py-2 text-sm text-left transition-colors
                      ${rate === r ? 'bg-accent text-white' : 'text-white/70 hover:bg-white/10'}
                    `}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              onExpand?.();
            }}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M5 15l7-7 7 7" />
              )}
            </svg>
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close player"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloatingAudioPlayer;

/**
 * useAudioPlayer Hook - DEV-16
 * Manages audio playback state and controls
 * Designed to work with the TTS engine (DEV-12)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { PlaybackState } from '@/types';

interface UseAudioPlayerOptions {
  onChapterEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseAudioPlayerReturn {
  playbackState: PlaybackState;
  isLoading: boolean;
  error: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (position: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setRate: (rate: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

const DEFAULT_SKIP_SECONDS = 10;

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const { onChapterEnd, onError } = options;

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentChapterIndex: 0,
    currentPosition: 0,
    rate: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDurationState] = useState(0);

  const positionInterval = useRef<NodeJS.Timeout>();

  // Simulate position updates while playing
  // In production, this would be driven by the actual TTS engine
  useEffect(() => {
    if (playbackState.isPlaying && duration > 0) {
      positionInterval.current = setInterval(() => {
        setPlaybackState(prev => {
          const newPosition = prev.currentPosition + (0.1 * prev.rate);
          
          if (newPosition >= duration) {
            // Chapter ended
            clearInterval(positionInterval.current);
            onChapterEnd?.();
            return { ...prev, isPlaying: false, currentPosition: duration };
          }
          
          return { ...prev, currentPosition: newPosition };
        });
      }, 100);

      return () => {
        if (positionInterval.current) {
          clearInterval(positionInterval.current);
        }
      };
    }
  }, [playbackState.isPlaying, playbackState.rate, duration, onChapterEnd]);

  const play = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    setError(null);
  }, []);

  const pause = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const seek = useCallback((position: number) => {
    setPlaybackState(prev => ({
      ...prev,
      currentPosition: Math.max(0, Math.min(duration, position)),
    }));
  }, [duration]);

  const skipForward = useCallback((seconds = DEFAULT_SKIP_SECONDS) => {
    setPlaybackState(prev => ({
      ...prev,
      currentPosition: Math.min(duration, prev.currentPosition + seconds),
    }));
  }, [duration]);

  const skipBackward = useCallback((seconds = DEFAULT_SKIP_SECONDS) => {
    setPlaybackState(prev => ({
      ...prev,
      currentPosition: Math.max(0, prev.currentPosition - seconds),
    }));
  }, []);

  const setRate = useCallback((rate: number) => {
    setPlaybackState(prev => ({ ...prev, rate }));
  }, []);

  const setDuration = useCallback((newDuration: number) => {
    setDurationState(newDuration);
  }, []);

  const reset = useCallback(() => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current);
    }
    setPlaybackState({
      isPlaying: false,
      currentChapterIndex: 0,
      currentPosition: 0,
      rate: 1,
    });
    setDurationState(0);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    playbackState,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    skipForward,
    skipBackward,
    setRate,
    setDuration,
    reset,
  };
}

export default useAudioPlayer;

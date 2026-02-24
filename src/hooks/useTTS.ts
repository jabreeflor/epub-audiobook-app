'use client';

/**
 * useTTS Hook - DEV-12
 * React hook wrapping the TTSEngine for easy component integration.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TTSEngine, type TTSPosition } from '@/lib/tts-engine';

export interface UseTTSReturn {
  /** Start reading the given text aloud. */
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** Skip to next sentence. */
  nextSentence: () => void;
  /** Skip to previous sentence. */
  previousSentence: () => void;
  /** Set playback rate (0.5–3). */
  setRate: (rate: number) => void;
  /** Set voice by SpeechSynthesisVoice object. */
  setVoice: (voice: SpeechSynthesisVoice) => void;
  /** Available system voices. */
  voices: SpeechSynthesisVoice[];
  /** Currently selected voice. */
  currentVoice: SpeechSynthesisVoice | null;
  /** Current playback rate. */
  rate: number;
  isPlaying: boolean;
  isPaused: boolean;
  /** Current sentence position within the text. */
  currentPosition: TTSPosition;
}

const defaultPosition: TTSPosition = { sentenceIndex: 0, totalSentences: 0, charIndex: 0 };

export function useTTS(): UseTTSReturn {
  const engineRef = useRef<TTSEngine | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRateState] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<TTSPosition>(defaultPosition);

  // Initialize engine
  useEffect(() => {
    const engine = new TTSEngine();
    engineRef.current = engine;

    engine.setCallbacks({
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentPosition(engine.getCurrentPosition());
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPosition(engine.getCurrentPosition());
      },
      onPause: () => setIsPaused(true),
      onResume: () => setIsPaused(false),
      onSentenceChange: () => {
        setCurrentPosition(engine.getCurrentPosition());
      },
      onError: (err) => console.error('[TTS]', err),
    });

    // Load voices (they may load async)
    const loadVoices = () => {
      const v = engine.getVoices();
      if (v.length) setVoices(v);
    };

    loadVoices();
    engine.onVoicesChanged(loadVoices);

    return () => {
      engine.offVoicesChanged(loadVoices);
      engine.stop();
    };
  }, []);

  const play = useCallback((text: string) => {
    engineRef.current?.play(text);
  }, []);

  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const stop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const nextSentence = useCallback(() => engineRef.current?.nextSentence(), []);
  const previousSentence = useCallback(() => engineRef.current?.previousSentence(), []);

  const setRate = useCallback((r: number) => {
    engineRef.current?.setRate(r);
    setRateState(r);
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    engineRef.current?.setVoiceByObject(voice);
    setCurrentVoice(voice);
  }, []);

  return {
    play, pause, resume, stop,
    nextSentence, previousSentence,
    setRate, setVoice,
    voices, currentVoice, rate,
    isPlaying, isPaused, currentPosition,
  };
}

export default useTTS;

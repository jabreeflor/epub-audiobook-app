/**
 * useTTSVoices Hook - DEV-18
 * Gets available speech synthesis voices
 */

import { useState, useEffect } from 'react';

export function useTTSVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Initial load
    loadVoices();

    // Chrome loads voices asynchronously
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}

export default useTTSVoices;

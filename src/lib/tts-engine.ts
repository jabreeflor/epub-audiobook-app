/**
 * TTS Engine - DEV-12
 * Web Speech API text-to-speech engine with sentence-level control,
 * voice selection, rate/pitch adjustment, and event callbacks.
 */

/** Callback types for TTS events */
export interface TTSCallbacks {
  onStart?: (sentenceIndex: number) => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (event: { charIndex: number; charLength: number; word: string }) => void;
  onError?: (error: string) => void;
  onSentenceChange?: (sentenceIndex: number) => void;
}

/** Current position within the queued text */
export interface TTSPosition {
  sentenceIndex: number;
  totalSentences: number;
  charIndex: number;
}

/**
 * Split text into sentences using common punctuation boundaries.
 * Keeps the delimiter attached to each sentence.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text.trim()) return [];

  // Split on sentence-ending punctuation followed by whitespace or end
  const raw = text.match(/[^.!?]*[.!?]+[\s]*/g);

  if (!raw) {
    // No sentence-ending punctuation – treat the whole text as one sentence
    return [text.trim()];
  }

  // Capture any trailing text that doesn't end with punctuation
  const joined = raw.join('');
  const remainder = text.slice(joined.length).trim();

  const sentences = raw.map((s) => s.trim()).filter(Boolean);
  if (remainder) sentences.push(remainder);

  return sentences;
}

/**
 * TTSEngine – drives the Web Speech API with sentence-level queue management.
 */
export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private sentences: string[] = [];
  private currentIndex = 0;
  private _isPlaying = false;
  private _isPaused = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private _rate = 1;
  private _pitch = 1;
  private callbacks: TTSCallbacks = {};
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  /* ───── Voice helpers ───── */

  /** List available voices (may be empty until voiceschanged fires). */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() ?? [];
  }

  /** Register a callback for when voices finish loading. */
  onVoicesChanged(cb: () => void): void {
    this.synth?.addEventListener('voiceschanged', cb);
  }

  /** Remove voiceschanged listener. */
  offVoicesChanged(cb: () => void): void {
    this.synth?.removeEventListener('voiceschanged', cb);
  }

  /** Pick a voice by name or language prefix (e.g. "en"). */
  setVoice(nameOrLang: string): void {
    const voices = this.getVoices();
    const match =
      voices.find((v) => v.name === nameOrLang) ??
      voices.find((v) => v.lang.startsWith(nameOrLang));
    if (match) this.selectedVoice = match;
  }

  setVoiceByObject(voice: SpeechSynthesisVoice): void {
    this.selectedVoice = voice;
  }

  /* ───── Rate / Pitch ───── */

  setRate(rate: number): void {
    this._rate = Math.max(0.5, Math.min(3, rate));
  }

  getRate(): number {
    return this._rate;
  }

  setPitch(pitch: number): void {
    this._pitch = Math.max(0, Math.min(2, pitch));
  }

  getPitch(): number {
    return this._pitch;
  }

  /* ───── Callbacks ───── */

  setCallbacks(cbs: TTSCallbacks): void {
    this.callbacks = cbs;
  }

  /* ───── Playback ───── */

  /** Load text, split into sentences, and start playing from the beginning. */
  play(text: string, startIndex = 0): void {
    if (!this.synth) {
      this.callbacks.onError?.('Speech synthesis not supported');
      return;
    }

    this.stop();

    this.sentences = splitIntoSentences(text);
    if (this.sentences.length === 0) return;

    this.currentIndex = Math.max(0, Math.min(startIndex, this.sentences.length - 1));
    this._isPlaying = true;
    this._isPaused = false;

    this.speakCurrent();
  }

  pause(): void {
    if (!this.synth || !this._isPlaying) return;
    this.synth.pause();
    this._isPaused = true;
    this.callbacks.onPause?.();
  }

  resume(): void {
    if (!this.synth || !this._isPaused) return;
    this.synth.resume();
    this._isPaused = false;
    this.callbacks.onResume?.();
  }

  stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this._isPlaying = false;
    this._isPaused = false;
    this.currentUtterance = null;
  }

  /** Skip to next sentence. */
  nextSentence(): void {
    if (this.currentIndex < this.sentences.length - 1) {
      this.synth?.cancel(); // triggers end → handled by speakCurrent chain
      this.currentIndex++;
      this.speakCurrent();
    }
  }

  /** Skip to previous sentence. */
  previousSentence(): void {
    if (this.currentIndex > 0) {
      this.synth?.cancel();
      this.currentIndex--;
      this.speakCurrent();
    }
  }

  /* ───── State ───── */

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  getCurrentPosition(): TTSPosition {
    return {
      sentenceIndex: this.currentIndex,
      totalSentences: this.sentences.length,
      charIndex: 0,
    };
  }

  /* ───── Internal ───── */

  private speakCurrent(): void {
    if (!this.synth || this.currentIndex >= this.sentences.length) {
      this._isPlaying = false;
      this.callbacks.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(this.sentences[this.currentIndex]);
    utterance.rate = this._rate;
    utterance.pitch = this._pitch;
    if (this.selectedVoice) utterance.voice = this.selectedVoice;

    utterance.onstart = () => {
      this.callbacks.onStart?.(this.currentIndex);
      this.callbacks.onSentenceChange?.(this.currentIndex);
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const word = this.sentences[this.currentIndex].slice(
          e.charIndex,
          e.charIndex + e.charLength,
        );
        this.callbacks.onBoundary?.({
          charIndex: e.charIndex,
          charLength: e.charLength,
          word,
        });
      }
    };

    utterance.onend = () => {
      // Auto-advance to next sentence
      if (this._isPlaying && !this._isPaused) {
        this.currentIndex++;
        this.speakCurrent();
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled') return; // expected on stop/skip
      this.callbacks.onError?.(e.error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export default TTSEngine;

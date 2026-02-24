// Shared TypeScript types for the EPUB Audiobook Reader

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  index: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentChapterIndex: number;
  currentPosition: number;
  rate: number;
}

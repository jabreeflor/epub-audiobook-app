/**
 * EPUB Parser - DEV-11
 * Parses EPUB files and extracts book metadata, chapters, and content
 * using the epubjs library.
 */

import ePub, { Book as EpubBook, NavItem } from 'epubjs';
import { Book, Chapter } from '@/types';

/**
 * Parses an EPUB file and returns a structured Book object
 * @param file - File object or ArrayBuffer of the EPUB
 * @returns Promise<Book> - Parsed book with metadata and chapters
 */
export async function parseEpub(file: File | ArrayBuffer): Promise<Book> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const book = ePub(arrayBuffer);
  
  await book.ready;
  
  const metadata = await book.loaded.metadata;
  const navigation = await book.loaded.navigation;
  const cover = await getCoverUrl(book);
  
  const chapters = await extractChapters(book, navigation.toc);
  
  return {
    id: generateBookId(metadata.title, metadata.creator),
    title: metadata.title || 'Untitled',
    author: metadata.creator || 'Unknown Author',
    coverUrl: cover,
    chapters,
  };
}

/**
 * Extracts the cover image URL from the EPUB
 */
async function getCoverUrl(book: EpubBook): Promise<string | undefined> {
  try {
    const coverUrl = await book.coverUrl();
    return coverUrl || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extracts chapters from the EPUB navigation
 */
async function extractChapters(book: EpubBook, toc: NavItem[]): Promise<Chapter[]> {
  const chapters: Chapter[] = [];
  
  // Flatten nested TOC if needed
  const flatToc = flattenToc(toc);
  
  for (let i = 0; i < flatToc.length; i++) {
    const navItem = flatToc[i];
    const content = await extractChapterContent(book, navItem.href);
    
    chapters.push({
      id: navItem.id || `chapter-${i}`,
      title: navItem.label?.trim() || `Chapter ${i + 1}`,
      content,
      index: i,
    });
  }
  
  // If no TOC, try to get chapters from spine
  if (chapters.length === 0) {
    const spineChapters = await extractChaptersFromSpine(book);
    return spineChapters;
  }
  
  return chapters;
}

/**
 * Flattens nested TOC structure into a single array
 */
function flattenToc(toc: NavItem[], result: NavItem[] = []): NavItem[] {
  for (const item of toc) {
    result.push(item);
    if (item.subitems && item.subitems.length > 0) {
      flattenToc(item.subitems, result);
    }
  }
  return result;
}

/**
 * Extracts plain text content from a chapter
 */
async function extractChapterContent(book: EpubBook, href: string): Promise<string> {
  try {
    // Get the section from the spine
    const section = book.spine.get(href);
    if (!section) {
      return '';
    }
    
    // Load the section content using the book's request function
    const contents = await section.load(book.load.bind(book) as never);
    
    // Extract text content, stripping HTML tags
    const text = extractTextFromHtml(contents as Document);
    
    return cleanText(text);
  } catch (error) {
    console.error(`Error extracting content for ${href}:`, error);
    return '';
  }
}

/**
 * Extracts chapters directly from the spine when TOC is unavailable
 */
async function extractChaptersFromSpine(book: EpubBook): Promise<Chapter[]> {
  const chapters: Chapter[] = [];
  const spine = book.spine as unknown as { items: Array<{ href: string; index: number }> };
  
  for (let i = 0; i < spine.items.length; i++) {
    const item = spine.items[i];
    const content = await extractChapterContent(book, item.href);
    
    // Skip empty chapters or very short ones (likely front matter)
    if (content.length < 100) continue;
    
    chapters.push({
      id: `spine-${i}`,
      title: `Chapter ${chapters.length + 1}`,
      content,
      index: chapters.length,
    });
  }
  
  return chapters;
}

/**
 * Extracts text content from an HTML document
 */
function extractTextFromHtml(doc: Document): string {
  if (!doc || !doc.body) {
    return '';
  }
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get text content
  return doc.body.textContent || '';
}

/**
 * Cleans and normalizes text content
 */
function cleanText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}

/**
 * Generates a unique book ID from title and author
 */
function generateBookId(title: string, author: string): string {
  const base = `${title}-${author}`.toLowerCase();
  const hash = base
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  return `book-${Math.abs(hash).toString(36)}`;
}

/**
 * Validates if a file is a valid EPUB
 */
export function isValidEpub(file: File): boolean {
  const validTypes = [
    'application/epub+zip',
    'application/epub',
  ];
  
  // Check MIME type
  if (validTypes.includes(file.type)) {
    return true;
  }
  
  // Fallback to extension check
  return file.name.toLowerCase().endsWith('.epub');
}

/**
 * Gets the total word count of a book
 */
export function getBookWordCount(book: Book): number {
  return book.chapters.reduce((total, chapter) => {
    const words = chapter.content.split(/\s+/).filter(w => w.length > 0);
    return total + words.length;
  }, 0);
}

/**
 * Estimates reading time in minutes
 * Based on average reading speed of 200 words per minute
 */
export function estimateReadingTime(book: Book, wordsPerMinute = 200): number {
  const wordCount = getBookWordCount(book);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Estimates listening time in minutes based on TTS speed
 * Average TTS speaks ~150 words per minute at 1x speed
 */
export function estimateListeningTime(book: Book, rate = 1, wordsPerMinute = 150): number {
  const wordCount = getBookWordCount(book);
  return Math.ceil(wordCount / (wordsPerMinute * rate));
}

export type { Book, Chapter };

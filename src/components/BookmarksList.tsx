'use client';

/**
 * BookmarksList Component - DEV-14
 * Displays all bookmarks for a book with navigation, notes, and delete.
 */

import { useState } from 'react';
import { Bookmark } from '@/hooks/useBookmarks';

interface BookmarksListProps {
  /** Bookmarks to display. */
  bookmarks: Bookmark[];
  /** Chapter titles for display. */
  chapterTitles: string[];
  /** Navigate to a bookmark. */
  onNavigate: (chapterIndex: number, scrollPosition: number) => void;
  /** Delete a bookmark. */
  onDelete: (id: string) => void;
  /** Update a bookmark's note. */
  onUpdateNote: (id: string, note: string) => void;
  /** Close the list. */
  onClose: () => void;
}

/**
 * Slide-over panel listing all bookmarks for a book.
 */
export function BookmarksList({
  bookmarks,
  chapterTitles,
  onNavigate,
  onDelete,
  onUpdateNote,
  onClose,
}: BookmarksListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const startEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditNote(bm.note);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateNote(editingId, editNote);
      setEditingId(null);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-surface border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white/90 font-semibold text-lg">Bookmarks</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white transition-colors"
            aria-label="Close bookmarks"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 px-6">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-sm text-center">No bookmarks yet. Tap the bookmark icon while reading to save your place.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {bookmarks.map(bm => (
                <li key={bm.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onNavigate(bm.chapterIndex, bm.scrollPosition)}
                      className="flex-1 text-left"
                    >
                      <p className="text-white/80 text-sm font-medium">
                        {chapterTitles[bm.chapterIndex] || `Chapter ${bm.chapterIndex + 1}`}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {Math.round(bm.scrollPosition * 100)}% · {formatDate(bm.createdAt)}
                      </p>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(bm)}
                        className="p-1 text-white/40 hover:text-white/70 transition-colors"
                        aria-label="Edit note"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(bm.id)}
                        className="p-1 text-white/40 hover:text-red-400 transition-colors"
                        aria-label="Delete bookmark"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Note display / edit */}
                  {editingId === bm.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        placeholder="Add a note…"
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 
                                   text-sm text-white/80 placeholder:text-white/30 
                                   focus:outline-none focus:border-accent"
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent/80 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : bm.note ? (
                    <p className="mt-1.5 text-white/50 text-xs italic">&ldquo;{bm.note}&rdquo;</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookmarksList;

'use client';

/**
 * LibraryScreen Component - DEV-19
 * Main library view showing all uploaded books
 */

import { useState, useMemo } from 'react';
import { Book } from '@/types';

interface LibraryBook extends Book {
  addedAt: number;
  lastReadAt?: number;
  progress?: number; // 0-100
}

interface LibraryScreenProps {
  books: LibraryBook[];
  onBookSelect: (book: LibraryBook) => void;
  onBookDelete?: (bookId: string) => void;
  onAddBook: () => void;
}

type SortOption = 'recent' | 'title' | 'author' | 'progress';
type ViewMode = 'grid' | 'list';

export function LibraryScreen({
  books,
  onBookSelect,
  onBookDelete,
  onAddBook,
}: LibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.lastReadAt || b.addedAt) - (a.lastReadAt || a.addedAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [books, searchQuery, sortBy]);

  const handleDelete = (bookId: string) => {
    onBookDelete?.(bookId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">My Library</h1>
            <button
              onClick={onAddBook}
              className="px-4 py-2 bg-accent text-white font-medium rounded-lg
                         hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4v16m8-8H4" />
              </svg>
              Add Book
            </button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/40 focus:outline-none focus:border-accent"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-white focus:outline-none focus:border-accent"
            >
              <option value="recent">Recently Read</option>
              <option value="title">Title A-Z</option>
              <option value="author">Author A-Z</option>
              <option value="progress">Progress</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-accent text-white' : 'text-white/60 hover:bg-white/5'
                }`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' ? 'bg-accent text-white' : 'text-white/60 hover:bg-white/5'
                }`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {books.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-white/20">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zm-1 14H4V6h16v12zM9.5 8.5a1 1 0 00-1 1v5a1 1 0 002 0v-5a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v5a1 1 0 002 0v-5a1 1 0 00-1-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Your library is empty</h2>
            <p className="text-white/50 mb-6">Add your first EPUB to get started</p>
            <button
              onClick={onAddBook}
              className="px-6 py-3 bg-accent text-white font-medium rounded-lg
                         hover:bg-accent/90 transition-colors"
            >
              Add Your First Book
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          // No Results
          <div className="text-center py-16">
            <p className="text-white/50">No books match &quot;{searchQuery}&quot;</p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={() => onBookSelect(book)}
                onDelete={onBookDelete ? () => setShowDeleteConfirm(book.id) : undefined}
              />
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <BookListItem
                key={book.id}
                book={book}
                onSelect={() => onBookSelect(book)}
                onDelete={onBookDelete ? () => setShowDeleteConfirm(book.id) : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-surface rounded-xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Book?</h3>
            <p className="text-white/60 mb-6">
              This will remove the book from your library. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-white/20 text-white/70 rounded-lg
                           hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg
                           hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Book Card Component (Grid View)
function BookCard({
  book,
  onSelect,
  onDelete,
}: {
  book: LibraryBook;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
      >
        {/* Cover */}
        <div className="aspect-[2/3] bg-surface rounded-lg overflow-hidden mb-2 relative">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
              <span className="text-4xl font-bold text-accent/50">
                {book.title.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Progress Overlay */}
          {book.progress !== undefined && book.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div 
                className="h-full bg-accent"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-white truncate">{book.title}</h3>
        <p className="text-xs text-white/50 truncate">{book.author}</p>
      </button>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full
                     text-white/60 hover:text-white hover:bg-black/70
                     opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete book"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Book List Item Component (List View)
function BookListItem({
  book,
  onSelect,
  onDelete,
}: {
  book: LibraryBook;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div 
      className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-white/5
                 hover:border-white/10 transition-colors group"
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-4 flex-1 text-left"
      >
        {/* Cover */}
        <div className="w-12 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/10">
              <span className="text-lg font-bold text-accent/50">
                {book.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{book.title}</h3>
          <p className="text-sm text-white/50 truncate">{book.author}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
            <span>{book.chapters.length} chapters</span>
            {book.lastReadAt && (
              <span>Last read {formatDate(book.lastReadAt)}</span>
            )}
          </div>
        </div>

        {/* Progress */}
        {book.progress !== undefined && book.progress > 0 && (
          <div className="text-right">
            <div className="text-sm text-white/70">{Math.round(book.progress)}%</div>
            <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
              <div 
                className="h-full bg-accent rounded-full"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-white/40 hover:text-red-400 transition-colors
                     opacity-0 group-hover:opacity-100"
          aria-label="Delete book"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export type { LibraryBook };
export default LibraryScreen;

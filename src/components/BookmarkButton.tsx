'use client';

/**
 * BookmarkButton Component - DEV-14
 * Toggle bookmark at the current reading position.
 */

interface BookmarkButtonProps {
  /** Whether a bookmark exists at the current position. */
  isBookmarked: boolean;
  /** Toggle the bookmark. */
  onToggle: () => void;
  /** Optional additional class names. */
  className?: string;
}

/**
 * A bookmark toggle button with filled/outlined states.
 */
export function BookmarkButton({ isBookmarked, onToggle, className = '' }: BookmarkButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 transition-colors ${
        isBookmarked
          ? 'text-accent hover:text-accent/80'
          : 'text-white/60 hover:text-white'
      } ${className}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}

export default BookmarkButton;

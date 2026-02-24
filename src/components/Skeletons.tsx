'use client';

/**
 * Skeleton Components - Polish
 * Loading placeholders for better perceived performance
 */

import { ReactNode } from 'react';

// Base skeleton with shimmer animation
function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`bg-white/10 rounded animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// Book card skeleton for library grid
export function BookCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-white/10 rounded-lg mb-2" />
      <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  );
}

// Book list item skeleton
export function BookListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 bg-surface rounded-lg animate-pulse">
      <div className="w-12 h-16 bg-white/10 rounded" />
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
        <div className="h-2 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  );
}

// Library grid skeleton
export function LibraryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Library list skeleton
export function LibraryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <BookListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Chapter list skeleton
export function ChapterListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="flex-1 h-4 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

// Book detail skeleton
export function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero */}
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-40 h-56 bg-white/10 rounded-xl self-center sm:self-start" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="flex gap-4 mt-4">
              <div className="h-4 bg-white/10 rounded w-20" />
              <div className="h-4 bg-white/10 rounded w-20" />
              <div className="h-4 bg-white/10 rounded w-20" />
            </div>
            <div className="flex gap-3 mt-6">
              <div className="h-12 bg-white/10 rounded-lg flex-1" />
              <div className="h-12 bg-white/10 rounded-lg flex-1" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-white/10 px-6">
        <div className="flex gap-8">
          <div className="h-4 bg-white/10 rounded w-20 py-4" />
          <div className="h-4 bg-white/10 rounded w-16 py-4" />
        </div>
      </div>
      
      {/* Chapter list */}
      <div className="p-6">
        <ChapterListSkeleton count={8} />
      </div>
    </div>
  );
}

// Reader content skeleton
export function ReaderContentSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-2/3 mb-8" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Settings panel skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-10 bg-white/10 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

// Full page loading
export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-accent border-t-transparent 
                        rounded-full animate-spin" />
        <p className="text-white/60">{message}</p>
      </div>
    </div>
  );
}

// Inline spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div className={`${sizes[size]} border-accent border-t-transparent rounded-full animate-spin`} />
  );
}

// Skeleton wrapper with conditional loading
export function SkeletonWrapper({ 
  isLoading, 
  skeleton, 
  children 
}: { 
  isLoading: boolean; 
  skeleton: ReactNode; 
  children: ReactNode;
}) {
  return isLoading ? <>{skeleton}</> : <>{children}</>;
}

const Skeletons = {
  BookCardSkeleton,
  BookListItemSkeleton,
  LibraryGridSkeleton,
  LibraryListSkeleton,
  ChapterListSkeleton,
  BookDetailSkeleton,
  ReaderContentSkeleton,
  SettingsSkeleton,
  FullPageLoader,
  Spinner,
  SkeletonWrapper,
};

export default Skeletons;

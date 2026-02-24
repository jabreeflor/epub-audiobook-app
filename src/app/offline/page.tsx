'use client';

/**
 * Offline Fallback Page - DEV-21
 * Shown when user is offline and page isn't cached
 */

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-6 text-white/20">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zM17.04 15.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7L12 21.5l3.07-3.94 4.43 4.43 1.28-1.28-3.74-3.49zM12 13.5l-2.02-2.02-2.76-2.75C5.4 9.27 4 9.97 3.64 10.22L12 21.5l2.03-2.61-2.03-5.39z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re Offline</h1>
        
        <p className="text-white/60 mb-6">
          It looks like you&apos;ve lost your internet connection. 
          Don&apos;t worry — any books you&apos;ve already opened are still available!
        </p>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full px-6 py-3 bg-accent text-white font-medium rounded-lg
                       hover:bg-accent/90 transition-colors"
          >
            Go to Library
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="block w-full px-6 py-3 border border-white/20 text-white/70 
                       rounded-lg hover:border-white/40 transition-colors"
          >
            Try Again
          </button>
        </div>

        <p className="mt-8 text-sm text-white/40">
          Tip: Open books while online to make them available offline.
        </p>
      </div>
    </div>
  );
}

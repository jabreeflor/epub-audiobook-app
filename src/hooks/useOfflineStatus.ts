/**
 * useOfflineStatus Hook - DEV-21
 * Tracks online/offline status with SSR safety
 */

import { useState, useEffect } from 'react';

export function useOfflineStatus(): { isOnline: boolean; isOffline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

export default useOfflineStatus;

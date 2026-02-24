/**
 * useAppSettings Hook - DEV-18
 * Persists app settings to localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, defaultAppSettings } from '@/components/SettingsPanel';

const STORAGE_KEY = 'epub-reader-settings';

interface UseAppSettingsReturn {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isLoaded: boolean;
}

export function useAppSettings(): UseAppSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings added in updates
        setSettings({ ...defaultAppSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultAppSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
}

export default useAppSettings;

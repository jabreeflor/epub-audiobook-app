'use client';

/**
 * ReaderSettings Component - DEV-15
 * Settings panel for customizing the reading experience
 */

import { useState } from 'react';

export interface ReaderSettingsValues {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  theme: 'dark' | 'sepia' | 'light';
}

interface ReaderSettingsProps {
  settings: ReaderSettingsValues;
  onChange: (settings: ReaderSettingsValues) => void;
  isOpen: boolean;
  onClose: () => void;
}

const fontFamilies = [
  { value: 'sans', label: 'Sans Serif', className: 'font-sans' },
  { value: 'serif', label: 'Serif', className: 'font-serif' },
  { value: 'mono', label: 'Monospace', className: 'font-mono' },
] as const;

const themes = [
  { value: 'dark', label: 'Dark', bg: '#0d1117', text: '#ffffff' },
  { value: 'sepia', label: 'Sepia', bg: '#f4ecd8', text: '#5b4636' },
  { value: 'light', label: 'Light', bg: '#ffffff', text: '#1a1a1a' },
] as const;

export function ReaderSettings({ 
  settings, 
  onChange, 
  isOpen, 
  onClose 
}: ReaderSettingsProps) {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof ReaderSettingsValues>(
    key: K,
    value: ReaderSettingsValues[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl p-6 
                      animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Reading Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-3">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min={12}
              max={32}
              step={2}
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-3">
              Line Spacing: {settings.lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min={1.2}
              max={2.4}
              step={0.2}
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>Compact</span>
              <span>Relaxed</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-3">Font Style</label>
            <div className="flex gap-2">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => updateSetting('fontFamily', font.value)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg border transition-all
                    ${font.className}
                    ${settings.fontFamily === font.value
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                    }
                  `}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-3">Theme</label>
            <div className="flex gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSetting('theme', theme.value)}
                  className={`
                    flex-1 py-3 px-3 rounded-lg border transition-all flex flex-col items-center gap-1
                    ${settings.theme === theme.value
                      ? 'border-accent'
                      : 'border-white/20 hover:border-white/40'
                    }
                  `}
                >
                  <div 
                    className="w-8 h-8 rounded-full border border-white/20"
                    style={{ background: theme.bg }}
                  />
                  <span className="text-white/70 text-xs">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border border-white/10">
            <p className="text-white/50 text-xs mb-2">Preview</p>
            <p 
              className={`text-white/90 ${fontFamilies.find(f => f.value === settings.fontFamily)?.className}`}
              style={{ 
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
              }}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export const defaultReaderSettings: ReaderSettingsValues = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  theme: 'dark',
};

export default ReaderSettings;

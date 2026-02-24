'use client';

/**
 * SettingsPanel Component - DEV-18
 * Comprehensive app-wide settings panel
 */

import { useState, useEffect } from 'react';

export interface AppSettings {
  // TTS Settings
  ttsVoice: string;
  ttsRate: number;
  ttsPitch: number;
  autoPlayNextChapter: boolean;
  
  // Reading Settings
  fontSize: number;
  lineHeight: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  theme: 'dark' | 'sepia' | 'light';
  
  // Playback Settings
  defaultPlaybackRate: number;
  sleepTimerMinutes: number | null;
  
  // Storage Settings
  offlineMode: boolean;
  cacheSize: number; // in MB
}

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  availableVoices: SpeechSynthesisVoice[];
  isOpen: boolean;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { value: 'sans', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
] as const;

const THEMES = [
  { value: 'dark', label: 'Dark', color: '#0d1117' },
  { value: 'sepia', label: 'Sepia', color: '#f4ecd8' },
  { value: 'light', label: 'Light', color: '#ffffff' },
] as const;

const SLEEP_TIMER_OPTIONS = [
  { value: null, label: 'Off' },
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
];

export function SettingsPanel({
  settings,
  onChange,
  availableVoices,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<'tts' | 'reading' | 'playback' | 'storage'>('tts');

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const sections = [
    { id: 'tts', label: 'Text-to-Speech', icon: '🔊' },
    { id: 'reading', label: 'Reading', icon: '📖' },
    { id: 'playback', label: 'Playback', icon: '▶️' },
    { id: 'storage', label: 'Storage', icon: '💾' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface rounded-2xl 
                      shadow-2xl border border-white/10 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg
                       hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-48 border-r border-white/10 p-2 flex-shrink-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full px-4 py-3 text-left rounded-lg flex items-center gap-3
                  transition-colors mb-1
                  ${activeSection === section.id 
                    ? 'bg-accent/20 text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* TTS Section */}
            {activeSection === 'tts' && (
              <div className="space-y-6">
                <SectionTitle>Text-to-Speech Settings</SectionTitle>

                {/* Voice Selection */}
                <SettingRow label="Voice">
                  <select
                    value={settings.ttsVoice}
                    onChange={(e) => updateSetting('ttsVoice', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2
                               text-white focus:outline-none focus:border-accent"
                  >
                    {availableVoices.length === 0 ? (
                      <option value="">Loading voices...</option>
                    ) : (
                      availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                </SettingRow>

                {/* TTS Rate */}
                <SettingRow label={`Speech Rate: ${settings.ttsRate.toFixed(1)}x`}>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={settings.ttsRate}
                    onChange={(e) => updateSetting('ttsRate', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* TTS Pitch */}
                <SettingRow label={`Pitch: ${settings.ttsPitch.toFixed(1)}`}>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={settings.ttsPitch}
                    onChange={(e) => updateSetting('ttsPitch', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* Auto-play */}
                <SettingRow label="Auto-play next chapter">
                  <Toggle
                    checked={settings.autoPlayNextChapter}
                    onChange={(checked) => updateSetting('autoPlayNextChapter', checked)}
                  />
                </SettingRow>
              </div>
            )}

            {/* Reading Section */}
            {activeSection === 'reading' && (
              <div className="space-y-6">
                <SectionTitle>Reading Settings</SectionTitle>

                {/* Font Size */}
                <SettingRow label={`Font Size: ${settings.fontSize}px`}>
                  <input
                    type="range"
                    min={12}
                    max={32}
                    step={2}
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* Line Height */}
                <SettingRow label={`Line Spacing: ${settings.lineHeight.toFixed(1)}`}>
                  <input
                    type="range"
                    min={1.2}
                    max={2.4}
                    step={0.2}
                    value={settings.lineHeight}
                    onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* Font Family */}
                <SettingRow label="Font Style">
                  <div className="flex gap-2">
                    {FONT_FAMILIES.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => updateSetting('fontFamily', font.value)}
                        className={`
                          flex-1 py-2 px-3 rounded-lg border text-sm transition-all
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
                </SettingRow>

                {/* Theme */}
                <SettingRow label="Theme">
                  <div className="flex gap-3">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`
                          flex-1 py-3 rounded-lg border flex flex-col items-center gap-2
                          transition-all
                          ${settings.theme === theme.value
                            ? 'border-accent'
                            : 'border-white/20 hover:border-white/40'
                          }
                        `}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="text-white/70 text-xs">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* Playback Section */}
            {activeSection === 'playback' && (
              <div className="space-y-6">
                <SectionTitle>Playback Settings</SectionTitle>

                {/* Default Playback Rate */}
                <SettingRow label={`Default Speed: ${settings.defaultPlaybackRate}x`}>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={settings.defaultPlaybackRate}
                    onChange={(e) => updateSetting('defaultPlaybackRate', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* Sleep Timer */}
                <SettingRow label="Sleep Timer">
                  <div className="flex flex-wrap gap-2">
                    {SLEEP_TIMER_OPTIONS.map((option) => (
                      <button
                        key={option.value ?? 'off'}
                        onClick={() => updateSetting('sleepTimerMinutes', option.value)}
                        className={`
                          px-4 py-2 rounded-lg border text-sm transition-all
                          ${settings.sleepTimerMinutes === option.value
                            ? 'border-accent bg-accent/20 text-white'
                            : 'border-white/20 text-white/60 hover:border-white/40'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* Storage Section */}
            {activeSection === 'storage' && (
              <div className="space-y-6">
                <SectionTitle>Storage Settings</SectionTitle>

                {/* Offline Mode */}
                <SettingRow label="Offline Mode">
                  <Toggle
                    checked={settings.offlineMode}
                    onChange={(checked) => updateSetting('offlineMode', checked)}
                  />
                </SettingRow>
                <p className="text-white/40 text-sm -mt-3">
                  Enable to cache books for offline reading
                </p>

                {/* Cache Size */}
                <SettingRow label={`Max Cache Size: ${settings.cacheSize} MB`}>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={50}
                    value={settings.cacheSize}
                    onChange={(e) => updateSetting('cacheSize', Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </SettingRow>

                {/* Clear Cache Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (confirm('Clear all cached data? This cannot be undone.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg
                               border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    Clear All Cached Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white font-medium rounded-lg
                       hover:bg-accent/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-4">{children}</h3>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-white/70 text-sm">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${checked ? 'bg-accent' : 'bg-white/20'}
      `}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={`
          absolute top-1 w-4 h-4 rounded-full bg-white shadow
          transition-transform
          ${checked ? 'left-7' : 'left-1'}
        `}
      />
    </button>
  );
}

// Default settings
export const defaultAppSettings: AppSettings = {
  ttsVoice: '',
  ttsRate: 1,
  ttsPitch: 1,
  autoPlayNextChapter: true,
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  theme: 'dark',
  defaultPlaybackRate: 1,
  sleepTimerMinutes: null,
  offlineMode: false,
  cacheSize: 100,
};

export default SettingsPanel;

import { useState, useEffect, useCallback } from 'react';

export interface AudioSettings {
  autoplay: boolean;
  backgroundMusic: boolean;
  backgroundMusicVolume: number;
  masterVolume: number;
}

const DEFAULT_SETTINGS: AudioSettings = {
  autoplay: true,
  backgroundMusic: true,
  backgroundMusicVolume: 0.5,
  masterVolume: 0.8,
};

const STORAGE_KEY = 'affirm-audio-settings';

export const useAudioSettings = () => {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }, [settings]);

  const updateAutoplay = useCallback((autoplay: boolean) => {
    saveSettings({ autoplay });
  }, [saveSettings]);

  const updateBackgroundMusic = useCallback((backgroundMusic: boolean) => {
    saveSettings({ backgroundMusic });
  }, [saveSettings]);

  const updateBackgroundMusicVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    saveSettings({ backgroundMusicVolume: clampedVolume });
  }, [saveSettings]);

  const updateMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    saveSettings({ masterVolume: clampedVolume });
  }, [saveSettings]);

  return {
    settings,
    loading,
    updateAutoplay,
    updateBackgroundMusic,
    updateBackgroundMusicVolume,
    updateMasterVolume,
  };
};

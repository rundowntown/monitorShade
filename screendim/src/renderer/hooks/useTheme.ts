import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { applyTheme } from '../themes';
import { ThemeName } from '../../shared/types';

export function useTheme() {
  const { settings, setSettings, setTheme } = useSettingsStore();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const loadSettings = useCallback(async () => {
    const result = await window.electronAPI.getSettings();
    setSettings(result);
    applyTheme(result.theme);
  }, [setSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const changeTheme = useCallback(async (theme: ThemeName) => {
    setTheme(theme);
    applyTheme(theme);
    const newSettings = { ...settings, theme };
    await window.electronAPI.saveSettings(newSettings);
  }, [settings, setTheme]);

  return { theme: settings.theme, changeTheme, settings };
}

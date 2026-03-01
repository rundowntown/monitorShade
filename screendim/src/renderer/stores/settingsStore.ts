import { create } from 'zustand';
import { AppSettings, ThemeName, MonitorPosition } from '../../shared/types';

interface SettingsStore {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  setTheme: (theme: ThemeName) => void;
  setLaunchOnStartup: (value: boolean) => void;
  setMinimizeToTray: (value: boolean) => void;
  setMonitorPosition: (id: number, pos: MonitorPosition) => void;
  setMonitorPositions: (positions: Record<number, MonitorPosition>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    theme: 'dark',
    launchOnStartup: false,
    minimizeToTray: true,
    globalHotkey: null,
    monitorPositions: {},
    monitorNames: {},
    customLogos: {},
  },

  setSettings: (settings) => set({ settings }),

  setTheme: (theme) =>
    set((s) => ({ settings: { ...s.settings, theme } })),

  setLaunchOnStartup: (value) =>
    set((s) => ({ settings: { ...s.settings, launchOnStartup: value } })),

  setMinimizeToTray: (value) =>
    set((s) => ({ settings: { ...s.settings, minimizeToTray: value } })),

  setMonitorPosition: (id, pos) =>
    set((s) => ({
      settings: {
        ...s.settings,
        monitorPositions: { ...s.settings.monitorPositions, [id]: pos },
      },
    })),

  setMonitorPositions: (positions) =>
    set((s) => ({ settings: { ...s.settings, monitorPositions: positions } })),
}));

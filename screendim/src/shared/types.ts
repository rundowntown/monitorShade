export interface MonitorInfo {
  id: number;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
}

export interface MonitorState {
  id: number;
  brightness: number;
  dimness: number;
  overlayOpacity: number;
  isSelected: boolean;
}

export type AppMode = 'auto' | 'toggle';

export interface Profile {
  name: string;
  emoji: string;
  mode: AppMode;
  monitorsSelected: number[];
  brightnessValues: Record<number, number>;
  dimnessValues: Record<number, number>;
  overlayOpacityValues: Record<number, number>;
  overlayColor?: string;
  hotkey: string | null;
}

export const OVERLAY_COLORS = [
  { id: 'black', label: 'Black', value: '0,0,0' },
  { id: 'warm', label: 'Warm', value: '40,20,0' },
  { id: 'amber', label: 'Amber', value: '60,30,0' },
  { id: 'blue', label: 'Night Blue', value: '0,0,30' },
  { id: 'red', label: 'Darkroom', value: '40,0,0' },
  { id: 'sepia', label: 'Sepia', value: '30,20,5' },
];

export const PROFILE_EMOJIS = [
  '🌙', '🎬', '☀️', '🌅', '💻', '🎮', '📺', '🔆', '🌃', '💡',
  '🎵', '📖', '🎨', '⚡', '🌿', '❄️', '🔥', '👁️', '🌈', '⭐',
];

export interface MonitorPosition {
  x: number;
  y: number;
}

export interface AppSettings {
  theme: ThemeName;
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  globalHotkey: string | null;
  monitorPositions: Record<number, MonitorPosition>;
  monitorNames: Record<number, string>;
  customLogos: Record<string, string>;
}

export type ThemeName = 'dark' | 'light' | 'midnight' | 'forest' | 'tech';

export interface ThemeColors {
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  accent: string;
  accentDim: string;
  accentBright: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderAccent: string;
}

export interface ElectronAPI {
  getMonitors: () => Promise<MonitorInfo[]>;
  getBrightness: (displayId: number) => Promise<number>;
  setBrightness: (displayId: number, value: number) => Promise<void>;
  setOverlay: (displayId: number, opacity: number, color?: string) => Promise<void>;
  removeOverlay: (displayId: number) => Promise<void>;
  getProfiles: () => Promise<Record<string, Profile>>;
  saveProfile: (name: string, profile: Profile) => Promise<void>;
  deleteProfile: (name: string) => Promise<void>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  registerHotkey: (accelerator: string) => Promise<boolean>;
  unregisterHotkey: (accelerator: string) => Promise<void>;
  minimizeToTray: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  syncTrayProfile: (name: string | null) => void;
  onHotkeyTriggered: (callback: () => void) => () => void;
  onMonitorsChanged: (callback: (monitors: MonitorInfo[]) => void) => () => void;
  onTrayProfileApplied: (callback: (name: string) => void) => () => void;
  onTrayFullPower: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

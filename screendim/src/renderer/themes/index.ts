import { ThemeColors, ThemeName } from '../../shared/types';

interface ThemeExtras {
  canvasBgTop: string;
  canvasBgBottom: string;
  cardBg: string;
  cardBgActive: string;
  selectR: number;
  selectG: number;
  selectB: number;
}

type FullTheme = ThemeColors & ThemeExtras;

export const themes: Record<ThemeName, FullTheme> = {
  dark: {
    surface: '#0c0c10',
    surfaceAlt: '#141418',
    surfaceHover: '#1c1c22',
    accent: '#6c63ff',
    accentDim: '#5046e5',
    accentBright: '#8b83ff',
    textPrimary: '#ececf1',
    textSecondary: '#a1a1b5',
    textMuted: '#55556a',
    border: '#222230',
    borderAccent: '#6c63ff',
    canvasBgTop: '#1a1a2e',
    canvasBgBottom: '#151524',
    cardBg: '#101016',
    cardBgActive: '#0c1618',
    selectR: 0, selectG: 220, selectB: 210,
  },
  light: {
    surface: '#f0f1f5',
    surfaceAlt: '#fafbfd',
    surfaceHover: '#e4e6ec',
    accent: '#5b52e0',
    accentDim: '#4840c8',
    accentBright: '#7b72f0',
    textPrimary: '#15151f',
    textSecondary: '#505068',
    textMuted: '#8888a0',
    border: '#d4d6e0',
    borderAccent: '#5b52e0',
    canvasBgTop: '#e2e4ec',
    canvasBgBottom: '#d8dae4',
    cardBg: '#f8f9fc',
    cardBgActive: '#e8e6ff',
    selectR: 80, selectG: 60, selectB: 240,
  },
  midnight: {
    surface: '#0e0e18',
    surfaceAlt: '#161624',
    surfaceHover: '#1e1e30',
    accent: '#7c8cf8',
    accentDim: '#5c6cf0',
    accentBright: '#a0b0ff',
    textPrimary: '#d0d0e8',
    textSecondary: '#7878a0',
    textMuted: '#484868',
    border: '#1e1e34',
    borderAccent: '#5c6cf0',
    canvasBgTop: '#141428',
    canvasBgBottom: '#10101e',
    cardBg: '#0e0e18',
    cardBgActive: '#12142a',
    selectR: 100, selectG: 140, selectB: 248,
  },
  forest: {
    surface: '#0e140f',
    surfaceAlt: '#162018',
    surfaceHover: '#1e2c22',
    accent: '#3dd878',
    accentDim: '#1cb854',
    accentBright: '#6ef0a0',
    textPrimary: '#d0e8d4',
    textSecondary: '#78a084',
    textMuted: '#486050',
    border: '#1e3024',
    borderAccent: '#1cb854',
    canvasBgTop: '#121e16',
    canvasBgBottom: '#0e1a12',
    cardBg: '#0c120e',
    cardBgActive: '#141a0c',
    selectR: 220, selectG: 180, selectB: 50,
  },
  tech: {
    surface: '#10131a',
    surfaceAlt: '#1a1e28',
    surfaceHover: '#242a38',
    accent: '#b3a369',
    accentDim: '#9a8a50',
    accentBright: '#d4c484',
    textPrimary: '#e8e4d8',
    textSecondary: '#a09880',
    textMuted: '#605840',
    border: '#222838',
    borderAccent: '#b3a369',
    canvasBgTop: '#141a28',
    canvasBgBottom: '#101620',
    cardBg: '#0e1218',
    cardBgActive: '#181c10',
    selectR: 179, selectG: 163, selectB: 105,
  },
};

export function applyTheme(name: ThemeName): void {
  const theme = themes[name];
  const root = document.documentElement;

  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-surface-alt', theme.surfaceAlt);
  root.style.setProperty('--color-surface-hover', theme.surfaceHover);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-accent-dim', theme.accentDim);
  root.style.setProperty('--color-accent-bright', theme.accentBright);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-border-accent', theme.borderAccent);
  root.style.setProperty('--canvas-bg-top', theme.canvasBgTop);
  root.style.setProperty('--canvas-bg-bottom', theme.canvasBgBottom);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--card-bg-active', theme.cardBgActive);
  root.style.setProperty('--select-r', String(theme.selectR));
  root.style.setProperty('--select-g', String(theme.selectG));
  root.style.setProperty('--select-b', String(theme.selectB));
}

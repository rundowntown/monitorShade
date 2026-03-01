import { create } from 'zustand';
import { MonitorInfo, MonitorState, AppMode } from '../../shared/types';
import { DEFAULT_BRIGHTNESS, DEFAULT_DIMNESS, DEFAULT_OVERLAY } from '../../shared/constants';

interface MonitorStore {
  monitors: MonitorInfo[];
  monitorStates: Record<number, MonitorState>;
  selectedMonitors: number[];
  controlAll: boolean;
  mode: AppMode;
  toggleState: 'bright' | 'dim';

  setMonitors: (monitors: MonitorInfo[]) => void;
  selectMonitor: (id: number) => void;
  deselectMonitor: (id: number) => void;
  toggleMonitorSelection: (id: number) => void;
  setControlAll: (value: boolean) => void;
  setMode: (mode: AppMode) => void;
  setBrightness: (id: number, value: number) => void;
  setDimness: (id: number, value: number) => void;
  setOverlayOpacity: (id: number, value: number) => void;
  toggleBrightness: () => void;
  setSelectedMonitors: (ids: number[]) => void;
  resetMonitorState: (id: number) => void;
}

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  monitors: [],
  monitorStates: {},
  selectedMonitors: [],
  controlAll: false,
  mode: 'auto',
  toggleState: 'bright',

  setMonitors: (monitors) => {
    const existing = get().monitorStates;
    const states: Record<number, MonitorState> = {};
    monitors.forEach((m) => {
      states[m.id] = existing[m.id] ?? {
        id: m.id,
        brightness: DEFAULT_BRIGHTNESS,
        dimness: DEFAULT_DIMNESS,
        overlayOpacity: DEFAULT_OVERLAY,
        isSelected: false,
      };
    });
    set({ monitors, monitorStates: states });
  },

  selectMonitor: (id) =>
    set((s) => ({
      selectedMonitors: s.selectedMonitors.includes(id) ? s.selectedMonitors : [...s.selectedMonitors, id],
    })),

  deselectMonitor: (id) =>
    set((s) => ({
      selectedMonitors: s.selectedMonitors.filter((m) => m !== id),
    })),

  toggleMonitorSelection: (id) => {
    const s = get();
    if (s.selectedMonitors.includes(id)) {
      set({ selectedMonitors: s.selectedMonitors.filter((m) => m !== id) });
    } else {
      set({ selectedMonitors: [...s.selectedMonitors, id] });
    }
  },

  setControlAll: (value) => set({ controlAll: value }),

  setMode: (mode) => set({ mode, selectedMonitors: [], toggleState: 'bright' }),

  setBrightness: (id, value) =>
    set((s) => ({
      monitorStates: {
        ...s.monitorStates,
        [id]: { ...s.monitorStates[id], brightness: value },
      },
    })),

  setDimness: (id, value) =>
    set((s) => ({
      monitorStates: {
        ...s.monitorStates,
        [id]: { ...s.monitorStates[id], dimness: value },
      },
    })),

  setOverlayOpacity: (id, value) =>
    set((s) => ({
      monitorStates: {
        ...s.monitorStates,
        [id]: { ...s.monitorStates[id], overlayOpacity: value },
      },
    })),

  toggleBrightness: () =>
    set((s) => ({
      toggleState: s.toggleState === 'bright' ? 'dim' : 'bright',
    })),

  setSelectedMonitors: (ids) => set({ selectedMonitors: ids }),

  resetMonitorState: (id) =>
    set((s) => ({
      monitorStates: {
        ...s.monitorStates,
        [id]: {
          id,
          brightness: DEFAULT_BRIGHTNESS,
          dimness: DEFAULT_DIMNESS,
          overlayOpacity: DEFAULT_OVERLAY,
          isSelected: false,
        },
      },
    })),
}));

export const IPC_CHANNELS = {
  GET_MONITORS: 'monitors:get',
  MONITORS_CHANGED: 'monitors:changed',
  GET_BRIGHTNESS: 'brightness:get',
  SET_BRIGHTNESS: 'brightness:set',
  SET_OVERLAY: 'overlay:set',
  REMOVE_OVERLAY: 'overlay:remove',
  GET_PROFILES: 'profiles:get',
  SAVE_PROFILE: 'profiles:save',
  DELETE_PROFILE: 'profiles:delete',
  GET_SETTINGS: 'settings:get',
  SAVE_SETTINGS: 'settings:save',
  REGISTER_HOTKEY: 'hotkey:register',
  UNREGISTER_HOTKEY: 'hotkey:unregister',
  HOTKEY_TRIGGERED: 'hotkey:triggered',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_MINIMIZE_TO_TRAY: 'window:minimize-to-tray',
} as const;

export const MAX_MONITORS = 8;
export const BRIGHTNESS_MIN = 0;
export const BRIGHTNESS_MAX = 100;
export const OVERLAY_MIN = 0;
export const OVERLAY_MAX = 100;
export const DEBOUNCE_MS = 50;

export const DEFAULT_BRIGHTNESS = 100;
export const DEFAULT_DIMNESS = 50;
export const DEFAULT_OVERLAY = 0;

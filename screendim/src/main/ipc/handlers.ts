import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { getMonitors } from '../services/monitors';
import { getBrightness, setBrightness } from '../services/brightness';
import { setOverlay, removeOverlay } from '../services/overlay';
import { getProfiles, saveProfile, deleteProfile, getSettings, saveSettings } from '../services/profiles';
import { registerHotkey, unregisterHotkey } from '../services/hotkeys';
import { updateTrayMenu, setTrayActiveProfile, setTrayFullPower } from '../services/tray';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNELS.GET_MONITORS, () => {
    return getMonitors();
  });

  ipcMain.handle(IPC_CHANNELS.GET_BRIGHTNESS, async (_event, displayId: number) => {
    return getBrightness(displayId);
  });

  ipcMain.handle(IPC_CHANNELS.SET_BRIGHTNESS, async (_event, displayId: number, value: number) => {
    return await setBrightness(displayId, value);
  });

  ipcMain.handle(IPC_CHANNELS.SET_OVERLAY, (_event, displayId: number, opacity: number, color?: string) => {
    setOverlay(displayId, opacity, color);
  });

  ipcMain.handle(IPC_CHANNELS.REMOVE_OVERLAY, (_event, displayId: number) => {
    removeOverlay(displayId);
  });

  ipcMain.handle(IPC_CHANNELS.GET_PROFILES, () => {
    return getProfiles();
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_PROFILE, (_event, name: string, profile: any) => {
    saveProfile(name, profile);
    updateTrayMenu();
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_PROFILE, (_event, name: string) => {
    deleteProfile(name);
    updateTrayMenu();
  });

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_event, settings: any) => {
    saveSettings(settings);
  });

  ipcMain.handle(IPC_CHANNELS.REGISTER_HOTKEY, (_event, accelerator: string) => {
    return registerHotkey(accelerator, mainWindow);
  });

  ipcMain.handle(IPC_CHANNELS.UNREGISTER_HOTKEY, (_event, accelerator: string) => {
    unregisterHotkey(accelerator);
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow.minimize();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow.close();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE_TO_TRAY, () => {
    mainWindow.hide();
  });

  ipcMain.on('tray:set-active-profile', (_event, name: string | null) => {
    if (name) setTrayActiveProfile(name);
    else setTrayFullPower();
  });
}

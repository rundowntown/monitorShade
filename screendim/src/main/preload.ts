import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import { ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  getMonitors: () => ipcRenderer.invoke(IPC_CHANNELS.GET_MONITORS),
  getBrightness: (displayId) => ipcRenderer.invoke(IPC_CHANNELS.GET_BRIGHTNESS, displayId),
  setBrightness: (displayId, value) => ipcRenderer.invoke(IPC_CHANNELS.SET_BRIGHTNESS, displayId, value),
  setOverlay: (displayId, opacity, color) => ipcRenderer.invoke(IPC_CHANNELS.SET_OVERLAY, displayId, opacity, color),
  removeOverlay: (displayId) => ipcRenderer.invoke(IPC_CHANNELS.REMOVE_OVERLAY, displayId),
  getProfiles: () => ipcRenderer.invoke(IPC_CHANNELS.GET_PROFILES),
  saveProfile: (name, profile) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_PROFILE, name, profile),
  deleteProfile: (name) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_PROFILE, name),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  registerHotkey: (accelerator) => ipcRenderer.invoke(IPC_CHANNELS.REGISTER_HOTKEY, accelerator),
  unregisterHotkey: (accelerator) => ipcRenderer.invoke(IPC_CHANNELS.UNREGISTER_HOTKEY, accelerator),
  minimizeToTray: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE_TO_TRAY),
  minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  syncTrayProfile: (name) => ipcRenderer.send('tray:set-active-profile', name),
  onHotkeyTriggered: (callback) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.HOTKEY_TRIGGERED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.HOTKEY_TRIGGERED, handler);
  },
  onMonitorsChanged: (callback) => {
    const handler = (_event: any, monitors: any) => callback(monitors);
    ipcRenderer.on(IPC_CHANNELS.MONITORS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.MONITORS_CHANGED, handler);
  },
  onTrayProfileApplied: (callback) => {
    const handler = (_event: any, name: string) => callback(name);
    ipcRenderer.on('tray:profile-applied', handler);
    return () => ipcRenderer.removeListener('tray:profile-applied', handler);
  },
  onTrayFullPower: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('tray:full-power', handler);
    return () => ipcRenderer.removeListener('tray:full-power', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

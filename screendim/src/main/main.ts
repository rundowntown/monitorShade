import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import { createTray, destroyTray } from './services/tray';
import { removeAllOverlays } from './services/overlay';
import { unregisterAllHotkeys } from './services/hotkeys';
import { destroyBrightnessProcess, initBrightnessDaemon } from './services/brightness';
import { getSettings } from './services/profiles';
import { getMonitors } from './services/monitors';
import { IPC_CHANNELS } from '../shared/constants';

let mainWindow: BrowserWindow | null = null;
let forceQuit = false;

const isDev = !app.isPackaged;

function getIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'icons', 'icon.ico');
  }
  return path.join(app.getAppPath(), 'assets', 'icons', 'icon.ico');
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1120,
    height: 830,
    minWidth: 1040,
    minHeight: 780,
    frame: false,
    transparent: false,
    backgroundColor: '#0c0c10',
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', (e) => {
    if (forceQuit) return;

    const settings = getSettings();
    if (settings.minimizeToTray) {
      e.preventDefault();
      win.hide();
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  initBrightnessDaemon();
  mainWindow = createWindow();
  registerIpcHandlers(mainWindow);
  createTray(mainWindow);

  screen.on('display-added', () => {
    mainWindow?.webContents.send(IPC_CHANNELS.MONITORS_CHANGED, getMonitors());
  });
  screen.on('display-removed', () => {
    mainWindow?.webContents.send(IPC_CHANNELS.MONITORS_CHANGED, getMonitors());
  });

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      mainWindow = createWindow();
      registerIpcHandlers(mainWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  forceQuit = true;
  removeAllOverlays();
  unregisterAllHotkeys();
  destroyBrightnessProcess();
  destroyTray();
});

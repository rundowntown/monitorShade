import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';
import { getProfiles } from './profiles';
import { setBrightness } from './brightness';
import { setOverlay, removeOverlay } from './overlay';
import { getMonitors } from './monitors';
import { Profile } from '../../shared/types';

let tray: Tray | null = null;
let mainWindowRef: BrowserWindow | null = null;
let activeProfileName: string | null = null;
let isFullPower = true;

function getAssetPath(filename: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'icons', filename);
  }
  return path.join(app.getAppPath(), 'assets', 'icons', filename);
}

function loadIcon(): Electron.NativeImage {
  for (const name of ['icon.ico', 'app-icon.png']) {
    try {
      const icon = nativeImage.createFromPath(getAssetPath(name));
      if (!icon.isEmpty()) return icon.resize({ width: 16, height: 16 });
    } catch { /* next */ }
  }
  const size = 16;
  const data = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const o = i * 4; data[o] = 120; data[o+1] = 110; data[o+2] = 255; data[o+3] = 255;
  }
  return nativeImage.createFromBuffer(data, { width: size, height: size });
}

export function createTray(mainWindow: BrowserWindow): Tray {
  mainWindowRef = mainWindow;
  tray = new Tray(loadIcon());
  tray.setToolTip('MonitorShade');
  updateTrayMenu();
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
  return tray;
}

export function setTrayActiveProfile(name: string | null): void {
  activeProfileName = name;
  isFullPower = false;
  updateTrayMenu();
}

export function setTrayFullPower(): void {
  activeProfileName = null;
  isFullPower = true;
  updateTrayMenu();
}

export function updateTrayMenu(): void {
  if (!tray || !mainWindowRef) return;

  const profiles = getProfiles();
  const profileNames = Object.keys(profiles);

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Show MonitorShade',
      click: () => { mainWindowRef?.show(); mainWindowRef?.focus(); },
    },
    { type: 'separator' },
    {
      label: `☀ Full Brightness${isFullPower ? '  ✓' : ''}`,
      click: () => {
        const monitors = getMonitors();
        monitors.forEach((m) => { setBrightness(m.id, 100); removeOverlay(m.id); });
        isFullPower = true;
        activeProfileName = null;
        updateTrayMenu();
        mainWindowRef?.webContents.send('tray:full-power');
      },
    },
  ];

  if (profileNames.length > 0) {
    template.push({ type: 'separator' });
    for (const name of profileNames) {
      const profile = profiles[name];
      const emoji = profile.emoji || '▪';
      const isActive = activeProfileName === name;
      template.push({
        label: `${emoji} ${name}${isActive ? '  ✓' : ''}`,
        click: () => {
          applyProfileFromTray(profile);
          activeProfileName = name;
          isFullPower = false;
          updateTrayMenu();
          mainWindowRef?.webContents.send('tray:profile-applied', name);
        },
      });
    }
  }

  template.push({ type: 'separator' });
  template.push({ label: 'Quit', click: () => app.quit() });
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function applyProfileFromTray(profile: Profile): void {
  for (const [id, val] of Object.entries(profile.brightnessValues)) {
    setBrightness(Number(id), val);
  }
  const monitors = getMonitors();
  monitors.forEach((m) => removeOverlay(m.id));
  for (const [id, val] of Object.entries(profile.overlayOpacityValues)) {
    if (val > 0) setOverlay(Number(id), val);
  }
}

export function destroyTray(): void {
  if (tray) { tray.destroy(); tray = null; }
  mainWindowRef = null;
}

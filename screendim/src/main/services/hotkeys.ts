import { globalShortcut, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

let currentHotkey: string | null = null;

export function registerHotkey(accelerator: string, mainWindow: BrowserWindow): boolean {
  unregisterCurrentHotkey();

  try {
    const success = globalShortcut.register(accelerator, () => {
      mainWindow.webContents.send(IPC_CHANNELS.HOTKEY_TRIGGERED);
    });

    if (success) {
      currentHotkey = accelerator;
    }
    return success;
  } catch (err) {
    console.error('Failed to register hotkey:', err);
    return false;
  }
}

export function unregisterHotkey(accelerator: string): void {
  try {
    globalShortcut.unregister(accelerator);
    if (currentHotkey === accelerator) {
      currentHotkey = null;
    }
  } catch (err) {
    console.error('Failed to unregister hotkey:', err);
  }
}

function unregisterCurrentHotkey(): void {
  if (currentHotkey) {
    try {
      globalShortcut.unregister(currentHotkey);
    } catch { /* already unregistered */ }
    currentHotkey = null;
  }
}

export function unregisterAllHotkeys(): void {
  globalShortcut.unregisterAll();
  currentHotkey = null;
}

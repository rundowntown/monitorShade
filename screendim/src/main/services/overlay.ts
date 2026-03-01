import { BrowserWindow, screen } from 'electron';

const overlayWindows = new Map<number, BrowserWindow>();

function createOverlayHtml(opacity: number, color: string = '0,0,0'): string {
  const alpha = Math.max(0, Math.min(1, opacity / 100));
  return `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body { background: rgba(${color},${alpha}); overflow: hidden; }
</style></head><body></body></html>`;
}

export function setOverlay(displayId: number, opacity: number, color?: string): void {
  const displays = screen.getAllDisplays();
  if (displayId >= displays.length) return;

  const display = displays[displayId];
  const { x, y, width, height } = display.bounds;

  if (opacity <= 0) {
    removeOverlay(displayId);
    return;
  }

  let win = overlayWindows.get(displayId);

  if (!win || win.isDestroyed()) {
    win = new BrowserWindow({
      x, y, width, height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: false,
      resizable: false,
      hasShadow: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    win.setIgnoreMouseEvents(true);
    win.setAlwaysOnTop(true, 'screen-saver');
    overlayWindows.set(displayId, win);
  }

  win.setBounds({ x, y, width, height });
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createOverlayHtml(opacity, color))}`);
}

export function removeOverlay(displayId: number): void {
  const win = overlayWindows.get(displayId);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  overlayWindows.delete(displayId);
}

export function removeAllOverlays(): void {
  for (const [id] of overlayWindows) {
    removeOverlay(id);
  }
}

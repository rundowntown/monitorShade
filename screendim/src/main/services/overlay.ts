import { BrowserWindow, screen } from 'electron';

const overlayWindows = new Map<number, BrowserWindow>();

const FADE_MS = 100;

function createOverlayHtml(opacity: number, color: string = '0,0,0'): string {
  const alpha = Math.max(0, Math.min(1, opacity / 100));
  return `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body {
    background: rgba(${color},${alpha});
    overflow: hidden;
    opacity: 0;
    transition: opacity ${FADE_MS}ms ease-out;
  }
  body.visible { opacity: 1; }
</style></head>
<body>
<script>requestAnimationFrame(() => document.body.classList.add('visible'));</script>
</body></html>`;
}

function createFadeOutHtml(color: string = '0,0,0', currentAlpha: number = 0): string {
  return `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body {
    background: rgba(${color},${currentAlpha});
    overflow: hidden;
    transition: opacity ${FADE_MS}ms ease-in;
  }
  body.hidden { opacity: 0; }
</style></head>
<body>
<script>requestAnimationFrame(() => document.body.classList.add('hidden'));</script>
</body></html>`;
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
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createOverlayHtml(opacity, color || '0,0,0'))}`);
}

export function removeOverlay(displayId: number): void {
  const win = overlayWindows.get(displayId);
  if (win && !win.isDestroyed()) {
    // Fade out then close
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createFadeOutHtml())}`);
    setTimeout(() => {
      if (!win.isDestroyed()) win.close();
    }, FADE_MS + 20);
  }
  overlayWindows.delete(displayId);
}

export function removeAllOverlays(): void {
  for (const [id] of overlayWindows) {
    removeOverlay(id);
  }
}

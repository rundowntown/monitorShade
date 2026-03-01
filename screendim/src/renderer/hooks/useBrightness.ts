import { useCallback, useRef } from 'react';
import { useMonitorStore } from '../stores/monitorStore';

const BRIGHTNESS_DEBOUNCE = 80;
const OVERLAY_DEBOUNCE = 50;

export function useBrightness() {
  const { monitorStates, setBrightness, setDimness, setOverlayOpacity } = useMonitorStore();
  const brightnessBatch = useRef<Map<number, number>>(new Map());
  const brightnessTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const overlayTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const applyBrightness = useCallback((displayId: number, value: number) => {
    setBrightness(displayId, value);
    brightnessBatch.current.set(displayId, value);

    clearTimeout(brightnessTimer.current);
    brightnessTimer.current = setTimeout(() => {
      const batch = new Map(brightnessBatch.current);
      brightnessBatch.current.clear();
      for (const [id, val] of batch) {
        window.electronAPI.setBrightness(id, val);
      }
    }, BRIGHTNESS_DEBOUNCE);
  }, [setBrightness]);

  const applyDimness = useCallback((displayId: number, value: number) => {
    setDimness(displayId, value);
  }, [setDimness]);

  const applyOverlay = useCallback((displayId: number, value: number) => {
    setOverlayOpacity(displayId, value);
    const existing = overlayTimers.current.get(displayId);
    if (existing) clearTimeout(existing);
    overlayTimers.current.set(displayId, setTimeout(() => {
      if (value > 0) {
        window.electronAPI.setOverlay(displayId, value);
      } else {
        window.electronAPI.removeOverlay(displayId);
      }
      overlayTimers.current.delete(displayId);
    }, OVERLAY_DEBOUNCE));
  }, [setOverlayOpacity]);

  return { monitorStates, applyBrightness, applyDimness, applyOverlay };
}

import { useEffect, useCallback } from 'react';
import { useMonitorStore } from '../stores/monitorStore';

export function useMonitors() {
  const { monitors, setMonitors } = useMonitorStore();

  const refreshMonitors = useCallback(async () => {
    const result = await window.electronAPI.getMonitors();
    setMonitors(result);
  }, [setMonitors]);

  useEffect(() => {
    refreshMonitors();
    const cleanup = window.electronAPI.onMonitorsChanged((newMonitors) => {
      setMonitors(newMonitors);
    });
    return cleanup;
  }, [refreshMonitors, setMonitors]);

  return { monitors, refreshMonitors };
}

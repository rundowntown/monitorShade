import { screen } from 'electron';
import { MonitorInfo } from '../../shared/types';

export function getMonitors(): MonitorInfo[] {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();

  return displays.map((display, index) => ({
    id: index,
    name: `Display ${index + 1}${display.id === primary.id ? ' (Primary)' : ''}`,
    bounds: display.bounds,
    isPrimary: display.id === primary.id,
  }));
}

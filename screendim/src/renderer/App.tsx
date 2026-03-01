import { useState, useMemo, useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar, Page } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProfilesPage } from './pages/ProfilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { useTheme } from './hooks/useTheme';
import { useMonitorStore } from './stores/monitorStore';
import { useProfileStore } from './stores/profileStore';

export function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  useTheme();

  const { monitors, monitorStates, setBrightness, setOverlayOpacity, setControlAll, setSelectedMonitors } = useMonitorStore();
  const { profiles, setActiveProfile } = useProfileStore();

  // Listen for tray events and sync GUI
  useEffect(() => {
    const cleanupProfile = window.electronAPI.onTrayProfileApplied((name) => {
      const profile = profiles[name];
      if (!profile) return;

      setActiveProfile(name);
      setControlAll(false);
      setSelectedMonitors(profile.monitorsSelected);

      for (const [id, val] of Object.entries(profile.brightnessValues)) {
        setBrightness(Number(id), val);
      }
      for (const [id, val] of Object.entries(profile.overlayOpacityValues)) {
        setOverlayOpacity(Number(id), val);
      }
    });

    const cleanupFull = window.electronAPI.onTrayFullPower(() => {
      setActiveProfile(null);
      setControlAll(false);
      setSelectedMonitors(monitors.map((m) => m.id));
      monitors.forEach((m) => {
        setBrightness(m.id, 100);
        setOverlayOpacity(m.id, 0);
      });
    });

    return () => { cleanupProfile(); cleanupFull(); };
  }, [profiles, monitors, setActiveProfile, setControlAll, setSelectedMonitors, setBrightness, setOverlayOpacity]);

  // Prevent Electron from navigating when files are dragged onto the window
  useEffect(() => {
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener('dragover', prevent);
    document.addEventListener('drop', prevent);
    return () => {
      document.removeEventListener('dragover', prevent);
      document.removeEventListener('drop', prevent);
    };
  }, []);

  const globalDarkness = useMemo(() => {
    if (monitors.length === 0) return 0;
    let totalDark = 0;
    monitors.forEach((m) => {
      const s = monitorStates[m.id];
      if (!s) return;
      const dark = Math.max((100 - s.brightness) / 100, s.overlayOpacity / 100);
      totalDark += dark;
    });
    return totalDark / monitors.length;
  }, [monitors, monitorStates]);

  const tronActive = globalDarkness > 0.3;
  const tronIntensity = tronActive ? Math.min(1, (globalDarkness - 0.3) / 0.5) : 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface relative">
      {tronActive && (
        <div className="absolute inset-0 pointer-events-none z-50 rounded-lg transition-opacity duration-500"
             style={{
               boxShadow: `inset 0 0 1px rgba(255,140,50,${tronIntensity * 0.3}), inset 0 0 ${10 + tronIntensity * 20}px rgba(255,100,20,${tronIntensity * 0.06})`,
               border: `1px solid rgba(255,140,50,${tronIntensity * 0.15})`,
             }} />
      )}

      <TitleBar tronIntensity={tronIntensity} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} tronIntensity={tronIntensity} />
        <main className="flex-1 overflow-hidden">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'profiles' && <ProfilesPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { LayoutDashboard, BookMarked, Settings, ImagePlus, X } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useSettingsStore } from '../../stores/settingsStore';

export type Page = 'dashboard' | 'profiles' | 'settings';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  tronIntensity?: number;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Displays', icon: LayoutDashboard },
  { id: 'profiles', label: 'Profiles', icon: BookMarked },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activePage, onNavigate, tronIntensity = 0 }: SidebarProps) {
  const tron = tronIntensity > 0;
  const { settings } = useSettingsStore();
  const [dragOver, setDragOver] = useState(false);

  const customLogo = settings.customLogos?.[settings.theme];

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newSettings = {
        ...settings,
        customLogos: { ...(settings.customLogos ?? {}), [settings.theme]: base64 },
      };
      useSettingsStore.getState().setSettings(newSettings);
      await window.electronAPI.saveSettings(newSettings);
    };
    reader.readAsDataURL(file);
  }, [settings]);

  const handleRemoveLogo = useCallback(async () => {
    const logos = { ...(settings.customLogos ?? {}) };
    delete logos[settings.theme];
    const newSettings = { ...settings, customLogos: logos };
    useSettingsStore.getState().setSettings(newSettings);
    await window.electronAPI.saveSettings(newSettings);
  }, [settings]);

  return (
    <div className="relative flex flex-col w-[88px] h-full transition-colors duration-500">
      {/* Right border — base line */}
      <div className="absolute right-0 inset-y-0 w-px pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent 95%)' }} />
      {/* Single slow rainfall drop */}
      <div className="absolute right-0 inset-y-0 w-px pointer-events-none sidebar-rain-1" />

      <div className="flex items-center justify-center h-[72px]">
        <AppLogo size={52} tronIntensity={tronIntensity} />
      </div>

      <nav className="flex flex-col items-center gap-1.5 py-3 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="relative flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? tron ? `rgba(255,140,50,${0.08 + tronIntensity * 0.06})` : 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                  : undefined,
                color: isActive
                  ? tron ? `rgba(255,160,70,${0.7 + tronIntensity * 0.3})` : 'var(--color-accent)'
                  : tron ? `rgba(255,140,50,${0.25 + tronIntensity * 0.15})` : 'var(--color-text-muted)',
              }}
              title={label}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-[11px] mt-1 font-medium leading-none">{label}</span>
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full transition-colors duration-500"
                     style={{ backgroundColor: tron ? `rgba(255,140,50,${0.6 + tronIntensity * 0.4})` : 'var(--color-accent)' }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Custom logo area — bottom of sidebar */}
      <div className="flex flex-col items-center pb-3 px-2">
        {customLogo ? (
          <div className="relative group">
            <img src={customLogo} alt="Custom logo" className="w-14 h-14 rounded-lg object-contain" draggable={false} />
            <button
              onClick={handleRemoveLogo}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 text-white flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove logo"
            >
              <X size={8} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.stopPropagation(); handleDrop(e); }}
            className={`w-14 h-14 rounded-lg border border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-accent/50 bg-accent/10 scale-105'
                : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
            }`}
            title="Drag & drop a logo image"
          >
            <ImagePlus size={14} className="text-text-muted/40" />
          </div>
        )}
      </div>
    </div>
  );
}

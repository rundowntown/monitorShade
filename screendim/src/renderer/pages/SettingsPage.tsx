import { Palette, Keyboard, Monitor, ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../stores/settingsStore';
import { ThemeName } from '../../shared/types';
import { themes } from '../themes';
import { useState, useCallback } from 'react';

const themeEntries: { id: ThemeName; label: string; description: string }[] = [
  { id: 'dark', label: 'Dark', description: 'Indigo & cyan accents' },
  { id: 'light', label: 'Light', description: 'Clean and bright' },
  { id: 'midnight', label: 'Midnight', description: 'Deep blue-purple' },
  { id: 'forest', label: 'Forest', description: 'Emerald & gold' },
  { id: 'tech', label: 'Georgia Tech', description: 'Old Gold & Navy' },
];

export function SettingsPage() {
  const { theme, changeTheme, settings } = useTheme();
  const { setMinimizeToTray, setLaunchOnStartup } = useSettingsStore();
  const [hotkeyInput, setHotkeyInput] = useState(settings.globalHotkey ?? '');
  const [recording, setRecording] = useState(false);

  const handleHotkeyRecord = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    }
    if (parts.length > 0) {
      const combo = parts.join('+');
      setHotkeyInput(combo);
    }
  }, []);

  const handleSaveHotkey = useCallback(async () => {
    if (hotkeyInput) {
      const success = await window.electronAPI.registerHotkey(hotkeyInput);
      if (success) {
        const newSettings = { ...settings, globalHotkey: hotkeyInput };
        await window.electronAPI.saveSettings(newSettings);
      }
    }
    setRecording(false);
  }, [hotkeyInput, settings]);

  const handleClearHotkey = useCallback(async () => {
    if (settings.globalHotkey) {
      await window.electronAPI.unregisterHotkey(settings.globalHotkey);
    }
    setHotkeyInput('');
    const newSettings = { ...settings, globalHotkey: null };
    await window.electronAPI.saveSettings(newSettings);
  }, [settings]);

  const handleToggleSetting = useCallback(async (key: 'minimizeToTray' | 'launchOnStartup', value: boolean) => {
    if (key === 'minimizeToTray') setMinimizeToTray(value);
    else setLaunchOnStartup(value);
    const newSettings = { ...settings, [key]: value };
    await window.electronAPI.saveSettings(newSettings);
  }, [settings, setMinimizeToTray, setLaunchOnStartup]);

  return (
    <div className="flex flex-col h-full p-5 gap-6 overflow-y-auto">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">Customize your experience</p>
      </div>

      {/* Themes */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider">
          <Palette size={13} />
          Theme
        </div>
        <div className="grid grid-cols-2 gap-2">
          {themeEntries.map((t) => {
            const colors = themes[t.id];
            return (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                  theme === t.id
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-border bg-surface-alt hover:border-border-accent/30'
                }`}
              >
                <div className="flex gap-1">
                  <div className="w-4 h-8 rounded" style={{ backgroundColor: colors.surface }} />
                  <div className="w-4 h-8 rounded" style={{ backgroundColor: colors.accent }} />
                  <div className="w-4 h-8 rounded" style={{ backgroundColor: colors.surfaceAlt }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">{t.label}</span>
                  <span className="text-[10px] text-text-muted">{t.description}</span>
                </div>
                {theme === t.id && (
                  <ChevronRight size={14} className="ml-auto text-accent" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hotkey */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider">
          <Keyboard size={13} />
          Global Hotkey (Toggle Mode)
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-mono transition-all ${
              recording
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-alt text-text-secondary'
            }`}
          >
            {recording ? (
              <input
                autoFocus
                value={hotkeyInput}
                readOnly
                onKeyDown={handleHotkeyRecord}
                className="bg-transparent outline-none w-full"
                placeholder="Press key combination..."
              />
            ) : (
              <span>{hotkeyInput || 'No hotkey set'}</span>
            )}
          </div>
          {recording ? (
            <button
              onClick={handleSaveHotkey}
              className="px-3 py-2 rounded-lg bg-accent text-surface text-xs font-medium hover:bg-accent-bright transition-colors"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setRecording(true)}
              className="px-3 py-2 rounded-lg bg-surface-alt border border-border text-xs text-text-secondary hover:bg-surface-hover transition-colors"
            >
              {hotkeyInput ? 'Change' : 'Set'}
            </button>
          )}
          {hotkeyInput && !recording && (
            <button
              onClick={handleClearHotkey}
              className="px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* General */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider">
          <Monitor size={13} />
          General
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:border-white/[0.1] transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-secondary">Close to system tray</span>
              <span className="text-[11px] text-text-muted">Clicking X hides the app to the tray instead of quitting</span>
            </div>
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(e) => handleToggleSetting('minimizeToTray', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:border-white/[0.1] transition-colors">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-secondary">Launch on Windows startup</span>
              <span className="text-[11px] text-text-muted">Start MonitorShade when you log in</span>
            </div>
            <input
              type="checkbox"
              checked={settings.launchOnStartup}
              onChange={(e) => handleToggleSetting('launchOnStartup', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
          </label>
        </div>
      </section>

      {/* About */}
      <section className="flex flex-col gap-3 mt-2">
        <div className="divider-gradient" />
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>MonitorShade</span>
            <span className="text-[11px] text-text-muted">v2.0.0 &middot; Built with Electron + React</span>
            <span className="text-[11px] text-text-muted">by daniel forcade</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-text-muted">
            <span>Multi-monitor brightness & overlay control</span>
            <span className="opacity-50">github.com/rundowntown/monitorShade</span>
          </div>
        </div>
      </section>
    </div>
  );
}

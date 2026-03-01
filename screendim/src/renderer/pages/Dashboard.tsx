import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Layers, ArrowUpDown, Save, Check, X, Plus, Sun } from 'lucide-react';
import { MonitorGrid } from '../components/monitors/MonitorGrid';
import { BrightnessSlider } from '../components/controls/BrightnessSlider';
import { OverlaySlider } from '../components/controls/OverlaySlider';
import { ModeToggle } from '../components/controls/ModeToggle';
import { useMonitorStore } from '../stores/monitorStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useMonitors } from '../hooks/useMonitors';
import { useBrightness } from '../hooks/useBrightness';
import { useProfiles } from '../hooks/useProfiles';
import { useProfileStore } from '../stores/profileStore';
import { MonitorPosition, Profile, PROFILE_EMOJIS } from '../../shared/types';
import { DEFAULT_BRIGHTNESS, DEFAULT_DIMNESS, DEFAULT_OVERLAY } from '../../shared/constants';

export function Dashboard() {
  const { refreshMonitors } = useMonitors();
  const { monitorStates, applyBrightness, applyDimness, applyOverlay } = useBrightness();
  const {
    monitors, selectedMonitors, controlAll, mode, toggleState,
    toggleMonitorSelection, setControlAll, setMode, toggleBrightness, setSelectedMonitors,
  } = useMonitorStore();

  const { settings, setMonitorPosition } = useSettingsStore();
  const { profiles, activeProfile, applyProfile, saveProfile } = useProfiles();
  const { setActiveProfile } = useProfileStore();
  const profileList = Object.entries(profiles);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveEmoji, setSaveEmoji] = useState('🌙');

  const handleSaveProfile = useCallback(async () => {
    const name = saveName.trim();
    if (!name) return;
    const ids = controlAll ? monitors.map((m) => m.id) : selectedMonitors;
    const profile: Profile = {
      name,
      emoji: saveEmoji,
      mode,
      monitorsSelected: ids,
      brightnessValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.brightness ?? 100])),
      dimnessValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.dimness ?? 50])),
      overlayOpacityValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.overlayOpacity ?? 0])),
      hotkey: null,
    };
    await saveProfile(name, profile);
    window.electronAPI.syncTrayProfile(name);
    setSaving(false);
    setSaveName('');
    setSaveEmoji('🌙');
  }, [saveName, saveEmoji, controlAll, monitors, selectedMonitors, mode, monitorStates, saveProfile]);

  const buildCurrentProfile = useCallback((name: string): Profile => {
    const ids = controlAll ? monitors.map((m) => m.id) : selectedMonitors;
    return {
      name,
      emoji: profiles[name]?.emoji ?? '🌙',
      mode,
      monitorsSelected: ids,
      brightnessValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.brightness ?? 100])),
      dimnessValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.dimness ?? 50])),
      overlayOpacityValues: Object.fromEntries(ids.map((id) => [id, monitorStates[id]?.overlayOpacity ?? 0])),
      hotkey: profiles[name]?.hotkey ?? null,
    };
  }, [monitors, mode, monitorStates, profiles, controlAll, selectedMonitors]);

  const handleQuickSave = useCallback(async () => {
    if (!activeProfile) {
      setSaving(true);
      return;
    }
    const profile = buildCurrentProfile(activeProfile);
    await saveProfile(activeProfile, profile);
    window.electronAPI.syncTrayProfile(activeProfile);
  }, [activeProfile, buildCurrentProfile, saveProfile]);

  const handlePositionCommit = useCallback((id: number, pos: MonitorPosition) => {
    setMonitorPosition(id, pos);
    const updated = { ...settings, monitorPositions: { ...settings.monitorPositions, [id]: pos } };
    window.electronAPI.saveSettings(updated);
  }, [settings, setMonitorPosition]);

  const handleMonitorRename = useCallback((id: number, name: string) => {
    const newSettings = { ...settings, monitorNames: { ...settings.monitorNames, [id]: name } };
    useSettingsStore.getState().setSettings(newSettings);
    window.electronAPI.saveSettings(newSettings);
  }, [settings]);

  const activeIds = controlAll ? monitors.map((m) => m.id) : selectedMonitors;
  const firstActive = activeIds[0];
  const firstState = firstActive !== undefined ? monitorStates[firstActive] : undefined;

  const currentBrightness = firstState?.brightness ?? DEFAULT_BRIGHTNESS;
  const currentDimness = firstState?.dimness ?? DEFAULT_DIMNESS;
  const currentOverlay = firstState?.overlayOpacity ?? DEFAULT_OVERLAY;

  const handleBrightnessChange = useCallback((value: number) => {
    activeIds.forEach((id) => applyBrightness(id, value));
  }, [activeIds, applyBrightness]);

  const handleDimnessChange = useCallback((value: number) => {
    activeIds.forEach((id) => applyDimness(id, value));
  }, [activeIds, applyDimness]);

  const handleOverlayChange = useCallback((value: number) => {
    activeIds.forEach((id) => applyOverlay(id, value));
  }, [activeIds, applyOverlay]);

  const handleToggle = useCallback(() => {
    toggleBrightness();
    monitors.forEach((m) => {
      if (selectedMonitors.includes(m.id) || controlAll) {
        const state = monitorStates[m.id];
        if (!state) return;
        const targetValue = toggleState === 'bright' ? state.dimness : state.brightness;
        window.electronAPI.setBrightness(m.id, targetValue);
      }
    });
  }, [toggleBrightness, monitors, selectedMonitors, controlAll, monitorStates, toggleState]);

  useEffect(() => {
    const cleanup = window.electronAPI.onHotkeyTriggered(() => {
      if (mode === 'toggle') handleToggle();
    });
    return cleanup;
  }, [mode, handleToggle]);

  const handleFullPower = useCallback(() => {
    setActiveProfile(null);
    setControlAll(false);
    setSelectedMonitors(monitors.map((m) => m.id));
    monitors.forEach((m) => {
      applyBrightness(m.id, 100);
      applyOverlay(m.id, 0);
    });
    window.electronAPI.syncTrayProfile(null);
  }, [monitors, applyBrightness, applyOverlay, setControlAll, setActiveProfile, setSelectedMonitors]);

  const hasSelection = activeIds.length > 0;
  const selCount = activeIds.length;

  const globalDarkness = monitors.length > 0
    ? monitors.reduce((sum, m) => {
        const s = monitorStates[m.id];
        return sum + (s ? Math.max((100 - s.brightness) / 100, s.overlayOpacity / 100) : 0);
      }, 0) / monitors.length
    : 0;
  const tron = globalDarkness > 0.3;
  const ti = tron ? Math.min(1, (globalDarkness - 0.3) / 0.5) : 0;

  const isFullPower = monitors.length > 0 && monitors.every((m) => {
    const s = monitorStates[m.id];
    return s && s.brightness === 100 && s.overlayOpacity === 0;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-base font-semibold text-text-primary">Displays</h1>
          <span className="text-xs text-text-muted">{monitors.length} connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ModeToggle mode={mode} onToggle={setMode} tronIntensity={ti} />
          <button
            onClick={() => setControlAll(!controlAll)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
            style={{
              backgroundColor: controlAll
                ? tron ? `rgba(255,140,50,${0.15 + ti * 0.1})` : 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
                : tron ? `rgba(255,140,50,${0.05 + ti * 0.05})` : undefined,
              color: controlAll
                ? tron ? `rgba(255,160,70,${0.7 + ti * 0.3})` : 'rgb(108,99,255)'
                : tron ? `rgba(255,150,60,${0.4 + ti * 0.3})` : undefined,
              boxShadow: tron && controlAll ? `0 0 8px rgba(255,120,30,${ti * 0.2})` : 'none',
            }}
          >
            <Layers size={13} />
            All
          </button>
          <button
            onClick={(e) => {
              const icon = e.currentTarget.querySelector('svg');
              if (icon) { icon.style.transition = 'transform 0.6s ease'; icon.style.transform = 'rotate(360deg)'; setTimeout(() => { icon.style.transform = ''; }, 600); }
              refreshMonitors();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
            title="Refresh displays"
            style={{
              color: tron ? `rgba(255,160,70,${0.5 + ti * 0.4})` : 'var(--color-accent)',
              backgroundColor: tron ? `rgba(255,140,50,${0.05 + ti * 0.04})` : 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="px-4">
        <MonitorGrid
          monitors={monitors}
          monitorStates={monitorStates}
          selectedMonitors={selectedMonitors}
          controlAll={controlAll}
          monitorPositions={settings.monitorPositions}
          monitorNames={settings.monitorNames ?? {}}
          onMonitorClick={toggleMonitorSelection}
          onPositionCommit={handlePositionCommit}
          onMonitorRename={handleMonitorRename}
        />
      </div>

      {/* Profiles Bar — always visible */}
      <div className="px-5 pt-2 pb-1">
        {saving ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const idx = PROFILE_EMOJIS.indexOf(saveEmoji);
                  setSaveEmoji(PROFILE_EMOJIS[(idx + 1) % PROFILE_EMOJIS.length]);
                }}
                className="shrink-0 w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                title="Click to change emoji"
              >
                {saveEmoji}
              </button>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(); if (e.key === 'Escape') { setSaving(false); setSaveName(''); setSaveEmoji('🌙'); } }}
                placeholder="Profile name..."
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary
                           placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/40"
              />
              <button
                onClick={handleSaveProfile}
                disabled={!saveName.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15 text-accent
                           hover:bg-accent/25 transition-colors disabled:opacity-30"
                title="Save"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => { setSaving(false); setSaveName(''); setSaveEmoji('🌙'); }}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-text-muted
                           hover:bg-white/[0.04] transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {PROFILE_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setSaveEmoji(e)}
                  className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all duration-100
                    ${saveEmoji === e ? 'bg-accent/20 ring-1 ring-accent/40 scale-110' : 'hover:bg-white/[0.06]'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Full Power — left side */}
            <button
              onClick={handleFullPower}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${!isFullPower && tron ? 'glow-border glow-border-tron' : ''}`}
              title="Max brightness, remove all overlays"
              style={isFullPower ? {
                background: 'linear-gradient(135deg, rgba(255,160,60,0.3), rgba(255,120,30,0.25))',
                color: 'rgb(200,120,20)',
                border: '2px solid rgba(255,150,50,0.5)',
                boxShadow: '0 0 12px rgba(255,120,30,0.3)',
              } : tron ? {
                background: 'rgba(255,140,50,0.08)',
                color: `rgba(255,160,70,${0.6 + ti * 0.4})`,
                border: '1px solid rgba(255,140,50,0.2)',
                boxShadow: `0 0 ${6 + ti * 10}px rgba(255,120,30,${0.1 + ti * 0.15})`,
              } : {
                background: 'transparent',
                color: 'rgba(255,150,60,0.4)',
                border: '1px solid rgba(255,140,50,0.12)',
              }}
            >
              <Sun size={14} />
              Full
            </button>

            {/* Spacer pushes profiles to the right */}
            <div className="flex-1" />

            {/* Profile suite — right side */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Profile pills */}
              {profileList.map(([name, profile]) => {
                const isActive = activeProfile === name;
                return (
                  <button
                    key={name}
                    onClick={() => { applyProfile(profile); window.electronAPI.syncTrayProfile(name); }}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={isActive ? {
                      background: tron
                      ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
                      : 'rgba(108,99,255,0.15)',
                    color: tron ? 'rgb(255,180,90)' : 'var(--color-accent)',
                    border: `2px solid ${tron ? 'rgba(255,150,50,0.5)' : 'color-mix(in srgb, var(--color-accent) 50%, transparent)'}`,
                    } : {
                      background: tron ? `rgba(255,140,50,${0.03 + ti * 0.03})` : 'rgba(255,255,255,0.03)',
                      color: tron ? `rgba(255,150,60,${0.35 + ti * 0.2})` : undefined,
                      border: '2px solid transparent',
                    }}
                  >
                    {profile.emoji || '▪'} {name}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="w-px h-5 shrink-0 transition-colors duration-300"
                   style={{ backgroundColor: tron ? `rgba(255,140,50,${0.1 + ti * 0.08})` : 'rgba(255,255,255,0.06)' }} />

              {/* Save */}
              <button
                onClick={handleQuickSave}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                title={activeProfile ? `Save to "${activeProfile}"` : 'Save as new profile'}
                style={{
                  backgroundColor: tron ? `rgba(255,140,50,${0.08 + ti * 0.06})` : 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                  color: tron ? `rgba(255,160,70,${0.5 + ti * 0.3})` : 'var(--color-accent)',
                  border: '1px solid transparent',
                }}
              >
                <Save size={13} />
                Save
              </button>

              {/* New */}
              <button
                onClick={() => setSaving(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                title="Create a new profile"
                style={{
                  backgroundColor: tron ? `rgba(255,140,50,${0.04 + ti * 0.03})` : 'rgba(255,255,255,0.03)',
                  color: tron ? `rgba(255,150,60,${0.4 + ti * 0.2})` : undefined,
                  border: '1px solid transparent',
                }}
              >
                <Plus size={13} />
                New
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 my-3 divider-gradient" />

      {/* Controls */}
      <div className="flex-1 px-5 pb-4">
        {hasSelection ? (
          <div className="flex flex-col gap-5 animate-fade-in">
            <span className="text-xs font-medium text-text-secondary">
              {controlAll ? 'All displays' : `${selCount} selected`}
            </span>

            <BrightnessSlider value={currentBrightness} onChange={handleBrightnessChange} label="Brightness" />

            {mode === 'toggle' && (
              <BrightnessSlider value={currentDimness} onChange={handleDimnessChange} label="Dim Level" />
            )}

            <OverlaySlider value={currentOverlay} onChange={handleOverlayChange} />

            {mode === 'toggle' && (
              <button
                onClick={handleToggle}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                           bg-accent/10 text-accent/80 hover:bg-accent/15 hover:text-accent
                           transition-colors text-sm font-medium mt-1"
              >
                <ArrowUpDown size={14} />
                Toggle &middot; {toggleState === 'bright' ? 'Bright' : 'Dim'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-text-muted/60 text-sm">
            Click a display to adjust settings
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2 border-t border-white/[0.03]">
        <div className="flex items-center gap-3 text-[11px] text-text-muted/50">
          <span>{monitors.length} display{monitors.length !== 1 ? 's' : ''}</span>
          <span className="w-px h-3 bg-white/[0.06]" />
          <span>{selCount > 0 ? `${selCount} selected` : 'none selected'}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-text-muted/50">
          {activeProfile && (
            <span className="flex items-center gap-1">
              {profiles[activeProfile]?.emoji || '▪'} {activeProfile}
            </span>
          )}
          <span className="capitalize">{mode}</span>
        </div>
      </div>
    </div>
  );
}

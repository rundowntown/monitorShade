import Store from 'electron-store';
import { Profile, AppSettings } from '../../shared/types';

interface StoreSchema {
  profiles: Record<string, Profile>;
  settings: AppSettings;
}

const store = new Store<StoreSchema>({
  defaults: {
    profiles: {},
    settings: {
      theme: 'dark',
      launchOnStartup: false,
      minimizeToTray: true,
      globalHotkey: null,
      monitorPositions: {},
      monitorNames: {},
      customLogos: {},
    },
  },
});

export function getProfiles(): Record<string, Profile> {
  return store.get('profiles');
}

export function saveProfile(name: string, profile: Profile): void {
  const profiles = getProfiles();
  profiles[name] = profile;
  store.set('profiles', profiles);
}

export function deleteProfile(name: string): void {
  const profiles = getProfiles();
  delete profiles[name];
  store.set('profiles', profiles);
}

export function getSettings(): AppSettings {
  return store.get('settings');
}

export function saveSettings(settings: AppSettings): void {
  store.set('settings', settings);
}

export function importLegacyProfiles(legacyData: Record<string, any>): void {
  const profiles: Record<string, Profile> = {};

  for (const [name, data] of Object.entries(legacyData)) {
    if (!data || typeof data !== 'object' || !data.mode) continue;

    profiles[name] = {
      name,
      emoji: data.emoji ?? '🌙',
      mode: data.mode === 'Toggle' ? 'toggle' : 'auto',
      monitorsSelected: data.monitors_selected ?? [],
      brightnessValues: data.brightness_values ?? {},
      dimnessValues: data.dimness_values ?? {},
      overlayOpacityValues: data.overlay_opacity_values ?? {},
      hotkey: data.hotkey ?? null,
    };
  }

  store.set('profiles', { ...getProfiles(), ...profiles });
}

import { useEffect, useCallback } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useMonitorStore } from '../stores/monitorStore';
import { Profile } from '../../shared/types';
import { MAX_MONITORS } from '../../shared/constants';

export function useProfiles() {
  const { profiles, activeProfile, setProfiles, setActiveProfile, addProfile, removeProfile } = useProfileStore();
  const { setMode, setBrightness, setDimness, setOverlayOpacity, setSelectedMonitors, setControlAll } = useMonitorStore();

  const loadProfiles = useCallback(async () => {
    const result = await window.electronAPI.getProfiles();
    setProfiles(result);
  }, [setProfiles]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const saveProfile = useCallback(async (name: string, profile: Profile) => {
    await window.electronAPI.saveProfile(name, profile);
    addProfile(name, profile);
  }, [addProfile]);

  const deleteProfile = useCallback(async (name: string) => {
    await window.electronAPI.deleteProfile(name);
    removeProfile(name);
  }, [removeProfile]);

  const applyProfile = useCallback(async (profile: Profile) => {
    setControlAll(false);
    setMode(profile.mode);
    setSelectedMonitors(profile.monitorsSelected);

    // Update store values
    for (const [id, val] of Object.entries(profile.brightnessValues)) {
      setBrightness(Number(id), val);
    }
    for (const [id, val] of Object.entries(profile.dimnessValues)) {
      setDimness(Number(id), val);
    }
    for (const [id, val] of Object.entries(profile.overlayOpacityValues)) {
      setOverlayOpacity(Number(id), val);
    }

    setActiveProfile(profile.name);

    // Remove overlays on all monitors first
    for (let i = 0; i < MAX_MONITORS; i++) {
      window.electronAPI.removeOverlay(i);
    }

    // Apply brightness + overlays via IPC
    for (const [id, val] of Object.entries(profile.brightnessValues)) {
      window.electronAPI.setBrightness(Number(id), val);
    }
    for (const [id, val] of Object.entries(profile.overlayOpacityValues)) {
      if (val > 0) {
        window.electronAPI.setOverlay(Number(id), val);
      }
    }
  }, [setControlAll, setMode, setBrightness, setDimness, setOverlayOpacity, setSelectedMonitors, setActiveProfile]);

  return { profiles, activeProfile, loadProfiles, saveProfile, deleteProfile, applyProfile };
}

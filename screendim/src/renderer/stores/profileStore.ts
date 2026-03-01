import { create } from 'zustand';
import { Profile } from '../../shared/types';

interface ProfileStore {
  profiles: Record<string, Profile>;
  activeProfile: string | null;

  setProfiles: (profiles: Record<string, Profile>) => void;
  setActiveProfile: (name: string | null) => void;
  addProfile: (name: string, profile: Profile) => void;
  removeProfile: (name: string) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profiles: {},
  activeProfile: null,

  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (name) => set({ activeProfile: name }),

  addProfile: (name, profile) =>
    set((s) => ({
      profiles: { ...s.profiles, [name]: profile },
    })),

  removeProfile: (name) =>
    set((s) => {
      const { [name]: _, ...rest } = s.profiles;
      return {
        profiles: rest,
        activeProfile: s.activeProfile === name ? null : s.activeProfile,
      };
    }),
}));

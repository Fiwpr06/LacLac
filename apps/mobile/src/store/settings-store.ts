import { create } from 'zustand';

interface SettingsStore {
  language: 'vi' | 'en';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  reduceMotion: boolean;
  setLanguage: (lang: 'vi' | 'en') => void;
  setSound: (v: boolean) => void;
  setHaptic: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  language: 'vi',
  soundEnabled: true,
  hapticEnabled: true,
  reduceMotion: false,
  setLanguage: (val) => set({ language: val }),
  setSound: (val) => set({ soundEnabled: val }),
  setHaptic: (val) => set({ hapticEnabled: val }),
  setReduceMotion: (val) => set({ reduceMotion: val }),
}));

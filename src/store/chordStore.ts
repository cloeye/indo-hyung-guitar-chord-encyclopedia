"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChordRoot, ChordVoicing, QualityTabId, TabId, UseCase } from "@/types/chord";

type ChordState = {
  selectedRoot: ChordRoot;
  selectedQualityId: string;
  selectedGroup: QualityTabId;
  selectedMode: UseCase;
  activeTab: TabId;
  showAdvancedVoicings: boolean;
  showFingerNumbers: boolean;
  isLeftHanded: boolean;
  favorites: string[];
  favoriteVoicings: Record<string, ChordVoicing>;
  recent: string[];

  setRoot: (root: ChordRoot) => void;
  setQualityId: (qualityId: string) => void;
  setGroup: (group: QualityTabId) => void;
  setMode: (mode: UseCase) => void;
  setActiveTab: (tab: TabId) => void;
  toggleAdvancedVoicings: () => void;
  toggleFingerNumbers: () => void;
  toggleLeftHanded: () => void;
  toggleFavorite: (chordName: string) => void;
  toggleFavoriteVoicing: (voicing: ChordVoicing) => void;
  addRecent: (chordName: string) => void;
};

export const useChordStore = create<ChordState>()(
  persist(
    (set) => ({
      selectedRoot: "C",
      selectedQualityId: "major",
      selectedGroup: "main",
      selectedMode: "beginner",
      activeTab: "forward",
      showAdvancedVoicings: false,
      showFingerNumbers: true,
      isLeftHanded: false,
      favorites: [],
      favoriteVoicings: {},
      recent: [],

      setRoot: (root) => set({ selectedRoot: root }),
      setQualityId: (qualityId) => set({ selectedQualityId: qualityId }),
      setGroup: (group) => set({ selectedGroup: group }),
      setMode: (mode) => set({ selectedMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleAdvancedVoicings: () =>
        set((state) => ({ showAdvancedVoicings: !state.showAdvancedVoicings })),
      toggleFingerNumbers: () =>
        set((state) => ({ showFingerNumbers: !state.showFingerNumbers })),
      toggleLeftHanded: () => set((state) => ({ isLeftHanded: !state.isLeftHanded })),
      toggleFavorite: (chordName) =>
        set((state) => ({
          favorites: state.favorites.includes(chordName)
            ? state.favorites.filter((favorite) => favorite !== chordName)
            : [chordName, ...state.favorites].slice(0, 30),
          favoriteVoicings: state.favorites.includes(chordName)
            ? Object.fromEntries(
                Object.entries(state.favoriteVoicings).filter(([key]) => key !== chordName),
              )
            : state.favoriteVoicings,
        })),
      toggleFavoriteVoicing: (voicing) =>
        set((state) => ({
          favorites: state.favorites.includes(voicing.chordName)
            ? state.favorites.filter((favorite) => favorite !== voicing.chordName)
            : [voicing.chordName, ...state.favorites].slice(0, 30),
          favoriteVoicings: state.favorites.includes(voicing.chordName)
            ? Object.fromEntries(
                Object.entries(state.favoriteVoicings).filter(([key]) => key !== voicing.chordName),
              )
            : {
                ...state.favoriteVoicings,
                [voicing.chordName]: voicing,
              },
        })),
      addRecent: (chordName) =>
        set((state) => ({
          recent: [chordName, ...state.recent.filter((item) => item !== chordName)].slice(0, 12),
        })),
    }),
    {
      name: "guitar-chord-finder-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRoot: state.selectedRoot,
        selectedQualityId: state.selectedQualityId,
        selectedGroup: state.selectedGroup,
        selectedMode: state.selectedMode,
        showAdvancedVoicings: state.showAdvancedVoicings,
        showFingerNumbers: state.showFingerNumbers,
        isLeftHanded: state.isLeftHanded,
        favorites: state.favorites,
        favoriteVoicings: state.favoriteVoicings,
        recent: state.recent,
      }),
    },
  ),
);

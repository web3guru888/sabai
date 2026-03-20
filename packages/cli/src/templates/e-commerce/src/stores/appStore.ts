import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageId } from '../types';

interface AppState {
  isAgeVerified: boolean;
  isPdpaConsented: boolean;
  language: 'th' | 'en';
  currentPage: PageId;
  /** For navigation context (e.g. product ID) */
  pageParam: string | null;

  setAgeVerified: (verified: boolean) => void;
  setPdpaConsented: (consented: boolean) => void;
  setLanguage: (language: 'th' | 'en') => void;
  navigate: (page: PageId, param?: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAgeVerified: false,
      isPdpaConsented: false,
      language: 'th',
      currentPage: 'home',
      pageParam: null,

      setAgeVerified: (verified) => set({ isAgeVerified: verified }),
      setPdpaConsented: (consented) => set({ isPdpaConsented: consented }),
      setLanguage: (language) => set({ language }),
      navigate: (page, param = null) => set({ currentPage: page, pageParam: param }),
    }),
    {
      name: 'sabai_app',
      partialize: (state) => ({
        isAgeVerified: state.isAgeVerified,
        isPdpaConsented: state.isPdpaConsented,
        language: state.language,
      }),
    },
  ),
);

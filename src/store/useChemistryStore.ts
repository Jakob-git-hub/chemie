import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Molecule, QuizResult } from '@/lib/types';

interface ChemistryState {
  currentMolecule: Molecule | null;
  setMolecule: (m: Molecule | null) => void;

  quizProgress: QuizResult[];
  addResult: (r: QuizResult) => void;
  resetProgress: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useChemistryStore = create<ChemistryState>()(
  persist(
    (set) => ({
      currentMolecule: null,
      setMolecule: (m) => set({ currentMolecule: m }),

      quizProgress: [],
      addResult: (r) => set((s) => ({ quizProgress: [...s.quizProgress, r] })),
      resetProgress: () => set({ quizProgress: [] }),

      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }))
    }),
    {
      name: 'chemistry-store',
      // Only persist quiz progress and theme, not current molecule (transient state)
      partialize: (state) => ({
        quizProgress: state.quizProgress,
        theme: state.theme
      })
    }
  )
);

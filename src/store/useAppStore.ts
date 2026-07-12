import { create } from 'zustand';

interface AppState {
  /** Geteilter Formel-String (Periodensystem -> Molrechner). */
  formula: string;
  setFormula: (f: string) => void;
  appendToFormula: (sym: string) => void;

  /** Aktuell gewähltes Element im Periodensystem. */
  selectedElement: string | null;
  setSelectedElement: (sym: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  formula: '',
  setFormula: (f) => set({ formula: f }),
  appendToFormula: (sym) =>
    set((s) => ({ formula: (s.formula + sym).replace(/\s+/g, '') })),

  selectedElement: null,
  setSelectedElement: (sym) => set({ selectedElement: sym })
}));

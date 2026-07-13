import { create } from 'zustand';

export interface ThermoState {
  // Stored in kJ/mol, raw energy from engine
  deltaH: number | null;
  // Standard molar entropy in J/(mol*K)
  deltaS: number | null;
  // Temperature in Kelvin
  temperature: number;
  // Cached Gibbs free energy in kJ/mol
  deltaG: number | null;

  // Setter
  setDeltaH: (value: number | null) => void;
  setDeltaS: (value: number | null) => void;
  setTemperature: (value: number) => void;
  // Compute G
  computeDeltaG: () => void;
}

export const useThermoStore = create<ThermoState>((set, get) => ({
  deltaH: null,
  deltaS: null,
  temperature: 298,
  deltaG: null,
  setDeltaH: (value) => set({ deltaH: value }),
  setDeltaS: (value) => set({ deltaS: value }),
  setTemperature: (value) => set({ temperature: value }),
  computeDeltaG: () => {
    const { deltaH, deltaS, temperature } = get();
    if (deltaH === null || deltaS === null) {
      set({ deltaG: null });
      return;
    }
    const dG_J = deltaH * 1000 - temperature * deltaS;
    set({ deltaG: dG_J / 1000 }); // back to kJ/mol
  },
}));

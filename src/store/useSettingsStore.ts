import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TemperatureUnit = 'K' | 'C' | 'F';
export type EnergyUnit = 'kJ' | 'kcal' | 'eV';
export type PressureUnit = 'kPa' | 'atm' | 'bar' | 'mmHg';
export type VolumeUnit = 'L' | 'mL' | 'm3';

export interface SettingsState {
  temperature: TemperatureUnit;
  energy: EnergyUnit;
  pressure: PressureUnit;
  volume: VolumeUnit;
  // Conversion functions
  convertTemperature: (value: number, from: TemperatureUnit, to: TemperatureUnit) => number;
  convertEnergy: (value: number, from: EnergyUnit, to: EnergyUnit) => number;
  convertPressure: (value: number, from: PressureUnit, to: PressureUnit) => number;
  convertVolume: (value: number, from: VolumeUnit, to: VolumeUnit) => number;
  // Setters
  setTemperature: (unit: TemperatureUnit) => void;
  setEnergy: (unit: EnergyUnit) => void;
  setPressure: (unit: PressureUnit) => void;
  setVolume: (unit: VolumeUnit) => void;
}

const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  // Convert to Kelvin first
  let kelvin: number;
  switch (from) {
    case 'K': kelvin = value; break;
    case 'C': kelvin = value + 273.15; break;
    case 'F': kelvin = (value - 32) * 5/9 + 273.15; break;
  }
  // Convert from Kelvin to target
  switch (to) {
    case 'K': return kelvin;
    case 'C': return kelvin - 273.15;
    case 'F': return (kelvin - 273.15) * 9/5 + 32;
  }
};

const convertEnergy = (value: number, from: EnergyUnit, to: EnergyUnit): number => {
  // Convert to kJ first (base unit)
  let kj: number;
  switch (from) {
    case 'kJ': kj = value; break;
    case 'kcal': kj = value * 4.184; break;
    case 'eV': kj = value * 96.485; break; // 1 eV = 96.485 kJ/mol
  }
  // Convert from kJ to target
  switch (to) {
    case 'kJ': return kj;
    case 'kcal': return kj / 4.184;
    case 'eV': return kj / 96.485;
  }
};

const convertPressure = (value: number, from: PressureUnit, to: PressureUnit): number => {
  // Convert to kPa first (base unit)
  let kpa: number;
  switch (from) {
    case 'kPa': kpa = value; break;
    case 'atm': kpa = value * 101.325; break;
    case 'bar': kpa = value * 100; break;
    case 'mmHg': kpa = value * 0.133322; break;
  }
  // Convert from kPa to target
  switch (to) {
    case 'kPa': return kpa;
    case 'atm': return kpa / 101.325;
    case 'bar': return kpa / 100;
    case 'mmHg': return kpa / 0.133322;
  }
};

const convertVolume = (value: number, from: VolumeUnit, to: VolumeUnit): number => {
  // Convert to L first (base unit)
  let liters: number;
  switch (from) {
    case 'L': liters = value; break;
    case 'mL': liters = value / 1000; break;
    case 'm3': liters = value * 1000; break;
  }
  // Convert from L to target
  switch (to) {
    case 'L': return liters;
    case 'mL': return liters * 1000;
    case 'm3': return liters / 1000;
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      temperature: 'K',
      energy: 'kJ',
      pressure: 'kPa',
      volume: 'L',
      convertTemperature,
      convertEnergy,
      convertPressure,
      convertVolume,
      setTemperature: (unit) => set({ temperature: unit }),
      setEnergy: (unit) => set({ energy: unit }),
      setPressure: (unit) => set({ pressure: unit }),
      setVolume: (unit) => set({ volume: unit }),
    }),
    {
      name: 'chemistry-settings',
      partialize: (state) => ({
        temperature: state.temperature,
        energy: state.energy,
        pressure: state.pressure,
        volume: state.volume,
      }),
    }
  )
);

// Unit labels for display
export const UNIT_LABELS: Record<string, Record<string, string>> = {
  temperature: {
    K: 'Kelvin (K)',
    C: 'Celsius (°C)',
    F: 'Fahrenheit (°F)',
  },
  energy: {
    kJ: 'Kilojoule (kJ/mol)',
    kcal: 'Kilokalorie (kcal/mol)',
    eV: 'Elektronenvolt (eV)',
  },
  pressure: {
    kPa: 'Kilopascal (kPa)',
    atm: 'Atmosphäre (atm)',
    bar: 'Bar',
    mmHg: 'Millimeter Quecksilber (mmHg)',
  },
  volume: {
    L: 'Liter (L)',
    mL: 'Milliliter (mL)',
    m3: 'Kubikmeter (m³)',
  },
};

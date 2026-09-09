/**
 * Zustand Store for the Atombaukasten
 * Manages subatomic particle counts with undo/history and localStorage persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';
import {
  computeAtomPhysics,
  validateAtom,
  computeElementSymbol,
  computeElementName,
  computeElectronConfiguration,
  computeShellOccupancy,
  formatCharge,
  formatIsotopeNotation,
  PARTICLE_LIMITS,
} from '@/lib/atom-builder/physics';

export type ParticleType = 'proton' | 'neutron' | 'electron';
export type ToolMode = 'place' | 'remove';

export interface AtomBuilderState {
  // Particle counts (physics state — source of truth)
  protonCount: number;
  neutronCount: number;
  electronCount: number;

  // UI state
  selectedParticleType: ParticleType;
  toolMode: ToolMode;

  // History for undo/redo
  history: Array<{
    protonCount: number;
    neutronCount: number;
    electronCount: number;
  }>;
}

export interface AtomBuilderActions {
  // Particle management
  addParticle: (type: ParticleType) => void;
  removeParticle: (type: ParticleType) => void;
  setParticleCount: (type: ParticleType, count: number) => void;

  // Tool/UI actions
  setSelectedParticleType: (type: ParticleType) => void;
  setToolMode: (mode: ToolMode) => void;

  // History
  undo: () => void;
  clearHistory: () => void;

  // Bulk
  reset: () => void;
}

export interface AtomBuilderSelectors {
  // Derived physics
  elementSymbol: string;
  elementName: string;
  atomicNumber: number;
  massNumber: number;
  charge: number;
  chargeLabel: string;
  isotopeNotation: string;
  electronConfiguration: string;
  shellOccupancy: number[];
  validation: ReturnType<typeof validateAtom>;

  // UI helpers
  canAddProton: boolean;
  canAddNeutron: boolean;
  canAddElectron: boolean;
  canRemoveProton: boolean;
  canRemoveNeutron: boolean;
  canRemoveElectron: boolean;
}

export type AtomBuilderStore = AtomBuilderState & AtomBuilderActions & AtomBuilderSelectors;

const INITIAL_STATE = {
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1,
  selectedParticleType: 'proton' as ParticleType,
  toolMode: 'place' as ToolMode,
  history: [] as AtomBuilderState['history'],
};

// Computed selectors that derive from state
const createSelectors = (state: AtomBuilderState): AtomBuilderSelectors => {
  const physics = computeAtomPhysics(state.protonCount, state.neutronCount, state.electronCount);
  return {
    elementSymbol: physics.elementSymbol,
    elementName: physics.elementName,
    atomicNumber: physics.atomicNumber,
    massNumber: physics.massNumber,
    charge: physics.charge,
    chargeLabel: physics.chargeLabel,
    isotopeNotation: physics.isotopeNotation,
    electronConfiguration: physics.electronConfiguration,
    shellOccupancy: physics.shellOccupancy,
    validation: physics.validation,

    canAddProton: state.protonCount < PARTICLE_LIMITS.proton.max,
    canAddNeutron: state.neutronCount < PARTICLE_LIMITS.neutron.max,
    canAddElectron: state.electronCount < PARTICLE_LIMITS.electron.max,
    canRemoveProton: state.protonCount > PARTICLE_LIMITS.proton.min,
    canRemoveNeutron: state.neutronCount > PARTICLE_LIMITS.neutron.min,
    canRemoveElectron: state.electronCount > PARTICLE_LIMITS.electron.min,
  };
};

export const useAtomBuilderStore = create<AtomBuilderStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // --- Actions ---
        addParticle: (type) => {
          const limits = PARTICLE_LIMITS[type];
          set((state) => {
            const next = { ...state };
            if (type === 'proton') {
              next.protonCount = Math.min(state.protonCount + 1, limits.max);
            } else if (type === 'neutron') {
              next.neutronCount = Math.min(state.neutronCount + 1, limits.max);
            } else if (type === 'electron') {
              next.electronCount = Math.min(state.electronCount + 1, limits.max);
            }
            // Only push history if the count actually changed
            if (next.protonCount !== state.protonCount ||
                next.neutronCount !== state.neutronCount ||
                next.electronCount !== state.electronCount) {
              next.history = [
                ...next.history.slice(-19),
                { protonCount: state.protonCount, neutronCount: state.neutronCount, electronCount: state.electronCount },
              ];
            }
            // Re-compute selectors
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        removeParticle: (type) => {
          set((state) => {
            const next = { ...state };
            const limits = PARTICLE_LIMITS[type];
            if (type === 'proton') {
              next.protonCount = Math.max(state.protonCount - 1, limits.min);
            } else if (type === 'neutron') {
              next.neutronCount = Math.max(state.neutronCount - 1, limits.min);
            } else if (type === 'electron') {
              next.electronCount = Math.max(state.electronCount - 1, limits.min);
            }
            if (next.protonCount !== state.protonCount ||
                next.neutronCount !== state.neutronCount ||
                next.electronCount !== state.electronCount) {
              next.history = [
                ...next.history.slice(-19),
                { protonCount: state.protonCount, neutronCount: state.neutronCount, electronCount: state.electronCount },
              ];
            }
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        setParticleCount: (type, count) => {
          set((state) => {
            const limits = PARTICLE_LIMITS[type];
            const clamped = Math.max(limits.min, Math.min(count, limits.max));
            const next = { ...state };
            if (type === 'proton') next.protonCount = clamped;
            else if (type === 'neutron') next.neutronCount = clamped;
            else if (type === 'electron') next.electronCount = clamped;
            next.history = [
              ...next.history.slice(-19),
              { protonCount: state.protonCount, neutronCount: state.neutronCount, electronCount: state.electronCount },
            ];
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        setSelectedParticleType: (type) => {
          set((state) => {
            const next = { ...state, selectedParticleType: type };
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        setToolMode: (mode) => {
          set((state) => {
            const next = { ...state, toolMode: mode };
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        undo: () => {
          const { history } = get();
          if (history.length === 0) return;
          const previous = history[history.length - 1];
          set((state) => {
            const next = {
              ...state,
              protonCount: previous.protonCount,
              neutronCount: previous.neutronCount,
              electronCount: previous.electronCount,
              history: history.slice(0, -1),
            };
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        clearHistory: () => {
          set((state) => {
            const next = { ...state, history: [] };
            Object.assign(next, createSelectors(next));
            return next;
          });
        },

        reset: () => {
          set({
            ...INITIAL_STATE,
            history: [],
          });
        },

        ...createSelectors(INITIAL_STATE),
      }),
      { name: 'atom-builder-storage' }
    )
  )
);

// --- Selector hooks for granular reactivity ---

export function useAtomPhysics() {
  const { protonCount, neutronCount, electronCount } = useAtomBuilderStore(
    (state) => ({
      protonCount: state.protonCount,
      neutronCount: state.neutronCount,
      electronCount: state.electronCount,
    })
  );
  return useSyncExternalStore(
    (callback) => callback,
    () => computeAtomPhysics(protonCount, neutronCount, electronCount),
    () => computeAtomPhysics(protonCount, neutronCount, electronCount)
  );
}
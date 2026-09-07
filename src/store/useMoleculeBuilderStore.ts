/**
 * Zustand store for the molecule builder
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BuildableAtom, BuildableBond, BuilderMode, BuildableMolecule } from '@/lib/molecule-builder/types';
import { computeFormula, computeMolarMass } from '@/lib/molecule-builder/formula';
import { generateSmiles } from '@/lib/molecule-builder/smiles';
import { validateMolecule } from '@/lib/molecule-builder/validation';
import { isValidElement, ELEMENT_DATA } from '@/lib/molecule-builder/valency';

interface MoleculeBuilderState {
  // State
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
  selectedAtomId: string | null;
  pendingBondFrom: string | null;
  mode: BuilderMode;
  selectedElement: string;
  history: { atoms: BuildableAtom[]; bonds: BuildableBond[] }[];

  // Actions - Atoms
  addAtom: (element: string, position: { x: number; y: number }) => string | null;
  removeAtom: (id: string) => void;
  moveAtom: (id: string, position: { x: number; y: number }) => void;
  selectAtom: (id: string | null) => void;

  // Actions - Bonds
  addBond: (from: string, to: string, order?: 1 | 2 | 3) => string | null;
  removeBond: (id: string) => void;
  cycleBondOrder: (id: string) => void;

  // Actions - Mode
  setMode: (mode: BuilderMode) => void;
  setSelectedElement: (element: string) => void;

  // Actions - Bulk
  clearCanvas: () => void;
  loadMolecule: (molecule: { atoms: BuildableAtom[]; bonds: BuildableBond[] }) => void;
  exportMolecule: () => BuildableMolecule;

  // Actions - History
  undo: () => void;
  pushHistory: () => void;
}

let atomCounter = 0;
let bondCounter = 0;

function generateAtomId(element: string): string {
  atomCounter++;
  return `${element}_${atomCounter}_${Date.now().toString(36)}`;
}

function generateBondId(): string {
  bondCounter++;
  return `bond_${bondCounter}_${Date.now().toString(36)}`;
}

export const useMoleculeBuilderStore = create<MoleculeBuilderState>()(
  persist(
    (set, get) => ({
      atoms: [],
      bonds: [],
      selectedAtomId: null,
      pendingBondFrom: null,
      mode: 'addAtom',
      selectedElement: 'C',
      history: [],

      addAtom: (element, position) => {
        if (!isValidElement(element)) {
          console.warn(`Invalid element: ${element}`);
          return null;
        }

        get().pushHistory();

        const id = generateAtomId(element);
        const newAtom: BuildableAtom = {
          id,
          element,
          position: { x: Math.round(position.x), y: Math.round(position.y) },
          charge: 0
        };

        set(state => ({
          atoms: [...state.atoms, newAtom],
          selectedAtomId: id
        }));

        return id;
      },

      removeAtom: (id) => {
        get().pushHistory();
        set(state => ({
          atoms: state.atoms.filter(a => a.id !== id),
          bonds: state.bonds.filter(b => b.from !== id && b.to !== id),
          selectedAtomId: state.selectedAtomId === id ? null : state.selectedAtomId,
          pendingBondFrom: state.pendingBondFrom === id ? null : state.pendingBondFrom
        }));
      },

      moveAtom: (id, position) => {
        set(state => ({
          atoms: state.atoms.map(a =>
            a.id === id ? { ...a, position: { x: Math.round(position.x), y: Math.round(position.y) } } : a
          )
        }));
      },

      selectAtom: (id) => {
        set({ selectedAtomId: id });
      },

      addBond: (from, to, order = 1) => {
        if (from === to) return null;

        const { atoms, bonds } = get();
        if (!atoms.some(a => a.id === from) || !atoms.some(a => a.id === to)) {
          return null;
        }

        const exists = bonds.some(b =>
          (b.from === from && b.to === to) ||
          (b.from === to && b.to === from)
        );
        if (exists) return null;

        get().pushHistory();

        const id = generateBondId();
        const newBond: BuildableBond = {
          id,
          from,
          to,
          order: order as 1 | 2 | 3
        };

        set(state => ({
          bonds: [...state.bonds, newBond]
        }));

        return id;
      },

      removeBond: (id) => {
        get().pushHistory();
        set(state => ({
          bonds: state.bonds.filter(b => b.id !== id)
        }));
      },

      cycleBondOrder: (id) => {
        get().pushHistory();
        set(state => ({
          bonds: state.bonds.map(b => {
            if (b.id !== id) return b;
            const nextOrder = b.order === 1 ? 2 : b.order === 2 ? 3 : 1;
            return { ...b, order: nextOrder as 1 | 2 | 3 };
          })
        }));
      },

      setMode: (mode) => {
        set({ mode, pendingBondFrom: null });
      },

      setSelectedElement: (element) => {
        if (isValidElement(element)) {
          set({ selectedElement: element });
        }
      },

      clearCanvas: () => {
        get().pushHistory();
        set({
          atoms: [],
          bonds: [],
          selectedAtomId: null,
          pendingBondFrom: null
        });
      },

      loadMolecule: (molecule) => {
        get().pushHistory();
        set({
          atoms: molecule.atoms,
          bonds: molecule.bonds,
          selectedAtomId: null,
          pendingBondFrom: null
        });
      },

      exportMolecule: () => {
        const { atoms, bonds } = get();
        const formula = computeFormula(atoms);
        const molarMass = computeMolarMass(atoms);
        const smiles = generateSmiles(atoms, bonds);
        const validation = validateMolecule(atoms, bonds);

        return {
          atoms,
          bonds,
          formula,
          molarMass,
          smiles,
          isValid: validation.valid,
          validationErrors: validation.errors.map(e => e.message)
        };
      },

      undo: () => {
        const { history } = get();
        if (history.length === 0) return;

        const previous = history[history.length - 1];
        set({
          atoms: previous.atoms,
          bonds: previous.bonds,
          history: history.slice(0, -1)
        });
      },

      pushHistory: () => {
        set(state => ({
          history: [
            ...state.history.slice(-19), // Keep last 20 states
            { atoms: state.atoms, bonds: state.bonds }
          ]
        }));
      }
    }),
    {
      name: 'molecule-builder-storage',
      partialize: (state) => ({
        atoms: state.atoms,
        bonds: state.bonds
      })
    }
  )
);

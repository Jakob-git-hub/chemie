/**
 * Types for the molecule builder
 */

/**
 * Atom placed on the canvas by the user
 */
export interface BuildableAtom {
  id: string;
  element: string;
  position: { x: number; y: number };
  charge: number;
}

/**
 * Bond between two atoms
 */
export interface BuildableBond {
  id: string;
  from: string;
  to: string;
  order: 1 | 2 | 3;
}

/**
 * The complete molecule that was built
 */
export interface BuildableMolecule {
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
  formula: string;
  molarMass: number;
  smiles: string;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Tool mode for the builder
 */
export type BuilderMode = 'select' | 'addAtom' | 'addBond' | 'delete';

/**
 * Result of saving/loading
 */
export interface SaveResult {
  success: boolean;
  message?: string;
}

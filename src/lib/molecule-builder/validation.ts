/**
 * Validation logic for molecules
 * Checks valency rules and chemical validity
 */

import type { BuildableAtom, BuildableBond } from './types';
import { getDefaultValency, getAllowedValencies } from './valency';

export interface ValidationError {
  type: 'valency_exceeded' | 'valency_unfilled' | 'duplicate_bond' | 'self_bond' | 'invalid_element';
  atomId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Calculates total bond order for an atom
 */
function getTotalBondOrder(atomId: string, bonds: BuildableBond[]): number {
  return bonds
    .filter(b => b.from === atomId || b.to === atomId)
    .reduce((sum, b) => sum + b.order, 0);
}

/**
 * Checks if a bond already exists between two atoms
 */
function bondExists(from: string, to: string, bonds: BuildableBond[]): BuildableBond | undefined {
  return bonds.find(b =>
    (b.from === from && b.to === to) ||
    (b.from === to && b.to === from)
  );
}

/**
 * Validates a single atom's valency
 */
function validateAtomValency(
  atom: BuildableAtom,
  bonds: BuildableBond[]
): ValidationError | null {
  const bondOrder = getTotalBondOrder(atom.id, bonds);
  const allowedValencies = getAllowedValencies(atom.element);
  const defaultValency = getDefaultValency(atom.element);

  // Check if bond order exceeds any allowed valency
  const exceedsAll = allowedValencies.every(v => bondOrder > v);
  if (exceedsAll && bondOrder > 0) {
    return {
      type: 'valency_exceeded',
      atomId: atom.id,
      message: `${atom.element}: ${bondOrder} Bindungen (max. ${Math.max(...allowedValencies)})`,
      severity: 'error'
    };
  }

  // Check if valency is unfilled (warning only, as implicit H can fill)
  const belowDefault = bondOrder < defaultValency;
  const hasExplicitH = bonds.some(b => {
    // Check if there's a hydrogen connected (implicitly or explicitly)
    const otherId = b.from === atom.id ? b.to : b.from;
    return otherId.startsWith('H_') || otherId === `H_${atom.id}`;
  });

  // Special case: Carbon with less than 4 bonds (could have H)
  if (atom.element === 'C' && bondOrder < 4 && bondOrder > 0) {
    // Carbon can have implicit hydrogens - this is fine
    return null;
  }

  // Other atoms with unfilled valency
  if (belowDefault && bondOrder > 0 && !hasExplicitH) {
    const missingBonds = defaultValency - bondOrder;
    return {
      type: 'valency_unfilled',
      atomId: atom.id,
      message: `${atom.element}: ${missingBonds} weitere Bindung${missingBonds > 1 ? 'en' : ''} möglich`,
      severity: 'warning'
    };
  }

  return null;
}

/**
 * Validates a potential bond before creation
 */
export function validateBondCreation(
  fromId: string,
  toId: string,
  atoms: BuildableAtom[],
  bonds: BuildableBond[]
): ValidationError | null {
  // Self-bond check
  if (fromId === toId) {
    return {
      type: 'self_bond',
      message: 'Ein Atom kann nicht mit sich selbst verbunden werden',
      severity: 'error'
    };
  }

  // Duplicate bond check
  if (bondExists(fromId, toId, bonds)) {
    return {
      type: 'duplicate_bond',
      message: 'Diese Bindung existiert bereits',
      severity: 'error'
    };
  }

  // Valency check for from atom
  const fromAtom = atoms.find(a => a.id === fromId);
  if (!fromAtom) {
    return {
      type: 'invalid_element',
      message: 'Unbekanntes Atom',
      severity: 'error'
    };
  }

  const fromBondOrder = getTotalBondOrder(fromId, bonds) + 1; // +1 for new bond
  const fromAllowed = getAllowedValencies(fromAtom.element);
  if (fromBondOrder > Math.max(...fromAllowed)) {
    return {
      type: 'valency_exceeded',
      atomId: fromId,
      message: `${fromAtom.element}: Valenz würde überschritten`,
      severity: 'error'
    };
  }

  // Valency check for to atom
  const toAtom = atoms.find(a => a.id === toId);
  if (toAtom) {
    const toBondOrder = getTotalBondOrder(toId, bonds) + 1;
    const toAllowed = getAllowedValencies(toAtom.element);
    if (toBondOrder > Math.max(...toAllowed)) {
      return {
        type: 'valency_exceeded',
        atomId: toId,
        message: `${toAtom.element}: Valenz würde überschritten`,
        severity: 'error'
      };
    }
  }

  return null;
}

/**
 * Main validation function - validates the entire molecule
 */
export function validateMolecule(
  atoms: BuildableAtom[],
  bonds: BuildableBond[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate each atom
  for (const atom of atoms) {
    const error = validateAtomValency(atom, bonds);
    if (error) {
      if (error.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
  }

  // Check for disconnected atoms
  const connectedAtoms = new Set<string>();
  for (const bond of bonds) {
    connectedAtoms.add(bond.from);
    connectedAtoms.add(bond.to);
  }

  for (const atom of atoms) {
    if (!connectedAtoms.has(atom.id) && atoms.length > 1) {
      warnings.push({
        type: 'valency_unfilled',
        atomId: atom.id,
        message: `${atom.element} ist nicht mit anderen Atomen verbunden`,
        severity: 'warning'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Gets validation status for a specific atom
 */
export function getAtomValidation(
  atomId: string,
  atoms: BuildableAtom[],
  bonds: BuildableBond[]
): { status: 'valid' | 'warning' | 'error'; message?: string } {
  const atom = atoms.find(a => a.id === atomId);
  if (!atom) return { status: 'valid' };

  const result = validateMolecule(atoms, bonds);
  const atomError = result.errors.find(e => e.atomId === atomId);
  if (atomError) {
    return { status: 'error', message: atomError.message };
  }

  const atomWarning = result.warnings.find(w => w.atomId === atomId);
  if (atomWarning) {
    return { status: 'warning', message: atomWarning.message };
  }

  return { status: 'valid' };
}

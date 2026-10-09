import { describe, it, expect } from 'vitest';
import { validateMolecule, validateBondCreation, getAtomValidation } from '@/lib/molecule-builder/validation';
import type { BuildableAtom, BuildableBond } from '@/lib/molecule-builder/types';

describe('validateMolecule', () => {
  it('returns valid for empty molecule', () => {
    const result = validateMolecule([], []);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for single atom', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const result = validateMolecule(atoms, []);
    expect(result.valid).toBe(true);
  });

  it('returns valid for water (H-O-H)', () => {
    const atoms: BuildableAtom[] = [
      { id: 'O', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'O', to: 'H1', order: 1 },
      { id: 'b2', from: 'O', to: 'H2', order: 1 }
    ];
    const result = validateMolecule(atoms, bonds);
    expect(result.valid).toBe(true);
  });

  it('detects valency exceeded for carbon with too many single bonds', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H3', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H4', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H5', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'C1', to: 'H1', order: 1 },
      { id: 'b2', from: 'C1', to: 'H2', order: 1 },
      { id: 'b3', from: 'C1', to: 'H3', order: 1 },
      { id: 'b4', from: 'C1', to: 'H4', order: 1 },
      { id: 'b5', from: 'C1', to: 'H5', order: 1 }
    ];
    const result = validateMolecule(atoms, bonds);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'valency_exceeded')).toBe(true);
  });

  it('detects disconnected atoms as warnings', () => {
    const atoms: BuildableAtom[] = [
      { id: 'O', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    // No bonds between them
    const bonds: BuildableBond[] = [];
    const result = validateMolecule(atoms, bonds);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.message.includes('nicht mit anderen Atomen verbunden'))).toBe(true);
  });
});

describe('validateBondCreation', () => {
  it('rejects self-bond', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const result = validateBondCreation('C1', 'C1', atoms, []);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('self_bond');
  });

  it('rejects duplicate bond', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'C1', to: 'H1', order: 1 }
    ];
    const result = validateBondCreation('C1', 'H1', atoms, bonds);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('duplicate_bond');
  });

  it('allows valid bond', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const result = validateBondCreation('C1', 'H1', atoms, []);
    expect(result).toBeNull();
  });

  it('detects valency exceeded', () => {
    const atoms: BuildableAtom[] = [
      { id: 'C1', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H3', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H4', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H5', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    // C has 4 bonds already
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'C1', to: 'H1', order: 1 },
      { id: 'b2', from: 'C1', to: 'H2', order: 1 },
      { id: 'b3', from: 'C1', to: 'H3', order: 1 },
      { id: 'b4', from: 'C1', to: 'H4', order: 1 }
    ];
    // Try to add a 5th bond to C1 - should fail due to valency
    const result = validateBondCreation('C1', 'H5', atoms, bonds);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('valency_exceeded');
  });
});

describe('getAtomValidation', () => {
  it('returns valid for well-bonded oxygen', () => {
    const atoms: BuildableAtom[] = [
      { id: 'O', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'O', to: 'H1', order: 1 },
      { id: 'b2', from: 'O', to: 'H2', order: 1 }
    ];
    const result = getAtomValidation('O', atoms, bonds);
    expect(result.status).toBe('valid');
  });

  it('returns error for oxygen with too many bonds', () => {
    const atoms: BuildableAtom[] = [
      { id: 'O', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H3', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const bonds: BuildableBond[] = [
      { id: 'b1', from: 'O', to: 'H1', order: 1 },
      { id: 'b2', from: 'O', to: 'H2', order: 1 },
      { id: 'b3', from: 'O', to: 'H3', order: 1 }
    ];
    const result = getAtomValidation('O', atoms, bonds);
    expect(result.status).toBe('error');
  });
});

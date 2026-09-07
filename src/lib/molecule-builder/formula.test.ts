import { describe, it, expect } from 'vitest';
import { computeFormula, computeMolarMass, computeComposition } from '@/lib/molecule-builder/formula';
import type { BuildableAtom, BuildableBond } from '@/lib/molecule-builder/types';

describe('computeFormula', () => {
  it('returns empty string for no atoms', () => {
    expect(computeFormula([])).toBe('');
  });

  it('computes water formula H₂O', () => {
    const atoms: BuildableAtom[] = [
      { id: 'H1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'H2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: 'O', element: 'O', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const formula = computeFormula(atoms);
    expect(formula).toBe('H₂O');
  });

  it('sorts by Hill system (C first, then H, then alphabetical)', () => {
    const atoms: BuildableAtom[] = [
      { id: '1', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: '2', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: '3', element: 'H', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const formula = computeFormula(atoms);
    expect(formula.startsWith('C')).toBe(true);
    expect(formula.indexOf('H')).toBeLessThan(formula.indexOf('O'));
  });

  it('handles single atoms without subscript', () => {
    const atoms: BuildableAtom[] = [
      { id: '1', element: 'C', position: { x: 0, y: 0 }, charge: 0 }
    ];
    expect(computeFormula(atoms)).toBe('C');
  });
});

describe('computeMolarMass', () => {
  it('returns 0 for empty atoms', () => {
    expect(computeMolarMass([])).toBe(0);
  });

  it('computes water mass (18.015 g/mol)', () => {
    const atoms: BuildableAtom[] = [
      { id: '1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: '2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: '3', element: 'O', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const mass = computeMolarMass(atoms);
    expect(mass).toBeCloseTo(18.015, 2);
  });

  it('computes CO₂ mass (44.009 g/mol)', () => {
    const atoms: BuildableAtom[] = [
      { id: '1', element: 'C', position: { x: 0, y: 0 }, charge: 0 },
      { id: '2', element: 'O', position: { x: 0, y: 0 }, charge: 0 },
      { id: '3', element: 'O', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const mass = computeMolarMass(atoms);
    expect(mass).toBeCloseTo(44.009, 2);
  });
});

describe('computeComposition', () => {
  it('returns empty array for empty atoms', () => {
    expect(computeComposition([])).toEqual([]);
  });

  it('computes composition with percentages', () => {
    const atoms: BuildableAtom[] = [
      { id: '1', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: '2', element: 'H', position: { x: 0, y: 0 }, charge: 0 },
      { id: '3', element: 'O', position: { x: 0, y: 0 }, charge: 0 }
    ];
    const composition = computeComposition(atoms);
    expect(composition).toHaveLength(2);
    // H should be lighter (2 atoms vs 1 O)
    const hEntry = composition.find(c => c.element === 'H');
    const oEntry = composition.find(c => c.element === 'O');
    expect(hEntry?.count).toBe(2);
    expect(oEntry?.count).toBe(1);
    // Percentages should sum to 100
    const totalPercentage = composition.reduce((sum, c) => sum + c.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });
});

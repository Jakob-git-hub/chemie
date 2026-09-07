/**
 * Chemical formula computation
 * Computes molecular formula and molar mass from atoms
 */

import type { BuildableAtom, BuildableBond } from './types';
import { ELEMENT_DATA } from './valency';
import { ATOMIC_MASS } from '@/lib/chem';

/**
 * Computes the molecular formula string (e.g., "H2O", "C6H12O6")
 */
export function computeFormula(atoms: BuildableAtom[]): string {
  if (atoms.length === 0) return '';

  // Count atoms by element
  const counts: Record<string, number> = {};
  for (const atom of atoms) {
    counts[atom.element] = (counts[atom.element] ?? 0) + 1;
  }

  // Sort by Hill system: C first, then H, then alphabetical
  const elements = Object.keys(counts);
  elements.sort((a, b) => {
    if (a === 'C') return -1;
    if (b === 'C') return 1;
    if (a === 'H') return -1;
    if (b === 'H') return 1;
    return a.localeCompare(b);
  });

  // Build formula string
  const parts = elements.map(el => {
    const count = counts[el];
    return count === 1 ? el : `${el}${toSubscript(count)}`;
  });

  return parts.join('');
}

/**
 * Converts a number to subscript characters
 */
function toSubscript(num: number): string {
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return String(num).split('').map(d => subscripts[d] ?? d).join('');
}

/**
 * Computes the molar mass in g/mol
 */
export function computeMolarMass(atoms: BuildableAtom[]): number {
  let mass = 0;
  for (const atom of atoms) {
    const atomicMass = ATOMIC_MASS[atom.element] ?? 0;
    mass += atomicMass;
  }
  return Math.round(mass * 1000) / 1000; // Round to 3 decimal places
}

/**
 * Computes atom composition breakdown
 */
export function computeComposition(atoms: BuildableAtom[]): Array<{
  element: string;
  count: number;
  percentage: number;
  mass: number;
}> {
  const counts: Record<string, number> = {};
  for (const atom of atoms) {
    counts[atom.element] = (counts[atom.element] ?? 0) + 1;
  }

  const totalMass = computeMolarMass(atoms);
  if (totalMass === 0) return [];

  const composition: Array<{
    element: string;
    count: number;
    percentage: number;
    mass: number;
  }> = [];

  for (const [element, count] of Object.entries(counts)) {
    const atomicMass = ATOMIC_MASS[element] ?? 0;
    const totalElementMass = count * atomicMass;
    composition.push({
      element,
      count,
      percentage: Math.round((totalElementMass / totalMass) * 10000) / 100,
      mass: Math.round(totalElementMass * 1000) / 1000
    });
  }

  // Sort by count descending
  composition.sort((a, b) => b.count - a.count);
  return composition;
}

/**
 * Formats molar mass for display
 */
export function formatMolarMass(mass: number): string {
  if (mass === 0) return '–';
  return `${mass.toFixed(3)} g/mol`;
}

/**
 * Pure Physics Engine for the Atombaukasten
 * Zero side effects — fully testable, no DOM, no store dependencies
 */

import { ELEMENTS, type PeriodicElement } from '@/lib/elements';

/**
 * Subshell definition with filling order (Aufbau principle)
 */
export interface Subshell {
  name: string;       // e.g., "1s", "2p", "3d"
  n: number;          // Principal quantum number
  l: number;          // Azimuthal quantum number (0=s, 1=p, 2=d, 3=f)
  capacity: number;   // 2(2l+1) = 2, 6, 10, 14
}

/**
 * Ordered subshells by Aufbau filling order
 */
export const SUBSHELLS: Subshell[] = [
  { name: '1s', n: 1, l: 0, capacity: 2 },
  { name: '2s', n: 2, l: 0, capacity: 2 },
  { name: '2p', n: 2, l: 1, capacity: 6 },
  { name: '3s', n: 3, l: 0, capacity: 2 },
  { name: '3p', n: 3, l: 1, capacity: 6 },
  { name: '4s', n: 4, l: 0, capacity: 2 },
  { name: '3d', n: 3, l: 2, capacity: 10 },
  { name: '4p', n: 4, l: 1, capacity: 6 },
  { name: '5s', n: 5, l: 0, capacity: 2 },
  { name: '4d', n: 4, l: 2, capacity: 10 },
  { name: '5p', n: 5, l: 1, capacity: 6 },
  { name: '6s', n: 6, l: 0, capacity: 2 },
  { name: '4f', n: 4, l: 3, capacity: 14 },
  { name: '5d', n: 5, l: 2, capacity: 10 },
  { name: '6p', n: 6, l: 1, capacity: 6 },
  { name: '7s', n: 7, l: 0, capacity: 2 },
  { name: '5f', n: 5, l: 3, capacity: 14 },
  { name: '6d', n: 6, l: 2, capacity: 10 },
  { name: '7p', n: 7, l: 1, capacity: 6 },
];

/**
 * Map azimuthal quantum number to letter
 */
export const L_TO_LETTER = ['s', 'p', 'd', 'f'];

/**
 * Maximum electrons per shell (2n²)
 */
export function maxElectronsInShell(n: number): number {
  return 2 * n * n;
}

/**
 * Find element by atomic number Z
 */
export function getElementByZ(Z: number): PeriodicElement | undefined {
  return ELEMENTS.find((el) => el.number === Z);
}

/**
 * Compute element symbol from proton count (Z)
 */
export function computeElementSymbol(Z: number): string {
  const element = getElementByZ(Z);
  return element?.symbol || `Z${Z}`;
}

/**
 * Compute element name (German) from proton count (Z)
 */
export function computeElementName(Z: number): string {
  const element = getElementByZ(Z);
  return element?.name || `Element ${Z}`;
}

/**
 * Compute mass number A = Z + N
 */
export function computeMassNumber(Z: number, N: number): number {
  return Z + N;
}

/**
 * Compute charge = p⁺ - e⁻
 */
export function computeCharge(Z: number, electronCount: number): number {
  return Z - electronCount;
}

/**
 * Format charge as label (e.g., "+2", "0", "-1")
 */
export function formatCharge(charge: number): string {
  if (charge === 0) return '0';
  return charge > 0 ? `+${charge}` : String(charge);
}

/**
 * Format isotope notation (e.g., "⁵⁶Fe", "¹H")
 */
export function formatIsotopeNotation(Z: number, A: number): string {
  const symbol = computeElementSymbol(Z);
  const superscript = toSuperscript(A);
  return `${superscript}${symbol}`;
}

/**
 * Convert number to Unicode superscript
 */
function toSuperscript(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(n).split('').map((d) => map[d] || d).join('');
}

/**
 * Compute electron configuration using Aufbau principle
 * Returns subshell notation string (e.g., "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²")
 */
export function computeElectronConfiguration(Z: number, electronCount: number): string {
  if (electronCount <= 0) return '–';
  if (electronCount > 118) return '>118 e⁻';

  let remaining = electronCount;
  const parts: string[] = [];

  for (const subshell of SUBSHELLS) {
    if (remaining <= 0) break;
    const filled = Math.min(remaining, subshell.capacity);
    if (filled > 0) {
      parts.push(`${subshell.name}${toSubscript(filled)}`);
      remaining -= filled;
    }
  }

  return parts.join(' ');
}

/**
 * Convert number to Unicode subscript
 */
function toSubscript(n: number): string {
  const map: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  };
  return String(n).split('').map((d) => map[d] || d).join('');
}

/**
 * Compute shell occupancy for Bohr model visualization
 * Returns array of electron counts per shell n=1,2,3,...
 */
export function computeShellOccupancy(Z: number, electronCount: number): number[] {
  if (electronCount <= 0) return [];

  // Compute the actual electron configuration first, then group by shell (n)
  // This respects the Aufbau principle and the Pauli exclusion principle.
  // Shell occupancy is not just a sequential fill of 2n², because the
  // third shell (3d) doesn't start filling until after 4s is filled.
  const occupancy: number[] = [];
  let remaining = electronCount;

  for (const subshell of SUBSHELLS) {
    if (remaining <= 0) break;
    const filled = Math.min(remaining, subshell.capacity);
    if (filled > 0) {
      while (occupancy.length <= subshell.n - 1) {
        occupancy.push(0);
      }
      occupancy[subshell.n - 1] += filled;
      remaining -= filled;
    }
  }

  // Trim trailing empty shells
  while (occupancy.length > 0 && occupancy[occupancy.length - 1] === 0) {
    occupancy.pop();
  }

  return occupancy;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate atom physics state
 */
export function validateAtom(Z: number, N: number, electronCount: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Z must be positive
  if (Z <= 0) {
    errors.push('Ordnungszahl (Protonen) muss ≥ 1 sein');
  }
  if (Z > 118) {
    warnings.push('Elemente mit Z > 118 sind nicht im Periodensystem definiert');
  }

  // Neutron count reasonable
  if (N < 0) {
    errors.push('Neutronenzahl darf nicht negativ sein');
  }
  if (N > 200) {
    warnings.push('Sehr hohe Neutronenzahl (>200) unrealistisch');
  }

  // Electron count
  if (electronCount < 0) {
    errors.push('Elektronenzahl darf nicht negativ sein');
  }
  if (electronCount > Z + 10) {
    warnings.push('Stark negativ geladenes Ion (viele Überschuss-Elektronen)');
  }
  if (electronCount > 118) {
    errors.push('Elektronenzahl > 118 nicht darstellbar');
  }

  // Pauli principle check: electron count per shell ≤ 2n²
  const occupancy = computeShellOccupancy(Z, electronCount);
  occupancy.forEach((count, i) => {
    const shellNum = i + 1;
    const max = maxElectronsInShell(shellNum);
    if (count > max) {
      errors.push(`Pauli-Verletzung: Schale ${shellNum} hat ${count} e⁻, Maximum ist ${max} (2n²)`);
    }
  });

  // Subshell capacity check
  let remaining = electronCount;
  for (const subshell of SUBSHELLS) {
    if (remaining <= 0) break;
    const filled = Math.min(remaining, subshell.capacity);
    if (filled > subshell.capacity) {
      errors.push(`Pauli-Verletzung: ${subshell.name} Überlauf (${filled}/${subshell.capacity})`);
    }
    remaining -= filled;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Complete physics computation result
 */
export interface AtomPhysicsResult {
  elementSymbol: string;
  elementName: string;
  atomicNumber: number;
  massNumber: number;
  charge: number;
  chargeLabel: string;
  isotopeNotation: string;
  electronConfiguration: string;
  shellOccupancy: number[];
  validation: ValidationResult;
}

/**
 * Main entry point: compute all physics from subatomic particle counts
 */
export function computeAtomPhysics(
  protonCount: number,
  neutronCount: number,
  electronCount: number
): AtomPhysicsResult {
  const Z = protonCount;
  const N = neutronCount;
  const e = electronCount;
  const A = computeMassNumber(Z, N);
  const charge = computeCharge(Z, e);

  return {
    elementSymbol: computeElementSymbol(Z),
    elementName: computeElementName(Z),
    atomicNumber: Z,
    massNumber: A,
    charge,
    chargeLabel: formatCharge(charge),
    isotopeNotation: formatIsotopeNotation(Z, A),
    electronConfiguration: computeElectronConfiguration(Z, e),
    shellOccupancy: computeShellOccupancy(Z, e),
    validation: validateAtom(Z, N, e),
  };
}

/**
 * Default initial state: Hydrogen atom
 */
export const DEFAULT_ATOM_STATE = {
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1,
};

/**
 * Limits for particle counts
 */
export const PARTICLE_LIMITS = {
  proton: { min: 1, max: 118 },
  neutron: { min: 0, max: 200 },
  electron: { min: 0, max: 118 },
} as const;
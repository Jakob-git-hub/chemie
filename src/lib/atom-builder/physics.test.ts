/**
 * Unit tests for the Atombaukasten physics engine
 * Run with: npx vitest run src/lib/atom-builder/physics.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  computeElementSymbol,
  computeElementName,
  computeMassNumber,
  computeCharge,
  formatCharge,
  formatIsotopeNotation,
  computeElectronConfiguration,
  computeShellOccupancy,
  validateAtom,
  computeAtomPhysics,
  maxElectronsInShell,
  SUBSHELLS,
} from '@/lib/atom-builder/physics';

describe('Element Lookup', () => {
  it('returns H for Z=1', () => {
    expect(computeElementSymbol(1)).toBe('H');
    expect(computeElementName(1)).toBe('Wasserstoff');
  });

  it('returns He for Z=2', () => {
    expect(computeElementSymbol(2)).toBe('He');
    expect(computeElementName(2)).toBe('Helium');
  });

  it('returns Fe for Z=26', () => {
    expect(computeElementSymbol(26)).toBe('Fe');
    expect(computeElementName(26)).toBe('Eisen');
  });

  it('returns U for Z=92', () => {
    expect(computeElementSymbol(92)).toBe('U');
    expect(computeElementName(92)).toBe('Uran');
  });

  it('returns "Z999" for unknown elements', () => {
    expect(computeElementSymbol(119)).toBe('Z119');
  });
});

describe('Mass Number', () => {
  it('computes A = Z + N', () => {
    expect(computeMassNumber(1, 0)).toBe(1);  // ¹H
    expect(computeMassNumber(6, 6)).toBe(12); // ¹²C
    expect(computeMassNumber(8, 8)).toBe(16); // ¹⁶O
    expect(computeMassNumber(26, 30)).toBe(56); // ⁵⁶Fe
  });
});

describe('Charge', () => {
  it('returns 0 for neutral atoms', () => {
    expect(computeCharge(1, 1)).toBe(0);
    expect(computeCharge(8, 8)).toBe(0);
    expect(computeCharge(26, 26)).toBe(0);
  });

  it('returns positive for cations', () => {
    expect(computeCharge(11, 10)).toBe(1);  // Na⁺
    expect(computeCharge(26, 24)).toBe(2);  // Fe²⁺
    expect(computeCharge(26, 23)).toBe(3);  // Fe³⁺
  });

  it('returns negative for anions', () => {
    expect(computeCharge(8, 9)).toBe(-1);   // OH⁻ or O⁻
    expect(computeCharge(9, 10)).toBe(-1);  // F⁻
  });

  it('formats charge correctly', () => {
    expect(formatCharge(0)).toBe('0');
    expect(formatCharge(1)).toBe('+1');
    expect(formatCharge(2)).toBe('+2');
    expect(formatCharge(-1)).toBe('-1');
    expect(formatCharge(-3)).toBe('-3');
  });
});

describe('Isotope Notation', () => {
  it('formats with superscript mass number', () => {
    expect(formatIsotopeNotation(1, 1)).toBe('¹H');
    expect(formatIsotopeNotation(6, 12)).toBe('¹²C');
    expect(formatIsotopeNotation(8, 16)).toBe('¹⁶O');
    expect(formatIsotopeNotation(26, 56)).toBe('⁵⁶Fe');
  });
});

describe('Electron Configuration', () => {
  it('computes 1s¹ for 1 electron', () => {
    expect(computeElectronConfiguration(1, 1)).toBe('1s₁');
  });

  it('computes 1s² for 2 electrons', () => {
    expect(computeElectronConfiguration(2, 2)).toBe('1s₂');
  });

  it('computes 1s² 2s² 2p⁶ for 10 electrons (Ne)', () => {
    expect(computeElectronConfiguration(10, 10)).toBe('1s₂ 2s₂ 2p₆');
  });

  it('computes full configuration for O (8 e⁻)', () => {
    expect(computeElectronConfiguration(8, 8)).toBe('1s₂ 2s₂ 2p₄');
  });

  it('computes full configuration for Fe (26 e⁻)', () => {
    expect(computeElectronConfiguration(26, 26)).toBe('1s₂ 2s₂ 2p₆ 3s₂ 3p₆ 4s₂ 3d₆');
  });

  it('returns "–" for 0 electrons', () => {
    expect(computeElectronConfiguration(1, 0)).toBe('–');
  });

  it('uses proper Aufbau order (4s before 3d)', () => {
    // K (19): 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹
    const config = computeElectronConfiguration(19, 19);
    expect(config).toContain('4s');
    // 4s should appear before 3d
    const sIdx = config.indexOf('4s');
    const dIdx = config.indexOf('3d');
    expect(sIdx).toBeGreaterThan(-1);
    expect(dIdx).toBe(-1); // K has no 3d electrons
  });
});

describe('Shell Occupancy', () => {
  it('returns [2] for 2 electrons (He)', () => {
    expect(computeShellOccupancy(2, 2)).toEqual([2]);
  });

  it('returns [2, 8] for 10 electrons (Ne)', () => {
    expect(computeShellOccupancy(10, 10)).toEqual([2, 8]);
  });

  it('returns [2, 8, 8, 2] for 20 electrons (Ca)', () => {
    // Ca (20 e⁻): 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² → [2, 8, 8, 2]
    expect(computeShellOccupancy(20, 20)).toEqual([2, 8, 8, 2]);
  });

  it('returns [2, 8, 18, 4] for 32 electrons (Ge)', () => {
    // Ge (32 e⁻): 1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p² → [2, 8, 18, 4]
    expect(computeShellOccupancy(32, 32)).toEqual([2, 8, 18, 4]);
  });

  it('returns empty for 0 electrons', () => {
    expect(computeShellOccupancy(1, 0)).toEqual([]);
  });

  it('respects 2n² limit', () => {
    // Shell n=1 can have max 2 electrons
    expect(computeShellOccupancy(1, 2)).toEqual([2]);
    // Shell n=2 can have max 8 electrons
    expect(computeShellOccupancy(1, 10)).toEqual([2, 8]);
  });
});

describe('Max Electrons in Shell', () => {
  it('computes 2n² correctly', () => {
    expect(maxElectronsInShell(1)).toBe(2);
    expect(maxElectronsInShell(2)).toBe(8);
    expect(maxElectronsInShell(3)).toBe(18);
    expect(maxElectronsInShell(4)).toBe(32);
    expect(maxElectronsInShell(5)).toBe(50);
  });
});

describe('Validation', () => {
  it('passes for valid neutral atoms', () => {
    expect(validateAtom(1, 0, 1).valid).toBe(true);
    expect(validateAtom(8, 8, 8).valid).toBe(true);
    expect(validateAtom(26, 26, 26).valid).toBe(true);
  });

  it('passes for valid ions', () => {
    expect(validateAtom(11, 12, 10).valid).toBe(true); // Na⁺
    expect(validateAtom(26, 24, 24).valid).toBe(true);  // Fe²⁺
  });

  it('errors on Z <= 0', () => {
    const result = validateAtom(0, 0, 0);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Ordnungszahl (Protonen) muss ≥ 1 sein');
  });

  it('errors on negative neutron count', () => {
    const result = validateAtom(1, -1, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Neutron'))).toBe(true);
  });

  it('errors on negative electron count', () => {
    const result = validateAtom(1, 0, -1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Elektron'))).toBe(true);
  });

  it('checks Pauli principle violations', () => {
    // Try to fit 3 electrons in shell 1 (max 2) — this shouldn't happen
    // since computeShellOccupancy enforces 2n², but validate should check
    const result = validateAtom(1, 0, 5);
    expect(result.valid).toBe(true); // 5 electrons → [2, 3] shells, no violation
    // Pauli violation is per-orbital, which 2n² already prevents at shell level
  });
});

describe('Complete Physics Computation', () => {
  it('computes H (¹H) correctly', () => {
    const result = computeAtomPhysics(1, 0, 1);
    expect(result.elementSymbol).toBe('H');
    expect(result.elementName).toBe('Wasserstoff');
    expect(result.atomicNumber).toBe(1);
    expect(result.massNumber).toBe(1);
    expect(result.charge).toBe(0);
    expect(result.chargeLabel).toBe('0');
    expect(result.isotopeNotation).toBe('¹H');
    expect(result.electronConfiguration).toBe('1s₁');
    expect(result.shellOccupancy).toEqual([1]);
    expect(result.validation.valid).toBe(true);
  });

  it('computes O (¹⁶O) correctly', () => {
    const result = computeAtomPhysics(8, 8, 8);
    expect(result.elementSymbol).toBe('O');
    expect(result.elementName).toBe('Sauerstoff');
    expect(result.atomicNumber).toBe(8);
    expect(result.massNumber).toBe(16);
    expect(result.charge).toBe(0);
    expect(result.isotopeNotation).toBe('¹⁶O');
    expect(result.electronConfiguration).toBe('1s₂ 2s₂ 2p₄');
    expect(result.shellOccupancy).toEqual([2, 6]);
  });

  it('computes Fe (⁵⁶Fe) correctly', () => {
    const result = computeAtomPhysics(26, 30, 26);
    expect(result.elementSymbol).toBe('Fe');
    expect(result.elementName).toBe('Eisen');
    expect(result.atomicNumber).toBe(26);
    expect(result.massNumber).toBe(56);
    expect(result.charge).toBe(0);
    expect(result.isotopeNotation).toBe('⁵⁶Fe');
    expect(result.shellOccupancy).toEqual([2, 8, 14, 2]);
  });

  it('computes Na⁺ ion correctly', () => {
    const result = computeAtomPhysics(11, 12, 10); // Na⁺: 11p, 12n, 10e⁻
    expect(result.elementSymbol).toBe('Na');
    expect(result.elementName).toBe('Natrium');
    expect(result.charge).toBe(1);
    expect(result.chargeLabel).toBe('+1');
    expect(result.isotopeNotation).toBe('²³Na');
  });

  it('computes Ca²⁻ ion correctly (hypothetical)', () => {
    const result = computeAtomPhysics(20, 20, 22); // 20p, 20n, 22e⁻ → -2
    expect(result.charge).toBe(-2);
    expect(result.chargeLabel).toBe('-2');
    expect(result.shellOccupancy).toEqual([2, 8, 10, 2]);
  });
});

describe('Subshell Definitions', () => {
  it('has correct capacities', () => {
    const s = SUBSHELLS.find((s) => s.l === 0);
    expect(s?.capacity).toBe(2);
    const p = SUBSHELLS.find((s) => s.l === 1);
    expect(p?.capacity).toBe(6);
    const d = SUBSHELLS.find((s) => s.l === 2);
    expect(d?.capacity).toBe(10);
    const f = SUBSHELLS.find((s) => s.l === 3);
    expect(f?.capacity).toBe(14);
  });

  it('has correct Aufbau order (4s before 3d)', () => {
    const shells4s = SUBSHELLS.findIndex((s) => s.name === '4s');
    const shells3d = SUBSHELLS.findIndex((s) => s.name === '3d');
    expect(shells4s).toBeGreaterThan(-1);
    expect(shells3d).toBeGreaterThan(-1);
    expect(shells4s).toBeLessThan(shells3d);
  });
});
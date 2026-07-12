import { describe, it, expect } from 'vitest';
import { parseFormula, balanceEquation } from '@/lib/chem';

describe('parseFormula', () => {
  it('berechnet Wasser korrekt', () => {
    const r = parseFormula('H2O');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.counts).toEqual({ H: 2, O: 1 });
      expect(r.mass).toBeCloseTo(18.015, 2);
    }
  });

  it('behandelt Klammern und Hydrate', () => {
    const r = parseFormula('(NH4)2SO4');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.counts).toEqual({ N: 2, H: 8, S: 1, O: 4 });

    const h = parseFormula('CuSO4*5H2O');
    expect(h.ok).toBe(true);
    if (h.ok) expect(h.counts).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
  });

  it('lehnt unbekannte Elemente ab', () => {
    expect(parseFormula('Xy2').ok).toBe(false);
  });
});

describe('balanceEquation', () => {
  it('gleicht Wasserstoffverbrennung aus', () => {
    const r = balanceEquation('H2 + O2 -> H2O');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.coeffs).toEqual([2, 1, 2]);
      expect(r.balanced).toBe('2H2 + O2 → 2H2O');
    }
  });

  it('gleicht Methanverbrennung aus', () => {
    const r = balanceEquation('CH4 + O2 -> CO2 + H2O');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.coeffs).toEqual([1, 2, 1, 2]);
  });

  it('meldet fehlendes Trennzeichen', () => {
    expect(balanceEquation('H2 O2').ok).toBe(false);
  });
});

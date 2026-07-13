import { describe, it, expect } from 'vitest';
import { analyzeReaction, computeGibbs, checkAtomBalance } from '@/lib/api';
import { balanceEquation } from '@/lib/chem';

describe('Integration: Fe + O2 ->', () => {
  it('gleicht automatisch aus und bilanziert Atome', () => {
    const a = analyzeReaction('Fe + O2 ->');
    expect(a.ok).toBe(true);
    expect(a.balanced).toBe('4Fe + 3O2 → 2Fe2O3');
    expect(a.coeffs).toEqual([4, 3, 2]);

    const bal = checkAtomBalance(a.species!);
    expect(bal.balanced).toBe(true);
    expect(bal.rows.find((r) => r.element === 'Fe')!.ok).toBe(true);
    expect(bal.rows.find((r) => r.element === 'O')!.ok).toBe(true);
  });

  it('berechnet ΔG korrekt mit Einheiten-Sync (kJ -> J)', () => {
    const a = analyzeReaction('Fe + O2 ->');
    const rec = a.species!.map((s) => ({
      formula: s.formula,
      coeff: s.coeff,
      hFormation: s.formula === 'Fe' ? 0 : s.formula === 'O2' ? 0 : -824.2,
      entropy: s.formula === 'Fe' ? 27.28 : s.formula === 'O2' ? 205.15 : 87.4
    }));
    const r = rec.filter((x) => x.formula !== 'Fe2O3');
    const p = rec.filter((x) => x.formula === 'Fe2O3');
    const g = computeGibbs(r, p, 298);

    expect(g.deltaH).toBeCloseTo(-1648.4, 1);
    expect(g.deltaS).toBeCloseTo(-549.77, 1);
    expect(g.deltaG).toBeCloseTo(-1484.57, 1); // spontan
  });
});

describe('Integration: CH4 + O2 ->', () => {
  it('schlägt Verbrennungsprodukte vor und gleicht aus', () => {
    const a = analyzeReaction('CH4 + O2 ->');
    expect(a.ok).toBe(true);
    expect(a.balanced).toBe('CH4 + 2O2 → CO2 + 2H2O');
    expect(a.coeffs).toEqual([1, 2, 1, 2]);
    expect(checkAtomBalance(a.species!).balanced).toBe(true);
  });

  it('exakter rationaler Ausgleich bei komplizierten Brüchen', () => {
    // C2H6 + 7/2 O2 -> 2 CO2 + 3 H2O  => [2, 7, 4, 6]
    const b = balanceEquation('C2H6 + O2 -> CO2 + H2O');
    expect(b.ok).toBe(true);
    if (b.ok) expect(b.coeffs).toEqual([2, 7, 4, 6]);
  });
});

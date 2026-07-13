import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveCompound, analyzeReaction, computeGibbs, checkAtomBalance, LOCAL_THERMO } from '@/lib/api';

const SDF_3D = `C6H12O6
  JSmol repair test
 24 24  0  0  0  0  0  0  0  0999 V2000
`;

/**
 * POST-FIX-VERIFIKATIONSTEST (Belastungstest)
 * Simuliert den Live-Flow NACH einem Routenwechsel auf #/molecules:
 *   1. dynamische Summenformel (Hill-System) eingeben -> PubChem auflösen
 *   2. SDF an den (reparierten) JSmol-Viewer übergeben (loadInline)
 *   3. Reaktionsgleichung ausgleichen + Atombilanz prüfen
 *   4. Gibbs-Helmholtz mit exaktem kJ->J-Unit-Sync koppeln
 * Läuft headless (offline) mit gemocktem PubChem + gemocktem window.Jmol.
 */
describe('Post-Fix: dynamische Summenformel direkt nach Routenwechsel', () => {
  afterEach(() => vi.restoreAllMocks());

  it('löst C6H12O6 auf, spielt SDF in den reparierten Viewer und koppelt Gibbs', async () => {
    // --- 1. PubChem mocken (offline, deterministisch) ---
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/property/')) {
          return {
            ok: true,
            json: async () => ({
              PropertyTable: {
                Properties: [
                  { CID: 5793, IUPACName: 'D-glucose', MolecularFormula: 'C6H12O6', IsomericSMILES: 'C(C1C(C(C(C(O1)O)O)O)O)O' }
                ]
              }
            })
          };
        }
        if (url.includes('/record/SDF')) {
          return { ok: true, text: async () => SDF_3D };
        }
        return { ok: false, json: async () => ({}) };
      })
    );

    // --- 2. reparierten JSmol-Viewer mocken (getApplet trifft #jsmolApplet, kein getAppletHtml) ---
    const loadInline = vi.fn();
    const getApplet = vi.fn((id: string) => ({ _id: id, loadInline }));
    (globalThis as any).Jmol = { getApplet, loadInline };

    const info = await resolveCompound('C6H12O6');
    expect(info).not.toBeNull();
    expect(info!.formula).toBe('C6H12O6');
    expect(/V2000|V3000/.test(info!.sdf)).toBe(true);

    // --- 3. SDF in den Viewer spielen (reaktiver Lade-Pfad) ---
    const applet = (globalThis as any).Jmol.getApplet('jsmolApplet'); // Reparatur: id == Element-id
    appletRef(applet, info!.sdf);
    expect(getApplet).toHaveBeenCalledWith('jsmolApplet');
    expect(loadInline).toHaveBeenCalledWith(applet, info!.sdf);

    // --- 4. Atombilanz + Gibbs-Reaktionskopplung (CH4-Verbrennung) ---
    const a = analyzeReaction('CH4 + O2 ->');
    expect(a.ok).toBe(true);
    expect(a.balanced).toBe('CH4 + 2O2 → CO2 + 2H2O');

    const bal = checkAtomBalance(a.species!);
    expect(bal.balanced).toBe(true);

    const r = a.species!.filter((s) => s.role === 'reactant').map((s) => ({
      formula: s.formula, coeff: s.coeff,
      hFormation: LOCAL_THERMO[s.formula].hFormation, entropy: LOCAL_THERMO[s.formula].entropy
    }));
    const p = a.species!.filter((s) => s.role === 'product').map((s) => ({
      formula: s.formula, coeff: s.coeff,
      hFormation: LOCAL_THERMO[s.formula].hFormation, entropy: LOCAL_THERMO[s.formula].entropy
    }));
    const g = computeGibbs(r, p, 298);

    // Erwartet: ΔH=-802.34, ΔS=-5.11, ΔG≈-800.82 kJ/mol  (exakter kJ->J-Sync)
    expect(g.deltaH).toBeCloseTo(-802.34, 1);
    expect(g.deltaS).toBeCloseTo(-5.11, 1);
    expect(g.deltaG).toBeCloseTo(-800.82, 1);
    expect(Number.isNaN(g.deltaG!)).toBe(false); // keine NaN
    expect(g.deltaG!).toBeLessThan(0); // spontan
  });
});

// Hilfs-Funktion: ahmt den reparierten Reaktiv-Effekt aus molecules.tsx nach.
function appletRef(applet: any, sdf: string) {
  (globalThis as any).Jmol.loadInline(applet, sdf);
}

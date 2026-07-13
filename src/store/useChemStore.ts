import { create } from 'zustand';
import { balanceEquation, suggestProducts, calculateDeltaHFromBonds } from '@/lib/chem';
import type { Molecule } from '@/lib/types';
import { MOLECULES } from '@/data/molecules';
import { fetchMainIsomer } from '@/lib/jsmol';
import thermoData from '@/data/thermo.json';

// Standardmolare Entropien S⁰ [J/(mol·K)] und Bildungsenthalpien H_f⁰ [kJ/mol].
const S0 = (thermoData as { S0: Record<string, number> }).S0;
const FORM = (thermoData as { formationEnthalpy: Record<string, number> }).formationEnthalpy;

// Schlankes DE→EN-Mapping (PubChem erwartet englische Begriffe).
const DE_EN: Record<string, string> = {
  wasser: 'water',
  wasserstoff: 'hydrogen',
  sauerstoff: 'oxygen',
  kohlenstoff: 'carbon',
  stickstoff: 'nitrogen',
  kohlendioxid: 'carbon dioxide',
  kohlenstoffdioxid: 'carbon dioxide',
  kohlenmonoxid: 'carbon monoxide',
  methan: 'methane',
  ethan: 'ethane',
  ethen: 'ethene',
  propan: 'propane',
  ammoniak: 'ammonia',
  ethanol: 'ethanol',
  methanol: 'methanol',
  benzol: 'benzene',
  toluol: 'toluene',
  phenol: 'phenol',
  koffein: 'caffeine',
  aspirin: 'aspirin',
  acetylsalicylsäure: 'aspirin',
  glukose: 'glucose',
  traubenzucker: 'glucose',
  zucker: 'sucrose',
  essigsäure: 'acetic acid',
  ameisensäure: 'formic acid',
  zitronensäure: 'citric acid',
  harnstoff: 'urea',
  natriumchlorid: 'sodium chloride',
  kochsalz: 'sodium chloride',
  salzsäure: 'hydrogen chloride',
  schwefelsäure: 'sulfuric acid',
  natronlauge: 'sodium hydroxide',
  eisen: 'iron',
  magnesium: 'magnesium',
  schwefel: 'sulfur',
  salpeter: 'niter'
};

export interface BalanceResult {
  ok: boolean;
  balanced?: string;
  reactants?: string[];
  products?: string[];
  coeffs?: number[];
  error?: string;
}

interface Override {
  dHf?: number;
  S?: number;
}

interface ChemState {
  // --- Suche / JSmol ---
  query: string;
  isomer: { name: string; formula: string; cid: number; smiles?: string } | null;
  sdf: string | null;
  jsmolReady: boolean;
  searchStatus: string | null;

  // --- Stöchiometrie ---
  equation: string;
  balance: BalanceResult | null;
  note: string | null;

  // --- Thermo ---
  deltaH: number | null; // kJ/mol
  deltaS: number | null; // J/(mol·K)
  temperature: number; // K
  deltaG: number | null; // kJ/mol
  missingThermo: string[];
  overrides: Record<string, Override>;

  // --- Aktionen ---
  setQuery: (q: string) => void;
  setEquation: (e: string) => void;
  setTemperature: (t: number) => void;
  setJsmolReady: (b: boolean) => void;
  setOverride: (formula: string, key: 'dHf' | 'S', value: number) => void;
  loadMolecule: (q: string) => Promise<void>;
  analyze: (eq: string) => void;
  computeDeltaG: () => void;
}

function computeThermo(
  bal: BalanceResult,
  overrides: Record<string, Override>
): { deltaH: number | null; deltaS: number | null; missing: string[] } {
  if (!bal.ok || !bal.reactants || !bal.products || !bal.coeffs) {
    return { deltaH: null, deltaS: null, missing: [] };
  }
  const { reactants, products, coeffs } = bal;
  const missing = new Set<string>();
  let dH = 0;
  let dS = 0;
  let haveH = true;
  let haveS = true;

  reactants.concat(products).forEach((f, i) => {
    const sign = i < reactants.length ? -1 : 1; // Edukte -, Produkte +
    const nu = coeffs[i];
    const o = overrides[f];
    const dHf = o?.dHf ?? FORM[f];
    const s = o?.S ?? S0[f];
    if (dHf === undefined) {
      haveH = false;
      missing.add(f);
    } else {
      dH += sign * nu * dHf;
    }
    if (s === undefined) {
      haveS = false;
      missing.add(f);
    } else {
      dS += sign * nu * s;
    }
  });

  return {
    deltaH: haveH ? Number(dH.toFixed(2)) : null,
    deltaS: haveS ? Number(dS.toFixed(2)) : null,
    missing: [...missing]
  };
}

export const useChemStore = create<ChemState>((set, get) => ({
  query: '',
  isomer: null,
  sdf: null,
  jsmolReady: false,
  searchStatus: null,

  equation: '',
  balance: null,
  note: null,

  deltaH: null,
  deltaS: null,
  temperature: 298,
  deltaG: null,
  missingThermo: [],
  overrides: {},

  setQuery: (q) => set({ query: q }),
  setEquation: (e) => set({ equation: e }),
  setTemperature: (t) => {
    set({ temperature: t });
    get().computeDeltaG();
  },
  setJsmolReady: (b) => set({ jsmolReady: b }),
  setOverride: (formula, key, value) =>
    set((s) => ({
      overrides: { ...s.overrides, [formula]: { ...s.overrides[formula], [key]: value } }
    })),

  loadMolecule: async (qRaw) => {
    const trimmed = qRaw.trim();
    const q = DE_EN[trimmed.toLowerCase()] ?? trimmed; // Lokalisierung
    set({ searchStatus: 'Suche in PubChem …' });
    try {
      const res = await fetchMainIsomer(q);
      if (!res) {
        set({ searchStatus: `„${trimmed}“ nicht in PubChem gefunden.` });
        return;
      }
      set({
        sdf: res.sdf,
        isomer: { name: res.name, formula: trimmed, cid: res.cid, smiles: res.smiles },
        searchStatus: `Hauptisomer geladen: ${res.name} (CID ${res.cid})`
      });
    } catch {
      set({ searchStatus: 'Netzwerkfehler bei PubChem.' });
    }
  },

  analyze: (eqRaw) => {
    const raw = eqRaw.trim();
    const norm = raw.replace(/→|=/g, '->');
    const parts = norm.split('->');
    if (parts.length !== 2) {
      set({
        balance: { ok: false, error: 'Bitte genau einen Pfeil (-> oder →) verwenden.' },
        note: null,
        deltaH: null,
        deltaS: null,
        deltaG: null,
        missingThermo: []
      });
      return;
    }
    let reactants = parts[0].split('+').map((s) => s.trim()).filter(Boolean);
    let products = parts[1].split('+').map((s) => s.trim()).filter(Boolean);

    // Unvollständige Gleichung: sinnvolle Produkte vorschlagen.
    if (products.length === 0) {
      const sugg = suggestProducts(reactants);
      if (sugg.length) products = sugg;
    }

    const fullEq = `${reactants.join(' + ')} -> ${products.join(' + ')}`;
    const bal = balanceEquation(fullEq); // mathematischer Ausgleich (Hill/species)

    if (!bal.ok) {
      set({
        balance: { ok: false, error: bal.error ?? 'Gleichung nicht ausgleichbar.' },
        note:
          products.length === 0
            ? 'Keine Produkte ermittelbar – bitte Produkte angeben oder eine bekannte Edukt-Kombination wählen.'
            : null,
        equation: fullEq,
        deltaH: null,
        deltaS: null,
        deltaG: null,
        missingThermo: []
      });
      return;
    }

    const res = computeThermo(bal, get().overrides);
    set({
      balance: bal,
      equation: fullEq,
      note: null,
      deltaH: res.deltaH,
      deltaS: res.deltaS,
      missingThermo: res.missing,
      deltaG: null
    });
    get().computeDeltaG();
  },

  computeDeltaG: () => {
    const { deltaH, deltaS, temperature } = get();
    // Einheiten-Sync: ΔH [kJ/mol] -> J/mol (*1000), ΔS bereits [J/(mol·K)].
    if (deltaH === null || deltaS === null) {
      set({ deltaG: null });
      return;
    }
    const dG_J = deltaH * 1000 - temperature * deltaS; // Joule/mol
    set({ deltaG: Number((dG_J / 1000).toFixed(2)) }); // zurück zu kJ/mol
  }
}));

// Hilfsfunktion für die UI: Bindungsenergie-Route (Modus A) bei Bedarf.
export function deltaHFromBonds(reactantFormulas: string[], productFormulas: string[]) {
  const rMols = reactantFormulas
    .map((f) => MOLECULES.find((m) => m.formula === f) ?? null)
    .filter((m): m is Molecule => m !== null);
  const pMols = productFormulas
    .map((f) => MOLECULES.find((m) => m.formula === f) ?? null)
    .filter((m): m is Molecule => m !== null);
  if (rMols.length === 0 || pMols.length === 0) return null;
  return calculateDeltaHFromBonds(rMols, pMols);
}

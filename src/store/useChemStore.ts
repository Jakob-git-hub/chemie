import { create } from 'zustand';
import {
  resolveCompound,
  fetchThermo,
  analyzeReaction,
  computeGibbs,
  LOCAL_THERMO,
  type ThermoData
} from '@/lib/api';

interface Override {
  dHf?: number;
  S?: number;
}

interface SpeciesThermo {
  formula: string;
  coeff: number;
  hFormation: number | null;
  entropy: number | null;
}

interface Species {
  formula: string;
  role: 'reactant' | 'product';
  coeff: number;
}

interface BalanceState {
  ok: boolean;
  balanced?: string;
  species?: Species[];
  error?: string;
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
  balance: BalanceState | null;
  note: string | null;

  // --- Thermo ---
  thermoCache: Record<string, ThermoData>;
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

/** Löst Thermodaten einer Spezies auf: manuell -> Cache -> lokale Tabelle -> fehlend. */
function resolveThermo(formula: string, s: ChemState): ThermoData {
  const base: ThermoData =
    s.thermoCache[formula] ??
    (LOCAL_THERMO[formula]
      ? {
          hFormation: LOCAL_THERMO[formula].hFormation,
          entropy: LOCAL_THERMO[formula].entropy,
          source: 'local'
        }
      : { hFormation: null, entropy: null, source: 'missing' });

  const ov = s.overrides[formula];
  if (ov) {
    return {
      hFormation: ov.dHf ?? base.hFormation,
      entropy: ov.S ?? base.entropy,
      source: 'manual'
    };
  }
  return base;
}

/** Teilt die Reaktionsspezies in Edukte/Produkte auf und reichert sie mit Thermo an. */
function splitSpecies(species: Species[], s: ChemState): { r: SpeciesThermo[]; p: SpeciesThermo[] } {
  const r: SpeciesThermo[] = [];
  const p: SpeciesThermo[] = [];
  for (const sp of species) {
    const t = resolveThermo(sp.formula, s);
    const entry: SpeciesThermo = {
      formula: sp.formula,
      coeff: sp.coeff,
      hFormation: t.hFormation,
      entropy: t.entropy
    };
    if (sp.role === 'reactant') r.push(entry);
    else p.push(entry);
  }
  return { r, p };
}

/** Best-Effort: fehlende Thermodaten live aus PubChem nachladen (kein Loop, kein Absturz). */
async function refreshMissing(
  missing: string[],
  set: (partial: Partial<ChemState>) => void,
  get: () => ChemState
): Promise<void> {
  for (const f of missing) {
    if (get().overrides[f]) continue; // manuell gepflegt -> nicht überschreiben
    try {
      const info = await resolveCompound(f);
      if (!info) continue;
      const thermo = await fetchThermo(info.cid, info.formula);
      if (thermo.hFormation == null && thermo.entropy == null) continue;
      set({ thermoCache: { ...get().thermoCache, [f]: thermo } });
      if (get().equation) get().analyze(get().equation); // Gibbs reaktiv neu verrechnen
    } catch {
      /* still fehlend -> manuelle Eingabe im UI */
    }
  }
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

  thermoCache: {},
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

  // 3D-Struktur laden UND Thermo synchron mitabfragen (KPI #1)
  loadMolecule: async (qRaw) => {
    const q = qRaw.trim();
    set({ searchStatus: 'Suche in PubChem …' });
    const info = await resolveCompound(q);
    if (!info) {
      set({ searchStatus: `„${q}“ nicht in PubChem gefunden.`, sdf: null, isomer: null });
      return;
    }
    set({
      sdf: info.sdf,
      isomer: { name: info.name, formula: q, cid: info.cid, smiles: info.smiles },
      searchStatus: `Hauptisomer geladen: ${info.name} (CID ${info.cid})`
    });
    const thermo = await fetchThermo(info.cid, info.formula);
    set((s) => ({ thermoCache: { ...s.thermoCache, [info.formula]: thermo } }));
    if (get().equation) get().analyze(get().equation); // Gibbs reaktiv neu verrechnen
  },

  analyze: (eqRaw) => {
    const res = analyzeReaction(eqRaw);
    if (!res.ok) {
      set({
        balance: { ok: false, error: res.error },
        note: res.note ?? null,
        deltaH: null,
        deltaS: null,
        deltaG: null,
        missingThermo: []
      });
      return;
    }
    if (!res.species) return;
    set({ balance: { ok: true, balanced: res.balanced, species: res.species }, equation: eqRaw, note: null });

    const { r, p } = splitSpecies(res.species, get());
    const g = computeGibbs(r, p, get().temperature);
    set({ deltaH: g.deltaH, deltaS: g.deltaS, deltaG: g.deltaG, missingThermo: g.missing });

    if (g.missing.length) void refreshMissing(g.missing, set, get);
  },

  computeDeltaG: () => {
    const { balance, temperature } = get();
    if (!balance?.ok || !balance.species) {
      set({ deltaG: null });
      return;
    }
    const { r, p } = splitSpecies(balance.species, get());
    const g = computeGibbs(r, p, temperature);
    set({ deltaH: g.deltaH, deltaS: g.deltaS, deltaG: g.deltaG, missingThermo: g.missing });
    if (g.missing.length) void refreshMissing(g.missing, set, get);
  }
}));

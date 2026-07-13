// ===========================================================================
// ZENTRALES STATE- & API-MODUL
// PubChem PUG-REST Anbindung, Name->CID-Auflösung, Stöchiometrie-Orchestrierung,
// Gibbs-Helmholtz. Ersetzt das alte statische api-Stub-Objekt vollständig (in-place).
// ===========================================================================

import { parseFormula, balanceEquation, suggestProducts } from './chem';
import { MOLECULES, getMolecule, getRandomMolecule } from '@/data/molecules';

// Einmaliger JSmol-Loader wird aus dem bestehenden jsmol-Modul übernommen.
export { ensureJSmol } from './jsmol';

/* ------------------------------- Typen ------------------------------- */
export interface CompoundInfo {
  cid: number;
  name: string; // kanonischer (englischer) Name aus PubChem
  queryName: string; // ursprüngliche Nutzer-Eingabe
  smiles?: string;
  formula: string; // Hill-Formel
  sdf: string; // 3D-Koordinaten für JSmol
  kind: 'name' | 'formula' | 'smiles';
}

export interface ThermoData {
  hFormation: number | null; // ΔH_f° in kJ/mol
  entropy: number | null; // S°   in J/(mol·K)
  source: 'pubchem' | 'local' | 'manual' | 'missing';
}

/* ----------------- Deutsches -> Englisch Mapping ----------------- */
// PubChem erwartet englische Begriffe. Schlankes Wörterbuch für Standardstoffe.
export const DE_EN: Record<string, string> = {
  wasser: 'water',
  wasserstoff: 'hydrogen',
  sauerstoff: 'oxygen',
  stickstoff: 'nitrogen',
  kohlenstoff: 'carbon',
  kohlendioxid: 'carbon dioxide',
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
  acetylsalicylsaeure: 'aspirin',
  glukose: 'glucose',
  traubenzucker: 'glucose',
  zucker: 'sucrose',
  essigsaeure: 'acetic acid',
  ameisensaeure: 'formic acid',
  zitronensaeure: 'citric acid',
  harnstoff: 'urea',
  natriumchlorid: 'sodium chloride',
  kochsalz: 'sodium chloride',
  salzsaeure: 'hydrogen chloride',
  schwefelsaeure: 'sulfuric acid',
  natronlauge: 'sodium hydroxide',
  eisen: 'iron',
  magnesium: 'magnesium',
  schwefel: 'sulfur',
  salpeter: 'niter'
};

const normalizeKey = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

/* ----------------- Lokale Thermo-Fallback-Tabelle ----------------- */
// PubChem liefert H_f°/S° nicht für alle Stoffe. Werte in kJ/mol bzw. J/(mol·K), 298 K.
export const LOCAL_THERMO: Record<string, { hFormation: number; entropy: number }> = {
  H2: { hFormation: 0, entropy: 130.68 },
  O2: { hFormation: 0, entropy: 205.15 },
  N2: { hFormation: 0, entropy: 191.61 },
  Cl2: { hFormation: 0, entropy: 223.08 },
  C: { hFormation: 0, entropy: 5.74 },
  Fe: { hFormation: 0, entropy: 27.28 },
  H2O: { hFormation: -241.82, entropy: 188.83 }, // gasförmig
  CO2: { hFormation: -393.51, entropy: 213.79 },
  CO: { hFormation: -110.53, entropy: 197.66 },
  CH4: { hFormation: -74.81, entropy: 186.26 },
  NH3: { hFormation: -45.9, entropy: 192.77 },
  HCl: { hFormation: -92.31, entropy: 186.9 },
  SO2: { hFormation: -296.83, entropy: 248.22 },
  NO: { hFormation: 90.25, entropy: 210.76 },
  C2H5OH: { hFormation: -234.8, entropy: 282.7 }, // gas
  NaCl: { hFormation: -411.15, entropy: 72.13 },
  MgO: { hFormation: -601.6, entropy: 26.94 },
  Fe2O3: { hFormation: -824.2, entropy: 87.4 },
  CaO: { hFormation: -635.09, entropy: 39.75 },
  CaCO3: { hFormation: -1206.9, entropy: 92.9 },
  C6H12O6: { hFormation: -1273.3, entropy: 212.1 }
};

/* ----------------- Art-Erkennung (Name / Formel / SMILES) ----------------- */
type Kind = 'name' | 'formula' | 'smiles';
function detectKind(q: string): Kind {
  if (/[a-z@=/#()[\]\\]/.test(q)) return 'smiles';
  if (/^([A-Z][a-z]?\d*)+$/.test(q)) return 'formula';
  return 'name';
}

/* ----------------- PubChem: Name/SMILES/Formel -> CID + 3D ----------------- */
export async function resolveCompound(rawQuery: string): Promise<CompoundInfo | null> {
  const trimmed = rawQuery.trim();
  if (!trimmed) return null;
  const enQuery = DE_EN[normalizeKey(trimmed)] ?? trimmed; // Sprachbarriere
  const primary = detectKind(enQuery);
  const order = [primary, 'name', 'formula', 'smiles'].filter(
    (k, i, a) => a.indexOf(k) === i
  ) as Kind[];

  for (const kind of order) {
    try {
      const propRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${kind}/${encodeURIComponent(
          enQuery
        )}/property/IUPACName,Title,IsomericSMILES,MolecularFormula,CID/JSON`
      );
      if (!propRes.ok) continue;
      const data = await propRes.json();
      const props = data?.PropertyTable?.Properties?.[0];
      if (!props || !props.CID) continue;
      const sdfRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${props.CID}/record/SDF/?record_type=3d`
      );
      if (!sdfRes.ok) continue;
      const sdf = await sdfRes.text();
      if (!/V2000|V3000/.test(sdf)) continue;
      return {
        cid: props.CID,
        name: props.IUPACName || props.Title || enQuery,
        queryName: trimmed,
        smiles: props.IsomericSMILES,
        formula: props.MolecularFormula || trimmed,
        sdf,
        kind
      };
    } catch {
      // nächste Kind-Variante versuchen
    }
  }
  return null;
}

/* ----------------- PubChem: Thermo (H_f°, S°) live abfragen ----------------- */
// Niemals NaN: Fehler/CORS -> null, danach greift LOCAL_THERMO (siehe Store).
export async function fetchThermo(cid: number, formula: string): Promise<ThermoData> {
  const fallback = LOCAL_THERMO[formula];
  let pubH: number | null = null;
  let pubS: number | null = null;
  try {
    const res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/EnthalpyOfFormation,Entropy/JSON`
    );
    if (res.ok) {
      const d = await res.json();
      const p = d?.PropertyTable?.Properties?.[0];
      if (p?.EnthalpyOfFormation != null && Number.isFinite(p.EnthalpyOfFormation))
        pubH = Number(p.EnthalpyOfFormation);
      if (p?.Entropy != null && Number.isFinite(p.Entropy)) {
        let s = Number(p.Entropy);
        if (s > 0 && s < 5) s = s * 4.184; // Heuristik: cal/(mol·K) -> J/(mol·K)
        pubS = s;
      }
    }
  } catch {
    /* offline / CORS – Fallback greift */
  }
  const hFormation = pubH ?? fallback?.hFormation ?? null;
  const entropy = pubS ?? fallback?.entropy ?? null;
  const source: ThermoData['source'] =
    pubH != null && pubS != null ? 'pubchem' : fallback ? 'local' : 'missing';
  return { hFormation, entropy, source };
}

/* ----------------- Reaktions-Ausgleich (Parser + Produktvorschlag) ----------------- */
export interface ReactionAnalysis {
  ok: boolean;
  balanced?: string;
  coeffs?: number[];
  reactants?: string[];
  products?: string[];
  species?: { formula: string; role: 'reactant' | 'product'; coeff: number }[];
  error?: string;
  note?: string;
}

/** Zerlegt "Fe + O2 ->" und gleicht atomar aus; ergänzt fehlende Produkte. */
export function analyzeReaction(equation: string): ReactionAnalysis {
  const norm = equation.replace(/→|=/g, '->').trim();
  const parts = norm.split('->');
  if (parts.length !== 2)
    return { ok: false, error: 'Bitte genau einen Pfeil (-> oder →) verwenden.' };

  let reactants = parts[0].split('+').map((s) => s.trim()).filter(Boolean);
  let products = parts[1].split('+').map((s) => s.trim()).filter(Boolean);

  if (products.length === 0) {
    const sugg = suggestProducts(reactants);
    if (sugg.length) {
      products = sugg;
    } else {
      return {
        ok: false,
        error: 'Unvollständige Gleichung – keine Produkte ermittelbar.',
        note: 'Bitte Produkte angeben oder eine bekannte Edukt-Kombination wählen.'
      };
    }
  }

  const fullEq = `${reactants.join(' + ')} -> ${products.join(' + ')}`;
  const bal = balanceEquation(fullEq);
  if (!bal.ok) return { ok: false, error: bal.error ?? 'Gleichung nicht ausgleichbar.' };

  const species = [
    ...bal.reactants.map((f, i) => ({ formula: f, role: 'reactant' as const, coeff: bal.coeffs![i] })),
    ...bal.products.map((f, i) => ({
      formula: f,
      role: 'product' as const,
      coeff: bal.coeffs![bal.reactants.length + i]
    }))
  ];
  return { ok: true, balanced: bal.balanced, coeffs: bal.coeffs, species, reactants, products };
}

/* ----------------- Gibbs-Helmholtz (mit Einheiten-Sync) ----------------- */
export function computeGibbs(
  reactants: { formula: string; coeff: number; hFormation: number | null; entropy: number | null }[],
  products: { formula: string; coeff: number; hFormation: number | null; entropy: number | null }[],
  T: number
): { deltaH: number | null; deltaS: number | null; deltaG: number | null; missing: string[] } {
  let dH = 0,
    dS = 0,
    haveH = true,
    haveS = true;
  const missing: string[] = [];

  const accumulate = (
    list: { formula: string; coeff: number; hFormation: number | null; entropy: number | null }[],
    sign: 1 | -1
  ) => {
    for (const sp of list) {
      if (sp.hFormation == null) {
        haveH = false;
        missing.push(sp.formula);
      } else dH += sign * sp.coeff * sp.hFormation; // Hess: Edukte -, Produkte +
      if (sp.entropy == null) {
        haveS = false;
        missing.push(sp.formula);
      } else dS += sign * sp.coeff * sp.entropy;
    }
  };
  accumulate(reactants, -1);
  accumulate(products, +1);

  if (haveH && haveS) {
    const dH_J = dH * 1000; // kJ/mol -> J/mol  (Einheiten-Sync!)
    const dG_J = dH_J - T * dS; // J/mol
    return { deltaH: dH, deltaS: dS, deltaG: dG_J / 1000, missing: [] };
  }
  return {
    deltaH: haveH ? dH : null,
    deltaS: haveS ? dS : null,
    deltaG: null,
    missing: [...new Set(missing)]
  };
}

/* ----------------- Atom-Bilanz-Prüfung ----------------- */
export interface AtomBalance {
  element: string;
  left: number;
  right: number;
  ok: boolean;
}
export function checkAtomBalance(
  species: { formula: string; role: 'reactant' | 'product'; coeff: number }[]
): { rows: AtomBalance[]; balanced: boolean } {
  const left: Record<string, number> = {};
  const right: Record<string, number> = {};
  for (const sp of species) {
    const parsed = parseFormula(sp.formula);
    if (!parsed.ok) continue;
    const target = sp.role === 'reactant' ? left : right;
    for (const [el, c] of Object.entries(parsed.counts))
      target[el] = (target[el] || 0) + c * sp.coeff;
  }
  const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  const rows = elements.map((el) => {
    const l = left[el] || 0,
      r = right[el] || 0;
    return { element: el, left: l, right: r, ok: l === r };
  });
  return { rows, balanced: rows.every((r) => r.ok) };
}

/* ----------------- RÜCKWÄRTSKOMPATIBILITÄT (Quiz / Home) ----------------- */
// Unverändert beibehalten -> Zero Regression für den Rest der Seite.
export const api = {
  listMolecules: () => MOLECULES,
  getMolecule: (id: string) => getMolecule(id),
  getRandomMolecule: () => getRandomMolecule()
};

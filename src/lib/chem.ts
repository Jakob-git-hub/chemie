// Chemie-Kernlogik: Formel-Parser, molare Masse, Reaktions-Ausgleich.
// Portiert und typsicher gemacht aus docs/calculator-stoffmenge.js.

import type { Atom, Bond, Molecule } from '@/lib/types';

export const ATOMIC_MASS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41,
  In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33,
  La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 144.91, Sm: 150.36, Eu: 151.96, Gd: 157.25,
  Tb: 158.93, Dy: 162.5, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97, Hf: 178.49,
  Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226,
  Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03, Np: 237, Pu: 244, Am: 243, Cm: 247,
  Bk: 247, Cf: 251, Es: 252, Fm: 257, Md: 258, No: 259, Lr: 266, Rf: 267,
  Db: 268, Sg: 269, Bh: 270, Hs: 269, Mt: 278, Ds: 281, Rg: 282, Cn: 285,
  Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294
};

const SUBSCRIPT: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
};

export interface ParseResult {
  ok: true;
  counts: Record<string, number>;
  mass: number;
  composition: { sym: string; count: number }[];
}
export interface ParseError {
  ok: false;
  error: string;
}
export type FormulaResult = ParseResult | ParseError;

/** Normalisiert Hydrat-Notation und tiefgestellte Ziffern. */
function normalize(input: string): { ok: true; main: string; hydrate?: { formula: string; mult: number } } | ParseError {
  let s = String(input).replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => SUBSCRIPT[c] ?? c);
  s = s.replace(/(\*|\s*·\s*|\s*•\s*|\.)/g, '*');
  const parts = s.split('*');
  if (parts.length > 2) return { ok: false, error: 'Ungültige Formel: zu viele Hydrat-Komponenten.' };
  const main = parts[0].trim();
  if (parts.length === 2) {
    const m = parts[1].trim().match(/^(\d*)(.*)$/);
    const mult = m && m[1] ? parseInt(m[1], 10) : 1;
    const formula = m ? m[2] : '';
    return { ok: true, main, hydrate: { formula, mult } };
  }
  return { ok: true, main };
}

function parseComponent(comp: string): FormulaResult {
  const stack: Record<string, number>[] = [{}];
  let i = 0;
  while (i < comp.length) {
    const ch = comp[i];
    if (ch === '(') {
      stack.push({});
      i++;
    } else if (ch === ')') {
      i++;
      let num = '';
      while (i < comp.length && /\d/.test(comp[i])) {
        num += comp[i];
        i++;
      }
      const mult = num ? parseInt(num, 10) : 1;
      const group = stack.pop();
      if (!group) return { ok: false, error: 'Klammern nicht geschlossen.' };
      const parent = stack[stack.length - 1];
      for (const sym in group) parent[sym] = (parent[sym] || 0) + group[sym] * mult;
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      while (i < comp.length && /[a-z]/.test(comp[i])) {
        sym += comp[i];
        i++;
      }
      let num = '';
      while (i < comp.length && /\d/.test(comp[i])) {
        num += comp[i];
        i++;
      }
      const count = num ? parseInt(num, 10) : 1;
      if (!(sym in ATOMIC_MASS)) return { ok: false, error: `Unbekanntes Elementsymbol: "${sym}".` };
      if (count <= 0) return { ok: false, error: 'Ungültiger Index in Formel.' };
      stack[stack.length - 1][sym] = (stack[stack.length - 1][sym] || 0) + count;
    } else if (/\d/.test(ch)) {
      return { ok: false, error: 'Ungültige Formel: Zahl ohne vorausgehendes Element.' };
    } else {
      return { ok: false, error: `Ungültiges Zeichen "${ch}" in Formel.` };
    }
  }
  if (stack.length !== 1) return { ok: false, error: 'Klammern nicht geschlossen.' };
  const counts = stack[0];
  let mass = 0;
  for (const sym in counts) mass += ATOMIC_MASS[sym] * counts[sym];
  const composition = Object.keys(counts)
    .sort()
    .map((sym) => ({ sym, count: counts[sym] }));
  return { ok: true, counts, mass: Number(mass.toFixed(4)), composition };
}

/** Parst eine Formel inkl. optionalem Hydrat. */
export function parseFormula(input: string): FormulaResult {
  if (!input || !input.trim()) return { ok: false, error: 'Leere Formel.' };
  const n = normalize(input.trim());
  if (!n.ok) return n;
  const main = parseComponent(n.main);
  if (!main.ok) return main;
  let totalMass = main.mass;
  const combined = { ...main.counts };
  if (n.hydrate && n.hydrate.formula && n.hydrate.mult > 0) {
    const h = parseComponent(n.hydrate.formula);
    if (!h.ok) return h;
    totalMass += h.mass * n.hydrate.mult;
    for (const sym in h.counts) combined[sym] = (combined[sym] || 0) + h.counts[sym] * n.hydrate.mult;
  }
  const composition = Object.keys(combined)
    .sort()
    .map((sym) => ({ sym, count: combined[sym] }));
  return { ok: true, counts: combined, mass: Number(totalMass.toFixed(4)), composition };
}

// ---- Reaktions-Ausgleich über exakte rationale Lineare Algebra ----

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export interface BalanceResult {
  ok: true;
  reactants: string[];
  products: string[];
  coeffs: number[];
  balanced: string;
}

/** Gleicht eine Reaktionsgleichung atomar aus (keine Ladungsbilanz). */
export function balanceEquation(equation: string): BalanceResult | ParseError {
  if (!equation || !equation.trim()) return { ok: false, error: 'Bitte eine Gleichung eingeben.' };
  const sides = equation.split(/\s*(?:->|→|=>|=)\s*/);
  if (sides.length !== 2) return { ok: false, error: 'Trenne Edukte und Produkte mit "->" (oder "=", "→").' };
  const [lhs, rhs] = sides.map((s) => s.trim());
  if (!lhs || !rhs) return { ok: false, error: 'Beide Seiten der Gleichung werden benötigt.' };

  const splitSpecies = (s: string) => s.split(/\s*\+\s*/).map((x) => x.trim()).filter(Boolean);
  const reactants = splitSpecies(lhs);
  const products = splitSpecies(rhs);
  if (!reactants.length || !products.length)
    return { ok: false, error: 'Mindestens eine Spezies pro Seite nötig.' };

  const species = [...reactants, ...products];
  const parsed = species.map((sp) => parseFormula(sp));
  const bad = parsed.find((p) => !p.ok);
  if (bad && !bad.ok) return bad;

  const elements = [...new Set(parsed.flatMap((p) => (p.ok ? Object.keys(p.counts) : [])))].sort();
  // Matrix: Zeile=Element, Spalte=Spezies; Produkte negativ (Ausgleich = 0)
  const M = elements.map((el) =>
    parsed.map((p, idx) => {
      const c = p.ok ? p.counts[el] || 0 : 0;
      return idx < reactants.length ? c : -c;
    })
  );
  const Mf = M.filter((row) => row.some((v) => v !== 0));

  const res = solveStoichiometry(Mf.length ? Mf : [[1]]);
  if (res.coeffs === null && res.underdetermined)
    return { ok: false, error: 'Gleichung ist nicht eindeutig ausgleichbar (zu frei / Redox mit Ladung).' };
  if (res.coeffs === null)
    return { ok: false, error: 'Gleichung ist nicht ausgleichbar (Widerspruch in den Atomen).' };

  const coeffs = res.coeffs;
  if (coeffs.some((c) => c <= 0))
    return { ok: false, error: 'Konnte keine positiven Koeffizienten finden (Edukte/Produkte prüfen).' };

  const fmt = (c: number, f: string) => (c === 1 ? f : `${c}${f}`);
  const left = reactants.map((f, i) => fmt(coeffs[i], f)).join(' + ');
  const right = products.map((f, i) => fmt(coeffs[reactants.length + i], f)).join(' + ');
  return { ok: true, reactants, products, coeffs, balanced: `${left} → ${right}` };
}

// Exakte rationale Arithmetik, damit Koeffizienten verlustfrei als ganze
// Zahlen entstehen (kein Float-Rounding, kein "scale=1000"-Trick).
class Frac {
  constructor(
    public n: number,
    public d: number = 1
  ) {
    if (this.d === 0) throw new Error('Nenner darf nicht 0 sein');
    if (this.d < 0) {
      this.n = -this.n;
      this.d = -this.d;
    }
    const g = gcd(Math.abs(this.n), this.d) || 1;
    this.n /= g;
    this.d /= g;
  }
  add(o: Frac): Frac {
    return new Frac(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o: Frac): Frac {
    return new Frac(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  mul(o: Frac): Frac {
    return new Frac(this.n * o.n, this.d * o.d);
  }
  neg(): Frac {
    return new Frac(-this.n, this.d);
  }
  get isZero(): boolean {
    return this.n === 0;
  }
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / (gcd(Math.abs(a), Math.abs(b)) || 1);
}

interface NullResult {
  coeffs: number[] | null;
  underdetermined: boolean;
}

/**
 * Löst das homogene Gleichungssystem A·x = 0 exakt über rationale Zahlen und
 * liefert die (eindeutige) ganzzahlige Koeffizienten-Zeile zurück.
 *  - 0 freie Spalten  → nur triviale Lösung (widersprüchlich) → coeffs = null
 *  - >1 freie Spalten → unterbestimmt (Redox/Ladung)        → underdetermined
 *  - 1 freie Spalte    → eindeutig; auf kleinstes gemeinsames Vielfache skaliert
 */
function solveStoichiometry(A0: number[][]): NullResult {
  const rows = A0.length;
  const cols = A0[0]?.length ?? 0;
  if (cols === 0) return { coeffs: null, underdetermined: false };

  const A: Frac[][] = A0.map((r) => r.map((x) => new Frac(x)));
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let pr = -1;
    for (let i = r; i < rows; i++)
      if (!A[i][c].isZero) {
        pr = i;
        break;
      }
    if (pr === -1) continue;
    [A[r], A[pr]] = [A[pr], A[r]];
    const piv = A[r][c];
    const inv = new Frac(piv.d, piv.n); // 1 / pivot
    for (let j = 0; j < cols; j++) A[r][j] = A[r][j].mul(inv);
    for (let i = 0; i < rows; i++) {
      if (i !== r && !A[i][c].isZero) {
        const f = A[i][c];
        for (let j = 0; j < cols; j++) A[i][j] = A[i][j].sub(A[r][j].mul(f));
      }
    }
    pivots.push(c);
    r++;
  }

  const free: number[] = [];
  for (let c = 0; c < cols; c++) if (!pivots.includes(c)) free.push(c);
  if (free.length === 0) return { coeffs: null, underdetermined: false }; // nur triviale Lsg.
  if (free.length > 1) return { coeffs: null, underdetermined: true };

  const fv = free[0];
  const vec: Frac[] = [];
  for (let i = 0; i < cols; i++) vec.push(new Frac(0));
  vec[fv] = new Frac(1);
  for (let i = 0; i < pivots.length; i++) {
    const pc = pivots[i];
    vec[pc] = A[i][fv].neg();
  }

  // Auf kleinstes gemeinsames Vielfache der Nenner skalieren -> ganze Zahlen.
  let denLcm = 1;
  vec.forEach((v) => {
    denLcm = lcm(denLcm, v.d);
  });
  let nums = vec.map((v) => v.n * (denLcm / v.d));
  const g = nums.reduce((a, v) => gcd(a, Math.abs(v)), 0) || 1;
  nums = nums.map((n) => n / g);
  const firstNonZero = nums.find((n) => n !== 0);
  if (firstNonZero !== undefined && firstNonZero < 0) nums = nums.map((n) => -n);
  return { coeffs: nums, underdetermined: false };
}

// ---- Energiebilanz: Reaktionsenthalpie aus Bindungsenergien ----
// Standard-Bindungsenergien (Mittelwerte) in kJ/mol.
export const BOND_ENERGIES: Record<string, number> = {
  'O-H': 459,
  'C-H': 413,
  'C-C': 348,
  'C-O': 358,
  'N-H': 391,
  'C-N': 305,
  'O-O': 145,
  'H-H': 432,
  'C=O': 799,
  'C=C': 611,
  'C≡C': 918
};

function bondKey(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `${x}-${y}`;
}

/**
 * Berechnet die Reaktionsenthalpie ΔH (kJ/mol) aus Bindungsenergien.
 * ΔH = Σ Bindungsenergien(Produkte) − Σ Bindungsenergien(Reaktanten).
 * @param reactants Liste von Molekül-Objekten (Edukte)
 * @param products  Liste von Molekül-Objekten (Produkte)
 */
export function calculateDeltaHFromBonds(
  reactants: Molecule[],
  products: Molecule[]
): number {
  const sumBonds = (mols: Molecule[]): number =>
    mols.reduce((sum: number, mol: Molecule) => {
      const e = mol.bonds.reduce((acc: number, bnd: Bond) => {
        const ea = mol.atoms.find((a: Atom) => a.id === bnd.from)?.element;
        const eb = mol.atoms.find((a: Atom) => a.id === bnd.to)?.element;
        if (!ea || !eb) return acc;
        return acc + (BOND_ENERGIES[bondKey(ea, eb)] ?? 0);
      }, 0);
      return sum + e;
    }, 0);

  // Vorzeichen-Konvention (Bindungsenthalpie):
  //   BindungsBRUCH ist endotherm  (+), BindungsBILDUNG exotherm (-)
  //   ΔH_rxn = Σ BDE(gebrochene Bindungen) − Σ BDE(gebildete Bindungen)
  //   = Σ BDE(Edukte) − Σ BDE(Produkte)
  const reactantEnergy = sumBonds(reactants); // Bindungsbruch  -> positiv (+)
  const productEnergy = sumBonds(products); // Bindungsbildung -> negativ (−)
  return reactantEnergy - productEnergy;
}

// ---- Stöchiometrie: Produkt-Vorschläge für unvollständige Gleichungen ----
// Schlüssel = sortierte, durch "+" verbundene Edukt-Formeln.
export const PRODUCT_SUGGESTIONS: Record<string, string[]> = {
  'H2+O2': ['H2O'],
  'C+O2': ['CO2'],
  'CH4+O2': ['CO2', 'H2O'],
  'C2H5OH+O2': ['CO2', 'H2O'],
  'C6H12O6+O2': ['CO2', 'H2O'],
  'C3H8+O2': ['CO2', 'H2O'],
  'Na+Cl2': ['NaCl'],
  'Mg+O2': ['MgO'],
  'Fe+O2': ['Fe2O3'],
  'S+O2': ['SO2'],
  'N2+H2': ['NH3'],
  'Al+O2': ['Al2O3'],
  'Ca+O2': ['CaO']
};

/**
 * Schlägt chemisch sinnvolle Produkte vor, wenn bei einer Reaktion keine
 * Produkte angegeben wurden. Gibt [] zurück, wenn keine Regel passt.
 */
export function suggestProducts(reactants: string[]): string[] {
  const r = reactants.map((s) => s.trim()).filter(Boolean);
  if (r.length === 0) return [];
  const keySorted = [...r].sort().join('+');
  const keyRaw = r.join('+');
  return PRODUCT_SUGGESTIONS[keySorted] ?? PRODUCT_SUGGESTIONS[keyRaw] ?? [];
}

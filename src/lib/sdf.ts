import type { Atom, Bond } from './types';

export interface ParsedStructure {
  atoms: Atom[];
  bonds: Bond[];
}

/**
 * Parst einen PubChem-3D-SDF in Atome + Bindungen (V2000 und V3000).
 */
export function parseSDF(sdf: string): ParsedStructure | null {
  if (!/V2000|V3000/.test(sdf)) return null;
  const lines = sdf.split(/\r?\n/);
  return /V3000/.test(sdf) ? parseV3000(lines) : parseV2000(lines);
}

/**
 * V2000-CTAB: nach 3 Header-Zeilen folgt die Counts-Zeile
 * (Spalte 1–3 = #Atome, 4–6 = #Bindungen), dann der Atom-Block
 * (x=0–10, y=10–20, z=20–30, Element=30–34) und der Bindungs-Block
 * (Atom1=0–3, Atom2=3–6, 1-basiert).
 */
function parseV2000(lines: string[]): ParsedStructure | null {
  if (lines.length < 4) return null;
  const counts = lines[3];
  const na = parseInt(counts.substring(0, 3), 10);
  const nb = parseInt(counts.substring(3, 6), 10);
  if (!Number.isFinite(na) || na <= 0) return null;

  const atoms: Atom[] = [];
  for (let i = 0; i < na; i++) {
    const line = lines[4 + i] ?? '';
    const x = parseFloat(line.substring(0, 10));
    const y = parseFloat(line.substring(10, 20));
    const z = parseFloat(line.substring(20, 30));
    const element = line.substring(30, 34).trim() || 'C';
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
    atoms.push({ id: `a${i + 1}`, element, position: [x, y, z] });
  }

  const bonds: Bond[] = [];
  for (let j = 0; j < nb; j++) {
    const line = lines[4 + na + j] ?? '';
    const a1 = parseInt(line.substring(0, 3), 10);
    const a2 = parseInt(line.substring(3, 6), 10);
    if (!Number.isFinite(a1) || !Number.isFinite(a2)) continue;
    bonds.push({ from: `a${a1}`, to: `a${a2}` });
  }

  return { atoms, bonds };
}

/**
 * V3000-CTAB: Atome/Bindungen stehen in Blöcken zwischen
 * "M  V30 BEGIN/END ATOM|BOND", jeweils leerzeichen-getrennt:
 *   Atom:  M  V30 <idx> <Element> <x> <y> <z> ...
 *   Bond:  M  V30 <idx> <order> <atom1> <atom2>
 */
function parseV3000(lines: string[]): ParsedStructure | null {
  let inAtom = false;
  let inBond = false;
  const atomLines: string[] = [];
  const bondLines: string[] = [];

  for (const line of lines) {
    if (/M\s+V30\s+BEGIN ATOM/.test(line)) { inAtom = true; continue; }
    if (/M\s+V30\s+END ATOM/.test(line)) { inAtom = false; continue; }
    if (/M\s+V30\s+BEGIN BOND/.test(line)) { inBond = true; continue; }
    if (/M\s+V30\s+END BOND/.test(line)) { inBond = false; continue; }
    if (inAtom) atomLines.push(line);
    if (inBond) bondLines.push(line);
  }

  const atoms: Atom[] = [];
  atomLines.forEach((line, i) => {
    const p = line.trim().split(/\s+/); // ['M','V30',idx,el,x,y,z,...]
    const element = p[3];
    const x = parseFloat(p[4]);
    const y = parseFloat(p[5]);
    const z = parseFloat(p[6]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    atoms.push({ id: `a${i + 1}`, element: element || 'C', position: [x, y, z] });
  });

  const bonds: Bond[] = [];
  bondLines.forEach((line) => {
    const p = line.trim().split(/\s+/); // ['M','V30',idx,order,a1,a2]
    const a1 = parseInt(p[4], 10);
    const a2 = parseInt(p[5], 10);
    if (!Number.isFinite(a1) || !Number.isFinite(a2)) return;
    bonds.push({ from: `a${a1}`, to: `a${a2}` });
  });

  return atoms.length ? { atoms, bonds } : null;
}

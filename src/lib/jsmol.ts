// ---------------------------------------------------------------------------
// JSmol-Lade- und PubChem-Hilfsfunktionen (zentral, einmalig).
// Ersetzt die zuvor isolierte JSmolSearch-Komponente.
// ---------------------------------------------------------------------------

let scriptPromise: Promise<any> | null = null;

/** Lädt das JSmol-Core-Skript genau einmal und liefert das globale Jmol-Objekt. */
export function ensureJSmol(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).Jmol) {
    return Promise.resolve((window as any).Jmol);
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.id = 'jsmol-core-script';
    s.src = 'https://chemapps.stolaf.edu/jmol/jsmol/JSmol.min.nojq.js';
    s.async = true;
    s.onload = () =>
      (window as any).Jmol ? resolve((window as any).Jmol) : reject(new Error('JSmol nicht gefunden'));
    s.onerror = () => reject(new Error('JSmol-Skript nicht ladbar (Netzwerk?)'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface IsomerResult {
  cid: number;
  name: string;
  smiles?: string;
  sdf: string;
}

type Kind = 'name' | 'formula' | 'smiles';

function detectKind(q: string): Kind {
  if (/[a-z@=/#()[\]\\]/.test(q)) return 'smiles';
  if (/^([A-Z][a-z]?\d*)+$/.test(q)) return 'formula';
  return 'name';
}

/**
 * Lädt das *Hauptisomer* zu einem Namen, einer SMILES oder einer Summenformel
 * (Hill-System, z. B. "C6H12O6") aus PubChem.
 *  - SMILES erkennbar an Sonderzeichen/Kleinbuchstaben -> `/compound/smiles/`
 *  - Hill-Formel (nur Elemente + Ziffern) -> `/compound/formula/`
 *  - sonst Namen -> `/compound/name/`
 * Bei mehrdeutigen Eingaben (z. B. "CCO") wird eine Fallback-Kette probiert,
 * bis ein CID gefunden wird (Isomerie-Auflösung: erstes/kanonisches Isomer).
 */
export async function fetchMainIsomer(query: string): Promise<IsomerResult | null> {
  const q = query.trim();
  if (!q) return null;
  const primary = detectKind(q);
  // Eindeutige Reihenfolge mit primärer Erkennung zuerst.
  const order = [primary, 'name', 'formula', 'smiles'].filter(
    (k, i, a) => a.indexOf(k) === i
  ) as Kind[];

  for (const kind of order) {
    try {
      const propRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${kind}/${encodeURIComponent(
          q
        )}/property/IUPACName,Title,IsomericSMILES,MolecularFormula/JSON`
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
        name: props.IUPACName || props.Title || q,
        smiles: props.IsomericSMILES,
        sdf
      };
    } catch {
      // nächste Kind-Variante versuchen
    }
  }
  return null;
}

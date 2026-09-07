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


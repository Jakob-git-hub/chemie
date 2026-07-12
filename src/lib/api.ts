import type { Molecule } from '@/lib/types';
import { MOLECULES, getMolecule, getRandomMolecule } from '@/data/molecules';

/**
 * Wrapper für externe Chemie-Datenquellen.
 *
 * Aktuell werden die Molekül-Daten lokal aus `data/molecules.ts` geladen.
 * Für eine echte, umfangreiche Bibliothek sollte hier ein Aufruf an eine
 * öffentliche API erfolgen, z.B.:
 *   - PubChem PUG-REST: https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/...
 *   - NIH Cactus:      https://cactus.nci.nih.gov/chemical/structure
 *
 * Dafür wird ein API-Key / eine Endpoint-Konfiguration benötigt (siehe Unsicherheiten).
 */
export const api = {
  listMolecules(): Molecule[] {
    return MOLECULES;
  },
  getMolecule(id: string): Molecule | undefined {
    return getMolecule(id);
  },
  getRandomMolecule(): Molecule {
    return getRandomMolecule();
  }
};

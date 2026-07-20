// Metadaten & Hilfsfunktionen für das Periodensystem.
// Kategorie-Farben sind als echte Hex-Werte hinterlegt, damit sie per
// Inline-Style (ohne Tailwind-Purge-Probleme) auf die Kacheln angewandt
// werden können.
export { ELEMENTS } from '@/data/elements';

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'diatomic-nonmetal'
  | 'polyatomic-nonmetal'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown-transition'
  | 'unknown-post-transition'
  | 'unknown-metalloid'
  | 'unknown-noble-gas'
  | 'unknown-alkali-metal';

export interface PeriodicElement {
  number: number;
  symbol: string;
  name: string; // deutscher Name
  nameEn: string;
  mass: number;
  category: ElementCategory;
  group: number | null;
  period: number;
  xpos: number; // 1..18
  ypos: number; // 1..7, 9 (Lanthanoide), 10 (Actinoide)
  block: string; // 's' | 'p' | 'd' | 'f'
  electronConfiguration: string;
  shells: number[]; // Elektronen pro Schale (für Bohr-Modell)
  electronegativity: number | null; // Pauling
  ionizationEnergy: number | null; // 1. Ionisierungsenergie, kJ/mol
  density: number | null; // g/cm³ (bzw. g/L bei Gasen)
  melt: number | null; // K
  boil: number | null; // K
  phase: string; // 'Solid' | 'Liquid' | 'Gas'
  discoveredBy: string | null;
  appearance: string | null;
  summary: string; // englische Zusammenfassung
  blurb: string; // deutsche Kurzbeschreibung
  imageUrl: string | null; // Foto (Wikimedia)
  bohrImageUrl: string | null; // externes Bohr-Modell-Bild
}

export interface CategoryMeta {
  key: ElementCategory;
  label: string; // deutsche Bezeichnung
  bg: string; // Kachel-Füllfarbe (Hex)
  fg: string; // Textfarbe auf der Kachel (Hex)
}

// Moderne, harmonische Palette – je Kategorie eine eigene Farbe.
export const CATEGORIES: CategoryMeta[] = [
  { key: 'alkali-metal', label: 'Alkalimetalle', bg: '#F2744F', fg: '#FFFFFF' },
  { key: 'alkaline-earth-metal', label: 'Erdalkalimetalle', bg: '#E8A33D', fg: '#3A2600' },
  { key: 'transition-metal', label: 'Übergangsmetalle', bg: '#3B9BE0', fg: '#FFFFFF' },
  { key: 'post-transition-metal', label: 'Post-Übergangsmetalle', bg: '#56B0A6', fg: '#FFFFFF' },
  { key: 'metalloid', label: 'Metalloide', bg: '#7C6FD4', fg: '#FFFFFF' },
  { key: 'diatomic-nonmetal', label: 'Nichtmetalle (diatomar)', bg: '#4FA86B', fg: '#FFFFFF' },
  { key: 'polyatomic-nonmetal', label: 'Nichtmetalle (polyatomar)', bg: '#2FA89A', fg: '#FFFFFF' },
  { key: 'noble-gas', label: 'Edelgase', bg: '#B96FD4', fg: '#FFFFFF' },
  { key: 'lanthanide', label: 'Lanthanoide', bg: '#D27BA6', fg: '#FFFFFF' },
  { key: 'actinide', label: 'Actinoide', bg: '#D96363', fg: '#FFFFFF' },
  { key: 'unknown-transition', label: 'Unbekannt (Übergangsmetall)', bg: '#8B93A6', fg: '#FFFFFF' },
  { key: 'unknown-post-transition', label: 'Unbekannt (Post-Übergangsmetall)', bg: '#97A0AE', fg: '#FFFFFF' },
  { key: 'unknown-metalloid', label: 'Unbekannt (Metalloid)', bg: '#A497C4', fg: '#FFFFFF' },
  { key: 'unknown-noble-gas', label: 'Unbekannt (Edelgas)', bg: '#C19AD4', fg: '#FFFFFF' },
  { key: 'unknown-alkali-metal', label: 'Unbekannt (Alkalimetall)', bg: '#D6A18F', fg: '#3A2600' }
];

const CATEGORY_MAP: Record<ElementCategory, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = c;
    return acc;
  },
  {} as Record<ElementCategory, CategoryMeta>
);

export function categoryMeta(key: ElementCategory): CategoryMeta {
  return CATEGORY_MAP[key];
}

// Grid-Layout: 18 Spalten, 10 Zeilen (Zeile 8 bleibt als Lücke zwischen
// Hauptblock und f-Block frei).
export const GRID_COLUMNS = 18;
export const GRID_ROWS = 10;

export function getElement(number: number): PeriodicElement | undefined {
  return ELEMENTS.find((e) => e.number === number);
}

// Temperatur-Kelvin → °C (für lesbare Anzeige).
export function toCelsius(kelvin: number | null): string {
  if (kelvin == null) return '–';
  return `${Math.round(kelvin - 273.15)} °C`;
}

export function phaseLabel(phase: string): string {
  switch (phase) {
    case 'Solid':
      return 'fest';
    case 'Liquid':
      return 'flüssig';
    case 'Gas':
      return 'gasförmig';
    default:
      return phase;
  }
}

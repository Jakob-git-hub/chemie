/**
 * Validity rules for chemical elements
 * Based on common organic chemistry rules
 */

export interface ValencyRule {
  default: number;
  alternatives?: number[];
  symbol: string;
  name: string;
  color: string; // CPK color
  category: 'alkali-metal' | 'alkaline-earth-metal' | 'transition-metal'
          | 'metalloid' | 'diatomic-nonmetal' | 'polyatomic-nonmetal'
          | 'noble-gas' | 'lanthanide' | 'actinide' | 'halogen' | 'post-transition-metal';
}

// CPK Color scheme (Chemistry teaching standard)
export const ELEMENT_DATA: Record<string, ValencyRule> = {
  // H, Nonmetals
  H: { default: 1, symbol: 'H', name: 'Wasserstoff', color: '#FFFFFF', category: 'diatomic-nonmetal' },
  C: { default: 4, symbol: 'C', name: 'Kohlenstoff', color: '#2b2b2b', category: 'diatomic-nonmetal' },
  N: { default: 3, alternatives: [5], symbol: 'N', name: 'Stickstoff', color: '#3050F8', category: 'diatomic-nonmetal' },
  O: { default: 2, symbol: 'O', name: 'Sauerstoff', color: '#FF0D0D', category: 'diatomic-nonmetal' },
  S: { default: 2, alternatives: [4, 6], symbol: 'S', name: 'Schwefel', color: '#FFFF30', category: 'diatomic-nonmetal' },
  P: { default: 3, alternatives: [5], symbol: 'P', name: 'Phosphor', color: '#FF8000', category: 'diatomic-nonmetal' },
  F: { default: 1, symbol: 'F', name: 'Fluor', color: '#90E050', category: 'halogen' },
  Cl: { default: 1, symbol: 'Cl', name: 'Chlor', color: '#1FF01F', category: 'halogen' },
  Br: { default: 1, symbol: 'Br', name: 'Brom', color: '#A62929', category: 'halogen' },
  I: { default: 1, symbol: 'I', name: 'Iod', color: '#940094', category: 'halogen' },
  B: { default: 3, symbol: 'B', name: 'Bor', color: '#FFB5B5', category: 'metalloid' },
  Si: { default: 4, symbol: 'Si', name: 'Silicium', color: '#F0C8A0', category: 'metalloid' },
  // Alkali metals
  Li: { default: 1, symbol: 'Li', name: 'Lithium', color: '#CC80FF', category: 'alkali-metal' },
  Na: { default: 1, symbol: 'Na', name: 'Natrium', color: '#AB5CF2', category: 'alkali-metal' },
  K: { default: 1, symbol: 'K', name: 'Kalium', color: '#8F40D4', category: 'alkali-metal' },
  // Alkaline earth metals
  Be: { default: 2, symbol: 'Be', name: 'Beryllium', color: '#C2FF00', category: 'alkaline-earth-metal' },
  Mg: { default: 2, symbol: 'Mg', name: 'Magnesium', color: '#8AFF00', category: 'alkaline-earth-metal' },
  Ca: { default: 2, symbol: 'Ca', name: 'Calcium', color: '#3DFF00', category: 'alkaline-earth-metal' },
  // Transition metals
  Fe: { default: 3, alternatives: [2, 6], symbol: 'Fe', name: 'Eisen', color: '#E06633', category: 'transition-metal' },
  Cu: { default: 2, alternatives: [1], symbol: 'Cu', name: 'Kupfer', color: '#C88033', category: 'transition-metal' },
  Zn: { default: 2, symbol: 'Zn', name: 'Zink', color: '#7D80B0', category: 'transition-metal' },
};

// Curated palette for quick access (most common in organic chemistry)
export const QUICK_ELEMENTS = ['H', 'C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I'];

// All available elements
export const ALL_ELEMENTS = Object.keys(ELEMENT_DATA).sort();

/**
 * Returns the allowed bond orders for an element
 */
export function getAllowedValencies(element: string): number[] {
  const data = ELEMENT_DATA[element];
  if (!data) return [0];
  return [data.default, ...(data.alternatives ?? [])];
}

/**
 * Returns the default valency for an element
 */
export function getDefaultValency(element: string): number {
  return ELEMENT_DATA[element]?.default ?? 0;
}

/**
 * Checks if an element is valid (exists in the database)
 */
export function isValidElement(symbol: string): boolean {
  return symbol in ELEMENT_DATA;
}

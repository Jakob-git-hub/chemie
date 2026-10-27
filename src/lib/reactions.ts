import type { Molecule } from './types';

export interface ReactionResult {
  equation: string;
  title: string;
  explanation: string;
  effect: 'flame' | 'gas' | 'neutral';
  products: string[];
}

const keyFor = (ids: string[]) => [...ids].sort().join('+');

const REACTIONS: Record<string, ReactionResult> = {
  'methane+oxygen': {
    equation: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
    title: 'Vollständige Verbrennung',
    explanation:
      'Methan reagiert mit Sauerstoff. Dabei entstehen Kohlenstoffdioxid und Wasser; die Reaktion setzt Wärme und Licht frei.',
    effect: 'flame',
    products: ['Kohlendioxid', 'Wasser']
  },
  'ethanol+oxygen': {
    equation: 'C₂H₆O + 3 O₂ → 2 CO₂ + 3 H₂O',
    title: 'Alkohol-Verbrennung',
    explanation:
      'Ethanol wird vollständig oxidiert. Die frei werdende Energie zeigt sich im Simulator als kontrollierte Flammen-Animation.',
    effect: 'flame',
    products: ['Kohlendioxid', 'Wasser']
  },
  'hydrogen+oxygen': {
    equation: '2 H₂ + O₂ → 2 H₂O',
    title: 'Wasserbildung',
    explanation:
      'Wasserstoff und Sauerstoff bilden Wasser. Die Reaktion ist stark exotherm und wird hier ausschließlich virtuell dargestellt.',
    effect: 'gas',
    products: ['Wasser']
  }
};

export function simulateReaction(molecules: Molecule[]): ReactionResult | null {
  if (molecules.length !== 2) return null;
  return REACTIONS[keyFor(molecules.map((molecule) => molecule.id))] ?? null;
}


import type { Molecule } from '@/lib/types';

// Kuratierte Beispiel-Strukturen (vereinfachte, aber realistische Geometrie).
// Später durch eine externe Chemie-Datenbank (PubChem) ersetzbar.

// Funktionale Gruppen für Quiz-Modus
export const FUNCTIONAL_GROUPS = {
  hydroxyl: {
    name: 'Hydroxylgruppe',
    nameEn: 'Hydroxyl group',
    symbol: '-OH',
    description: 'Eine Hydroxylgruppe besteht aus einem Sauerstoffatom, das an ein Wasserstoffatom gebunden ist.',
    atomPattern: ['O'] as const,
    bondedTo: ['H', 'C'] as const
  },
  carbonyl: {
    name: 'Carbonylgruppe',
    nameEn: 'Carbonyl group',
    symbol: 'C=O',
    description: 'Eine Carbonylgruppe besteht aus einem Kohlenstoffatom, das doppelt an ein Sauerstoffatom gebunden ist.',
    atomPattern: ['C', 'O'] as const,
    bondedTo: ['O', 'C'] as const
  },
  carboxyl: {
    name: 'Carboxylgruppe',
    nameEn: 'Carboxylic acid group',
    symbol: '-COOH',
    description: 'Eine Carboxylgruppe enthält eine Carbonylgruppe, die an eine Hydroxylgruppe gebunden ist.',
    atomPattern: ['C', 'O', 'O', 'H'] as const,
    bondedTo: ['C', 'O', 'H'] as const
  },
  ester: {
    name: 'Estergruppe',
    nameEn: 'Ester group',
    symbol: '-COO-',
    description: 'Eine Estergruppe besteht aus einer Carbonylgruppe, die an ein Sauerstoffatom gebunden ist.',
    atomPattern: ['C', 'O', 'O'] as const,
    bondedTo: ['C', 'O'] as const
  },
  amino: {
    name: 'Aminogruppe',
    nameEn: 'Amino group',
    symbol: '-NH₂',
    description: 'Eine Aminogruppe besteht aus einem Stickstoffatom, das an zwei Wasserstoffatome gebunden ist.',
    atomPattern: ['N'] as const,
    bondedTo: ['H', 'H', 'C'] as const
  },
  ether: {
    name: 'Ethergruppe',
    nameEn: 'Ether group',
    symbol: 'R-O-R',
    description: 'Eine Ethergruppe besteht aus einem Sauerstoffatom, das an zwei Kohlenstoffatome gebunden ist.',
    atomPattern: ['O'] as const,
    bondedTo: ['C', 'C'] as const
  },
  aldehyde: {
    name: 'Aldehydgruppe',
    nameEn: 'Aldehyde group',
    symbol: '-CHO',
    description: 'Eine Aldehydgruppe enthält eine Carbonylgruppe am Ende einer Kohlenstoffkette.',
    atomPattern: ['C', 'H', 'O'] as const,
    bondedTo: ['H', 'C', 'O'] as const
  },
  ketone: {
    name: 'Ketongruppe',
    nameEn: 'Ketone group',
    symbol: '-CO-',
    description: 'Eine Ketongruppe enthält eine Carbonylgruppe innerhalb einer Kohlenstoffkette.',
    atomPattern: ['C', 'O'] as const,
    bondedTo: ['C', 'C'] as const
  }
} as const;

export type FunctionalGroupKey = keyof typeof FUNCTIONAL_GROUPS;

export const MOLECULES: Molecule[] = [
  {
    id: 'water',
    name: 'Wasser',
    formula: 'H₂O',
    iupacName: 'Oxidan / Wasser',
    category: 'Anorganisch',
    functionalGroups: [],
    difficulty: 'beginner',
    hints: [
      'Besteht aus zwei Elementen',
      'Enthält ein Sauerstoffatom',
      'Ein klassisches polares Molekül'
    ],
    atoms: [
      { id: 'o', element: 'O', position: [0, 0, 0] },
      { id: 'h1', element: 'H', position: [0.76, 0.59, 0] },
      { id: 'h2', element: 'H', position: [-0.76, 0.59, 0] }
    ],
    bonds: [
      { from: 'o', to: 'h1' },
      { from: 'o', to: 'h2' }
    ]
  },
  {
    id: 'co2',
    name: 'Kohlendioxid',
    formula: 'CO₂',
    iupacName: 'Kohlendioxid',
    category: 'Anorganisch',
    functionalGroups: ['carbonyl'],
    difficulty: 'beginner',
    hints: [
      'Besteht aus zwei Elementen',
      'Enthält ein Kohlenstoffatom',
      'Ein lineares Molekül mit zwei Doppelbindungen'
    ],
    atoms: [
      { id: 'c', element: 'C', position: [0, 0, 0] },
      { id: 'o1', element: 'O', position: [1.16, 0, 0] },
      { id: 'o2', element: 'O', position: [-1.16, 0, 0] }
    ],
    bonds: [
      { from: 'c', to: 'o1' },
      { from: 'c', to: 'o2' }
    ]
  },
  {
    id: 'methane',
    name: 'Methan',
    formula: 'CH₄',
    iupacName: 'Methan',
    category: 'Kohlenwasserstoff',
    functionalGroups: [],
    difficulty: 'beginner',
    hints: [
      'Besteht aus zwei Elementen',
      'Enthält ein Kohlenstoffatom',
      'Ein tetraedrisches Molekül'
    ],
    atoms: [
      { id: 'c', element: 'C', position: [0, 0, 0] },
      { id: 'h1', element: 'H', position: [0.63, 0.63, 0.63] },
      { id: 'h2', element: 'H', position: [-0.63, -0.63, 0.63] },
      { id: 'h3', element: 'H', position: [-0.63, 0.63, -0.63] },
      { id: 'h4', element: 'H', position: [0.63, -0.63, -0.63] }
    ],
    bonds: [
      { from: 'c', to: 'h1' },
      { from: 'c', to: 'h2' },
      { from: 'c', to: 'h3' },
      { from: 'c', to: 'h4' }
    ]
  },
  {
    id: 'ammonia',
    name: 'Ammoniak',
    formula: 'NH₃',
    iupacName: 'Ammoniak',
    category: 'Anorganisch',
    functionalGroups: ['amino'],
    difficulty: 'beginner',
    hints: [
      'Besteht aus zwei Elementen',
      'Enthält ein Stickstoffatom',
      'Ein basisches Molekül mit trigonal-pyramidaler Geometrie'
    ],
    atoms: [
      { id: 'n', element: 'N', position: [0, 0, 0] },
      { id: 'h1', element: 'H', position: [0.94, 0, 0] },
      { id: 'h2', element: 'H', position: [-0.31, 0.89, 0] },
      { id: 'h3', element: 'H', position: [-0.31, -0.89, 0] }
    ],
    bonds: [
      { from: 'n', to: 'h1' },
      { from: 'n', to: 'h2' },
      { from: 'n', to: 'h3' }
    ]
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₆O',
    iupacName: 'Ethanol',
    category: 'Alkohol',
    functionalGroups: ['hydroxyl'],
    difficulty: 'beginner',
    hints: [
      'Enthält ein Sauerstoffatom',
      'Gehört zur Stoffgruppe der Alkohole',
      'Eine Hydroxylgruppe ist an eine Ethylgruppe gebunden'
    ],
    atoms: [
      { id: 'c1', element: 'C', position: [-1.2, 0.3, 0] },
      { id: 'c2', element: 'C', position: [0.2, -0.4, 0] },
      { id: 'o', element: 'O', position: [1.5, 0.4, 0] },
      { id: 'h1', element: 'H', position: [-1.5, 1.3, 0] },
      { id: 'h2', element: 'H', position: [-2.1, -0.3, 0.7] },
      { id: 'h3', element: 'H', position: [-2.1, -0.3, -0.7] },
      { id: 'h4', element: 'H', position: [0.2, -1.5, 0.7] },
      { id: 'h5', element: 'H', position: [0.2, -1.5, -0.7] },
      { id: 'h6', element: 'H', position: [1.9, 1.3, 0] }
    ],
    bonds: [
      { from: 'c1', to: 'c2' },
      { from: 'c2', to: 'o' },
      { from: 'c1', to: 'h1' },
      { from: 'c1', to: 'h2' },
      { from: 'c1', to: 'h3' },
      { from: 'c2', to: 'h4' },
      { from: 'c2', to: 'h5' },
      { from: 'o', to: 'h6' }
    ]
  },
  {
    id: 'acetic_acid',
    name: 'Essigsäure',
    formula: 'C₂H₄O₂',
    iupacName: 'Ethansäure',
    category: 'Carbonsäure',
    functionalGroups: ['carboxyl', 'hydroxyl'],
    difficulty: 'advanced',
    hints: [
      'Enthält eine Carboxylgruppe',
      'Gehört zur Stoffgruppe der Carbonsäuren',
      'Verantwortlich für den sauren Geschmack von Essig'
    ],
    atoms: [
      { id: 'c1', element: 'C', position: [0, 0, 0] },
      { id: 'c2', element: 'C', position: [1.5, 0, 0] },
      { id: 'o1', element: 'O', position: [2.0, 1.2, 0] },
      { id: 'o2', element: 'O', position: [2.0, -1.2, 0] },
      { id: 'h1', element: 'H', position: [-0.5, 1.0, 0] },
      { id: 'h2', element: 'H', position: [-1.0, -0.5, 0.9] },
      { id: 'h3', element: 'H', position: [-1.0, -0.5, -0.9] }
    ],
    bonds: [
      { from: 'c1', to: 'c2' },
      { from: 'c2', to: 'o1' },
      { from: 'c2', to: 'o2' },
      { from: 'c1', to: 'h1' },
      { from: 'c1', to: 'h2' },
      { from: 'c1', to: 'h3' }
    ]
  },
  {
    id: 'acetone',
    name: 'Aceton',
    formula: 'C₃H₆O',
    iupacName: 'Propan-2-on',
    category: 'Keton',
    functionalGroups: ['ketone', 'carbonyl'],
    difficulty: 'advanced',
    hints: [
      'Enthält eine Carbonylgruppe in der Mitte der Kette',
      'Gehört zur Stoffgruppe der Ketone',
      'Ein häufig verwendetes Lösungsmittel'
    ],
    atoms: [
      { id: 'c1', element: 'C', position: [-1.5, 0, 0] },
      { id: 'c2', element: 'C', position: [0, 0, 0] },
      { id: 'c3', element: 'C', position: [1.5, 0, 0] },
      { id: 'o', element: 'O', position: [0, 1.2, 0] }
    ],
    bonds: [
      { from: 'c1', to: 'c2' },
      { from: 'c2', to: 'c3' },
      { from: 'c2', to: 'o' }
    ]
  },
  {
    id: 'propane',
    name: 'Propan',
    formula: 'C₃H₈',
    iupacName: 'Propan',
    category: 'Kohlenwasserstoff',
    functionalGroups: [],
    difficulty: 'beginner',
    hints: [
      'Besteht nur aus Kohlenstoff und Wasserstoff',
      'Ein dreiatomiger Kohlenwasserstoff',
      'Ein gasförmiger Brennstoff'
    ],
    atoms: [
      { id: 'c1', element: 'C', position: [-2, 0, 0] },
      { id: 'c2', element: 'C', position: [0, 0, 0] },
      { id: 'c3', element: 'C', position: [2, 0, 0] }
    ],
    bonds: [
      { from: 'c1', to: 'c2' },
      { from: 'c2', to: 'c3' }
    ]
  },
  {
    id: 'formaldehyde',
    name: 'Formaldehyd',
    formula: 'CH₂O',
    iupacName: 'Methanal',
    category: 'Aldehyd',
    functionalGroups: ['aldehyde', 'carbonyl'],
    difficulty: 'advanced',
    hints: [
      'Enthält eine Aldehydgruppe am Kettenende',
      'Das einfachste Aldehyd',
      'Wird häufig als Desinfektionsmittel verwendet'
    ],
    atoms: [
      { id: 'c', element: 'C', position: [0, 0, 0] },
      { id: 'o', element: 'O', position: [1.2, 0, 0] },
      { id: 'h1', element: 'H', position: [-0.5, 1.0, 0] },
      { id: 'h2', element: 'H', position: [-0.5, -1.0, 0] }
    ],
    bonds: [
      { from: 'c', to: 'o' },
      { from: 'c', to: 'h1' },
      { from: 'c', to: 'h2' }
    ]
  }
];

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULES.find((m) => m.id === id);
}

export function getRandomMolecule(): Molecule {
  return MOLECULES[Math.floor(Math.random() * MOLECULES.length)];
}

export function getMoleculesByDifficulty(difficulty: 'beginner' | 'advanced' | 'expert'): Molecule[] {
  return MOLECULES.filter((m) => m.difficulty === difficulty || m.difficulty === 'beginner');
}

export function getMoleculesWithFunctionalGroups(): Molecule[] {
  return MOLECULES.filter((m) => m.functionalGroups && m.functionalGroups.length > 0);
}

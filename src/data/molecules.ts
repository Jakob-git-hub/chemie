import type { Molecule } from '@/lib/types';

// Kuratierte Beispiel-Strukturen (vereinfachte, aber realistische Geometrie).
// Später durch eine externe Chemie-Datenbank (PubChem) ersetzbar.
export const MOLECULES: Molecule[] = [
  {
    id: 'water',
    name: 'Wasser',
    formula: 'H₂O',
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
  }
];

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULES.find((m) => m.id === id);
}

export function getRandomMolecule(): Molecule {
  return MOLECULES[Math.floor(Math.random() * MOLECULES.length)];
}

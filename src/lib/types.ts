export interface Atom {
  id: string;
  element: string; // Elementsymbol, z.B. 'O'
  position: [number, number, number];
}

export interface Bond {
  from: string; // Atom-ID
  to: string; // Atom-ID
}

export interface Molecule {
  id: string;
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
}

export interface QuizResult {
  moleculeId: string;
  correct: boolean;
  answer: string;
  expected: string;
  timestamp: number;
}

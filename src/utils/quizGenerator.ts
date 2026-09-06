import type { Molecule } from '@/lib/types';
import { MOLECULES, FUNCTIONAL_GROUPS, type FunctionalGroupKey } from '@/data/molecules';

/**
 * Quiz-Generator für die Chemie-Lernplattform.
 * Erstellt Distraktoren und Antwortoptionen für Quiz-Fragen.
 */

export type QuizQuestionType = 'name' | 'formula' | 'functional_group';

/**
 * Generiert plausible Falschantworten (Distraktoren) basierend auf dem korrekten Molekül.
 */
export function generateDistractors(
  correctAnswer: string,
  allMolecules: Molecule[],
  count: number = 3
): string[] {
  // Filtere Moleküle mit ähnlichen Eigenschaften
  const potentialDistractors = allMolecules.filter(
    (m) => m.name !== correctAnswer && m.formula !== correctAnswer
  );

  // Mische die Liste
  const shuffled = [...potentialDistractors].sort(() => Math.random() - 0.5);

  // Nimm die ersten 'count' Elemente
  return shuffled.slice(0, count).map((m) => m.name);
}

/**
 * Generiert Antwortoptionen für eine Quiz-Frage.
 */
export function generateQuizOptions(
  molecule: Molecule,
  type: QuizQuestionType,
  allMolecules: Molecule[] = MOLECULES
): string[] {
  let correctAnswer: string;
  let distractors: string[];

  switch (type) {
    case 'name':
      correctAnswer = molecule.name;
      distractors = generateNameDistractors(molecule, allMolecules);
      break;

    case 'formula':
      correctAnswer = molecule.formula;
      distractors = generateFormulaDistractors(molecule, allMolecules);
      break;

    case 'functional_group':
      correctAnswer = getFunctionalGroupNameForMolecule(molecule);
      distractors = generateFunctionalGroupDistractors(molecule);
      break;

    default:
      correctAnswer = molecule.name;
      distractors = [];
  }

  // Kombiniere und mische
  const options = [correctAnswer, ...distractors];
  return shuffleArray(options);
}

/**
 * Generiert Distraktoren basierend auf dem Namen.
 * Wählt Moleküle mit ähnlicher Struktur oder Kategorie.
 */
function generateNameDistractors(correctMolecule: Molecule, allMolecules: Molecule[]): string[] {
  const otherMolecules = allMolecules.filter((m) => m.id !== correctMolecule.id);

  // Priorisiere Moleküle aus der gleichen Kategorie
  const sameCategory = otherMolecules.filter(
    (m) => m.category === correctMolecule.category
  );

  // Wenn genug aus gleicher Kategorie, nimm diese
  if (sameCategory.length >= 3) {
    return shuffleArray(sameCategory)
      .slice(0, 3)
      .map((m) => m.name);
  }

  // Sonst fülle mit zufälligen Molekülen auf
  const shuffled = shuffleArray(otherMolecules);
  const needed = 3 - sameCategory.length;
  const categoryDistractors = sameCategory.map((m) => m.name);
  const randomDistractors = shuffled.slice(0, needed).map((m) => m.name);

  return shuffleArray([...categoryDistractors, ...randomDistractors]);
}

/**
 * Generiert Distraktoren basierend auf der Summenformel.
 * Wählt Moleküle mit ähnlicher Atomzahl oder Elementen.
 */
function generateFormulaDistractors(correctMolecule: Molecule, allMolecules: Molecule[]): string[] {
  const otherMolecules = allMolecules.filter((m) => m.id !== correctMolecule.id);

  // Parse die Summenformel, um die Atomzahl zu ermitteln
  const correctAtomCount = parseFormulaAtomCount(correctMolecule.formula);

  // Sortiere nach Ähnlichkeit der Atomzahl
  const sorted = otherMolecules.sort((a, b) => {
    const countA = Math.abs(parseFormulaAtomCount(a.formula) - correctAtomCount);
    const countB = Math.abs(parseFormulaAtomCount(b.formula) - correctAtomCount);
    return countA - countB;
  });

  return sorted.slice(0, 3).map((m) => m.formula);
}

/**
 * Generiert Distraktoren für funktionelle Gruppen.
 */
function generateFunctionalGroupDistractors(correctMolecule: Molecule): string[] {
  const allGroupKeys = Object.keys(FUNCTIONAL_GROUPS) as FunctionalGroupKey[];
  const correctGroups = correctMolecule.functionalGroups || [];

  // Filtere Gruppen, die nicht bereits im Molekül vorhanden sind
  const availableGroups = allGroupKeys.filter(
    (key) => !correctGroups.includes(key)
  );

  // Mische und nimm 3
  const shuffled = shuffleArray(availableGroups);
  return shuffled
    .slice(0, 3)
    .map((key) => FUNCTIONAL_GROUPS[key].name);
}

/**
 * Parst eine Summenformel und gibt die Gesamtzahl der Atome zurück.
 */
function parseFormulaAtomCount(formula: string): number {
  // Entferne Subskript-Zahlen und zähle
  const matches = formula.match(/([A-Z][a-z]?)(\d*)/g) || [];
  return matches.reduce((sum, match) => {
    const count = parseInt(match.replace(/[A-Za-z]/g, '') || '1', 10);
    return sum + (isNaN(count) ? 1 : count);
  }, 0);
}

/**
 * Gibt die Haupt-Funktionsgruppe eines Moleküls als formatierte Zeichenkette zurück.
 */
export function getFunctionalGroupNameForMolecule(molecule: Molecule): string {
  if (!molecule.functionalGroups || molecule.functionalGroups.length === 0) {
    return 'Keine funktionelle Gruppe';
  }

  // Nimm die erste Gruppe
  const groupKey = molecule.functionalGroups[0] as FunctionalGroupKey;
  return FUNCTIONAL_GROUPS[groupKey]?.name || 'Unbekannte Gruppe';
}

/**
 * Prüft, ob ein angeklicktes Atom zu einer bestimmten funktionellen Gruppe gehört.
 */
export function checkAtomFunctionalGroup(
  atomId: string,
  targetGroup: FunctionalGroupKey,
  molecule: Molecule
): boolean {
  const group = FUNCTIONAL_GROUPS[targetGroup];
  if (!group) return false;

  const atom = molecule.atoms.find((a) => a.id === atomId);
  if (!atom) return false;

  // Prüfe, ob das Atom-Element zur Gruppe gehört
  const elementMatches = group.atomPattern.some(
    (patternElement) => {
      // Finde Atome mit passendem Element
      return molecule.atoms.some(
        (a) =>
          a.element === patternElement &&
          // Prüfe Bindungen zu anderen relevanten Atomen
          molecule.bonds.some((bond) => {
            if (bond.from === a.id) {
              const bondedAtom = molecule.atoms.find((ba) => ba.id === bond.to);
              return bondedAtom && (group.bondedTo as readonly string[]).includes(bondedAtom.element);
            }
            if (bond.to === a.id) {
              const bondedAtom = molecule.atoms.find((ba) => ba.id === bond.from);
              return bondedAtom && (group.bondedTo as readonly string[]).includes(bondedAtom.element);
            }
            return false;
          })
      );
    }
  );

  return elementMatches;
}

/**
 * Findet das/die Atom/e, das/die zu einer funktionellen Gruppe gehören.
 */
export function findAtomsInFunctionalGroup(
  groupKey: FunctionalGroupKey,
  molecule: Molecule
): string[] {
  const group = FUNCTIONAL_GROUPS[groupKey];
  if (!group) return [];

  const atomsInGroup: string[] = [];

  // Finde Atome, die zur Gruppe gehören
  molecule.atoms.forEach((atom) => {
    if ((group.atomPattern as readonly string[]).includes(atom.element)) {
      // Prüfe, ob das Atom an relevante Elemente gebunden ist
      const isInGroup = molecule.bonds.some((bond) => {
        if (bond.from === atom.id || bond.to === atom.id) {
          const otherAtomId = bond.from === atom.id ? bond.to : bond.from;
          const otherAtom = molecule.atoms.find((a) => a.id === otherAtomId);
          return otherAtom && (group.bondedTo as readonly string[]).includes(otherAtom.element);
        }
        return false;
      });

      if (isInGroup) {
        atomsInGroup.push(atom.id);
      }
    }
  });

  return atomsInGroup;
}

/**
 * Generiert eine chemische Erklärung für ein korrektes/inkorrektes Ergebnis.
 */
export function generateExplanation(
  molecule: Molecule,
  isCorrect: boolean,
  selectedAnswer?: string
): string {
  if (isCorrect) {
    return `Richtig! ${molecule.name} (${molecule.formula}) ${
      molecule.iupacName ? `(IUPAC: ${molecule.iupacName})` : ''
    }. ${
      molecule.functionalGroups && molecule.functionalGroups.length > 0
        ? `Dieses Molekül enthält: ${molecule.functionalGroups
            .map((g) => FUNCTIONAL_GROUPS[g as FunctionalGroupKey]?.name || g)
            .join(', ')}.`
        : 'Dieses Molekül enthält keine spezielle funktionelle Gruppe.'
    }`;
  } else {
    return `Leider nicht ganz. ${molecule.name} (${molecule.formula}) ${
      molecule.iupacName ? `(IUPAC: ${molecule.iupacName})` : ''
    }. ${selectedAnswer ? `Deine Antwort war "${selectedAnswer}". ` : ''}${
      molecule.functionalGroups && molecule.functionalGroups.length > 0
        ? `Dieses Molekül enthält: ${molecule.functionalGroups
            .map((g) => FUNCTIONAL_GROUPS[g as FunctionalGroupKey]?.name || g)
            .join(', ')}.`
        : ''
    }`;
  }
}

/**
 * Hilfsfunktion zum Mischen eines Arrays (Fisher-Yates).
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gibt zufällige Distraktoren aus der Molekül-Datenbank zurück.
 */
export function getRandomDistractors(
  count: number,
  exclude: string[] = []
): string[] {
  const available = MOLECULES.filter((m) => !exclude.includes(m.name));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, count).map((m) => m.name);
}

/**
 * Gibt die funktionelle Gruppe eines Moleküls zurück (falls vorhanden).
 */
export function getFunctionalGroupForMolecule(
  molecule: Molecule
): FunctionalGroupKey | null {
  if (!molecule.functionalGroups || molecule.functionalGroups.length === 0) {
    return null;
  }
  return molecule.functionalGroups[0] as FunctionalGroupKey;
}

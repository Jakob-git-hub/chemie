import type { GuidedReactionLesson } from '@/lib/lesson-types';

/**
 * Curated, complete methane-combustion lesson.
 *
 * The engine equation is deliberately written without phase labels so it can
 * be consumed by parseFormula/balanceEquation. The lesson teaches complete
 * combustion and uses gaseous water consistently with the displayed reaction.
 */
export const METHANE_COMBUSTION_LESSON: GuidedReactionLesson = {
  id: 'methane-combustion',
  title: 'Methan vollständig verbrennen',
  summary:
    'Lerne, die Produkte einer vollständigen Verbrennung zu bestimmen und die Reaktionsgleichung durch Erhaltung der Atome auszugleichen.',
  level: 'beginner',
  objectives: [
    'Kohlenwasserstoff und Sauerstoff als Edukte einer vollständigen Verbrennung erkennen',
    'Kohlenstoffdioxid und Wasser als Produkte formulieren',
    'Reaktionskoeffizienten bestimmen, ohne Formelsubskripte zu verändern',
    'Die Atombilanz auf beiden Seiten überprüfen'
  ],
  assumptions: [
    'Es liegt vollständige Verbrennung mit ausreichend Sauerstoff vor.',
    'Als Produkte werden ausschließlich Kohlenstoffdioxid und Wasser betrachtet.',
    'Die Gleichung ist als Stoffbilanz ohne Ladungsbilanz formuliert; alle Spezies sind neutral.',
    'Für die konsistente Reaktionsdarstellung wird Wasser als Wasserdampf (g) angegeben.',
    'Die Reaktionsgleichung beschreibt keine Reaktionsgeschwindigkeit, Ausbeute oder Sicherheitsfreigabe.'
  ],
  reaction: {
    equation: 'CH4 + O2 -> CO2 + H2O',
    displayEquation: 'CH₄(g) + O₂(g) → CO₂(g) + H₂O(g)',
    reactants: [
      { formula: 'CH4', name: 'Methan', role: 'reactant', phase: 'gas' },
      { formula: 'O2', name: 'Sauerstoff', role: 'reactant', phase: 'gas' }
    ],
    products: [
      { formula: 'CO2', name: 'Kohlenstoffdioxid', role: 'product', phase: 'gas' },
      { formula: 'H2O', name: 'Wasser', role: 'product', phase: 'gas' }
    ],
    expectedCoefficients: [1, 2, 1, 2],
    balancedEquation: 'CH4 + 2O2 → CO2 + 2H2O'
  },
  steps: [
    {
      id: 'identify-reactants',
      title: 'Edukte erkennen',
      explanation:
        'Methan ist ein Kohlenwasserstoff. Bei vollständiger Verbrennung reagiert es mit dem zweiatomigen Sauerstoffmolekül O₂.',
      learnerPrompt: 'Welche Stoffe stehen auf der linken Seite der Reaktion?',
      equation: 'CH4 + O2 ->'
    },
    {
      id: 'predict-products',
      title: 'Produkte bestimmen',
      explanation:
        'Der Kohlenstoff aus CH₄ wird zu CO₂ oxidiert. Der Wasserstoff wird zu H₂O oxidiert.',
      learnerPrompt: 'Welche Produkte enthalten den Kohlenstoff und den Wasserstoff aus Methan?',
      equation: 'CH4 + O2 -> CO2 + H2O'
    },
    {
      id: 'balance-carbon',
      title: 'Kohlenstoff ausgleichen',
      explanation:
        'Auf jeder Seite befindet sich bereits ein Kohlenstoffatom. Die Koeffizienten von CH₄ und CO₂ bleiben daher 1.',
      equation: 'CH4 + O2 -> CO2 + H2O'
    },
    {
      id: 'balance-hydrogen',
      title: 'Wasserstoff ausgleichen',
      explanation:
        'CH₄ enthält vier Wasserstoffatome. Deshalb werden zwei H₂O-Moleküle benötigt.',
      equation: 'CH4 + O2 -> CO2 + 2H2O'
    },
    {
      id: 'balance-oxygen',
      title: 'Sauerstoff ausgleichen',
      explanation:
        'Die Produkte enthalten nun vier Sauerstoffatome: zwei in CO₂ und zwei in 2H₂O. Daher werden zwei O₂-Moleküle benötigt.',
      equation: 'CH4 + 2O2 -> CO2 + 2H2O'
    },
    {
      id: 'verify',
      title: 'Atombilanz prüfen',
      explanation:
        'Links und rechts stehen 1 C, 4 H und 4 O. Die kleinsten ganzzahligen Koeffizienten sind 1, 2, 1 und 2.',
      equation: 'CH4 + 2O2 -> CO2 + 2H2O'
    }
  ]
};

export const GUIDED_REACTION_LESSONS: readonly GuidedReactionLesson[] = [
  METHANE_COMBUSTION_LESSON
];

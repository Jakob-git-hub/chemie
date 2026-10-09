/**
 * Organische Reaktionen – Multiple-Choice-Quiz
 *
 * Jede Frage zeigt Edukte + Reagenzien/Bedingungen; die Aufgabe ist,
 * das entstehende Produkt (Struktur als verstrickte/verkürzte Strukturformel)
 * aus vier Optionen zu wählen.
 */

export interface OrganicQuestion {
  id: string;
  category: string;
  difficulty: 'leicht' | 'mittel' | 'schwer';
  /** Edukte als verkürzte Strukturformeln */
  educts: string[];
  /** über dem Reaktionspfeil */
  reagents?: string;
  /** unter dem Reaktionspfeil */
  conditions?: string;
  /** genau 4 Produkt-Optionen */
  options: string[];
  correctIndex: number;
  productName: string;
  explanation: string;
}

export const ORGANIC_QUESTIONS: OrganicQuestion[] = [
  {
    id: 'add-br2-ethen',
    category: 'Elektrophile Addition',
    difficulty: 'leicht',
    educts: ['CH₂=CH₂', 'Br₂'],
    options: ['CH₃-CHBr₂', 'BrCH₂-CH₂Br', 'CH₂=CHBr', 'CH₃-CH₃'],
    correctIndex: 1,
    productName: '1,2-Dibromethan',
    explanation:
      'Die Doppelbindung greift Br₂ an: Je ein Bromatom lagert sich an eines der beiden C-Atome. Es entsteht ein vicinales Dibromid – kein Wasserstoff wird ersetzt.'
  },
  {
    id: 'add-h2o-ethen',
    category: 'Addition (Hydratisierung)',
    difficulty: 'leicht',
    educts: ['CH₂=CH₂', 'H₂O'],
    reagents: 'H₃O⁺ / H₂SO₄ (Kat.)',
    options: ['CH₃-CHO', 'CH₃-CH₂-OH', 'CH₃-COOH', 'CH₃-O-CH₃'],
    correctIndex: 1,
    productName: 'Ethanol',
    explanation:
      'Säurekatalysiert lagert sich Wasser an die Doppelbindung an (Markovnikov). Aus Ethen wird der primäre Alkohol Ethanol.'
  },
  {
    id: 'add-hbr-propen',
    category: 'Elektrophile Addition',
    difficulty: 'mittel',
    educts: ['CH₂=CH-CH₃', 'HBr'],
    options: ['CH₃-CH₂-CH₂Br', 'CH₃-CHBr-CH₃', 'CH₂=CH-CH₂Br', 'CH₃-CH₂-CH₃'],
    correctIndex: 1,
    productName: '2-Brompropan',
    explanation:
      'Markovnikov-Regel: Das H-Atom geht an das C-Atom mit mehr Wasserstoff, Brom an das höher substituierte C-Atom. Es entsteht 2-Brompropan, nicht 1-Brompropan.'
  },
  {
    id: 'rad-sub-methan',
    category: 'Radikalische Substitution',
    difficulty: 'leicht',
    educts: ['CH₄', 'Cl₂'],
    conditions: 'UV-Licht',
    options: ['CH₂Cl₂', 'CH₃Cl', 'CCl₄', 'CH₃-OH'],
    correctIndex: 1,
    productName: 'Chlormethan (+ HCl)',
    explanation:
      'UV-Licht spaltet Cl₂ homolytisch in Radikale. Ein H-Atom des Methans wird ersetzt – als erste Stufe entsteht Chlormethan (weitere Stufen wären CH₂Cl₂ usw.).'
  },
  {
    id: 'ester-essig-ethanol',
    category: 'Veresterung',
    difficulty: 'mittel',
    educts: ['CH₃-COOH', 'CH₃-CH₂-OH'],
    reagents: 'H⁺ (Kat.)',
    options: ['CH₃-COO-CH₂-CH₃', 'CH₃-CH₂-O-CH₂-CH₃', 'CH₃-CO-CH₃', 'CH₃-CH₂-CHO'],
    correctIndex: 0,
    productName: 'Ethansäureethylester (Essigester)',
    explanation:
      'Carbonsäure + Alkohol reagieren säurekatalysiert unter Wasserabspaltung zum Ester: Essigsäure + Ethanol → Essigsäureethylester + H₂O (Gleichgewichtsreaktion).'
  },
  {
    id: 'ox-ethanol-sauer',
    category: 'Oxidation',
    difficulty: 'mittel',
    educts: ['CH₃-CH₂-OH'],
    reagents: 'KMnO₄ / H⁺ (stark)',
    options: ['CH₃-CHO', 'CH₃-COOH', 'CH₂=CH₂', 'CO₂ + H₂O'],
    correctIndex: 1,
    productName: 'Ethansäure',
    explanation:
      'Primäre Alkohole laufen bei starker Oxidation über das Aldehyd-Stadium hinaus bis zur Carbonsäure. Ethanol → Ethanal → Ethansäure.'
  },
  {
    id: 'ox-propan2ol',
    category: 'Oxidation',
    difficulty: 'mittel',
    educts: ['CH₃-CHOH-CH₃'],
    reagents: '[O] (z. B. CuO)',
    options: ['CH₃-CH₂-CHO', 'CH₃-CH₂-COOH', 'CH₃-CO-CH₃', 'CH₃-CH₂-CH₃'],
    correctIndex: 2,
    productName: 'Propanon (Aceton)',
    explanation:
      'Sekundäre Alkohole werden zu Ketonen oxidiert – weiter geht es nicht, weil das Carbonyl-C kein H mehr trägt. Propan-2-ol → Propanon.'
  },
  {
    id: 'ethanol-natrium',
    category: 'Reaktion mit Alkalimetall',
    difficulty: 'schwer',
    educts: ['CH₃-CH₂-OH', 'Na'],
    options: ['CH₃-CH₂-O-Na', 'CH₃-CHO', 'CH₃-COONa', 'CH₃-CH₃'],
    correctIndex: 0,
    productName: 'Natriumethanolat (+ H₂)',
    explanation:
      'Alkohole reagieren wie sehr schwache Säuren mit Natrium: Es entsteht das Alkoholat-Ion und Wasserstoffgas – keine Oxidation, kein Salz der Carbonsäure.'
  },
  {
    id: 'neutralisation-acetat',
    category: 'Säure-Base',
    difficulty: 'leicht',
    educts: ['CH₃-COOH', 'NaOH'],
    options: ['CH₃-COO-Na', 'CH₃-CH₂-OH', 'CH₃-CHO', 'CH₃-COO-CH₃'],
    correctIndex: 0,
    productName: 'Natriumacetat (+ H₂O)',
    explanation:
      'Klassische Neutralisation: Die Carbonsäure gibt ihr Proton an die Base ab, es bleibt das Acetat-Salz und Wasser.'
  },
  {
    id: 'hydrierung-propen',
    category: 'Addition (Hydrierung)',
    difficulty: 'leicht',
    educts: ['CH₂=CH-CH₃', 'H₂'],
    reagents: 'Ni oder Pt (Kat.)',
    options: ['CH₃-CH₂-CH₃', 'CH₃-CH₂-CH₂-OH', 'CH≡C-CH₃', 'C₃H₆ (Cyclopropan)'],
    correctIndex: 0,
    productName: 'Propan',
    explanation:
      'Am Katalysator lagert sich H₂ an die Doppelbindung an – aus dem Alken wird das gesättigte Alkan.'
  },
  {
    id: 'sn-brompropan',
    category: 'Nukleophile Substitution',
    difficulty: 'mittel',
    educts: ['CH₃-CH₂-CH₂Br', 'NaOH (wässrig)'],
    options: ['CH₃-CH=CH₂', 'CH₃-CH₂-CH₂-OH', 'CH₃-CH₂-CH₂-ONa', 'CH₃-CH₂-CH₃'],
    correctIndex: 1,
    productName: 'Propan-1-ol',
    explanation:
      'In wässriger Lösung ersetzt das Hydroxid-Ion das Brom (SN-Reaktion) – es entsteht der Alkohol. Eliminierung zum Alken dominiert erst mit starker Base in Alkohol.'
  },
  {
    id: 'elim-ethanol',
    category: 'Eliminierung',
    difficulty: 'mittel',
    educts: ['CH₃-CH₂-OH'],
    reagents: 'konz. H₂SO₄',
    conditions: '180 °C',
    options: ['CH₃-CH₂-O-CH₂-CH₃', 'CH₂=CH₂', 'CH₃-CHO', 'CH₃-COOH'],
    correctIndex: 1,
    productName: 'Ethen',
    explanation:
      'Bei 180 °C spaltet Ethanol Wasser ab (Dehydratisierung) und wird zum Alken. Bei ~140 °C entsteht dagegen bevorzugt der Ether – Temperatur entscheidet.'
  },
  {
    id: 'eas-benzol-br2',
    category: 'Elektrophile aromatische Substitution',
    difficulty: 'schwer',
    educts: ['C₆H₆', 'Br₂'],
    reagents: 'FeBr₃ (Kat.)',
    options: ['C₆H₅-Br', 'C₆H₁₂', 'C₆H₅-OH', 'C₆H₁₀Br₂'],
    correctIndex: 0,
    productName: 'Brombenzol (+ HBr)',
    explanation:
      'Das aromatische System bleibt erhalten: Ein H wird durch Br ersetzt (Substitution), statt Br₂ wie beim Alken anzulagern (Addition). FeBr₃ aktiviert das Brom.'
  },
  {
    id: 'red-ethanal',
    category: 'Reduktion',
    difficulty: 'schwer',
    educts: ['CH₃-CHO'],
    reagents: 'NaBH₄',
    options: ['CH₃-COOH', 'CH₃-CH₂-OH', 'CH₂=CH₂', 'CH₃-COO-CH₃'],
    correctIndex: 1,
    productName: 'Ethanol',
    explanation:
      'NaBH₄ liefert Hydrid-Ionen, die den Aldehyd zum primären Alkohol reduzieren – die Umkehrung der Oxidation.'
  },
  {
    id: 'poly-ethen',
    category: 'Polymerisation',
    difficulty: 'leicht',
    educts: ['n CH₂=CH₂'],
    conditions: 'Druck, Initiator',
    options: ['(-CH₂-CH₂-)ₙ', '(-CH₂-CHCl-)ₙ', 'n CH₃-CH₃', '(-CH=CH-)ₙ'],
    correctIndex: 0,
    productName: 'Polyethen (PE)',
    explanation:
      'Bei der radikalischen Polymerisation öffnet sich die Doppelbindung und die Monomere verketten sich: Ethen → Polyethen mit gesättigter Kette.'
  }
];

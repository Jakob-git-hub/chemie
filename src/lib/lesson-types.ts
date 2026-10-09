/**
 * Typed content contract for guided chemistry lessons.
 *
 * Formula strings used by the chemistry engine intentionally omit phase labels
 * and coefficients. Display strings may include both for learner-facing copy.
 */
export type LessonId = 'methane-combustion';

export type ReactionRole = 'reactant' | 'product';

export interface LessonSpecies {
  formula: string;
  name: string;
  role: ReactionRole;
  phase: 'solid' | 'liquid' | 'gas' | 'aqueous';
}

export interface GuidedReaction {
  equation: string;
  displayEquation: string;
  reactants: readonly LessonSpecies[];
  products: readonly LessonSpecies[];
  expectedCoefficients: readonly number[];
  balancedEquation: string;
}

export interface GuidedLessonStep {
  id: string;
  title: string;
  explanation: string;
  learnerPrompt?: string;
  equation?: string;
}

export interface GuidedReactionLesson {
  id: LessonId;
  title: string;
  summary: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  objectives: readonly string[];
  assumptions: readonly string[];
  reaction: GuidedReaction;
  steps: readonly GuidedLessonStep[];
}

export interface LessonAnswer {
  answer?: string;
  coefficients?: number[];
  correct: boolean;
}

export interface LessonStepProgress {
  completed: boolean;
  lastSubmission: LessonAnswer | null;
}

export type LessonStepProgressMap = Record<string, LessonStepProgress>;

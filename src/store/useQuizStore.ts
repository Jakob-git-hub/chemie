import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Molecule } from '@/lib/types';
import { MOLECULES, getMoleculesByDifficulty, getMoleculesWithFunctionalGroups, FUNCTIONAL_GROUPS, type FunctionalGroupKey } from '@/data/molecules';
import { generateQuizOptions, getRandomDistractors, getFunctionalGroupForMolecule } from '@/utils/quizGenerator';

export type GameMode = 'idle' | 'identification' | 'functional_groups';
export type Difficulty = 'beginner' | 'advanced' | 'expert';

export interface QuizQuestion {
  molecule: Molecule;
  options: string[];
  correctAnswer: string;
  functionalGroupTarget?: FunctionalGroupKey;
}

interface QuizState {
  // Modus
  gameMode: GameMode;
  difficulty: Difficulty;

  // Aktuelle Frage
  currentQuestion: QuizQuestion | null;
  selectedAnswer: string | null;

  // Feedback
  isAnswered: boolean;
  isCorrect: boolean | null;
  currentHintIndex: number;
  showExplanation: boolean;

  // Score
  score: number;
  streak: number;
  highScore: number;
  totalQuestions: number;
  correctAnswers: number;

  // Question pool
  questionPool: QuizQuestion[];
  usedMoleculeIds: Set<string>;

  // Aktionen
  startQuiz: (mode: GameMode, difficulty: Difficulty) => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  requestHint: () => void;
  endQuiz: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

// XP-Konfiguration
const XP_CORRECT = 100;
const XP_HINT_PENALTY = 25;
const XP_STREAK_BONUS = 10; // Pro Streak-Stufe

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestionPool(mode: GameMode, difficulty: Difficulty): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  if (mode === 'identification') {
    // Molekül-Erkennungs-Modus
    const molecules = getMoleculesByDifficulty(difficulty);

    molecules.forEach((molecule) => {
      const options = generateQuizOptions(molecule, 'name', MOLECULES);
      questions.push({
        molecule,
        options,
        correctAnswer: molecule.name
      });
    });
  } else if (mode === 'functional_groups') {
    // Funktionale Gruppen-Modus
    const moleculesWithGroups = getMoleculesWithFunctionalGroups();

    moleculesWithGroups.forEach((molecule) => {
      if (!molecule.functionalGroups || molecule.functionalGroups.length === 0) return;

      // Wähle eine zufällige funktionelle Gruppe aus den verfügbaren
      const groupKey = molecule.functionalGroups[Math.floor(Math.random() * molecule.functionalGroups.length)] as FunctionalGroupKey;
      const group = FUNCTIONAL_GROUPS[groupKey];

      questions.push({
        molecule,
        options: [], // Wird bei der Anzeige generiert
        correctAnswer: group.name,
        functionalGroupTarget: groupKey
      });
    });
  }

  // Mische die Fragen
  return shuffleArray(questions);
}

function getNextQuestion(state: QuizState): QuizQuestion | null {
  const { questionPool, usedMoleculeIds, gameMode } = state;

  // Finde eine nicht verwendete Frage
  for (let i = 0; i < questionPool.length; i++) {
    const question = questionPool[i];
    if (!usedMoleculeIds.has(question.molecule.id)) {
      return question;
    }
  }

  // Alle Fragen verwendet - Pool zurücksetzen
  if (questionPool.length > 0) {
    // Starte neue Runde mit neuen Fragen
    const newPool = generateQuestionPool(gameMode as GameMode, state.difficulty);
    return newPool[0] || null;
  }

  return null;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initialer Zustand
      gameMode: 'idle',
      difficulty: 'beginner',
      currentQuestion: null,
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: null,
      currentHintIndex: 0,
      showExplanation: false,
      score: 0,
      streak: 0,
      highScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      questionPool: [],
      usedMoleculeIds: new Set<string>(),

      startQuiz: (mode, difficulty) => {
        const pool = generateQuestionPool(mode, difficulty);
        const firstQuestion = pool[0] || null;

        set({
          gameMode: mode,
          difficulty,
          questionPool: pool,
          usedMoleculeIds: new Set<string>(),
          currentQuestion: firstQuestion,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: null,
          currentHintIndex: 0,
          showExplanation: false,
          score: 0,
          streak: 0,
          totalQuestions: 0,
          correctAnswers: 0
        });

        // Markiere erste Frage als verwendet
        if (firstQuestion) {
          const newUsed = new Set(get().usedMoleculeIds);
          newUsed.add(firstQuestion.molecule.id);
          set({ usedMoleculeIds: newUsed });
        }
      },

      selectAnswer: (answer) => {
        const state = get();
        if (state.isAnswered || !state.currentQuestion) return;

        const isCorrect = answer === state.currentQuestion.correctAnswer;

        set({
          selectedAnswer: answer,
          isAnswered: true,
          isCorrect,
          showExplanation: true,
          totalQuestions: state.totalQuestions + 1,
          correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
          score: isCorrect
            ? state.score + XP_CORRECT + (state.streak * XP_STREAK_BONUS)
            : state.score,
          streak: isCorrect ? state.streak + 1 : 0,
          highScore: Math.max(state.highScore, isCorrect ? state.score + XP_CORRECT + (state.streak * XP_STREAK_BONUS) : state.score)
        });
      },

      nextQuestion: () => {
        const state = get();
        const nextQ = getNextQuestion(state);

        if (!nextQ) {
          // Keine weiteren Fragen verfügbar
          set({
            gameMode: 'idle',
            currentQuestion: null
          });
          return;
        }

        // Generiere Optionen für funktionale Gruppen
        let options = nextQ.options;
        if (state.gameMode === 'functional_groups') {
          options = generateQuizOptions(nextQ.molecule, 'functional_group', MOLECULES);
        }

        const newUsed = new Set(state.usedMoleculeIds);
        newUsed.add(nextQ.molecule.id);

        set({
          currentQuestion: { ...nextQ, options },
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: null,
          currentHintIndex: 0,
          showExplanation: false,
          usedMoleculeIds: newUsed
        });
      },

      requestHint: () => {
        const state = get();
        if (!state.currentQuestion || !state.currentQuestion.molecule.hints) return;

        const newIndex = Math.min(
          state.currentHintIndex + 1,
          state.currentQuestion.molecule.hints.length - 1
        );

        // Punktabzug für Hinweis
        const newScore = Math.max(0, state.score - XP_HINT_PENALTY);

        set({
          currentHintIndex: newIndex,
          score: newScore
        });
      },

      endQuiz: () => {
        set({
          gameMode: 'idle',
          currentQuestion: null,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: null,
          currentHintIndex: 0,
          showExplanation: false
        });
      },

      setDifficulty: (difficulty) => {
        set({ difficulty });
      }
    }),
    {
      name: 'chemistry-quiz-storage',
      partialize: (state) => ({
        highScore: state.highScore
      })
    }
  )
);

// Selector-Hooks für Performance
export const useQuizGameMode = () => useQuizStore((s) => s.gameMode);
export const useQuizScore = () => useQuizStore((s) => s.score);
export const useQuizStreak = () => useQuizStore((s) => s.streak);
export const useQuizHighScore = () => useQuizStore((s) => s.highScore);
export const useQuizIsAnswered = () => useQuizStore((s) => s.isAnswered);
export const useQuizCurrentQuestion = () => useQuizStore((s) => s.currentQuestion);

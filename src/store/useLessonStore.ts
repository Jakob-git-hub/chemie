import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LessonAnswer, LessonStepProgress, LessonStepProgressMap } from '@/lib/lesson-types';

const LESSON_PROGRESS_VERSION = 1;

interface LessonProgressState {
  activeLessonId: string | null;
  stepIds: string[];
  currentStepIndex: number;
  steps: LessonStepProgressMap;
  startedAt: number | null;
  completedAt: number | null;

  startLesson: (lessonId: string, stepIds: readonly string[]) => void;
  submitCoefficients: (
    stepId: string,
    coefficients: readonly number[],
    correct: boolean
  ) => void;
  submitAnswer: (stepId: string, answer: string, correct: boolean) => void;
  completeStep: (stepId?: string) => void;
  resetStep: (stepId?: string) => void;
  setCurrentStep: (index: number) => void;
  resetLesson: () => void;
}

const emptyStep = (): LessonStepProgress => ({
  completed: false,
  lastSubmission: null
});

function normalizeStepIds(stepIds: readonly string[]): string[] {
  return [...new Set(stepIds.map((stepId) => stepId.trim()).filter(Boolean))];
}

function createStepProgress(stepIds: readonly string[]): LessonStepProgressMap {
  return Object.fromEntries(stepIds.map((stepId) => [stepId, emptyStep()]));
}

function clampStepIndex(index: number, stepIds: readonly string[]): number {
  if (stepIds.length === 0) return 0;
  return Math.min(Math.max(index, 0), stepIds.length - 1);
}

function withSubmission(
  current: LessonStepProgress | undefined,
  submission: LessonAnswer
): LessonStepProgress {
  return {
    ...(current ?? emptyStep()),
    lastSubmission: {
      ...submission,
      coefficients: submission.coefficients ? [...submission.coefficients] : undefined
    }
  };
}

export const useLessonStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      activeLessonId: null,
      stepIds: [],
      currentStepIndex: 0,
      steps: {},
      startedAt: null,
      completedAt: null,

      startLesson: (lessonId, rawStepIds) => {
        const stepIds = normalizeStepIds(rawStepIds);
        const state = get();
        const isSameLesson = state.activeLessonId === lessonId;

        if (isSameLesson) {
          const steps = Object.fromEntries(
            stepIds.map((stepId) => [stepId, state.steps[stepId] ?? emptyStep()])
          );
          const allCompleted =
            stepIds.length > 0 && stepIds.every((stepId) => steps[stepId].completed);

          set({
            stepIds,
            steps,
            currentStepIndex: clampStepIndex(state.currentStepIndex, stepIds),
            completedAt: allCompleted ? state.completedAt : null
          });
          return;
        }

        set({
          activeLessonId: lessonId,
          stepIds,
          currentStepIndex: 0,
          steps: createStepProgress(stepIds),
          startedAt: Date.now(),
          completedAt: null
        });
      },

      submitCoefficients: (stepId, coefficients, correct) => {
        const state = get();
        if (!state.stepIds.includes(stepId)) return;

        set({
          steps: {
            ...state.steps,
            [stepId]: withSubmission(state.steps[stepId], {
              coefficients: [...coefficients],
              correct
            })
          }
        });
      },

      submitAnswer: (stepId, answer, correct) => {
        const state = get();
        if (!state.stepIds.includes(stepId)) return;

        set({
          steps: {
            ...state.steps,
            [stepId]: withSubmission(state.steps[stepId], { answer, correct })
          }
        });
      },

      completeStep: (stepId = get().stepIds[get().currentStepIndex]) => {
        const state = get();
        if (!stepId || !state.stepIds.includes(stepId)) return;

        const progress = state.steps[stepId] ?? emptyStep();
        if (!progress.lastSubmission?.correct) return;

        const steps = {
          ...state.steps,
          [stepId]: { ...progress, completed: true }
        };
        const stepIndex = state.stepIds.indexOf(stepId);
        const allCompleted = state.stepIds.every((id) => steps[id]?.completed);

        set({
          steps,
          currentStepIndex: allCompleted
            ? stepIndex
            : clampStepIndex(stepIndex + 1, state.stepIds),
          completedAt: allCompleted ? Date.now() : null
        });
      },

      resetStep: (stepId = get().stepIds[get().currentStepIndex]) => {
        const state = get();
        if (!stepId || !state.stepIds.includes(stepId)) return;

        set({
          steps: { ...state.steps, [stepId]: emptyStep() },
          currentStepIndex: state.stepIds.indexOf(stepId),
          completedAt: null
        });
      },

      setCurrentStep: (index) =>
        set((state) => ({ currentStepIndex: clampStepIndex(index, state.stepIds) })),

      resetLesson: () =>
        set({
          activeLessonId: null,
          stepIds: [],
          currentStepIndex: 0,
          steps: {},
          startedAt: null,
          completedAt: null
        })
    }),
    {
      name: 'chemistry-lesson-progress',
      version: LESSON_PROGRESS_VERSION,
      partialize: (state) => ({
        activeLessonId: state.activeLessonId,
        stepIds: state.stepIds,
        currentStepIndex: state.currentStepIndex,
        steps: state.steps,
        startedAt: state.startedAt,
        completedAt: state.completedAt
      })
    }
  )
);

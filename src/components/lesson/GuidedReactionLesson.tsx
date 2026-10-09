import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, RotateCcw } from 'lucide-react';
import { parseFormula } from '@/lib/chem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CoefficientInput from './CoefficientInput';
import BalanceFeedback, { type ElementBalance } from './BalanceFeedback';
import type { GuidedReactionLesson } from '@/lib/lesson-types';
import { useLessonStore } from '@/store/useLessonStore';

interface GuidedReactionLessonProps {
  lesson: GuidedReactionLesson;
}

export default function GuidedReactionLesson({ lesson }: GuidedReactionLessonProps) {
  const currentStepIndex = useLessonStore((state) => state.activeLessonId === lesson.id ? state.currentStepIndex : 0);
  const progress = useLessonStore((state) => state.steps);
  const completed = useLessonStore((state) => state.completedAt !== null && state.activeLessonId === lesson.id);
  const startLesson = useLessonStore((state) => state.startLesson);
  const submitCoefficients = useLessonStore((state) => state.submitCoefficients);
  const completeStep = useLessonStore((state) => state.completeStep);
  const resetLesson = useLessonStore((state) => state.resetLesson);
  const setCurrentStep = useLessonStore((state) => state.setCurrentStep);
  const [coefficients, setCoefficients] = useState(() => lesson.reaction.expectedCoefficients.map(() => 1));
  const step = currentStepIndex;
  const species = useMemo(() => [...lesson.reaction.reactants, ...lesson.reaction.products], [lesson.reaction.products, lesson.reaction.reactants]);

  useEffect(() => {
    startLesson(lesson.id, lesson.steps.map((item) => item.id));
  }, [lesson.id, lesson.steps, startLesson]);

  const formulas = useMemo(
    () =>
      species.map((item) => {
        const parsed = parseFormula(item.formula);
        return parsed.ok ? parsed.counts : {};
      }),
    [species]
  );

  const elements = useMemo(() => [...new Set(formulas.flatMap((counts) => Object.keys(counts)))], [formulas]);
  const balanceRows: ElementBalance[] = useMemo(
    () =>
      elements.map((element) => ({
        element,
        left: species.reduce((sum, item, index) => item.role === 'reactant' ? sum + (formulas[index][element] ?? 0) * coefficients[index] : sum, 0),
        right: species.reduce((sum, item, index) => item.role === 'product' ? sum + (formulas[index][element] ?? 0) * coefficients[index] : sum, 0)
      })),
    [coefficients, elements, formulas, species]
  );
  const isBalanced = balanceRows.length > 0 && balanceRows.every((row) => row.left === row.right);
  const requiresBalanceCheck = lesson.steps[step].id === 'verify';
  const coefficientsMatchTarget = coefficients.every(
    (value, index) => value === lesson.reaction.expectedCoefficients[index]
  );
  const stepCorrect = requiresBalanceCheck ? isBalanced && coefficientsMatchTarget : true;

  const reset = () => {
    setCoefficients(lesson.reaction.expectedCoefficients.map(() => 1));
    resetLesson();
    startLesson(lesson.id, lesson.steps.map((item) => item.id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Geführte Reaktion</CardTitle>
              <CardDescription className="mt-1">{lesson.summary}</CardDescription>
            </div>
            {completed && <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-label="Lektion abgeschlossen" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 border-b border-border/60 pb-5 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">Was du mitnimmst</h2>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {lesson.objectives.map((objective) => <li key={objective}>• {objective}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">Annahmen</h2>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {lesson.assumptions.slice(0, 3).map((assumption) => <li key={assumption}>• {assumption}</li>)}
              </ul>
            </div>
          </div>
          <ol className="grid gap-2 sm:grid-cols-3" aria-label="Lektionsschritte">
            {lesson.steps.map((lessonStep, index) => (
              <li key={lessonStep.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (index <= currentStepIndex) setCurrentStep(index);
                  }}
                  aria-current={index === step ? 'step' : undefined}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${index === step ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                >
                  <span className="text-xs font-semibold text-muted-foreground">Schritt {index + 1}</span>
                  <span className="mt-1 block font-semibold">{lessonStep.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border bg-muted/30 p-4" aria-live="polite">
            <p className="text-sm leading-relaxed">{lesson.steps[step].explanation}</p>
            {lesson.steps[step].learnerPrompt && (
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span><span className="font-semibold text-foreground">Aufgabe:</span> {lesson.steps[step].learnerPrompt}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setze die Koeffizienten</CardTitle>
          <CardDescription>
            {requiresBalanceCheck
              ? 'Verwende positive ganze Zahlen. Im letzten Schritt prüfst du die kleinste ausgeglichene Kombination.'
              : 'Nutze die Atombilanz als Kontrolle. Die eigentliche Abschlussprüfung folgt im letzten Schritt.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-4" role="group" aria-label={`Reaktionsgleichung ${lesson.reaction.displayEquation}`}>
            {species.map((item, index) => (
              <span key={`${item.formula}-${index}`} className="contents">
                <CoefficientInput
                  id={`coefficient-${index}`}
                  formula={item.formula}
                  value={coefficients[index]}
                  onChange={(value) => setCoefficients((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
                />
                {index < species.length - 1 && (
                  <span className="px-1 text-lg text-muted-foreground" aria-hidden="true">
                    {item.role !== species[index + 1].role ? '→' : '+'}
                  </span>
                )}
              </span>
            ))}
          </div>

          <BalanceFeedback rows={balanceRows} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Zurücksetzen
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(step - 1)} disabled={step === 0}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Zurück
              </Button>
              {step < lesson.steps.length - 1 ? (
                <Button type="button" onClick={() => {
                  submitCoefficients(lesson.steps[step].id, coefficients, stepCorrect);
                  if (stepCorrect) completeStep(lesson.steps[step].id);
                }}>
                  Nächster Schritt
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button type="button" onClick={() => {
                  const correct = isBalanced && coefficientsMatchTarget;
                  submitCoefficients(lesson.steps[step].id, coefficients, correct);
                  if (correct) completeStep(lesson.steps[step].id);
                }} disabled={!isBalanced}>
                  Lektion abschließen
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            {progress[lesson.steps[step].id]?.lastSubmission && (
              <p className="text-sm text-muted-foreground" role="status">
                {progress[lesson.steps[step].id].lastSubmission?.correct ? 'Dieser Schritt ist korrekt.' : 'Prüfe die Koeffizienten und versuche es erneut.'}
              </p>
            )}
          </div>
          {completed && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm text-emerald-800 dark:text-emerald-200" role="status">
              Geschafft! Die Reaktion ist ausgeglichen und diese Lektion wurde gespeichert.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

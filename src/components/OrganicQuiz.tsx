import { useMemo, useState } from 'react';
import { ArrowRight, FlaskConical, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORGANIC_QUESTIONS, type OrganicQuestion } from '@/data/organicReactions';
import { cn } from '@/lib/utils';

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PreparedQuestion {
  question: OrganicQuestion;
  options: string[];
  correctIndex: number;
}

const DIFFICULTY_STYLE: Record<OrganicQuestion['difficulty'], string> = {
  leicht: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  mittel: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  schwer: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
};

export default function OrganicQuiz() {
  const [round, setRound] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  // Fragen- und Antwortreihenfolge pro Runde mischen
  const prepared = useMemo<PreparedQuestion[]>(() => {
    return shuffled(ORGANIC_QUESTIONS).map((q) => {
      const order = shuffled(q.options.map((_, i) => i));
      return {
        question: q,
        options: order.map((i) => q.options[i]),
        correctIndex: order.indexOf(q.correctIndex)
      };
    });
    // round startet die Mischung neu
  }, [round]);

  const current = prepared[questionIndex];
  const total = prepared.length;
  const answered = selected !== null;
  const isCorrect = answered && selected === current.correctIndex;

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === current.correctIndex) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (questionIndex + 1 >= total) {
      setFinished(true);
    } else {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setRound((r) => r + 1);
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Runde geschafft!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="font-mono text-5xl font-bold">
            {score}<span className="text-2xl text-muted-foreground">/{total}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pct >= 90 ? 'Stark – deine Organik sitzt! 💪' : pct >= 60 ? 'Solide Runde. Schau dir die Erklärungen zu deinen Fehlern nochmal an.' : 'Guter Anfang – starte eine neue Runde und nutze die Erklärungen als Lernhilfe.'}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="rounded-full bg-muted px-3 py-1">Trefferquote: {pct}%</span>
            <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Beste Serie: {bestStreak}
            </span>
          </div>
          <Button onClick={restart} className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Neue Runde starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = current.question;

  return (
    <div className="space-y-4">
      {/* Fortschritt */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-muted px-3 py-1 font-medium">
          Frage {questionIndex + 1} / {total}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 font-medium">Punkte: {score}</span>
        {streak >= 2 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Zap className="h-3.5 w-3.5" /> {streak}er-Serie
          </span>
        )}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(questionIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Reaktionsschema */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {q.category}
            </span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', DIFFICULTY_STYLE[q.difficulty])}>
              {q.difficulty}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 py-2 sm:flex-row sm:justify-center sm:gap-6">
            {/* Edukte */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              {q.educts.map((e, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-xl text-muted-foreground">+</span>}
                  <span className="rounded-lg border bg-card px-3 py-2 font-mono text-base font-medium shadow-sm sm:text-lg">
                    {e}
                  </span>
                </span>
              ))}
            </div>

            {/* Pfeil mit Reagenzien */}
            <div className="flex flex-col items-center">
              {q.reagents && (
                <span className="whitespace-nowrap text-xs text-muted-foreground">{q.reagents}</span>
              )}
              <ArrowRight className="h-8 w-8 rotate-90 text-primary sm:rotate-0" aria-hidden="true" />
              {q.conditions && (
                <span className="whitespace-nowrap text-xs text-muted-foreground">{q.conditions}</span>
              )}
            </div>

            {/* Gesuchtes Produkt */}
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-primary/50 font-mono text-2xl font-bold text-primary">
              ?
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Welches Produkt entsteht bei dieser Reaktion?
          </p>
        </CardContent>
      </Card>

      {/* Antwortoptionen */}
      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Antwortmöglichkeiten">
        {current.options.map((opt, i) => {
          const isThis = selected === i;
          const isAnswer = i === current.correctIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                'flex min-h-[56px] items-center justify-center rounded-xl border-2 px-4 py-3 font-mono text-base font-medium transition-all sm:text-lg',
                !answered && 'border-border bg-card hover:border-primary/60 hover:bg-primary/5 active:scale-[0.98]',
                answered && isAnswer && 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
                answered && isThis && !isAnswer && 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                answered && !isThis && !isAnswer && 'border-border bg-card opacity-40'
              )}
              aria-pressed={isThis}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback + Erklärung */}
      {answered && (
        <Card
          className={cn(
            'border-2',
            isCorrect
              ? 'border-green-500/60 bg-green-50/60 dark:bg-green-950/20'
              : 'border-red-500/60 bg-red-50/60 dark:bg-red-950/20'
          )}
        >
          <CardContent className="space-y-3 pt-5">
            <p className={cn('flex items-center gap-2 font-semibold', isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
              {isCorrect ? (
                <>
                  <Sparkles className="h-4 w-4" /> Richtig! {q.productName}
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4" /> Nicht ganz – gesucht war {q.productName}
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">{q.explanation}</p>
            <Button onClick={next} className="w-full sm:w-auto">
              {questionIndex + 1 >= total ? 'Auswertung anzeigen' : 'Nächste Frage'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Suspense, lazy, useMemo, useState } from 'react';
import { FlaskConical, HelpCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import OrganicQuiz from '@/components/OrganicQuiz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UnifiedMoleculeViewer = lazy(() => import('@/components/UnifiedMoleculeViewer'));

function AtomCountQuiz() {
  const [molecule, setMolecule] = useState(() => api.getRandomMolecule());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const addResult = useChemistryStore((s) => s.addResult);
  const resetProgress = useChemistryStore((s) => s.resetProgress);
  const progress = useChemistryStore((s) => s.quizProgress);

  const question = useMemo(() => {
    const present = molecule.atoms.map((a) => a.element);
    const unique = [...new Set(present)];
    const element = unique[Math.floor(Math.random() * unique.length)];
    const count = molecule.atoms.filter((a) => a.element === element).length;
    const options = new Set<number>([count]);
    while (options.size < 4) {
      const wrong = Math.max(0, count + Math.floor(Math.random() * 5) - 2);
      if (wrong !== count) options.add(wrong);
    }
    return {
      element,
      count,
      options: [...options].sort((a, b) => a - b)
    };
  }, [molecule]);

  const check = (value: number) => {
    const correct = value === question.count;
    setFeedback(correct ? 'Richtig! 🎉' : `Leider falsch. Es sind ${question.count} ${question.element}-Atome.`);
    addResult({
      moleculeId: molecule.id,
      correct,
      answer: String(value),
      expected: String(question.count),
      timestamp: Date.now()
    });
    setSelected(String(value));
  };

  const next = () => {
    setMolecule(api.getRandomMolecule());
    setSelected(null);
    setFeedback(null);
  };

  const score = progress.filter((p) => p.correct).length;
  const accuracy = progress.length > 0 ? Math.round((score / progress.length) * 100) : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quiz: {molecule.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}>
            <UnifiedMoleculeViewer molecule={molecule} onSelectAtom={setSelected} />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wie viele {question.element}-Atome?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Antwortmöglichkeiten">
            {question.options.map((opt) => (
              <Button
                key={opt}
                variant={selected === String(opt) ? 'default' : 'outline'}
                onClick={() => check(opt)}
                disabled={selected !== null}
                aria-pressed={selected === String(opt)}
                aria-label={`${opt} Atome`}
              >
                {opt}
              </Button>
            ))}
          </div>
          {feedback && (
            <div
              className={`text-sm font-medium ${feedback.startsWith('Richtig') ? 'text-green-600' : 'text-red-600'}`}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Punkte: {score} / {progress.length}
              </span>
              {progress.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Genauigkeit: {accuracy}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {progress.length > 0 && (
                <Button
                  onClick={() => {
                    if (window.confirm('Fortschritt wirklich zurücksetzen?')) {
                      resetProgress();
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  aria-label="Fortschritt zurücksetzen"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              <Button onClick={next} disabled={selected === null}>
                Nächste Frage →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
  );
}

export default function Quiz() {
  return (
    <>
      <PageHeader
        title="Quiz"
        description="Zähle Atome im 3D-Modell oder bestimme die Produkte organischer Reaktionen – dein Fortschritt wird mitverfolgt."
        icon={<HelpCircle className="h-5 w-5" />}
      />
      <Tabs defaultValue="organic" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="organic" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Reaktions-Quiz
          </TabsTrigger>
          <TabsTrigger value="atoms" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Atome zählen (3D)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="organic">
          <OrganicQuiz />
        </TabsContent>
        <TabsContent value="atoms">
          <AtomCountQuiz />
        </TabsContent>
      </Tabs>
    </>
  );
}

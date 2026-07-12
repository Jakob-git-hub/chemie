import { Suspense, lazy, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MoleculeViewer = lazy(() => import('@/components/MoleculeViewer'));

export default function Quiz() {
  const [molecule, setMolecule] = useState(() => api.getRandomMolecule());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const addResult = useChemistryStore((s) => s.addResult);
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quiz: {molecule.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}>
            <MoleculeViewer molecule={molecule} onSelectAtom={setSelected} />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wie viele {question.element}-Atome?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt) => (
              <Button
                key={opt}
                variant={selected === String(opt) ? 'default' : 'outline'}
                onClick={() => check(opt)}
                disabled={selected !== null}
              >
                {opt}
              </Button>
            ))}
          </div>
          {feedback && <p className="text-sm font-medium">{feedback}</p>}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Punkte: {score} / {progress.length}
            </span>
            <Button onClick={next} disabled={selected === null}>
              Nächste Frage →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

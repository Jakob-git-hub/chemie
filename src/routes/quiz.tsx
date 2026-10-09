import { Suspense, lazy } from 'react';
import { HelpCircle, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { QuizOverlay } from '@/components/QuizOverlay';
import { useQuizStore } from '@/store/useQuizStore';

const MoleculeViewer = lazy(() => import('@/components/MoleculeViewer'));
const MoleculeQuizViewer = lazy(() => import('@/components/MoleculeQuizViewer'));

export default function Quiz() {
  const { gameMode, currentQuestion } = useQuizStore();
  const activeMolecule = currentQuestion?.molecule;

  return (
    <>
      <PageHeader
        title="Üben & festigen"
        description="Ein gemeinsamer Übungsraum für Molekül-Erkennung und funktionelle Gruppen – mit Hinweisen, Feedback und einer verständlichen Erklärung."
        icon={<HelpCircle className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Dein Übungsmodell
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMolecule ? (
              <Suspense fallback={<div className="h-[360px] animate-pulse rounded-xl bg-muted" />}>
                {gameMode === 'functional_groups' ? (
                  <MoleculeQuizViewer molecule={activeMolecule} height={360} />
                ) : (
                  <MoleculeViewer molecule={activeMolecule} height={360} />
                )}
              </Suspense>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Wähle rechts einen Übungsmodus, um ein Molekül zu laden.
              </div>
            )}
            {activeMolecule && (
              <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
                <span className="font-semibold">{activeMolecule.name}</span>
                <span className="ml-2 font-mono text-muted-foreground">{activeMolecule.formula}</span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Das Modell ist eine vereinfachte Lernvisualisierung. Es ersetzt keine vollständige Struktur- oder Orbitaldarstellung.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <QuizOverlay />
        </div>
      </div>
    </>
  );
}

import { Suspense, lazy, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MOLECULES } from '@/data/molecules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';

// 3D-Modul wird erst bei Bedarf geladen (Bundle-schonend).
const UnifiedMoleculeViewer = lazy(() => import('@/components/UnifiedMoleculeViewer'));

export default function Home() {
  const [idx, setIdx] = useState(0);
  const molecule = MOLECULES[idx];
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MOLECULES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Auswahl zurücksetzen, sobald das Molekül wechselt.
  useEffect(() => {
    setSelectedAtomId(null);
  }, [idx]);

  const selectedAtom = selectedAtomId
    ? molecule.atoms.find((a) => a.id === selectedAtomId)
    : null;

  return (
    <>
      <PageHeader
        title="Willkommen im Chemie-Labor"
        description="Erkunde Moleküle in 3D, entdecke das Periodensystem und teste dein Wissen im Quiz – spielerisch und ganz ohne Server."
        icon={<Sparkles className="h-5 w-5" />}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deine Lernplattform</CardTitle>
            <CardDescription>
              Erkunde Moleküle in 3D, teste dein Wissen im Quiz und lerne spielerisch.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Diese Plattform wurde als moderne Single-Page-App (React + Vite) neu gestaltet. Der
            Fokus liegt auf interaktiven, didaktisch wertvollen Features – ganz ohne Server,
            alles läuft lokal in deinem Browser.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>3D-Molekül-Visualisierung mit Drehen &amp; Zoom</li>
            <li>Klicke ein Atom an, um es auszuwählen und zu markieren</li>
            <li>Interaktives Quiz mit Fortschrittstracking</li>
            <li>Erweiterbar um weitere Datenquellen (z.&nbsp;B. PubChem)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ausgewähltes Molekül: {molecule.name}</CardTitle>
          <CardDescription>Formel: {molecule.formula}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}>
            <UnifiedMoleculeViewer molecule={molecule} onSelectAtom={setSelectedAtomId} />
          </Suspense>

          {selectedAtom ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
              <div>
                <span className="font-medium">Ausgewähltes Atom: </span>
                <span className="font-mono">
                  {selectedAtom.element} ({selectedAtom.id})
                </span>
                <span className="ml-2 font-mono text-muted-foreground">
                  [{selectedAtom.position.map((n) => n.toFixed(2)).join(', ')}]
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedAtomId(null)}>
                Zurücksetzen
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tippe auf ein Atom im 3D-Modell, um es auszuwählen.
            </p>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}

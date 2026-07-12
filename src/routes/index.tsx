import { Suspense, lazy, useEffect, useState } from 'react';
import { MOLECULES } from '@/data/molecules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// 3D-Modul wird erst bei Bedarf geladen (Bundle-schonend).
const MoleculeViewer = lazy(() => import('@/components/MoleculeViewer'));

export default function Home() {
  const [idx, setIdx] = useState(0);
  const molecule = MOLECULES[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MOLECULES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Willkommen im Chemie-Labor</CardTitle>
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
        <CardContent>
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}>
            <MoleculeViewer molecule={molecule} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

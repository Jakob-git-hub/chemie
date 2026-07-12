import { Suspense, lazy, useState } from 'react';
import { MOLECULES } from '@/data/molecules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 3D-Modul wird erst bei Bedarf geladen (Bundle-schonend).
const MoleculeViewer = lazy(() => import('@/components/MoleculeViewer'));

export default function Molecules() {
  const [selected, setSelected] = useState(MOLECULES[0]);

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Molekül-Bibliothek</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {MOLECULES.map((m) => (
            <Button
              key={m.id}
              variant={m.id === selected.id ? 'default' : 'outline'}
              className="justify-start"
              onClick={() => setSelected(m)}
            >
              {m.name} <span className="ml-auto text-xs opacity-70">{m.formula}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selected.name} <span className="text-sm font-normal text-muted-foreground">({selected.formula})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-xl bg-muted" />}>
            <MoleculeViewer molecule={selected} />
          </Suspense>
          <p className="mt-3 text-sm text-muted-foreground">
            Ziehen zum Drehen, Scrollen zum Zoomen. Atome sind nach dem CPK-Schema farbcodiert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

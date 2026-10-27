import { useMemo, useState } from 'react';
import { CloudFog, Flame, FlaskConical, RotateCcw, Sparkles, Waves } from 'lucide-react';
import { MOLECULES } from '@/data/molecules';
import { simulateReaction, type ReactionResult } from '@/lib/reactions';
import type { Molecule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export default function ReactionSimulator() {
  const [selected, setSelected] = useState<Molecule[]>([]);
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [activeEffect, setActiveEffect] = useState<ReactionResult['effect'] | null>(null);

  const available = useMemo(
    () => [
      ...MOLECULES.filter((molecule) => ['methane', 'ethanol'].includes(molecule.id)),
      { id: 'oxygen', name: 'Sauerstoff', formula: 'O₂', atoms: [], bonds: [] },
      { id: 'hydrogen', name: 'Wasserstoff', formula: 'H₂', atoms: [], bonds: [] }
    ],
    []
  );

  const addMolecule = (molecule: Molecule) => {
    if (selected.length >= 2 || selected.some((item) => item.id === molecule.id)) return;
    setResult(null);
    setSelected((items) => [...items, molecule]);
  };

  const runReaction = () => {
    const nextResult = simulateReaction(selected);
    setActiveEffect(nextResult?.effect ?? 'neutral');
    setIsReacting(true);
    window.setTimeout(() => {
      setResult(nextResult);
      setIsReacting(false);
      setActiveEffect(null);
    }, 650);
  };

  const reset = () => {
    setSelected([]);
    setResult(null);
    setIsReacting(false);
    setActiveEffect(null);
  };

  return (
    <>
      <PageHeader
        title="Reaction Lab"
        description="Kombiniere virtuelle Stoffe und beobachte sichere, rein digitale Reaktionsmodelle."
        icon={<FlaskConical className="h-5 w-5" />}
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sicherer Browser-Reaktionssimulator</CardTitle>
            <CardDescription>
              Keine echten Stoffe, keine freien Skripte und keine gefährlichen Berechnungen: Jede Reaktion ist eine kuratierte Lernsimulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Virtuelle Stoffe">
              {available.map((molecule) => (
                <button
                  key={molecule.id}
                  type="button"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', molecule.id)}
                  onClick={() => addMolecule(molecule)}
                  className={cn(
                    'rounded-xl border bg-background p-3 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md',
                    selected.some((item) => item.id === molecule.id) && 'border-primary bg-primary/5'
                  )}
                  aria-pressed={selected.some((item) => item.id === molecule.id)}
                >
                  <span className="block font-semibold">{molecule.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{molecule.formula}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">Ziehen oder auswählen</span>
                </button>
              ))}
            </div>

            <div
              className={cn(
                'reaction-vessel relative min-h-44 overflow-hidden rounded-2xl border-2 border-dashed p-5 transition',
                isReacting && 'reaction-pulse border-accent bg-accent/10',
                isReacting && activeEffect === 'gas' && 'border-sky-400 bg-sky-500/10',
                isReacting && activeEffect === 'flame' && 'border-orange-400 bg-orange-500/10',
                !isReacting && 'border-border bg-muted/20'
              )}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const molecule = available.find((item) => item.id === event.dataTransfer.getData('text/plain'));
                if (molecule) addMolecule(molecule);
              }}
              aria-label="Reaktionsgefäß"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Reaktionsgefäß</p>
                  <p className="text-sm text-muted-foreground">Lege bis zu zwei Stoffe hier ab.</p>
                </div>
                <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <div className="mt-6 flex min-h-16 flex-wrap items-center justify-center gap-3">
                {selected.length === 0 && <span className="text-sm text-muted-foreground">Noch keine Stoffe ausgewählt</span>}
                {selected.map((molecule) => (
                  <button
                    key={molecule.id}
                    type="button"
                    onClick={() => setSelected((items) => items.filter((item) => item.id !== molecule.id))}
                    className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium"
                    title="Stoff entfernen"
                  >
                    {molecule.formula}
                  </button>
                ))}
              </div>
              {isReacting && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {activeEffect === 'gas' ? (
                    <Waves className="h-12 w-12 animate-bounce text-sky-500" aria-label="Gasentwicklung läuft" />
                  ) : (
                    <Flame className="h-12 w-12 animate-pulse text-orange-500" aria-label="Reaktion läuft" />
                  )}
                </div>
              )}
              {isReacting && (
                <>
                  <span className="reaction-bubble reaction-bubble-one" />
                  <span className="reaction-bubble reaction-bubble-two" />
                  <span className="reaction-smoke"><CloudFog className="h-8 w-8" /></span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={runReaction} disabled={selected.length !== 2 || isReacting}>
                <Flame className="h-4 w-4" aria-hidden="true" />
                Reaktion starten
              </Button>
              <Button type="button" variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Zurücksetzen
              </Button>
            </div>

            {result ? (
              <div className={cn(
                'rounded-2xl border p-5',
                result.effect === 'flame' && 'border-orange-400/50 bg-orange-500/10',
                result.effect === 'gas' && 'border-sky-400/50 bg-sky-500/10',
                result.effect === 'neutral' && 'border-primary/30 bg-primary/5'
              )} role="status" aria-live="polite">
                <div className="flex items-center gap-2">
                  {result.effect === 'flame' && <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />}
                  <h3 className="font-semibold">{result.title}</h3>
                </div>
                <p className="mt-3 font-mono text-lg">{result.equation}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{result.explanation}</p>
                <p className="mt-3 text-xs text-muted-foreground">Produkte: {result.products.join(' · ')}</p>
              </div>
            ) : selected.length === 2 ? (
              <p className="text-sm text-muted-foreground">Diese Stoffkombination ist noch nicht als Lernreaktion hinterlegt.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

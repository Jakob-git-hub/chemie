import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Atom, Beaker, Calculator, HelpCircle, Sparkles, Table2, TrendingUp, FlaskConical, BookOpen, Zap } from 'lucide-react';
import { MOLECULES } from '@/data/molecules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { useChemistryStore } from '@/store/useChemistryStore';

const MoleculeViewer = lazy(() => import('@/components/MoleculeViewer'));

export default function Home() {
  const [idx, setIdx] = useState(0);
  const molecule = MOLECULES[idx];
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const progress = useChemistryStore((s) => s.quizProgress);
  const favorites = useChemistryStore((s) => s.favorites);
  const correctAnswers = progress.filter((result) => result.correct).length;

  useEffect(() => {
    const timer = setInterval(() => setIdx((current) => (current + 1) % MOLECULES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedAtomId(null);
  }, [idx]);

  const selectedAtom = selectedAtomId
    ? molecule.atoms.find((atom) => atom.id === selectedAtomId)
    : null;

  return (
    <>
      <PageHeader
        title="Dein persönliches Chemie-Labor."
        description="Ein ruhiger, interaktiver Lernraum für Atome, Moleküle und Rechnen — direkt im Browser, ohne Konto und ohne Ablenkung."
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="space-y-10">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="lab-grid relative overflow-hidden border-foreground/10 bg-foreground text-background shadow-2xl">
            <CardContent className="relative flex min-h-[340px] flex-col justify-between p-7 sm:p-10">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-primary/50 bg-primary/15 blur-[1px]" aria-hidden="true" />
              <div className="absolute bottom-7 right-10 h-28 w-28 rounded-full border border-accent/40" aria-hidden="true" />
              <div className="relative max-w-xl space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-background/80">
                  <Beaker className="h-3.5 w-3.5 text-accent" />
                  Session 01 / Orientierung
                </div>
                <div>
                  <h2 className="display-serif text-4xl leading-[0.98] text-background sm:text-6xl">
                    Vom Atom zur Idee.
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-background/65 sm:text-base">
                    Visualisiere, rechne und teste dein Wissen in einer Umgebung, die sich wie ein kleines digitales Labor anfühlt.
                  </p>
                </div>
              </div>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <NavLink
                  to="/molecules"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  Moleküle erkunden <ArrowRight className="h-4 w-4" />
                </NavLink>
                <NavLink
                  to="/quiz"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-background/20 bg-background/10 px-5 text-sm font-semibold text-background hover:bg-background/15"
                >
                  Quiz starten
                </NavLink>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/periodic-table" icon={<Table2 />} label="Periodensystem" detail="118 Elemente" />
            <QuickLink to="/molecules" icon={<Atom />} label="Moleküle" detail="3D-Strukturen" />
            <QuickLink to="/calculator" icon={<Calculator />} label="Rechner" detail="Formeln & Werte" />
            <QuickLink to="/quiz" icon={<HelpCircle />} label="Quiz" detail="Wissen testen" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={<TrendingUp />} label="Quiz-Fortschritt" value={`${correctAnswers} richtig`} detail={progress.length ? `${progress.length} Antworten gesammelt` : 'Noch keine Session gestartet'} />
          <MetricCard icon={<FlaskConical />} label="Gemerkte Formeln" value={`${favorites.length}`} detail="Favoriten im lokalen Labor" />
          <MetricCard icon={<Zap />} label="Nächster Schritt" value="5 Minuten" detail="Eine kurze Lernsession reicht" />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/20 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <CardTitle className="text-xl">Molekül des Moments</CardTitle>
                </div>
                <CardDescription className="mt-1">Drehen, zoomen und Atome direkt im Modell auswählen.</CardDescription>
              </div>
              <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
                <div className="font-mono text-sm font-semibold text-primary">{molecule.formula}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{molecule.name}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <Suspense fallback={<div className="aspect-[4/3] max-h-[420px] animate-pulse rounded-xl bg-muted sm:aspect-auto sm:h-[420px]" />}>
                <MoleculeViewer molecule={molecule} onSelectAtom={setSelectedAtomId} />
              </Suspense>
              {selectedAtom ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                  <div>
                    <span className="font-medium">Ausgewähltes Atom: </span>
                    <span className="font-mono">{selectedAtom.element} ({selectedAtom.id})</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedAtomId(null)}>
                    Zurücksetzen
                  </Button>
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">Tippe auf ein Atom, um Details anzuzeigen.</p>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <p className="eyebrow">Arbeitsbereiche</p>
              <CardTitle className="text-xl">Dein Werkzeugkasten</CardTitle>
              <CardDescription>Vier Wege, Chemie aktiv zu erkunden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ToolRow icon={<Atom />} title="Strukturen verstehen" text="3D-Ansicht mit Atom- und Bindungsdetails" to="/molecules" />
              <ToolRow icon={<Calculator />} title="Sicher rechnen" text="Molmasse, Gase, Konzentration und pH" to="/calculator" />
              <ToolRow icon={<HelpCircle />} title="Wissen festigen" text="Kurze Fragen mit direktem Feedback" to="/quiz" />
              <ToolRow icon={<BookOpen />} title="Schnell nachschlagen" text="Elemente und Eigenschaften verstehen" to="/periodic-table" />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="surface-panel flex items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="eyebrow block text-[10px] tracking-[0.14em]">{label}</span>
        <span className="mt-1 block text-lg font-bold tracking-tight">{value}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
      </span>
    </div>
  );
}

function QuickLink({ to, icon, label, detail }: { to: string; icon: ReactNode; label: string; detail: string }) {
  return (
    <NavLink
      to={to}
      className="surface-panel group flex min-h-32 flex-col justify-between p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
      </span>
    </NavLink>
  );
}

function ToolRow({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return (
    <NavLink
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{text}</span>
      </span>
      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </NavLink>
  );
}

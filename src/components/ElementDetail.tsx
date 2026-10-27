import { useEffect, useState } from 'react';
import { Check, Shield, Star, Trophy, X, Zap } from 'lucide-react';
import BohrModel from '@/components/BohrModel';
import {
  categoryMeta,
  phaseLabel,
  toCelsius,
  type PeriodicElement
} from '@/lib/elements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function reactivityLabel(element: PeriodicElement): { label: string; score: number } {
  if (element.category === 'noble-gas') return { label: 'Sehr stabil', score: 1 };
  if (element.category.includes('alkali')) return { label: 'Sehr hoch', score: 5 };
  if (element.category.includes('halogen') || element.category.includes('nonmetal')) {
    return { label: 'Hoch', score: 4 };
  }
  if (element.category === 'transition-metal') return { label: 'Mittel', score: 3 };
  return { label: 'Moderat', score: 2 };
}

interface ElementDetailProps {
  element: PeriodicElement;
  onClose: () => void;
}

function densityLabel(el: PeriodicElement): string {
  if (el.density == null) return '–';
  const unit = el.phase === 'Gas' ? 'g/L' : 'g/cm³';
  return `${el.density} ${unit}`;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function RealmStat({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        {icon}
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-bold" title={value}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function ElementDetail({ element, onClose }: ElementDetailProps) {
  const meta = categoryMeta(element.category);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const reactivity = reactivityLabel(element);
  const quizOptions = [element.category, element.discoveredBy ?? 'in der Antike bekannt', 'die Elektronenschale'];
  const correctAnswer = element.category;

  // ESC schließt das Modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Focus the close button on mount for keyboard users
    const closeButton = document.querySelector<HTMLButtonElement>('[aria-label="Schließen"]');
    closeButton?.focus();

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detailansicht ${element.name}`}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kopf mit Kategorie-Farbe */}
        <div
          className="relative flex items-center gap-4 rounded-t-2xl p-5 text-white"
          style={{ backgroundColor: meta.bg, color: meta.fg }}
        >
          <div
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-white/15 backdrop-blur"
            style={{ color: meta.fg }}
          >
            <span className="text-[11px] font-semibold leading-none">{element.number}</span>
            <span className="text-2xl font-bold leading-none">{element.symbol}</span>
            <span className="text-[9px] opacity-90">{element.mass.toFixed(2)}</span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold leading-tight">{element.name}</h2>
            <p className="text-sm opacity-90">{element.nameEn}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {meta.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 text-current hover:bg-white/20"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {/* Beschreibung */}
          <p className="text-sm leading-relaxed text-foreground/90">{element.blurb}</p>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Visualisierungen */}
            <div className="space-y-3">
              <div className="flex flex-col items-center rounded-xl border border-border bg-background p-3">
                <span className="mb-1 text-xs font-medium text-muted-foreground">
                  Bohr-Modell (lokal berechnet)
                </span>
                <BohrModel
                  shells={element.shells}
                  symbol={element.symbol}
                  atomicNumber={element.number}
                  color={meta.bg}
                  size={240}
                />
              </div>

              {element.imageUrl && !photoFailed && (
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <img
                    src={element.imageUrl}
                    alt={`${element.name} (Foto)`}
                    loading="lazy"
                    onError={() => setPhotoFailed(true)}
                    className="h-40 w-full object-cover"
                  />
                  <p className="bg-muted/50 px-3 py-1 text-center text-[10px] text-muted-foreground">
                    Foto: Wikimedia Commons
                  </p>
                </div>
              )}
            </div>

            {/* Stammdaten */}
            <dl className="grid grid-cols-2 gap-2">
              <DataRow label="Ordnungszahl" value={element.number} />
              <DataRow label="Atommasse" value={`${element.mass} u`} />
              <DataRow label="Gruppe" value={element.group ?? '–'} />
              <DataRow label="Periode" value={element.period} />
              <DataRow label="Block" value={element.block.toUpperCase()} />
              <DataRow label="Aggregat" value={phaseLabel(element.phase)} />
              <DataRow
                label="Elektroneg."
                value={element.electronegativity ?? '–'}
              />
              <DataRow
                label="Ionisierungs-energie"
                value={element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : '–'}
              />
              <DataRow label="Dichte" value={densityLabel(element)} />
              <DataRow label="Schmelzp." value={toCelsius(element.melt)} />
              <DataRow label="Siedep." value={toCelsius(element.boil)} />
              <DataRow label="Elektronen/Schale" value={element.shells.join(', ')} />
              <DataRow
                label="Konfiguration"
                value={
                  <span className="font-mono text-xs">{element.electronConfiguration}</span>
                }
              />
              <div className="col-span-2">
                <DataRow
                  label="Entdeckt von"
                  value={element.discoveredBy ?? 'in der Antike bekannt'}
                />
              </div>
            </dl>
          </div>

          <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4" aria-labelledby="periodic-realm-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">The Periodic Realm</p>
                <h3 id="periodic-realm-title" className="mt-1 text-lg font-bold">Charakterprofil: {element.symbol}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Vergleiche Eigenschaften und sammle Wissen-XP.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm font-bold text-primary">
                <Trophy className="h-4 w-4" />
                {quizAnswer === correctAnswer ? '10 XP' : '0 XP'}
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <RealmStat icon={<Zap className="h-4 w-4" />} label="Reaktivität" value={reactivity.label} detail={`${reactivity.score}/5`} />
              <RealmStat icon={<Star className="h-4 w-4" />} label="Elektronegativität" value={element.electronegativity?.toFixed(2) ?? 'unbekannt'} detail="Pauling" />
              <RealmStat icon={<Shield className="h-4 w-4" />} label="Entdecker" value={element.discoveredBy ?? 'Antike'} detail="Chronik" />
            </div>
            <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-sm font-semibold">Mini-Quest: Zu welcher Kategorie gehört {element.name}?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quizOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={quizAnswer !== null}
                    onClick={() => setQuizAnswer(option)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                      quizAnswer === option && option === correctAnswer && 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
                      quizAnswer === option && option !== correctAnswer && 'border-destructive bg-destructive/10 text-destructive',
                      quizAnswer === null && 'hover:border-primary hover:bg-primary/5'
                    )}
                  >
                    {quizAnswer === option && option === correctAnswer && <Check className="mr-1 inline h-3.5 w-3.5" />}
                    {option}
                  </button>
                ))}
              </div>
              {quizAnswer && (
                <p className={cn('mt-2 text-xs font-medium', quizAnswer === correctAnswer ? 'text-green-700 dark:text-green-300' : 'text-destructive')} role="status">
                  {quizAnswer === correctAnswer ? 'Quest abgeschlossen! Du hast 10 XP verdient.' : `Noch nicht. Die richtige Kategorie ist ${correctAnswer}.`}
                </p>
              )}
            </div>
          </section>

          {element.summary && (
            <details className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground">
                Mehr erfahren (englische Zusammenfassung)
              </summary>
              <p className="mt-2 leading-relaxed text-foreground/80">{element.summary}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

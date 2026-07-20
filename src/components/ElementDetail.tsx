import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import BohrModel from '@/components/BohrModel';
import {
  categoryMeta,
  phaseLabel,
  toCelsius,
  type PeriodicElement
} from '@/lib/elements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function ElementDetail({ element, onClose }: ElementDetailProps) {
  const meta = categoryMeta(element.category);
  const [photoFailed, setPhotoFailed] = useState(false);

  // ESC schließt das Modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
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

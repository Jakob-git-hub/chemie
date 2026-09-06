import { useState } from 'react';
import { Settings, X, Thermometer, Zap, Gauge, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  useSettingsStore,
  UNIT_LABELS,
  TemperatureUnit,
  EnergyUnit,
  PressureUnit,
  VolumeUnit,
} from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

function UnitSelector<T extends string>({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ElementType;
  value: T;
  onChange: (unit: T) => void;
  options: Record<string, string>;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as T)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              value === key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    temperature,
    energy,
    pressure,
    volume,
    setTemperature,
    setEnergy,
    setPressure,
    setVolume,
  } = useSettingsStore();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" aria-hidden="true" />
              Einstellungen
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Einstellungen schließen"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Wähle deine bevorzugten Einheiten für Berechnungen. Die Einstellungen werden automatisch gespeichert.
            </p>

            <div className="space-y-4">
              <UnitSelector<TemperatureUnit>
                label="Temperatur"
                icon={Thermometer}
                value={temperature}
                onChange={setTemperature}
                options={UNIT_LABELS.temperature}
              />

              <UnitSelector<EnergyUnit>
                label="Energie"
                icon={Zap}
                value={energy}
                onChange={setEnergy}
                options={UNIT_LABELS.energy}
              />

              <UnitSelector<PressureUnit>
                label="Druck"
                icon={Gauge}
                value={pressure}
                onChange={setPressure}
                options={UNIT_LABELS.pressure}
              />

              <UnitSelector<VolumeUnit>
                label="Volumen"
                icon={Droplets}
                value={volume}
                onChange={setVolume}
                options={UNIT_LABELS.volume}
              />
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Hinweis:</strong> Interne Berechnungen erfolgen immer in SI-Einheiten (K, kJ, kPa, L).
                Die Ausgabe wird dann in deine gewählte Einheit umgerechnet.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={onClose}>Fertig</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─── Settings Button for Header ─────────────────────────────────────────────────
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Einstellungen öffnen"
      className="ml-1"
    >
      <Settings className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}

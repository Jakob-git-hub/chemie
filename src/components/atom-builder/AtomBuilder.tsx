import { useState } from 'react';
import { useAtomBuilderStore } from '@/store/useAtomBuilderStore';
import ParticlePalette from './ParticlePalette';
import AtomBuilderCanvas from './AtomBuilderCanvas';
import PhysicsDisplay from './PhysicsDisplay';
import { Button } from '@/components/ui/button';
import { RotateCcw, Undo, Save, Download } from 'lucide-react';

export default function AtomBuilder() {
  const store = useAtomBuilderStore();
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Event handlers for particle interactions
  const handleAddParticle = (type: 'proton' | 'neutron' | 'electron', position: { x: number; y: number }) => {
    store.addParticle(type);
  };

  const handleRemoveParticle = (position: { x: number; y: number }) => {
    // Determine particle type based on current selection
    if (store.selectedParticleType !== 'electron') {
      store.removeParticle(store.selectedParticleType);
    }
  };

  const handleSelectParticle = (type: 'proton' | 'neutron' | 'electron') => {
    store.setSelectedParticleType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Atombaukasten</h1>
            <p className="text-muted-foreground">Baue Atome, selektiere Teilchen und sehe die Physik in Echtzeit</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.reset()}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Zurücksetzen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.undo()}
              disabled={store.history.length === 0}
              className="gap-2"
            >
              <Undo className="h-4 w-4" />
              Rückgängig
            </Button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Particle palette - left sidebar */}
          <div className="lg:col-span-1 space-y-4 sticky top-24">
            <ParticlePalette
              protonCount={store.protonCount}
              neutronCount={store.neutronCount}
              electronCount={store.electronCount}
              selectedParticleType={store.selectedParticleType}
              canAdd={{
                proton: store.canAddProton,
                neutron: store.canAddNeutron,
                electron: store.canAddElectron,
              }}
              onSelect={handleSelectParticle}
              onAdd={() => {}}
              onRemove={() => {}}
            />

            {/* Physics display - summary panel */}
            <PhysicsDisplay />

            {/* Canvas controls */}
            <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
              <h3 className="mb-3 text-sm font-medium">Canvas-Größe</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Breite:</span>
                  <span>{canvasSize.width}px</span>
                </div>
                <div className="flex justify-between">
                  <span>Höhe:</span>
                  <span>{canvasSize.height}px</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasSize({ width: 400, height: 300 })}
                >
                  Klein
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasSize({ width: 600, height: 400 })}
                >
                  Mittel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasSize({ width: 800, height: 600 })}
                >
                  Groß
                </Button>
              </div>
            </div>
          </div>

          {/* Main canvas - center */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
            <h3 className="mb-4 text-sm font-medium">Arbeitsfläche</h3>
            <AtomBuilderCanvas
              protonCount={store.protonCount}
              neutronCount={store.neutronCount}
              electronCount={store.electronCount}
              selectedParticleType={store.selectedParticleType}
              onAddParticle={handleAddParticle}
              onRemoveParticle={handleRemoveParticle}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </div>

          {/* Validation and info - right sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
              <h3 className="mb-3 text-sm font-medium">Statistik</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                  <span className="text-red-700 dark:text-red-300">Protonen:</span>
                  <span className="font-mono font-medium">{store.protonCount}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2">
                  <span className="text-amber-700 dark:text-amber-300">Neutronen:</span>
                  <span className="font-mono font-medium">{store.neutronCount}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                  <span className="text-blue-700 dark:text-blue-300">Elektronen:</span>
                  <span className="font-mono font-medium">{store.electronCount}</span>
                </div>
              </div>
            </div>

            {store.validation && !store.validation.valid && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">Validierungsfehler</h3>
                <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                  {store.validation.errors.map((error, idx) => (
                    <li key={idx} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {store.validation && store.validation.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 shadow-sm backdrop-blur">
                <h3 className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">Hinweise</h3>
                <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  {store.validation.warnings.map((warning, idx) => (
                    <li key={idx} className="list-disc list-inside">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p><strong>Anleitung:</strong> Wähle ein Teilchen-Typ oben aus und klicke dann auf die Arbeitsfläche, um es hinzuzufügen. Klicke erneut auf ein vorhandenes Teilchen, um es zu entfernen. Versuche, stabile Atomkonfigurationen zu erstellen!</p>
        </div>
      </div>
    </div>
  );
}
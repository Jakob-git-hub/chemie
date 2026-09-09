import { useAtomBuilderStore } from '@/store/useAtomBuilderStore';
import { Info } from 'lucide-react';

export default function PhysicsDisplay() {
  const store = useAtomBuilderStore();

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Info className="h-4 w-4 text-muted-foreground" />
        <span>Atom-Physik</span>
      </div>

      {/* Element Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-background p-3">
          <div className="text-xs text-muted-foreground">Element</div>
          <div className="font-medium">{store.elementName} ({store.elementSymbol})</div>
          <div className="text-xs text-muted-foreground">Z={store.atomicNumber}</div>
        </div>

        <div className="rounded-lg bg-background p-3">
          <div className="text-xs text-muted-foreground">Isotop</div>
          <div className="font-medium">{store.isotopeNotation}</div>
          <div className="text-xs text-muted-foreground">Masse {store.massNumber}u</div>
        </div>
      </div>

      {/* Charge */}
      <div className="rounded-lg bg-background p-3">
        <div className="text-xs text-muted-foreground">Ladung</div>
        <div className="text-lg font-bold">{store.chargeLabel}</div>
      </div>

      {/* Electron Configuration */}
      <div className="rounded-lg bg-background p-3">
        <div className="text-xs text-muted-foreground">Elektronenkonfiguration</div>
        <div className="font-mono text-sm">{store.electronConfiguration}</div>
      </div>

      {/* Shell Occupancy */}
      <div className="rounded-lg bg-background p-3">
        <div className="text-xs text-muted-foreground mb-2">Schalenbesetzung</div>
        <div className="flex flex-wrap gap-1">
          {store.shellOccupancy.map((count, idx) => (
            <div
              key={idx}
              className="rounded bg-primary/10 px-2 py-1 text-xs font-mono text-primary"
            >
              n={idx + 1}: {count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
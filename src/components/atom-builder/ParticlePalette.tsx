import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ParticlePalette — sidebar for selecting which subatomic particle to place
 *
 * Three buttons: Proton, Neutron, Electron
 * Visual badge shows current selection
 * Disables selection when at count limit
 */
export interface ParticlePaletteProps {
  /** Current counts from the store */
  protonCount: number;
  neutronCount: number;
  electronCount: number;

  /** Which particle type is currently selected */
  selectedParticleType: 'proton' | 'neutron' | 'electron';

  /** Available actions per type */
  canAdd: {
    proton: boolean;
    neutron: boolean;
    electron: boolean;
  };

  /** Action: select particle type */
  onSelect: (type: 'proton' | 'neutron' | 'electron') => void;

  /** Action: add one particle of selected type */
  onAdd: () => void;

  /** Action: remove one particle of selected type */
  onRemove: () => void;
}

export default function ParticlePalette({
  protonCount,
  neutronCount,
  electronCount,
  selectedParticleType,
  canAdd,
  onSelect,
  onAdd,
  onRemove,
}: ParticlePaletteProps) {
  const labels = {
    proton: 'Proton (p⁺)',
    neutron: 'Neutron (n⁰)',
    electron: 'Elektron (e⁻)',
  };

  const limits = {
    proton: 118,
    neutron: 200,
    electron: 118,
  };

  return (
    <div
      className="space-y-2 pt-2 border-t border-border/60 bg-background/80 sticky top-0 z-10 max-w-sm"
      style={{ top: 80 }}
    >
      {/* Selection indicator */}
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/60 pb-2 mb-3"
      >
        Aktuell: <span className="font-medium" id="palette-selected-label">
          {labels[selectedParticleType]}
        </span>
      </div>

      {/* Proton button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSelect('proton')}
        className={cn(
          'group flex flex-col items-center rounded-md py-2 px-3 border transition-colors',
          'border-transparent hover:border-primary/30 hover:bg-primary/5',
          selectedParticleType === 'proton' && 'border-primary/30 bg-primary/5 text-primary',
          !canAdd.proton && 'opacity-50 cursor-not-allowed'
        )}
        title="Proton hinzufügen (1..118)"
      >
        <svg
          className="h-5 w-5 group-hover:text-primary mb-1"
          viewBox="0 0 24 24"
        >
          <circle cx={12} cy={12} r={8} fill="#e53e3e" />
          <path
            fill="#fff"
            d="M9 10a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H12l-3 9 9 3v-3z"
          />
        </svg>
        <span className="text-[10px] mt-1">{labels.proton}</span>
      </Button>

      {/* Neutron button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSelect('neutron')}
        className={cn(
          'group flex flex-col items-center rounded-md py-2 px-3 border transition-colors',
          'border-transparent hover:border-accent/30 hover:bg-accent/5',
          selectedParticleType === 'neutron' &&
            'border-accent/30 bg-accent/5 text-accent',
          !canAdd.neutron && 'opacity-50 cursor-not-allowed'
        )}
        title="Neutron hinzufügen (0..200)"
      >
        <svg
          className="h-5 w-5 group-hover:text-accent mb-1"
          viewBox="0 0 24 24"
        >
          <circle cx={12} cy={12} r={8} fill="#f6ad55" />
          <path
            fill="#fff"
            d="M12 3v6h6v12h-6v-8.5a3.5 3.5 0 1 0-7 0V21H5v-6h6V3h6v7.5a3.5 3.5 0 0 0 7 0V3z"
          />
        </svg>
        <span className="text-[10px] mt-1">{labels.neutron}</span>
      </Button>

      {/* Electron button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSelect('electron')}
        className={cn(
          'group flex flex-col items-center rounded-md py-2 px-3 border transition-colors',
          'border-transparent hover:border-success/30 hover:bg-success/5',
          selectedParticleType === 'electron' &&
            'border-success/30 bg-success/5 text-success',
          !canAdd.electron && 'opacity-50 cursor-not-allowed'
        )}
        title="Elektron hinzufügen (0..118)"
      >
        <svg
          className="h-5 w-5 group-hover:text-success mb-1"
          viewBox="0 0 24 24"
        >
          <path
            fill="#3182ce"
            d="M9 19c-5-3-5-3-5-3s1.5-5 4.5-5 4.5 3 4.5 3-1.5 5-4.5 5-4.5zM9 9c-5-3-5-3-5-3s1.5-5 4.5-5 4.5 3 4.5 3-1.5 5-4.5 5-4.5z"
          />
        </svg>
        <span className="text-[10px] mt-1">{labels.electron}</span>
      </Button>
    </div>
  );
}
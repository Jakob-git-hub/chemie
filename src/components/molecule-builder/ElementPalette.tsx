/**
 * Element selection palette for the molecule builder
 */

import { cn } from '@/lib/utils';
import { ELEMENT_DATA, QUICK_ELEMENTS, ALL_ELEMENTS } from '@/lib/molecule-builder/valency';
import type { BuilderMode } from '@/lib/molecule-builder/types';

interface ElementPaletteProps {
  selectedElement: string;
  mode: BuilderMode;
  onSelectElement: (element: string) => void;
}

export default function ElementPalette({ selectedElement, mode, onSelectElement }: ElementPaletteProps) {
  if (mode !== 'addAtom') {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        {mode === 'addBond' && 'Klicke auf zwei Atome, um eine Bindung zu erstellen'}
        {mode === 'delete' && 'Klicke auf Atome oder Bindungen zum Löschen'}
        {mode === 'select' && 'Klicke auf ein Atom zum Auswählen'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick elements - most common */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Schnellauswahl
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_ELEMENTS.map(element => (
            <ElementButton
              key={element}
              element={element}
              isSelected={selectedElement === element}
              onClick={() => onSelectElement(element)}
            />
          ))}
        </div>
      </div>

      {/* All elements */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Weitere Elemente
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALL_ELEMENTS.filter(el => !QUICK_ELEMENTS.includes(el)).map(element => (
            <ElementButton
              key={element}
              element={element}
              isSelected={selectedElement === element}
              onClick={() => onSelectElement(element)}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ElementButtonProps {
  element: string;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

function ElementButton({ element, isSelected, onClick, compact }: ElementButtonProps) {
  const data = ELEMENT_DATA[element];
  if (!data) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border-2 px-2 py-1.5 text-sm font-medium transition-all',
        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        compact && 'px-1.5 py-1 text-xs',
        isSelected
          ? 'border-primary bg-primary/10 text-primary shadow-sm'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
      )}
      style={{
        color: isSelected ? undefined : data.color,
        backgroundColor: isSelected ? undefined : `${data.color}15`
      }}
      aria-label={`${data.name} (${element}) auswählen`}
      aria-pressed={isSelected}
    >
      <span className={cn('font-bold', compact ? 'text-base' : 'text-lg')}>
        {element}
      </span>
      {!compact && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {data.name}
        </span>
      )}
    </button>
  );
}

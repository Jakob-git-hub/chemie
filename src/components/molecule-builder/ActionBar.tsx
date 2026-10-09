/**
 * Action bar with tools and actions for the builder
 */

import { MousePointer, Plus, Link2, Trash2, Undo, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BuilderMode } from '@/lib/molecule-builder/types';

interface ActionBarProps {
  mode: BuilderMode;
  canUndo: boolean;
  onSetMode: (mode: BuilderMode) => void;
  onClear: () => void;
  onUndo: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onShowPreview: () => void;
}

export default function ActionBar({
  mode,
  canUndo,
  onSetMode,
  onClear,
  onUndo,
  onExport,
  onImport,
  onShowPreview
}: ActionBarProps) {
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      {/* Tool buttons */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Werkzeuge
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ToolButton
            active={mode === 'select'}
            onClick={() => onSetMode('select')}
            icon={<MousePointer className="h-4 w-4" />}
            label="Auswählen"
          />
          <ToolButton
            active={mode === 'addAtom'}
            onClick={() => onSetMode('addAtom')}
            icon={<Plus className="h-4 w-4" />}
            label="Atom"
          />
          <ToolButton
            active={mode === 'addBond'}
            onClick={() => onSetMode('addBond')}
            icon={<Link2 className="h-4 w-4" />}
            label="Bindung"
          />
          <ToolButton
            active={mode === 'delete'}
            onClick={() => onSetMode('delete')}
            icon={<Trash2 className="h-4 w-4" />}
            label="Löschen"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aktionen
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="mr-1 h-4 w-4" />
            Rückgängig
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowPreview}
          >
            3D-Vorschau
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
          >
            <Upload className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Leeren
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ToolButton({ active, onClick, icon, label }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all',
        'min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

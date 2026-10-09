/**
 * Analysis panel showing formula, mass, and validation status
 */

import type { BuildableAtom, BuildableBond } from '@/lib/molecule-builder/types';
import { computeFormula, computeMolarMass, computeComposition } from '@/lib/molecule-builder/formula';
import { generateSmiles } from '@/lib/molecule-builder/smiles';
import { validateMolecule } from '@/lib/molecule-builder/validation';
import { InfoCard } from '@/components/ui/info-card';

interface AnalysisPanelProps {
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
}

export default function AnalysisPanel({ atoms, bonds }: AnalysisPanelProps) {
  if (atoms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Noch keine Atome vorhanden
      </div>
    );
  }

  const formula = computeFormula(atoms);
  const molarMass = computeMolarMass(atoms);
  const smiles = generateSmiles(atoms, bonds);
  const composition = computeComposition(atoms);
  const validation = validateMolecule(atoms, bonds);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoCard
          label="Atome"
          value={atoms.length}
        />
        <InfoCard
          label="Bindungen"
          value={bonds.length}
        />
        <InfoCard
          label="Molare Masse"
          value={molarMass > 0 ? molarMass.toFixed(2) : '–'}
          unit="g/mol"
        />
        <InfoCard
          label="Status"
          value={validation.valid ? '✓' : '⚠'}
          variant={validation.valid ? 'success' : 'warning'}
        />
      </div>

      {/* Formula display */}
      {formula && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Summenformel
          </div>
          <div className="mt-1 text-2xl font-bold font-mono">
            {formula}
          </div>
        </div>
      )}

      {/* SMILES */}
      {smiles && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            SMILES
          </div>
          <div className="mt-1 font-mono text-sm break-all">
            {smiles}
          </div>
        </div>
      )}

      {/* Composition */}
      {composition.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Zusammensetzung
          </div>
          <div className="mt-2 space-y-1">
            {composition.map(({ element, count, percentage, mass }) => (
              <div key={element} className="flex items-center justify-between text-sm">
                <span className="font-medium">{element}</span>
                <span className="text-muted-foreground">
                  {count} × {mass.toFixed(2)}g ({percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation messages */}
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <span>⚠</span>
            <span>Valenz-Probleme</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-destructive/80">
            {validation.errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <span>💡</span>
            <span>Hinweise</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-amber-600/80 dark:text-amber-400/80">
            {validation.warnings.map((warning, i) => (
              <li key={i}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

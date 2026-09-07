/**
 * Main Molecule Builder Container
 * Orchestrates all builder components
 */

import { useState, Suspense, lazy } from 'react';
import { Beaker } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ElementPalette from './ElementPalette';
import BuilderCanvas from './BuilderCanvas';
import AnalysisPanel from './AnalysisPanel';
import ActionBar from './ActionBar';
import { useMoleculeBuilderStore } from '@/store/useMoleculeBuilderStore';
import type { BuildableMolecule } from '@/lib/molecule-builder/types';

// Lazy load 3D viewer
const UnifiedMoleculeViewer = lazy(() => import('@/components/UnifiedMoleculeViewer'));

export default function MoleculeBuilder() {
  const {
    atoms,
    bonds,
    mode,
    selectedElement,
    selectedAtomId,
    history,
    addAtom,
    removeAtom,
    moveAtom,
    selectAtom,
    addBond,
    removeBond,
    cycleBondOrder,
    setMode,
    setSelectedElement,
    clearCanvas,
    loadMolecule,
    exportMolecule,
    undo
  } = useMoleculeBuilderStore();

  const [showPreview, setShowPreview] = useState(false);
  const [previewMolecule, setPreviewMolecule] = useState<BuildableMolecule | null>(null);

  // Handle export
  const handleExport = () => {
    const molecule = exportMolecule();
    const blob = new Blob([JSON.stringify(molecule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${molecule.formula || 'molecule'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.atoms && data.bonds) {
          loadMolecule({ atoms: data.atoms, bonds: data.bonds });
        }
      } catch (err) {
        console.error('Failed to import molecule:', err);
      }
    };
    reader.readAsText(file);
  };

  // Handle 3D preview
  const handleShowPreview = () => {
    const molecule = exportMolecule();
    setPreviewMolecule(molecule);
    setShowPreview(true);
  };

  // Convert buildable atoms to molecule format for 3D viewer
  const convertToMolecule = (m: BuildableMolecule) => {
    // Simple conversion - in a full implementation, we'd calculate 3D positions
    const atoms3D = m.atoms.map((a, i) => ({
      id: a.id,
      element: a.element,
      position: [a.position.x / 20, 0, a.position.y / 20] as [number, number, number]
    }));

    const bonds3D = m.bonds.map(b => ({
      from: b.from,
      to: b.to
    }));

    return {
      id: 'preview',
      name: m.formula || 'Gebautes Molekül',
      formula: m.formula,
      atoms: atoms3D,
      bonds: bonds3D
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Molekül-Baukasten"
        description="Bau deine eigenen Moleküle! Füge Atome hinzu, verbinde sie mit Bindungen und lerne die Grundlagen der Chemie."
        icon={<Beaker className="h-5 w-5" />}
      />

      {/* Preview Modal */}
      {showPreview && previewMolecule && (
        <PreviewModal
          molecule={previewMolecule}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Tools */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="rounded-lg bg-primary/10 p-1.5">
                <Beaker className="h-4 w-4 text-primary" />
              </span>
              Werkzeuge
            </h2>

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium">Modus</h3>
              <ActionBar
                mode={mode}
                canUndo={history.length > 0}
                onSetMode={setMode}
                onClear={clearCanvas}
                onUndo={undo}
                onExport={handleExport}
                onImport={handleImport}
                onShowPreview={handleShowPreview}
              />
            </div>

            <ElementPalette
              selectedElement={selectedElement}
              mode={mode}
              onSelectElement={setSelectedElement}
            />
          </div>
        </div>

        {/* Center column: Canvas */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-4 text-lg font-semibold">Arbeitsfläche</h2>

            <div className="h-[450px]">
              <BuilderCanvas
                atoms={atoms}
                bonds={bonds}
                mode={mode}
                selectedElement={selectedElement}
                selectedAtomId={selectedAtomId}
                pendingBondFrom={null}
                onAddAtom={addAtom}
                onRemoveAtom={removeAtom}
                onMoveAtom={moveAtom}
                onSelectAtom={selectAtom}
                onAddBond={addBond}
                onRemoveBond={removeBond}
                onCycleBondOrder={cycleBondOrder}
              />
            </div>

            {/* Canvas instructions */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {mode === 'addAtom' && (
                <span>Klicke auf die Fläche, um ein {selectedElement}-Atom hinzuzufügen</span>
              )}
              {mode === 'addBond' && (
                <span>Klicke auf zwei Atome, um sie zu verbinden</span>
              )}
              {mode === 'delete' && (
                <span>Klicke auf Atome oder Bindungen zum Löschen</span>
              )}
              {mode === 'select' && (
                <span>Ziehe Atome zum Verschieben. Klicke auf Bindungen zum Ändern.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Analysis */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Analyse</h2>
        <AnalysisPanel atoms={atoms} bonds={bonds} />
      </div>
    </div>
  );
}

// Preview Modal Component
interface PreviewModalProps {
  molecule: BuildableMolecule;
  onClose: () => void;
}

function PreviewModal({ molecule, onClose }: PreviewModalProps) {
  // Convert to 3D molecule format
  const molecule3D = {
    id: 'preview',
    name: molecule.formula || 'Gebautes Molekül',
    formula: molecule.formula,
    atoms: molecule.atoms.map((a, i) => ({
      id: a.id,
      element: a.element,
      position: [a.position.x / 15, 0, a.position.y / 15] as [number, number, number]
    })),
    bonds: molecule.bonds.map(b => ({
      from: b.from,
      to: b.to
    }))
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">
            3D-Vorschau: {molecule.formula || 'Unbenannt'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Schließen
          </Button>
        </div>
        <div className="h-[500px] p-4">
          <Suspense fallback={<div className="flex h-full items-center justify-center">Laden...</div>}>
            <UnifiedMoleculeViewer
              molecule={molecule3D}
              height={460}
              enableRenderMode={true}
              enableSaveImage={true}
            />
          </Suspense>
        </div>
        {molecule.smiles && (
          <div className="border-t p-4">
            <div className="text-sm text-muted-foreground">SMILES: {molecule.smiles}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Import Button for PreviewModal
import { Button } from '@/components/ui/button';

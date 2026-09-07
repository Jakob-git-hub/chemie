import { useMemo, useState, useCallback, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Molecule } from '@/lib/types';
import {
  ELEMENT_COLORS,
  ELEMENT_RADII_VDW,
  BALL_RADII,
  HIGHLIGHT_COLOR,
  BOND_COLOR,
  CORRECT_COLOR,
  bondTransform,
} from '@/lib/chemistry-constants';

// ─── Atom mesh (memoized per atom) ────────────────────────────────────────────
interface AtomMeshProps {
  position: [number, number, number];
  element: string;
  isSelected: boolean;
  renderMode: RenderMode;
  onClick: (id: string) => void;
  id: string;
}

/**
 * @deprecated Use UnifiedMoleculeViewer instead. This file is kept for backward
 * compatibility but will be removed in a future version.
 */
const AtomMesh = memo(function AtomMesh({
  position, element, isSelected, renderMode, onClick, id,
}: AtomMeshProps) {
  const radius = renderMode === 'spaceFilling'
    ? (ELEMENT_RADII_VDW[element] ?? 1.2)
    : (BALL_RADII[element] ?? 0.45);
  const color = isSelected ? HIGHLIGHT_COLOR : (ELEMENT_COLORS[element] ?? '#cc44cc');
  const emissiveIntensity = isSelected ? 0.6 : 0;

  return (
    <mesh
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? HIGHLIGHT_COLOR : '#000000'}
        emissiveIntensity={emissiveIntensity}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
});

// ─── Bond mesh (memoized per bond) ────────────────────────────────────────────
interface BondMeshProps {
  bond: { from: string; to: string };
  atomMap: Record<string, [number, number, number]>;
  renderMode: RenderMode;
  selectedAtomId: string | null;
  measuredFrom: string | null;
  measuredTo: string | null;
}

const BondMesh = memo(function BondMesh({
  bond, atomMap, renderMode, selectedAtomId, measuredFrom, measuredTo,
}: BondMeshProps) {
  const a = atomMap[bond.from];
  const b = atomMap[bond.to];
  if (!a || !b) return null;

  const { len, mid, quat } = bondTransform(a, b);
  const bondRadius = renderMode === 'spaceFilling' ? 0.15 : 0.08;

  const isMeasured = measuredFrom !== null && measuredTo !== null &&
    ((bond.from === measuredFrom && bond.to === measuredTo) ||
     (bond.from === measuredTo && bond.to === measuredFrom));
  const isWithSelected = selectedAtomId !== null &&
    (bond.from === selectedAtomId || bond.to === selectedAtomId);

  const color = isMeasured ? CORRECT_COLOR : BOND_COLOR;
  const emissive = isMeasured ? CORRECT_COLOR : '#000000';
  const emissiveIntensity = isMeasured ? 0.5 : 0;

  if (renderMode === 'wireframe') {
    return (
      <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
        <cylinderGeometry args={[0.05, 0.05, len, 8]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    );
  }

  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[bondRadius, bondRadius, len, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.5}
      />
    </mesh>
  );
});

// ─── Selection ring around selected atom ───────────────────────────────────────
interface SelectionRingProps {
  atomMap: Record<string, [number, number, number]>;
  selectedAtomId: string;
  element: string;
}

const SelectionRing = memo(function SelectionRing({
  atomMap, selectedAtomId, element,
}: SelectionRingProps) {
  const pos = atomMap[selectedAtomId];
  if (!pos) return null;
  const radius = (BALL_RADII[element] ?? 0.45) * 1.35;
  return (
    <mesh position={pos}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial color={HIGHLIGHT_COLOR} wireframe transparent opacity={0.5} />
    </mesh>
  );
});

// ─── Bond distance label ────────────────────────────────────────────────────────
interface BondDistanceLabelProps {
  atomMap: Record<string, [number, number, number]>;
  from: string;
  to: string;
  distance: number;
}

const BondDistanceLabel = memo(function BondDistanceLabel({
  atomMap, from, to, distance,
}: BondDistanceLabelProps) {
  const pos1 = atomMap[from];
  const pos2 = atomMap[to];
  if (!pos1 || !pos2) return null;
  const mid = new THREE.Vector3(
    (pos1[0] + pos2[0]) / 2,
    (pos1[1] + pos2[1]) / 2,
    (pos1[2] + pos2[2]) / 2
  );
  return (
    <mesh position={[mid.x, mid.y, mid.z + 0.3]}>
      <Html position={[0, 0, 0]} center>
        <div className="pointer-events-none rounded bg-black/70 px-2 py-1 text-xs text-white shadow">
          {distance.toFixed(2)} Å
        </div>
      </Html>
    </mesh>
  );
});

// ─── Atom info label ───────────────────────────────────────────────────────────
interface AtomInfoLabelProps {
  position: [number, number, number];
  element: string;
  atomId: string;
}

const AtomInfoLabel = memo(function AtomInfoLabel({
  position, element, atomId,
}: AtomInfoLabelProps) {
  const offsetY = (BALL_RADII[element] ?? 1.2) + 0.3;
  return (
    <mesh position={[position[0], position[1] + offsetY, position[2]]}>
      <Html position={[0, 0, 0]} center>
        <div className="pointer-events-none rounded bg-black/80 px-3 py-1.5 text-xs text-white shadow-md">
          <div className="font-bold">{element}</div>
          <div className="text-[10px] text-gray-300">
            [{position[0].toFixed(2)}, {position[1].toFixed(2)}, {position[2].toFixed(2)}]
          </div>
        </div>
      </Html>
    </mesh>
  );
});

// ─── Main MoleculeViewer ────────────────────────────────────────────────────────
type RenderMode = 'ballStick' | 'spaceFilling' | 'wireframe';

interface BondDistance {
  from: string;
  to: string;
  distance: number;
}

interface MoleculeViewerProps {
  molecule: Molecule;
  height?: number;
  onSelectAtom?: (atomId: string) => void;
}

function MoleculeViewerInner({
  molecule,
  height = 420,
  onSelectAtom,
}: MoleculeViewerProps) {
  // Stable atom map - only recomputed when molecule changes
  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => { map[a.id] = a.position; });
    return map;
  }, [molecule]);

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('ballStick');
  const [bondDistance, setBondDistance] = useState<BondDistance | null>(null);
  const [lastClickedAtomId, setLastClickedAtomId] = useState<string | null>(null);

  const selectedAtom = selectedAtomId
    ? molecule.atoms.find((a) => a.id === selectedAtomId) ?? null
    : null;

  const handleAtomClick = useCallback((atomId: string) => {
    // Bond distance measurement: two-click workflow
    if (lastClickedAtomId && lastClickedAtomId !== atomId) {
      const firstAtom = molecule.atoms.find((a) => a.id === lastClickedAtomId);
      const secondAtom = molecule.atoms.find((a) => a.id === atomId);
      if (firstAtom && secondAtom) {
        const pos1 = new THREE.Vector3(...firstAtom.position);
        const pos2 = new THREE.Vector3(...secondAtom.position);
        const dist = Math.round(pos1.distanceTo(pos2) * 100) / 100;
        setBondDistance({ from: lastClickedAtomId, to: atomId, distance: dist });
      }
      setLastClickedAtomId(null);
    } else {
      setLastClickedAtomId(atomId);
      setSelectedAtomId(atomId);
      onSelectAtom?.(atomId);
      setBondDistance(null);
    }
  }, [molecule.atoms, lastClickedAtomId, onSelectAtom]);

  const handleSaveImage = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${molecule.name || 'molecule'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }, [molecule.name]);

  return (
    <div className="relative">
      {/* Render mode controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm" role="group" aria-label="Darstellungsmodus">
        {(['ballStick', 'spaceFilling', 'wireframe'] as RenderMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setRenderMode(mode)}
            className={`rounded px-2 py-1 text-xs font-medium transition-all ${
              renderMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
            aria-pressed={renderMode === mode}
          >
            {mode === 'ballStick' ? 'Ball & Stick' : mode === 'spaceFilling' ? 'Space Fill' : 'Wireframe'}
          </button>
        ))}
      </div>

      {/* Save image */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleSaveImage}
          className="rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm hover:bg-background/90 transition-colors"
          title="Bild speichern"
          aria-label="Molekülbild als PNG speichern"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <div
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800"
      >
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} />

          {/* Atoms */}
          {molecule.atoms.map((atom) => (
            <AtomMesh
              key={atom.id}
              id={atom.id}
              position={atom.position}
              element={atom.element}
              isSelected={atom.id === selectedAtomId}
              renderMode={renderMode}
              onClick={handleAtomClick}
            />
          ))}

          {/* Selection ring */}
          {selectedAtom && (
            <SelectionRing
              atomMap={atomMap}
              selectedAtomId={selectedAtom.id}
              element={selectedAtom.element}
            />
          )}

          {/* Atom info label */}
          {selectedAtom && renderMode !== 'wireframe' && (
            <AtomInfoLabel
              position={selectedAtom.position}
              element={selectedAtom.element}
              atomId={selectedAtom.id}
            />
          )}

          {/* Bonds */}
          {molecule.bonds.map((bond, i) => (
            <BondMesh
              key={`bond-${i}`}
              bond={bond}
              atomMap={atomMap}
              renderMode={renderMode}
              selectedAtomId={selectedAtomId}
              measuredFrom={bondDistance?.from ?? null}
              measuredTo={bondDistance?.to ?? null}
            />
          ))}

          {/* Bond distance label */}
          {bondDistance && (
            <BondDistanceLabel
              atomMap={atomMap}
              from={bondDistance.from}
              to={bondDistance.to}
              distance={bondDistance.distance}
            />
          )}

          <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
        </Canvas>
      </div>
    </div>
  );
}

// Named export with memo for external consumers
const MoleculeViewer = memo(MoleculeViewerInner);
export default MoleculeViewer;

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Molecule } from '@/lib/types';

// CPK-ähnliche Element-Farbzuordnung
const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#2b2b2b',
  O: '#ff3b30',
  N: '#2d6cff',
  S: '#ffcc00',
  P: '#ff9500',
  Cl: '#34c759',
  F: '#5ac8fa',
  Br: '#a3331f',
  I: '#6a0dad',
  Na: '#ab5cf2',
  Fe: '#e06633'
};

const RADII: Record<string, number> = {
  H: 0.32,
  C: 0.45,
  O: 0.42,
  N: 0.43,
  S: 0.55,
  P: 0.55,
  Cl: 0.55,
  F: 0.4,
  Br: 0.6,
  I: 0.62,
  Na: 0.6,
  Fe: 0.55
};

const HIGHLIGHT_COLOR = '#ffcc00';

function bondTransform(a: [number, number, number], b: [number, number, number]) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { len, mid, quat };
}

interface MoleculeViewerProps {
  molecule: Molecule;
  height?: number;
  onSelectAtom?: (atomId: string) => void;
}

export default function MoleculeViewer({ molecule, height = 420, onSelectAtom }: MoleculeViewerProps) {
  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => (map[a.id] = a.position));
    return map;
  }, [molecule]);

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);

  const handleAtomClick = (atomId: string) => {
    setSelectedAtomId(atomId);
    onSelectAtom?.(atomId);
  };

  const selectedAtom = selectedAtomId ? molecule.atoms.find((a) => a.id === selectedAtomId) : null;

  return (
    <div
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800"
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />

        {molecule.atoms.map((atom) => {
          const isSelected = atom.id === selectedAtomId;
          return (
            <mesh
              key={atom.id}
              position={atom.position}
              onClick={(e) => {
                e.stopPropagation();
                handleAtomClick(atom.id);
              }}
            >
              <sphereGeometry args={[RADII[atom.element] ?? 0.45, 32, 32]} />
              <meshStandardMaterial
                color={isSelected ? HIGHLIGHT_COLOR : ELEMENT_COLORS[atom.element] ?? '#cc44cc'}
                emissive={isSelected ? HIGHLIGHT_COLOR : '#000000'}
                emissiveIntensity={isSelected ? 0.6 : 0}
                roughness={0.35}
                metalness={0.1}
              />
            </mesh>
          );
        })}

        {/* Sichtbarer Auswahl-Ring um das gewählte Atom */}
        {selectedAtom && (
          <mesh position={selectedAtom.position}>
            <sphereGeometry args={[(RADII[selectedAtom.element] ?? 0.45) * 1.35, 32, 32]} />
            <meshBasicMaterial color={HIGHLIGHT_COLOR} wireframe transparent opacity={0.5} />
          </mesh>
        )}

        {molecule.bonds.map((bond, i) => {
          const a = atomMap[bond.from];
          const b = atomMap[bond.to];
          if (!a || !b) return null;
          const { len, mid, quat } = bondTransform(a, b);
          return (
            <mesh key={`bond-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
              <cylinderGeometry args={[0.08, 0.08, len, 16]} />
              <meshStandardMaterial color="#9aa3b2" roughness={0.5} />
            </mesh>
          );
        })}

        <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
      </Canvas>
    </div>
  );
}

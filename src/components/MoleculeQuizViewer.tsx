import { useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Molecule } from '@/lib/types';
import { useQuizStore } from '@/store/useQuizStore';
import { findAtomsInFunctionalGroup } from '@/utils/quizGenerator';
import { FUNCTIONAL_GROUPS, type FunctionalGroupKey } from '@/data/molecules';

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

const ELEMENT_RADII: Record<string, number> = {
  H: 1.2,
  C: 1.7,
  O: 1.52,
  N: 1.55,
  S: 1.8,
  P: 1.8,
  Cl: 1.75,
  F: 1.47,
  Br: 1.85,
  I: 1.98,
  Na: 2.27,
  Fe: 2.0
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

const HIGHLIGHT_COLOR = '#00ff00';
const CORRECT_COLOR = '#22c55e';
const INCORRECT_COLOR = '#ef4444';
const SELECTED_COLOR = '#ffcc00';

interface MoleculeQuizViewerProps {
  molecule: Molecule;
  height?: number;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

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

export default function MoleculeQuizViewer({
  molecule,
  height = 420,
  onCorrectAnswer,
  onIncorrectAnswer
}: MoleculeQuizViewerProps) {
  const {
    gameMode,
    currentQuestion,
    isAnswered,
    isCorrect,
    selectedAnswer,
    selectAnswer
  } = useQuizStore();

  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => (map[a.id] = a.position));
    return map;
  }, [molecule]);

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);

  // Finde Atome, die zur gesuchten funktionellen Gruppe gehören
  const targetAtoms = useMemo(() => {
    if (gameMode !== 'functional_groups' || !currentQuestion?.functionalGroupTarget) {
      return [];
    }
    return findAtomsInFunctionalGroup(currentQuestion.functionalGroupTarget, molecule);
  }, [gameMode, currentQuestion?.functionalGroupTarget, molecule]);

  // Farbe basierend auf Quiz-Status
  const getAtomColor = useCallback((atomId: string, element: string): string => {
    // Immer Basis-Farbe
    let baseColor = ELEMENT_COLORS[element] ?? '#cc44cc';

    // Quiz-spezifische Farben
    if (isAnswered) {
      if (targetAtoms.includes(atomId)) {
        // Dies ist ein Atom der gesuchten Gruppe
        if (isCorrect) {
          return CORRECT_COLOR;
        } else if (gameMode === 'functional_groups' && selectedAtomId === atomId) {
          return INCORRECT_COLOR;
        }
      }
    }

    // Ausgewähltes Atom im Funktionale-Gruppen-Modus
    if (gameMode === 'functional_groups' && selectedAtomId === atomId) {
      return SELECTED_COLOR;
    }

    return baseColor;
  }, [isAnswered, isCorrect, targetAtoms, gameMode, selectedAtomId]);

  const handleAtomClick = useCallback((atomId: string) => {
    if (gameMode !== 'functional_groups' || isAnswered) return;

    setSelectedAtomId(atomId);

    // Prüfe ob die Antwort korrekt ist
    const isTargetAtom = targetAtoms.includes(atomId);

    if (currentQuestion?.functionalGroupTarget) {
      const group = FUNCTIONAL_GROUPS[currentQuestion.functionalGroupTarget as FunctionalGroupKey];
      selectAnswer(group?.name || 'Unbekannte Gruppe');
    }

    if (isTargetAtom) {
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  }, [gameMode, isAnswered, targetAtoms, currentQuestion, selectAnswer, onCorrectAnswer, onIncorrectAnswer]);

  return (
    <div className="relative">
      {/* Quiz-spezifisches Overlay */}
      {gameMode === 'functional_groups' && (
        <div className="absolute top-3 left-3 z-10 rounded-lg bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
          <span className="font-medium">🔬 Klicke auf ein Atom der gesuchten funktionellen Gruppe!</span>
        </div>
      )}

      {/* Glow-Effekt basierend auf Antwort */}
      {isAnswered && (
        <div
          className={`absolute inset-0 z-0 rounded-xl ${
            isCorrect
              ? 'animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.5)]'
              : 'shadow-[0_0_30px_rgba(239,68,68,0.5)]'
          }`}
        />
      )}

      <div
        style={{ height }}
        className={`w-full overflow-hidden rounded-xl border transition-all duration-300 ${
          isAnswered
            ? isCorrect
              ? 'border-green-500 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30'
              : 'border-red-500 bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/30'
            : 'border-border bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800'
        }`}
      >
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} />

          {/* Atome */}
          {molecule.atoms.map((atom) => {
            const isSelected = atom.id === selectedAtomId;
            const isTarget = targetAtoms.includes(atom.id);
            const radius = RADII[atom.element] ?? 0.45;

            return (
              <mesh
                key={atom.id}
                position={atom.position}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAtomClick(atom.id);
                }}
              >
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial
                  color={getAtomColor(atom.id, atom.element)}
                  emissive={isTarget && isAnswered ? (isCorrect ? CORRECT_COLOR : INCORRECT_COLOR) : (isSelected ? SELECTED_COLOR : '#000000')}
                  emissiveIntensity={isTarget && isAnswered ? 0.6 : (isSelected ? 0.4 : 0)}
                  roughness={0.35}
                  metalness={0.1}
                />
              </mesh>
            );
          })}

          {/* Highlight-Ring um Zielatome (nach Antwort) */}
          {isAnswered && targetAtoms.map((atomId) => {
            const atom = molecule.atoms.find((a) => a.id === atomId);
            if (!atom) return null;
            const radius = (RADII[atom.element] ?? 0.45) * 1.5;

            return (
              <mesh key={`highlight-${atomId}`} position={atom.position}>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshBasicMaterial
                  color={isCorrect ? CORRECT_COLOR : INCORRECT_COLOR}
                  wireframe
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })}

          {/* Bonds */}
          {molecule.bonds.map((bond, i) => {
            const a = atomMap[bond.from];
            const b = atomMap[bond.to];
            if (!a || !b) return null;
            const { len, mid, quat } = bondTransform(a, b);

            return (
              <mesh key={`bond-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
                <cylinderGeometry args={[0.08, 0.08, len, 16]} />
                <meshStandardMaterial
                  color="#9aa3b2"
                  roughness={0.5}
                />
              </mesh>
            );
          })}

          <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
        </Canvas>
      </div>
    </div>
  );
}

import { useMemo, useState, useCallback, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Molecule } from '@/lib/types';
import { useQuizStore } from '@/store/useQuizStore';
import { findAtomsInFunctionalGroup } from '@/utils/quizGenerator';
import { FUNCTIONAL_GROUPS, type FunctionalGroupKey } from '@/data/molecules';
import {
  ELEMENT_COLORS,
  BALL_RADII,
  CORRECT_COLOR,
  INCORRECT_COLOR,
  SELECTED_COLOR,
  BOND_COLOR,
  bondTransform,
} from '@/lib/chemistry-constants';

const RADII = BALL_RADII;

interface MoleculeQuizViewerProps {
  molecule: Molecule;
  height?: number;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

function MoleculeQuizViewerInner({
  molecule,
  height = 420,
  onCorrectAnswer,
  onIncorrectAnswer,
}: MoleculeQuizViewerProps) {
  const {
    gameMode,
    currentQuestion,
    isAnswered,
    isCorrect,
    selectAnswer
  } = useQuizStore();

  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => { map[a.id] = a.position; });
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

  // Stable target-set for O(1) lookup
  const targetAtomsSet = useMemo(() => new Set(targetAtoms), [targetAtoms]);

  const handleAtomClick = useCallback((atomId: string) => {
    if (gameMode !== 'functional_groups' || isAnswered) return;

    setSelectedAtomId(atomId);
    const isTargetAtom = targetAtomsSet.has(atomId);

    if (currentQuestion?.functionalGroupTarget) {
      const group = FUNCTIONAL_GROUPS[currentQuestion.functionalGroupTarget as FunctionalGroupKey];
      selectAnswer(group?.name || 'Unbekannte Gruppe');
    }

    if (isTargetAtom) onCorrectAnswer?.();
    else onIncorrectAnswer?.();
  }, [gameMode, isAnswered, targetAtomsSet, currentQuestion, selectAnswer, onCorrectAnswer, onIncorrectAnswer]);

  return (
    <div className="relative">
      {gameMode === 'functional_groups' && (
        <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
          <span className="font-medium">🔬 Klicke auf ein Atom der gesuchten Gruppe</span>
        </div>
      )}

      {isAnswered && (
        <div
          className={`absolute inset-0 z-0 rounded-xl pointer-events-none ${
            isCorrect
              ? 'shadow-[0_0_30px_rgba(34,197,94,0.5)]'
              : 'shadow-[0_0_30px_rgba(239,68,68,0.5)]'
          }`}
          aria-hidden="true"
        />
      )}

      <div
        style={{ height }}
        className={`w-full overflow-hidden rounded-xl border transition-colors ${
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

          {/* Atoms */}
          {molecule.atoms.map((atom) => {
            const isSelected = atom.id === selectedAtomId;
            const isTarget = targetAtomsSet.has(atom.id);
            const radius = RADII[atom.element] ?? 0.45;

            let color = ELEMENT_COLORS[atom.element] ?? '#cc44cc';
            let emissive: string = '#000000';
            let emissiveIntensity = 0;

            if (isAnswered && isTarget) {
              color = isCorrect ? CORRECT_COLOR : (isSelected ? INCORRECT_COLOR : color);
              emissive = isCorrect ? CORRECT_COLOR : INCORRECT_COLOR;
              emissiveIntensity = 0.6;
            } else if (isSelected) {
              color = SELECTED_COLOR;
              emissive = SELECTED_COLOR;
              emissiveIntensity = 0.4;
            }

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
                  color={color}
                  emissive={emissive}
                  emissiveIntensity={emissiveIntensity}
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
                <meshStandardMaterial color={BOND_COLOR} roughness={0.5} />
              </mesh>
            );
          })}

          <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
        </Canvas>
      </div>
    </div>
  );
}

export default memo(MoleculeQuizViewerInner);


/**
 * UnifiedMoleculeViewer
 *
 * Vereint MoleculeViewer und MoleculeQuizViewer in einer einzigen,
 * flexiblen Komponente mit Quiz-Mode-Unterstützung.
 *
 * @example
 * // Normaler Modus
 * <UnifiedMoleculeViewer molecule={molecule} onSelectAtom={handleSelect} />
 *
 * // Quiz-Modus
 * <UnifiedMoleculeViewer
 *   molecule={molecule}
 *   quizMode
 *   targetAtoms={targetAtomIds}
 *   isAnswered={isAnswered}
 *   isCorrect={isCorrect}
 *   onCorrectAnswer={handleCorrect}
 *   onIncorrectAnswer={handleIncorrect}
 * />
 */
import { useMemo, useState, useCallback, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Molecule } from '@/lib/types'
import {
  ELEMENT_COLORS,
  ELEMENT_RADII_VDW,
  BALL_RADII,
  HIGHLIGHT_COLOR,
  BOND_COLOR,
  CORRECT_COLOR,
  INCORRECT_COLOR,
  SELECTED_COLOR,
  bondTransform
} from '@/lib/chemistry-constants'

type RenderMode = 'ballStick' | 'spaceFilling' | 'wireframe'

// ─── Atom Mesh ─────────────────────────────────────────────────────────
interface AtomMeshProps {
  position: [number, number, number]
  element: string
  isSelected: boolean
  renderMode: RenderMode
  onClick: (id: string) => void
  id: string
  // Quiz-Mode
  isTargetAtom?: boolean
  isAnswered?: boolean
  isCorrect?: boolean | null
}

const AtomMesh = memo(function AtomMesh({
  position, element, isSelected, renderMode, onClick, id,
  isTargetAtom = false, isAnswered = false, isCorrect = null
}: AtomMeshProps) {
  const radius = renderMode === 'spaceFilling'
    ? (ELEMENT_RADII_VDW[element] ?? 1.2)
    : (BALL_RADII[element] ?? 0.45)

  let color = ELEMENT_COLORS[element] ?? '#cc44cc'
  let emissive = '#000000'
  let emissiveIntensity = 0

  // Priority: Quiz feedback > Selection > Normal
  if (isAnswered && isTargetAtom) {
    color = isCorrect ? CORRECT_COLOR : (isSelected ? INCORRECT_COLOR : color)
    emissive = isCorrect ? CORRECT_COLOR : INCORRECT_COLOR
    emissiveIntensity = 0.6
  } else if (isSelected) {
    color = SELECTED_COLOR
    emissive = HIGHLIGHT_COLOR
    emissiveIntensity = 0.6
  }

  return (
    <mesh
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(id) }}
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
  )
})

// ─── Bond Mesh ─────────────────────────────────────────────────────────
interface BondMeshProps {
  bond: { from: string; to: string }
  atomMap: Record<string, [number, number, number]>
  renderMode: RenderMode
}

const BondMesh = memo(function BondMesh({
  bond, atomMap, renderMode
}: BondMeshProps) {
  const a = atomMap[bond.from]
  const b = atomMap[bond.to]
  if (!a || !b) return null

  const { len, mid, quat } = bondTransform(a, b)
  const bondRadius = renderMode === 'spaceFilling' ? 0.15 : 0.08

  if (renderMode === 'wireframe') {
    return (
      <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
        <cylinderGeometry args={[0.05, 0.05, len, 8]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
    )
  }

  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[bondRadius, bondRadius, len, 16]} />
      <meshStandardMaterial color={BOND_COLOR} roughness={0.5} />
    </mesh>
  )
})

// ─── Selection Ring ────────────────────────────────────────────────────
interface SelectionRingProps {
  atomMap: Record<string, [number, number, number]>
  atomId: string
  element: string
  color?: string
}

const SelectionRing = memo(function SelectionRing({
  atomMap, atomId, element, color = HIGHLIGHT_COLOR
}: SelectionRingProps) {
  const pos = atomMap[atomId]
  if (!pos) return null
  const radius = (BALL_RADII[element] ?? 0.45) * 1.35
  return (
    <mesh position={pos}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
    </mesh>
  )
})

// ─── Target Highlight Ring ──────────────────────────────────────────────
interface TargetHighlightProps {
  atomMap: Record<string, [number, number, number]>
  atomId: string
  element: string
  isCorrect: boolean
}

const TargetHighlight = memo(function TargetHighlight({
  atomMap, atomId, element, isCorrect
}: TargetHighlightProps) {
  const pos = atomMap[atomId]
  if (!pos) return null
  const radius = (BALL_RADII[element] ?? 0.45) * 1.5
  return (
    <mesh position={pos}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={isCorrect ? CORRECT_COLOR : INCORRECT_COLOR}
        wireframe
        transparent
        opacity={0.7}
      />
    </mesh>
  )
})

// ─── Main Component ────────────────────────────────────────────────────
export interface UnifiedMoleculeViewerProps {
  molecule: Molecule
  height?: number
  onSelectAtom?: (atomId: string) => void
  // Quiz-Mode
  quizMode?: boolean
  targetAtoms?: string[]
  isAnswered?: boolean
  isCorrect?: boolean | null
  onCorrectAnswer?: () => void
  onIncorrectAnswer?: () => void
  // View controls
  enableRenderMode?: boolean
  enableSaveImage?: boolean
}

function UnifiedMoleculeViewerInner({
  molecule,
  height = 420,
  onSelectAtom,
  quizMode = false,
  targetAtoms = [],
  isAnswered = false,
  isCorrect = null,
  onCorrectAnswer,
  onIncorrectAnswer,
  enableRenderMode = true,
  enableSaveImage = true
}: UnifiedMoleculeViewerProps) {
  // Stable atom map
  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {}
    molecule.atoms.forEach((a) => { map[a.id] = a.position })
    return map
  }, [molecule])

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('ballStick')
  const targetAtomsSet = useMemo(() => new Set(targetAtoms), [targetAtoms])

  const handleAtomClick = useCallback((atomId: string) => {
    if (quizMode && isAnswered) return

    setSelectedAtomId(atomId)
    onSelectAtom?.(atomId)

    if (quizMode) {
      const isTarget = targetAtomsSet.has(atomId)
      if (isTarget) {
        onCorrectAnswer?.()
      } else {
        onIncorrectAnswer?.()
      }
    }
  }, [quizMode, isAnswered, targetAtomsSet, onSelectAtom, onCorrectAnswer, onIncorrectAnswer])

  const handleSaveImage = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${molecule.name || 'molecule'}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }, [molecule.name])

  // Background color based on state
  const bgClass = isAnswered
    ? isCorrect
      ? 'border-green-500 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30'
      : 'border-red-500 bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/30'
    : 'border-border bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800'

  return (
    <div className="relative">
      {/* Render mode controls */}
      {enableRenderMode && (
        <div
          className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm"
          role="group"
          aria-label="Darstellungsmodus"
        >
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
      )}

      {/* Save image button */}
      {enableSaveImage && (
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
      )}

      {/* Quiz mode hint */}
      {quizMode && !isAnswered && (
        <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
          <span className="font-medium">🔬 Klicke auf ein Atom der gesuchten Gruppe</span>
        </div>
      )}

      {/* Answer feedback glow */}
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
        className={`w-full overflow-hidden rounded-xl border transition-colors ${bgClass}`}
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
              isTargetAtom={targetAtomsSet.has(atom.id)}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
            />
          ))}

          {/* Selection ring */}
          {selectedAtomId && !quizMode && (
            <SelectionRing
              atomMap={atomMap}
              atomId={selectedAtomId}
              element={molecule.atoms.find(a => a.id === selectedAtomId)?.element ?? 'C'}
            />
          )}

          {/* Target highlights (after answer) */}
          {isAnswered && targetAtoms.map((atomId) => {
            const atom = molecule.atoms.find((a) => a.id === atomId)
            if (!atom) return null
            return (
              <TargetHighlight
                key={`highlight-${atomId}`}
                atomMap={atomMap}
                atomId={atomId}
                element={atom.element}
                isCorrect={isCorrect ?? false}
              />
            )
          })}

          {/* Bonds */}
          {molecule.bonds.map((bond, i) => (
            <BondMesh
              key={`bond-${i}`}
              bond={bond}
              atomMap={atomMap}
              renderMode={renderMode}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={20}
            touches={{
              ONE: 1, // ROTATE
              TWO: 2  // DOLLY_PAN
            }}
          />
        </Canvas>
      </div>
    </div>
  )
}

// Export with memo for external consumers
const UnifiedMoleculeViewer = memo(UnifiedMoleculeViewerInner)
export default UnifiedMoleculeViewer
export { UnifiedMoleculeViewer as MoleculeViewer }

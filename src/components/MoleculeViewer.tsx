import { useMemo, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Molecule } from '@/lib/types';
import { parseSDF } from '@/lib/sdf';
import { useChemStore } from '@/store/useChemStore';

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

const BOND_RADII: Record<string, number> = {
  H: 0.4,
  C: 0.7,
  O: 0.7,
  N: 0.7,
  S: 0.8,
  P: 0.8,
  Cl: 0.8,
  F: 0.6,
  Br: 0.9,
  I: 0.95,
  Na: 1.0,
  Fe: 0.9
};

const HIGHLIGHT_COLOR = '#ffcc00';

type RenderMode = 'ballStick' | 'spaceFilling' | 'wireframe';

type BondDistance = {
  from: string;
  to: string;
  distance: number;
};

interface MoleculeViewerProps {
  molecule: Molecule;
  height?: number;
  onSelectAtom?: (atomId: string) => void;
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

export default function MoleculeViewer({ molecule, height = 420, onSelectAtom }: MoleculeViewerProps) {
  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => (map[a.id] = a.position));
    return map;
  }, [molecule]);

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('ballStick');
  const [bondDistance, setBondDistance] = useState<BondDistance | null>(null);
  const [lastClickedAtomId, setLastClickedAtomId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PubChem API Search Integration
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ cid: string; name: string }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchPubChemData = useCallback(async (query: string) => {
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/search/compound?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.Status?.success && !data.ResultList) throw new Error('PubChem search failed');

      const results: { cid: string; name: string }[] = data.ResultList
        ? data.ResultList.map((cid: number) => ({
            cid: cid.toString(),
            name: `Compound ${cid}`
          }))
        : [];

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('PubChem API Error:', error);
      setSearchResults([]);
    }
  }, []);

  const handlePubChemSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    await fetchPubChemData(searchQuery);
  }, [searchQuery, fetchPubChemData]);

  const loadPubChemMolecule = useCallback(async (cid: string) => {
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF`);
      const sdfData = await response.text();
      const parsed = parseSDF(sdfData);
      if (parsed) {
        // Trigger molecule load in the store
        const { loadMolecule } = useChemStore.getState();
        void loadMolecule(searchQuery);
      }
    } catch (error) {
      console.error('Failed to load molecule SDF:', error);
    }
    setShowSearchResults(false);
  }, [searchQuery]);

  // Existing atom click handler with bond measurement
  const handleAtomClick = useCallback((atomId: string) => {
    const atom = molecule.atoms.find((a) => a.id === atomId);
    if (!atom) return;

    // Check if this is a second click on a different atom (for bond distance measurement)
    if (lastClickedAtomId && lastClickedAtomId !== atomId) {
      const firstAtom = molecule.atoms.find((a) => a.id === lastClickedAtomId);
      if (firstAtom) {
        const pos1 = new THREE.Vector3(...firstAtom.position);
        const pos2 = new THREE.Vector3(...atom.position);
        const distance = pos1.distanceTo(pos2);
        setBondDistance({
          from: lastClickedAtomId,
          to: atomId,
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        });
      }
      setLastClickedAtomId(null);
    } else {
      setLastClickedAtomId(atomId);
      setSelectedAtomId(atomId);
      onSelectAtom?.(atomId);
      setBondDistance(null);
    }
  }, [molecule, lastClickedAtomId, onSelectAtom]);

  const selectedAtom = selectedAtomId ? molecule.atoms.find((a) => a.id === selectedAtomId) : null;

  const handleSaveImage = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `molecule-${molecule.name || 'structure'}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  }, [molecule.name]);

  return (
    <div className="relative">
      {/* PubChem Search Bar */}
      <div className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search PubChem..."
          className="w-48"
          onKeyDown={(e) => e.key === 'Enter' && handlePubChemSearch()}
        />
        <Button onClick={handlePubChemSearch}>Search</Button>
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute top-12 left-1/2 z-20 w-64 -translate-x-1/2 rounded-lg border bg-background shadow-lg">
          {searchResults.map((result) => (
            <div
              key={result.cid}
              className="cursor-pointer px-3 py-2 hover:bg-muted"
              onClick={() => loadPubChemMolecule(result.cid)}
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-xs text-muted-foreground">CID: {result.cid}</div>
            </div>
          ))}
        </div>
      )}

      {/* Render Mode Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm">
        <button
          onClick={() => setRenderMode('ballStick')}
          className={`rounded px-2 py-1 text-xs font-medium transition-all ${
            renderMode === 'ballStick' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Ball & Stick
        </button>
        <button
          onClick={() => setRenderMode('spaceFilling')}
          className={`rounded px-2 py-1 text-xs font-medium transition-all ${
            renderMode === 'spaceFilling' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Space Filling
        </button>
        <button
          onClick={() => setRenderMode('wireframe')}
          className={`rounded px-2 py-1 text-xs font-medium transition-all ${
            renderMode === 'wireframe' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Wireframe
        </button>
      </div>

      {/* Save Image Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleSaveImage}
          className="rounded-lg bg-background/80 p-2 shadow-md backdrop-blur-sm hover:bg-background/90"
          title="Save Image"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]} ref={canvasRef}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} />

          {molecule.atoms.map((atom) => {
            const isSelected = atom.id === selectedAtomId;

            // Render mode specific atom geometry
            if (renderMode === 'wireframe') {
              return (
                <mesh
                  key={atom.id}
                  position={atom.position}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAtomClick(atom.id);
                  }}
                >
                  <sphereGeometry args={[RADII[atom.element] ?? 0.45, 8, 8]} />
                  <meshBasicMaterial color={ELEMENT_COLORS[atom.element] ?? '#cc44cc'} wireframe />
                </mesh>
              );
            }

            // Space filling mode uses van der Waals radii
            const radius = renderMode === 'spaceFilling'
              ? (ELEMENT_RADII[atom.element] ?? 1.2)
              : (RADII[atom.element] ?? 0.45);

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
                  color={isSelected ? HIGHLIGHT_COLOR : ELEMENT_COLORS[atom.element] ?? '#cc44cc'}
                  emissive={isSelected ? HIGHLIGHT_COLOR : '#000000'}
                  emissiveIntensity={isSelected ? 0.6 : 0}
                  roughness={0.35}
                  metalness={0.1}
                />
              </mesh>
            );
          })}

          {/* Visible selection ring around selected atom */}
          {selectedAtom && (
            <mesh position={selectedAtom.position}>
              <sphereGeometry args={[(RADII[selectedAtom.element] ?? 0.45) * 1.35, 32, 32]} />
              <meshBasicMaterial color={HIGHLIGHT_COLOR} wireframe transparent opacity={0.5} />
            </mesh>
          )}

          {/* Bonds */}
          {molecule.bonds.map((bond, i) => {
            const a = atomMap[bond.from];
            const b = atomMap[bond.to];
            if (!a || !b) return null;
            const { len, mid, quat } = bondTransform(a, b);

            const isBondWithSelected = selectedAtomId && (bond.from === selectedAtomId || bond.to === selectedAtomId);
            const isMeasuredBond = bondDistance && (
              (bond.from === bondDistance.from && bond.to === bondDistance.to) ||
              (bond.from === bondDistance.to && bond.to === bondDistance.from)
            );

            // Render mode specific bond geometry
            if (renderMode === 'wireframe') {
              return (
                <mesh key={`bond-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
                  <cylinderGeometry args={[0.05, 0.05, len, 8]} />
                  <meshBasicMaterial color="#888888" />
                </mesh>
              );
            }

            // Space filling mode uses larger bond radii
            const bondRadius = renderMode === 'spaceFilling' ? 0.15 : 0.08;

            const bondColor = isMeasuredBond ? '#00ff00' : '#9aa3b2';
            const bondEmissive = isMeasuredBond ? '#00ff00' : '#000000';

            return (
              <mesh key={`bond-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
                <cylinderGeometry args={[bondRadius, bondRadius, len, 16]} />
                <meshStandardMaterial
                  color={bondColor}
                  emissive={bondEmissive}
                  emissiveIntensity={isMeasuredBond ? 0.5 : 0}
                  roughness={0.5}
                />
              </mesh>
            );
          })}

          {/* Bond distance measurement label */}
          {bondDistance && (() => {
            const pos1 = atomMap[bondDistance.from];
            const pos2 = atomMap[bondDistance.to];
            if (!pos1 || !pos2) return null;
            const mid = new THREE.Vector3(
              (pos1[0] + pos2[0]) / 2,
              (pos1[1] + pos2[1]) / 2,
              (pos1[2] + pos2[2]) / 2
            );
            return (
              <mesh position={[mid.x, mid.y, mid.z + 0.3]}>
                <Html position={[0, 0, 0]} center>
                  <div className="pointer-events-none rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {bondDistance.distance.toFixed(2)} Å
                  </div>
                </Html>
              </mesh>
            );
          })()}

          {/* Atom info popup */}
          {selectedAtom && (
            <mesh
              position={[
                selectedAtom.position[0],
                selectedAtom.position[1] + (ELEMENT_RADII[selectedAtom.element] ?? 1.2) + 0.3,
                selectedAtom.position[2]
              ]}
            >
              <Html position={[0, 0, 0]} center>
                <div className="pointer-events-none rounded bg-black/80 px-3 py-1.5 text-xs text-white shadow-md">
                  <div className="font-bold">{selectedAtom.element}</div>
                  <div className="text-[10px] text-gray-300">
                    [{selectedAtom.position.map((n) => n.toFixed(2)).join(', ')}]
                  </div>
                </div>
              </Html>
            </mesh>
          )}

          <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
        </Canvas>
      </div>
    </div>
  );
}

// CPK radii (ball & stick mode)
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
import { useMemo, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Molecule } from '@/lib/types';
import { parseSDF } from '@/lib/sdf';
import { useChemStore } from '@/store/useChemStore';
import { parseSDF } from '@/lib/sdf';

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

type BondDistance {
  from: string;
  to: string;
  distance: number;
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
  const [renderMode, setRenderMode] = useState<RenderMode>('ballStick');
  const [bondDistance, setBondDistance] = useState<BondDistance | null>(null);
  const [lastClickedAtomId, setLastClickedAtomId] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // PubChem API Search Integration
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ cid: string, name: string }[]>([]);

  const fetchPubChemData = useCallback(async (query: string) => {
    try {
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/search/compound?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.Status.success) throw new Error('PubChem search failed');

      const results: { cid: string, name: string }[] = data.ResultList.map(cid => (
        { cid: cid.toString(), name: `Compound ${cid}` }
      ));

      setSearchResults(results);
    } catch (error) {
      console.error('PubChem API Error:', error);
      setSearchResults([]);
    }
  }, []);

  // Access the store to use the existing loadMolecule function
  const { loadMolecule: storeLoadMolecule } = useChemStore();

  const handlePubChemSearch = useCallback(async () => {
    if (!searchQuery) return;

    await fetchPubChemData(searchQuery);
  }, [searchQuery, fetchPubChemData]);

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

  // ... (existing code for rendering atoms, bonds, etc.) }

// ... (rest of the rendering components remain the same)
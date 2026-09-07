/**
 * SVG Canvas for building molecules
 * Interactive drawing area with atoms and bonds
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { BuildableAtom, BuildableBond } from '@/lib/molecule-builder/types';
import { ELEMENT_DATA } from '@/lib/molecule-builder/valency';
import { getAtomValidation } from '@/lib/molecule-builder/validation';
import { cn } from '@/lib/utils';

interface BuilderCanvasProps {
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
  mode: 'select' | 'addAtom' | 'addBond' | 'delete';
  selectedElement: string;
  selectedAtomId: string | null;
  pendingBondFrom: string | null;
  onAddAtom: (element: string, position: { x: number; y: number }) => void;
  onRemoveAtom: (id: string) => void;
  onMoveAtom: (id: string, position: { x: number; y: number }) => void;
  onSelectAtom: (id: string | null) => void;
  onAddBond: (from: string, to: string) => void;
  onRemoveBond: (id: string) => void;
  onCycleBondOrder: (id: string) => void;
}

export default function BuilderCanvas({
  atoms,
  bonds,
  mode,
  selectedElement,
  selectedAtomId,
  pendingBondFrom,
  onAddAtom,
  onRemoveAtom,
  onMoveAtom,
  onSelectAtom,
  onAddBond,
  onRemoveBond,
  onCycleBondOrder
}: BuilderCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 600, height: 400 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.width;
    const y = viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.height;
    return { x, y };
  }, [viewBox]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== svgRef.current) return; // Clicked on an element

    const pos = screenToSvg(e.clientX, e.clientY);

    if (mode === 'addAtom') {
      onAddAtom(selectedElement, pos);
    } else if (mode === 'select') {
      onSelectAtom(null);
    }
  }, [mode, selectedElement, screenToSvg, onAddAtom, onSelectAtom]);

  // Handle atom click
  const handleAtomClick = useCallback((e: React.MouseEvent, atomId: string) => {
    e.stopPropagation();

    if (mode === 'delete') {
      onRemoveAtom(atomId);
      return;
    }

    if (mode === 'addBond') {
      if (pendingBondFrom === null) {
        // Start bonding
        onSelectAtom(atomId);
        // Store pending bond in a separate way
      } else if (pendingBondFrom !== atomId) {
        // Complete bond
        onAddBond(pendingBondFrom, atomId);
        onSelectAtom(null);
      }
      return;
    }

    if (mode === 'select' || mode === 'addAtom') {
      onSelectAtom(atomId);
    }
  }, [mode, pendingBondFrom, onSelectAtom, onRemoveAtom, onAddBond]);

  // Handle bond click
  const handleBondClick = useCallback((e: React.MouseEvent, bondId: string) => {
    e.stopPropagation();
    if (mode === 'delete') {
      onRemoveBond(bondId);
    } else if (mode === 'select') {
      // Cycle bond order on click
      onCycleBondOrder(bondId);
    }
  }, [mode, onRemoveBond, onCycleBondOrder]);

  // Handle mouse down for dragging
  const handleAtomMouseDown = useCallback((e: React.MouseEvent, atom: BuildableAtom) => {
    if (mode !== 'select') return;
    e.stopPropagation();
    const pos = screenToSvg(e.clientX, e.clientY);
    setDragging(atom.id);
    setDragOffset({ x: pos.x - atom.position.x, y: pos.y - atom.position.y });
  }, [mode, screenToSvg]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = screenToSvg(e.clientX, e.clientY);
    onMoveAtom(dragging, {
      x: pos.x - dragOffset.x,
      y: pos.y - dragOffset.y
    });
  }, [dragging, dragOffset, screenToSvg, onMoveAtom]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Compute atom validation states
  const atomValidation = useMemo(() => {
    const map: Record<string, ReturnType<typeof getAtomValidation>> = {};
    for (const atom of atoms) {
      map[atom.id] = getAtomValidation(atom.id, atoms, bonds);
    }
    return map;
  }, [atoms, bonds]);

  return (
    <div className="relative h-full min-h-[400px] overflow-hidden rounded-xl border bg-background">
      {/* Grid background */}
      <svg
        ref={svgRef}
        className={cn(
          'h-full w-full cursor-crosshair',
          mode === 'select' && 'cursor-move',
          mode === 'delete' && 'cursor-pointer'
        )}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        aria-label="Molekül-Baukasten Canvas"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>

        {/* Grid background */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Bonds */}
        <g className="bonds">
          {bonds.map(bond => {
            const fromAtom = atoms.find(a => a.id === bond.from);
            const toAtom = atoms.find(a => a.id === bond.to);
            if (!fromAtom || !toAtom) return null;

            const x1 = fromAtom.position.x;
            const y1 = fromAtom.position.y;
            const x2 = toAtom.position.x;
            const y2 = toAtom.position.y;

            // Calculate bond lines for double/triple bonds
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;

            const perpX = -dy / len * 5;
            const perpY = dx / len * 5;

            const isSelected = bond.from === selectedAtomId || bond.to === selectedAtomId;

            return (
              <g
                key={bond.id}
                className="cursor-pointer"
                onClick={(e) => handleBondClick(e, bond.id)}
              >
                {/* Bond lines */}
                {bond.order >= 1 && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                    strokeWidth={bond.order === 1 ? 4 : 3}
                    strokeLinecap="round"
                    className="transition-colors"
                  />
                )}
                {bond.order >= 2 && (
                  <line
                    x1={x1 + perpX}
                    y1={y1 + perpY}
                    x2={x2 + perpX}
                    y2={y2 + perpY}
                    stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="transition-colors"
                  />
                )}
                {bond.order >= 3 && (
                  <line
                    x1={x1 - perpX}
                    y1={y1 - perpY}
                    x2={x2 - perpX}
                    y2={y2 - perpY}
                    stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="transition-colors"
                  />
                )}
                {/* Invisible wider line for easier clicking */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={20}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* Pending bond indicator */}
        {pendingBondFrom && (() => {
          const fromAtom = atoms.find(a => a.id === pendingBondFrom);
          return fromAtom ? (
            <circle
              cx={fromAtom.position.x}
              cy={fromAtom.position.y}
              r={30}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          ) : null;
        })()}

        {/* Atoms */}
        <g className="atoms">
          {atoms.map(atom => {
            const data = ELEMENT_DATA[atom.element];
            const validation = atomValidation[atom.id];
            const isSelected = atom.id === selectedAtomId || atom.id === pendingBondFrom;
            const isPending = atom.id === pendingBondFrom;
            const radius = 20;

            let strokeColor = 'hsl(var(--foreground))';
            let strokeWidth = 2;
            if (isSelected || isPending) {
              strokeColor = 'hsl(var(--primary))';
              strokeWidth = 3;
            } else if (validation?.status === 'error') {
              strokeColor = 'hsl(var(--destructive))';
            } else if (validation?.status === 'warning') {
              strokeColor = 'hsl(var(--warning))';
            }

            return (
              <g
                key={atom.id}
                className="cursor-pointer"
                onClick={(e) => handleAtomClick(e, atom.id)}
                onMouseDown={(e) => handleAtomMouseDown(e, atom)}
              >
                {/* Atom circle */}
                <circle
                  cx={atom.position.x}
                  cy={atom.position.y}
                  r={radius}
                  fill={data?.color ?? '#cccccc'}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all"
                />

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={atom.position.x}
                    cy={atom.position.y}
                    r={radius + 5}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                )}

                {/* Element symbol */}
                <text
                  x={atom.position.x}
                  y={atom.position.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight="bold"
                  fill={getContrastColor(data?.color ?? '#ffffff')}
                  style={{ pointerEvents: 'none', userSelect: 'none' } as React.CSSProperties}
                >
                  {atom.element}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Mode indicator */}
      <div className="absolute right-2 top-2 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        {mode === 'addAtom' && `Füge ${selectedElement} hinzu`}
        {mode === 'addBond' && (pendingBondFrom ? 'Klicke zweites Atom' : 'Wähle erstes Atom')}
        {mode === 'delete' && 'Klicken zum Löschen'}
        {mode === 'select' && 'Ziehen zum Bewegen'}
      </div>

      {/* Empty state */}
      {atoms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Klicke, um Atome hinzuzufügen</p>
            <p className="text-sm">Wähle ein Element aus der Palette und klicke auf die Fläche</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Determines if text should be light or dark based on background
 */
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#333333' : '#ffffff';
}

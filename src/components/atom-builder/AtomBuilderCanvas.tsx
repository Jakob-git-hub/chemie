import { useState, useRef, useCallback, useEffect, MouseEvent, TouchEvent } from 'react';

/**
 * Interactive SVG canvas for the Atombaukasten
 * Supports both mouse and touch events with proper coordinate space mapping
 */
export interface AtomBuilderCanvasProps {
  /** Current physics state */
  protonCount: number;
  neutronCount: number;
  electronCount: number;

  /** Which particle type to add on click */
  selectedParticleType: 'proton' | 'neutron' | 'electron';

  /** Add particle on click */
  onAddParticle: (type: 'proton' | 'neutron' | 'electron', position: { x: number; y: number }) => void;

  /** Remove particle on click at position */
  onRemoveParticle: (position: { x: number; y: number }) => void;

  /** Canvas size / viewport dimensions */
  width: number;
  height: number;
}

/**
 * Maps client/mouse/touch coordinates to SVG normalized coords (0,0 = center)
 */
function useSvgCoordinateMapper(width: number, height: number) {
  const svgRef = useRef<SVGSVGElement>(null);

  const getSvgPoint = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    // Get the SVG's transformation matrix
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    // Convert to normalized SVG coordinates (0,0 is top-left of viewBox)
    const screenCTM = svg.getScreenCTM();
    if (screenCTM) {
      const normalized = point.matrixTransform(screenCTM.inverse());
      return { x: normalized.x, y: normalized.y };
    }
    // Fallback: map client coords to center-(0,0) system
    const centerX = width / 2;
    const centerY = height / 2;
    return { x: clientX - centerX, y: clientY - centerY };
  };

  return { svgRef, getSvgPoint };
}

/**
 * AtomBuilderCanvas — interactive SVG canvas
 *
 * Interaction model:
 * - Click empty area → add selected particle type at click position
 * - Click existing particle → remove it
 * - Particles: protons (red, large) in nucleus, neutrons (orange, medium) in nucleus, electrons (blue, small) on shells
 */
export default function AtomBuilderCanvas({
  protonCount,
  neutronCount,
  electronCount,
  selectedParticleType,
  onAddParticle,
  onRemoveParticle,
  width,
  height,
}: AtomBuilderCanvasProps) {
  const { svgRef, getSvgPoint } = useSvgCoordinateMapper(width, height);
  const [hoveredParticleId, setHoveredParticleId] = useState<string | null>(null);
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);

  // Track all placed particles with their types and positions
  const [particles, setParticles] = useState<{
    id: string;
    type: 'proton' | 'neutron' | 'electron';
    x: number;
    y: number;
  }[]>([]);

  // Compute nucleus center and radius
  const nucleusRadius = Math.min(width, height) * 0.25;
  const nucleusX = width / 2;
  const nucleusY = height / 2;

  // Electron shells radii (approximate for 2D view)
  const shellRadii = [nucleusRadius + 40, nucleusRadius + 80, nucleusRadius + 120, nucleusRadius + 160];

  // Place a particle at the mapped SVG coordinates
  const placeParticle = useCallback((type: 'proton' | 'neutron' | 'electron', svgPt: { x: number; y: number }) => {
    const newParticle = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type,
      x: svgPt.x,
      y: svgPt.y,
    };

    // Check if clicking on an existing particle (remove it)
    const clickedOnExisting = particles.findIndex(
      (p) => p.type !== type && Math.hypot(p.x - svgPt.x, p.y - svgPt.y) < 12
    );

    if (clickedOnExisting >= 0) {
      // Remove the clicked particle
      setParticles((prev) => prev.filter((p) => p.id !== particles[clickedOnExisting].id));
    } else {
      // Add new particle
      setParticles((prev) => [...prev, newParticle]);
    }
  }, [particles]);

  // Add particle on click/touch
  const handlePointerDown = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const svgPt = getSvgPoint(clientX, clientY);
    placeParticle(selectedParticleType, svgPt);
  }, [selectedParticleType, getSvgPoint, placeParticle]);

  // Render particles
  const protonParticles = particles.filter((p) => p.type === 'proton');
  const neutronParticles = particles.filter((p) => p.type === 'neutron');
  const electronParticles = particles.filter((p) => p.type === 'electron');

  // Count displayed particles vs. physics counts
  const displayedProtons = protonParticles.length;
  const displayedNeutrons = neutronParticles.length;
  const displayedElectrons = electronParticles.length;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`-${width / 2} ${-height / 2} ${width} ${height}`}
      onPointerDown={handlePointerDown}
      style={{ cursor: 'default' }}
      aria-label={`Atom-Builder: ${protonCount} Protonen, ${neutronCount} Neutronen, ${electronCount} Elektronen`}
    >
      {/* Nucleus - protons and neutrons */}
      <g className="nucleus" transform={`translate(${nucleusX}, ${nucleusY})`}>
        {/* Protons - red circles in nucleus */}
        {protonParticles.map((p) => (
          <circle
            key={p.id}
            cx={0}
            cy={0}
            r={6}
            fill="#e53e3e"
            opacity={0.9}
            className="proton"
          >
            <title>Proton</title>
          </circle>
        ))}

        {/* Neutrons - orange circles in nucleus */}
        {neutronParticles.map((p) => (
          <circle
            key={p.id}
            cx={0}
            cy={0}
            r={5.5}
            fill="#f6ad55"
            opacity={0.9}
            className="neutron"
          >
            <title>Neutron</title>
          </circle>
        ))}
      </g>

      {/* Electron shells */}
      {shellRadii.map((shellRadius, shellIndex) => {
        const shellLabel = shellIndex + 1; // n=1,2,3,4
        const maxInShell = 2 * shellIndex * shellIndex + 2; // 2n² approximation
        const electronsInShell = electronParticles.filter(
          (p) => Math.hypot(p.x, p.y) < shellRadius + 30 && Math.hypot(p.x, p.y) > shellRadii[shellIndex - 1] || shellIndex === 0
        ).length;

        return (
          <circle
            key={`shell-${shellIndex}`}
            cx={0}
            cy={0}
            r={shellRadius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        );
      })}

      {/* Electrons orbiting on shells */}
      {electronParticles.map((p, idx) => {
        // Determine which shell this electron is in based on distance from center
        const dist = Math.hypot(p.x, p.y);
        let shellRadius = shellRadii[0];
        let shellIndex = 0;
        for (let i = shellRadii.length - 1; i >= 0; i--) {
          if (dist >= shellRadii[i] - 10 && dist < shellRadii[i] + 10) {
            shellRadius = shellRadii[i];
            shellIndex = i;
            break;
          }
        }

        // Calculate angle for positioning
        const angle = Math.atan2(p.y, p.x) - Math.PI / 2;

        const radius = shellRadius;
        const electronX = radius * Math.cos(angle);
        const electronY = radius * Math.sin(angle);

        // Color based on particle type
        const colors = {
          proton: '#e53e3e',
          neutron: '#f6ad55',
          electron: '#3182ce',
        };

        const color = colors.electron;

        return (
          <circle
            key={p.id}
            cx={electronX}
            cy={electronY}
            r={3}
            fill={color}
            opacity={0.8}
            className="electron"
          >
            <title>Elektron</title>
          </circle>
        );
      })}

      {/* Click instructions */}
      <text
        x={width / 2}
        y={height / 2 + (height / 2) * 0.65}
        textAnchor="middle"
        fontSize={14}
        fill="currentColor"
        opacity={0.6}
      >
        Klicken: {selectedParticleType === 'proton' ? 'Proton' : selectedParticleType === 'neutron' ? 'Neutron' : 'Elektron'} hinzufügen
      </text>
    </svg>
  );
}
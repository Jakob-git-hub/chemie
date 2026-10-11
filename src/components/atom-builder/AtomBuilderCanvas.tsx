import { useCallback, useMemo, useRef } from 'react';

export interface AtomBuilderCanvasProps {
  protonCount: number;
  neutronCount: number;
  electronCount: number;
  selectedParticleType: 'proton' | 'neutron' | 'electron';
  onAddParticle: (type: 'proton' | 'neutron' | 'electron', position: { x: number; y: number }) => void;
  onRemoveParticle: (type: 'proton' | 'neutron' | 'electron') => void;
  width: number;
  height: number;
}

type VisualParticle = {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  x: number;
  y: number;
};

function useSvgCoordinateMapper() {
  const svgRef = useRef<SVGSVGElement>(null);

  const getSvgPoint = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const point = svgRef.current.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = svgRef.current.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const normalized = point.matrixTransform(matrix.inverse());
    return { x: normalized.x, y: normalized.y };
  };

  return { svgRef, getSvgPoint };
}

function buildNucleusParticles(count: number, type: 'proton' | 'neutron', offset = 0): VisualParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const index = i + offset;
    const angle = index * 2.399963229728653;
    const radius = Math.sqrt(index) * 5;
    return {
      id: `${type}-${i}`,
      type,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
}

function buildElectronParticles(count: number, shellRadii: number[]): VisualParticle[] {
  const capacities = [2, 8, 18, 32];
  const particles: VisualParticle[] = [];
  let remaining = count;
  let id = 0;

  for (let shell = 0; shell < shellRadii.length && remaining > 0; shell++) {
    const inShell = Math.min(remaining, capacities[shell] ?? remaining);
    for (let i = 0; i < inShell; i++) {
      const angle = (Math.PI * 2 * i) / inShell - Math.PI / 2;
      particles.push({
        id: `electron-${id++}`,
        type: 'electron',
        x: Math.cos(angle) * shellRadii[shell],
        y: Math.sin(angle) * shellRadii[shell],
      });
    }
    remaining -= inShell;
  }

  return particles;
}

const HIT_RADIUS: Record<VisualParticle['type'], number> = {
  proton: 9,
  neutron: 9,
  electron: 7,
};

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
  const { svgRef, getSvgPoint } = useSvgCoordinateMapper();
  const nucleusRadius = Math.min(width, height) * 0.22;
  const shellRadii = [nucleusRadius + 35, nucleusRadius + 70, nucleusRadius + 105, nucleusRadius + 140];

  const visualParticles = useMemo(() => {
    const protons = buildNucleusParticles(protonCount, 'proton');
    const neutrons = buildNucleusParticles(neutronCount, 'neutron', protonCount);
    const electrons = buildElectronParticles(electronCount, shellRadii);
    return [...protons, ...neutrons, ...electrons];
  }, [protonCount, neutronCount, electronCount, shellRadii]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svgPt = getSvgPoint(e.clientX, e.clientY);
    const clicked = visualParticles.find(
      (p) => Math.hypot(p.x - svgPt.x, p.y - svgPt.y) <= HIT_RADIUS[p.type]
    );

    if (clicked) {
      onRemoveParticle(clicked.type);
      return;
    }

    onAddParticle(selectedParticleType, svgPt);
  }, [getSvgPoint, onAddParticle, onRemoveParticle, selectedParticleType, visualParticles]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`-${width / 2} ${-height / 2} ${width} ${height}`}
      onPointerDown={handlePointerDown}
      style={{ cursor: 'default', maxWidth: '100%', height: 'auto', touchAction: 'none' }}
      aria-label={`Atom-Builder: ${protonCount} Protonen, ${neutronCount} Neutronen, ${electronCount} Elektronen`}
    >
      {/* Nucleus area */}
      <circle cx={0} cy={0} r={nucleusRadius} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.15} />

      {/* Electron shells */}
      {shellRadii.map((shellRadius, shellIndex) => (
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
      ))}

      {/* Particles */}
      {visualParticles.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.type === 'electron' ? 4 : 6}
          fill={p.type === 'proton' ? '#e53e3e' : p.type === 'neutron' ? '#f6ad55' : '#3182ce'}
          opacity={0.9}
          className={p.type}
        >
          <title>{p.type === 'proton' ? 'Proton' : p.type === 'neutron' ? 'Neutron' : 'Elektron'}</title>
        </circle>
      ))}

      <text x={0} y={height / 2 - 20} textAnchor="middle" fontSize={14} fill="currentColor" opacity={0.6}>
        Klicken: {selectedParticleType === 'proton' ? 'Proton' : selectedParticleType === 'neutron' ? 'Neutron' : 'Elektron'} hinzufügen
      </text>
    </svg>
  );
}

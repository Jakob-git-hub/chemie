import { cn } from '@/lib/utils';

interface BohrModelProps {
  shells: number[]; // Elektronen pro Schale (von innen nach außen)
  symbol: string;
  atomicNumber: number;
  color?: string; // Kategorie-Farbe für den Kern
  size?: number; // px
  className?: string;
}

// Lokal gerendertes Bohr'sches Atommodell (Schalenmodell) als SVG.
// Völlig ohne externe Abhängigkeit – ein "Bild" des Elements, das im
// Browser berechnet wird.
export default function BohrModel({
  shells,
  symbol,
  atomicNumber,
  color = '#3B9BE0',
  size = 300,
  className
}: BohrModelProps) {
  const cx = 120;
  const cy = 120;
  const baseR = 42; // erster Schalenradius
  const step = 20; // Abstand zwischen den Schalen
  const maxRing = shells.length;

  // Schale mit den meisten Elektronen bestimmt die Größe des Modells.
  const maxElectrons = Math.max(2, ...shells);
  const maxRingR = baseR + (maxRing - 1) * step;
  const electronR = Math.min(5.5, 220 / (maxElectrons + 6));

  const totalElectrons = shells.reduce((a, b) => a + b, 0);

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={cn('select-none', className)}
      role="img"
      aria-label={`Bohr-Modell von ${symbol} mit ${totalElectrons} Elektronen`}
    >
      <defs>
        <radialGradient id={`nucleus-${atomicNumber}`} cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
        </radialGradient>
      </defs>

      {/* Schalen (Orbitale) */}
      {shells.map((_, i) => {
        const r = baseR + i * step;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.22}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        );
      })}

      {/* Elektronen auf jeder Schale */}
      {shells.map((count, i) => {
        const r = baseR + i * step;
        return Array.from({ length: count }).map((_, j) => {
          const angle = (2 * Math.PI * j) / count - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <circle
              key={`${i}-${j}`}
              cx={x}
              cy={y}
              r={electronR}
              fill={color}
              stroke="white"
              strokeOpacity={0.6}
              strokeWidth={0.6}
            />
          );
        });
      })}

      {/* Kern */}
      <circle cx={cx} cy={cy} r={26} fill={`url(#nucleus-${atomicNumber})`} />
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill="#fff"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {symbol}
      </text>
      <text
        x={cx}
        y={cy + 11}
        textAnchor="middle"
        fontSize={8}
        fill="#fff"
        fillOpacity={0.85}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {atomicNumber}
      </text>

      {/* äußere Begrenzung (dezent) */}
      <circle
        cx={cx}
        cy={cy}
        r={maxRingR + electronR + 6}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={1}
      />
    </svg>
  );
}

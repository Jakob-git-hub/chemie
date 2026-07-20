import { useMemo, useState } from 'react';
import { Search, Grid3x3 } from 'lucide-react';
import {
  CATEGORIES,
  ELEMENTS,
  GRID_COLUMNS,
  categoryMeta,
  type ElementCategory,
  type PeriodicElement
} from '@/lib/elements';
import { Input } from '@/components/ui/input';
import ElementTile from '@/components/ElementTile';
import ElementDetail from '@/components/ElementDetail';
import { cn } from '@/lib/utils';

type Filter = ElementCategory | 'all';

// (xpos, ypos) der Daten -> Grid-Zellen (mit Platz für Achsen-Beschriftung).
const gridPos = (xpos: number, ypos: number) => ({
  gridColumn: xpos + 1,
  gridRow: ypos + 1
});

// Marker, die auf die Lanthanoide/Actinoide im Hauptblock verweisen.
const F_BLOCK_MARKERS = [
  { label: '57–71', xpos: 3, ypos: 6 },
  { label: '89–103', xpos: 3, ypos: 7 }
];

export default function PeriodicTable() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<PeriodicElement | null>(null);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    return (el: PeriodicElement) => {
      const byCat = filter === 'all' || el.category === filter;
      if (!byCat) return { show: false, hit: false };
      const byQuery =
        q === '' ||
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q) ||
        el.nameEn.toLowerCase().includes(q) ||
        String(el.number) === q;
      return { show: byCat, hit: byQuery };
    };
  }, [q, filter]);

  const resultCount = useMemo(
    () => ELEMENTS.filter((el) => matches(el).show).length,
    [matches]
  );

  // Achsenbeschriftung: Gruppennummern (oben) und Perioden (links).
  const groupAxis = Array.from({ length: GRID_COLUMNS }, (_, i) => i + 1);
  const periodAxis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 8 = Lücke, 9/10 = f-Block

  const periodLabel = (row: number) => {
    if (row === 8) return '';
    if (row === 9) return '6';
    if (row === 10) return '7';
    return String(row);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Element suchen (z. B. Fe, Eisen, Gold)…"
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {resultCount} von {ELEMENTS.length} Elementen
          </span>
        </div>

        {/* Kategorie-Filter */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            className="bg-foreground text-background"
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Alle
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.key}
              active={filter === c.key}
              onClick={() => setFilter(c.key)}
              style={{ backgroundColor: c.bg, color: c.fg }}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Periodensystem */}
      <div className="scroll-x-thin overflow-x-auto pb-2">
        <div
          className="mx-auto grid min-w-[820px] gap-1 animate-fade-in"
          style={{
            gridTemplateColumns: `18px repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: `18px repeat(10, auto)`
          }}
        >
          {/* Gruppen-Achse (oben) */}
          {groupAxis.map((g) => (
            <div
              key={`g${g}`}
              className="flex items-center justify-center text-[10px] font-medium text-muted-foreground"
              style={gridPos(g, 0)}
            >
              {g}
            </div>
          ))}

          {/* Perioden-Achse (links) */}
          {periodAxis.map((p) => (
            <div
              key={`p${p}`}
              className="flex items-center justify-center text-[10px] font-medium text-muted-foreground"
              style={gridPos(0, p)}
            >
              {periodLabel(p)}
            </div>
          ))}

          {/* f-Block-Marker im Hauptblock */}
          {F_BLOCK_MARKERS.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-center rounded-md border border-dashed border-border text-center text-[8px] font-medium text-muted-foreground"
              style={gridPos(m.xpos, m.ypos)}
            >
              {m.label}
            </div>
          ))}

          {/* Element-Kacheln */}
          {ELEMENTS.map((el) => {
            const { show, hit } = matches(el);
            return (
              <div key={el.number} style={gridPos(el.xpos, el.ypos)}>
                <ElementTile
                  element={el}
                  onSelect={setSelected}
                  dimmed={!show}
                  highlighted={hit && q !== ''}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card/70 p-4 text-xs text-muted-foreground shadow-sm backdrop-blur">
        <span className="font-medium text-foreground">Legende:</span>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter((f) => (f === c.key ? 'all' : c.key))}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors',
              filter === c.key && 'ring-2 ring-foreground'
            )}
          >
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: c.bg }}
            />
            {c.label}
          </button>
        ))}
      </div>

      {selected && <ElementDetail element={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  className,
  style
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all',
        'border border-transparent hover:scale-105',
        !active && !style && 'bg-muted text-muted-foreground hover:bg-accent',
        active && 'ring-2 ring-offset-1 ring-foreground ring-offset-background',
        className
      )}
    >
      {children}
    </button>
  );
}

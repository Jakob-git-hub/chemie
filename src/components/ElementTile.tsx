import { categoryMeta, type PeriodicElement } from '@/lib/elements';
import { cn } from '@/lib/utils';

interface ElementTileProps {
  element: PeriodicElement;
  onSelect: (element: PeriodicElement) => void;
  dimmed?: boolean;
  highlighted?: boolean;
}

export default function ElementTile({ element, onSelect, dimmed, highlighted }: ElementTileProps) {
  const meta = categoryMeta(element.category);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(element);
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(element)}
      onKeyDown={handleKeyDown}
      title={`${element.name} (${element.symbol})`}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
      className={cn(
        'group relative flex aspect-square w-full flex-col justify-between rounded-md p-1 text-left transition-all duration-150',
        'hover:z-10 hover:scale-[1.12] hover:shadow-xl focus:z-10 focus:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-offset-2',
        'ring-offset-background',
        dimmed ? 'opacity-25 saturate-50' : 'opacity-100',
        highlighted && !dimmed && 'ring-2 ring-foreground ring-offset-2 shadow-lg'
      )}
      aria-label={`${element.name}, Ordnungszahl ${element.number}, Atommasse ${element.mass.toFixed(element.mass < 10 ? 3 : 2)}`}
      aria-current={highlighted ? 'true' : undefined}
    >
      <span className="text-[8px] font-semibold leading-none sm:text-[10px] md:text-xs" aria-hidden="true">
        {element.number}
      </span>
      <span className="text-center text-sm font-bold leading-none sm:text-base lg:text-lg" aria-hidden="true">
        {element.symbol}
      </span>
      <span className="flex flex-col leading-none" aria-hidden="true">
        <span className="w-full truncate text-[7px] font-medium sm:text-[9px]">
          {element.name}
        </span>
        <span className="hidden text-[7px] opacity-80 sm:block sm:text-[8px]">
          {element.mass.toFixed(element.mass < 10 ? 3 : 2)}
        </span>
      </span>
    </button>
  );
}

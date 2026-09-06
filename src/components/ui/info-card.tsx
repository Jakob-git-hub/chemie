import { cn } from '@/lib/utils';

export interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string | number | React.ReactNode;
  unit?: string;
  highlighted?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function InfoCard({
  className,
  label,
  value,
  unit,
  highlighted = false,
  variant = 'default',
  ...props
}: InfoCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-500/50 bg-green-500/5',
    warning: 'border-amber-500/50 bg-amber-500/5',
    error: 'border-red-500/50 bg-red-500/5'
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-center',
        variantStyles[variant],
        highlighted && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      {...props}
    >
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
      {value !== undefined && (
        <div className="font-mono text-lg font-medium">
          {value}
          {unit && <span className="ml-1 text-xs text-muted-foreground">{unit}</span>}
        </div>
      )}
    </div>
  );
}

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  ok?: boolean | null;
}

export function StatRow({ className, label, value, ok, ...props }: StatRowProps) {
  return (
    <div className={cn('flex items-center justify-between rounded border p-1.5', className)} {...props}>
      <span className="text-xs font-medium">{label}</span>
      <span
        className={cn(
          'font-mono text-xs',
          ok === true && 'text-green-600',
          ok === false && 'text-red-600',
          ok === null && 'text-muted-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default InfoCard;

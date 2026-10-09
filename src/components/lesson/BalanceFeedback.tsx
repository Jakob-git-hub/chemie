import { CheckCircle2, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ElementBalance {
  element: string;
  left: number;
  right: number;
}

interface BalanceFeedbackProps {
  rows: ElementBalance[];
}

export default function BalanceFeedback({ rows }: BalanceFeedbackProps) {
  const balanced = rows.length > 0 && rows.every((row) => row.left === row.right);

  return (
    <section aria-labelledby="balance-feedback-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="balance-feedback-title" className="text-base font-semibold">
          Atombilanz
        </h2>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
            balanced ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
          )}
          role="status"
          aria-live="polite"
        >
          {balanced ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />}
          {balanced ? 'Ausgeglichen' : 'Noch nicht ausgeglichen'}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {rows.map((row) => {
          const ok = row.left === row.right;
          return (
            <div key={row.element} className={cn('rounded-xl border p-3', ok ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5')}>
              <div className="text-xs font-semibold text-muted-foreground">{row.element}</div>
              <div className="mt-1 font-mono text-sm">
                {row.left} <span className="text-muted-foreground">↔</span> {row.right}
              </div>
              <div className="sr-only">{ok ? `${row.element} ist ausgeglichen` : `${row.element} ist noch nicht ausgeglichen`}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

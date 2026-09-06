import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorCard({ error, onRetry, className }: ErrorCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-red-800 dark:text-red-200">Fehler</p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
      {error.includes('No data') && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Bitte nach einer kleinen Weile erneut versuchen
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}

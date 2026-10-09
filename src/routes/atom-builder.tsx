/**
 * Atombaukasten Route
 * Lazy-loaded page component
 */

import { lazy } from 'react';
import { Suspense } from 'react';

const AtomBuilder = lazy(() => import('@/components/atom-builder/AtomBuilder'));

export default function AtomBuilderPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <AtomBuilder />
    </Suspense>
  );
}
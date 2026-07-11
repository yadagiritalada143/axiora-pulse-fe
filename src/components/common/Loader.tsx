import { Loader2 } from 'lucide-react';

import { cn } from '@lib/utils';

interface LoaderProps {
  className?: string;
  label?: string;
}

export function Loader({ className, label }: LoaderProps) {
  return (
    <div
      role="status"
      className={cn('text-muted-foreground flex items-center justify-center gap-2', className)}
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span className={label ? undefined : 'sr-only'}>{label ?? 'Loading'}</span>
    </div>
  );
}

/** Full-page loading state, used as a Suspense fallback for route-level code splitting. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Loader label="Loading page" className="text-base" />
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden="true" />;
}

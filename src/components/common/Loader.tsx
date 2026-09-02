import { Loader2 } from 'lucide-react';

import { cn } from '@lib/utils';

import { CartoonBotLoader } from './CartoonBotLoader';

interface LoaderProps {
  className?: string;
  label?: string;
  variant?: 'spinner' | 'cartoon';
  size?: 'sm' | 'md' | 'lg';
}

export function Loader({ className, label, variant = 'spinner', size = 'sm' }: LoaderProps) {
  if (variant === 'cartoon') {
    return <CartoonBotLoader className={className} label={label} size={size} />;
  }

  return (
    <div
      role="status"
      className={cn(
        'text-foreground flex items-center justify-center gap-2 font-medium',
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin text-[#f04f1e]" aria-hidden="true" />
      <span className={label ? 'text-foreground text-sm font-semibold dark:text-white' : 'sr-only'}>
        {label ?? 'Loading'}
      </span>
    </div>
  );
}

/** Full-page loading state, used as a Suspense fallback for route-level code splitting. */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'text-foreground flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center',
        className,
      )}
    >
      <Loader label="Loading page" className="text-base" />
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden="true" />;
}

export { CartoonBotLoader };

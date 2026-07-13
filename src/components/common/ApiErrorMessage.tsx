import { AlertCircle } from 'lucide-react';

import { isApiError } from '@/types/error.types';

interface ApiErrorMessageProps {
  error: unknown;
  className?: string;
}

/** Renders a normalized `ApiError` (or any unknown error) inline in a form/panel. */
export function ApiErrorMessage({ error, className }: ApiErrorMessageProps) {
  if (!error) return null;

  const message = isApiError(error) ? error.message : 'An unexpected error occurred.';

  return (
    <div
      role="alert"
      className={`border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${className ?? ''}`}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

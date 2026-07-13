import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string | null;
}

/** Top-of-form submission error, distinct from per-field `FormMessage` validation errors. */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm"
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

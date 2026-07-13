import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';

function toDate(input: string | Date): Date {
  return typeof input === 'string' ? parseISO(input) : input;
}

/** Formats a date/ISO string using a date-fns pattern, e.g. "PP" -> "Jan 4, 2026". */
export function formatDate(input: string | Date, pattern = 'PP'): string {
  const date = toDate(input);
  return isValid(date) ? format(date, pattern) : '';
}

/** Renders a relative time, e.g. "3 minutes ago". Used in chat/timeline UIs. */
export function formatRelativeTime(input: string | Date): string {
  const date = toDate(input);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '';
}

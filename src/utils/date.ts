import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DATE_FORMATS = [
  'YYYY-MM-DD',
  'DD/MM/YYYY',
  'DD-MM-YYYY',
  'YYYY/MM/DD',
  'MM/DD/YYYY',
  'DD MMM YYYY',
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ssZ',
];

export function toDate(input?: string | number | Date | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const parsedIso = parseISO(trimmed);
    if (isValid(parsedIso)) return parsedIso;
    for (const fmt of DATE_FORMATS) {
      const parsed = dayjs(trimmed, fmt, true);
      if (parsed.isValid()) return parsed.toDate();
    }
    const d = dayjs(trimmed);
    return d.isValid() ? d.toDate() : null;
  }
  return null;
}

export function formatDate(input?: string | number | Date | null, pattern = 'PP'): string {
  if (!input) return '';
  const date = toDate(input);
  if (!date || !isValid(date)) return '';
  if (/YYYY|DD/.test(pattern) && !/yyyy|dd/.test(pattern)) {
    return dayjs(date).format(pattern);
  }
  try {
    return format(date, pattern);
  } catch {
    return dayjs(date).format(pattern);
  }
}

export function formatRelativeTime(input?: string | number | Date | null): string {
  if (!input) return '';
  const date = toDate(input);
  return date && isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '';
}

export const fromNow = (value?: string | number | Date | null): string => {
  return formatRelativeTime(value);
};

export const toDateInputValue = (value?: string | number | Date | null): string => {
  const date = toDate(value);
  return date && isValid(date) ? format(date, 'yyyy-MM-dd') : '';
};

export const formatDateTime = (value?: string | number | Date | null): string => {
  const date = toDate(value);
  return date && isValid(date) ? format(date, 'dd MMM yyyy, HH:mm') : '';
};

export const parseDate = (val: unknown): Date | null => {
  return toDate(val as string | number | Date);
};

export const formatDateRange = (
  range?: [unknown, unknown] | null,
  pattern = 'dd MMM yyyy',
): string => {
  if (!range || (!range[0] && !range[1])) return '';
  const start = formatDate(range[0] as string | Date, pattern);
  const end = formatDate(range[1] as string | Date, pattern);
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - ...`;
  return '';
};

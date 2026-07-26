import { formatDate, formatRelativeTime } from '@utils/date';

describe('formatDate', () => {
  it('formats an ISO string using the default pattern', () => {
    expect(formatDate('2026-01-04T00:00:00.000Z')).toBe('Jan 4, 2026');
  });

  it('formats a Date instance', () => {
    expect(formatDate(new Date(2026, 0, 4))).toBe('Jan 4, 2026');
  });

  it('formats using a custom pattern', () => {
    expect(formatDate('2026-01-04T00:00:00.000Z', 'yyyy-MM-dd')).toBe('2026-01-04');
  });

  it('returns an empty string for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('renders a relative time suffix for a recent date', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    expect(formatRelativeTime(fiveMinutesAgo)).toMatch(/ago$/);
  });

  it('returns an empty string for an invalid date string', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });
});

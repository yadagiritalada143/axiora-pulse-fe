import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import {
  Calendar,
  CalendarPicker,
  DateRangePicker,
  formatDate,
  formatDateRange,
  openCalendarModal,
  openDateRangeModal,
  parseDate,
} from '@components/ui/calendar';
import { DatePicker } from '@components/ui/date-picker';

describe('Calendar component utilities', () => {
  it('parses dates correctly with parseDate', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('invalid-date-string')).toBeNull();

    const dateObj = new Date(2026, 8, 19);
    expect(parseDate(dateObj)).toEqual(dateObj);

    const fromString = parseDate('2026-09-19');
    expect(fromString).not.toBeNull();
    expect(dayjs(fromString).format('YYYY-MM-DD')).toBe('2026-09-19');
  });

  it('formats dates correctly with formatDate', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(new Date(2026, 8, 19), 'YYYY-MM-DD')).toBe('2026-09-19');
    expect(formatDate('2026-09-19', 'DD/MM/YYYY')).toBe('19/09/2026');
  });

  it('formats date ranges correctly with formatDateRange', () => {
    expect(formatDateRange(null)).toBe('');
    expect(formatDateRange([null, null])).toBe('');
    expect(formatDateRange(['2026-09-10', '2026-09-19'], 'DD/MM/YYYY')).toBe(
      '10/09/2026 - 19/09/2026',
    );
    expect(formatDateRange(['2026-09-10', null], 'DD/MM/YYYY')).toBe('10/09/2026 - ...');
  });
});

describe('Calendar component rendering & modes', () => {
  it('renders single date mode calendar', () => {
    const handleChange = jest.fn();
    render(
      <Calendar
        mode="single"
        value={new Date(2026, 8, 19)}
        onChange={handleChange}
        defaultDate={new Date(2026, 8, 19)}
      />,
    );

    // Calendar month header should render
    expect(screen.getByRole('button', { name: /^September 2026$/i })).toBeInTheDocument();
  });

  it('renders range mode calendar with 2 columns', () => {
    const handleChange = jest.fn();
    render(
      <Calendar
        mode="range"
        value={[new Date(2026, 8, 10), new Date(2026, 8, 19)]}
        onChange={handleChange}
        defaultDate={new Date(2026, 8, 19)}
        numberOfColumns={2}
      />,
    );

    // Multiple month headers should be rendered
    expect(screen.getByRole('button', { name: /^September 2026$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^October 2026$/i })).toBeInTheDocument();
  });

  it('renders with presets and triggers preset selection', () => {
    const handleChange = jest.fn();
    render(
      <Calendar
        mode="single"
        value={null}
        onChange={handleChange}
        withPresets
        defaultDate={new Date(2026, 8, 19)}
      />,
    );

    expect(screen.getByText('Presets')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yesterday/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Today/i }));
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with action buttons and handles clear and apply', () => {
    const handleChange = jest.fn();
    const handleClear = jest.fn();
    const handleApply = jest.fn();

    render(
      <Calendar
        mode="single"
        value={new Date(2026, 8, 19)}
        onChange={handleChange}
        withActions
        onClear={handleClear}
        onApply={handleApply}
      />,
    );

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    const applyBtn = screen.getByRole('button', { name: /Apply/i });

    expect(clearBtn).toBeInTheDocument();
    expect(applyBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith(null, '');
    expect(handleClear).toHaveBeenCalled();

    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalled();
  });

  it('supports disabledDates callback without crashing', () => {
    render(
      <Calendar
        mode="single"
        value={new Date(2026, 8, 19)}
        disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
        defaultDate={new Date(2026, 8, 19)}
      />,
    );

    expect(screen.getByRole('button', { name: /^September 2026$/i })).toBeInTheDocument();
  });
});

describe('CalendarPicker & DateRangePicker popover triggers', () => {
  it('renders CalendarPicker with placeholder and opens popover on click', () => {
    const handleChange = jest.fn();
    render(
      <CalendarPicker
        placeholder="Choose venture launch date"
        value={null}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText('Choose venture launch date')).toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /Choose venture launch date/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to open
    fireEvent.click(trigger);

    // Trigger should reflect opened state
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders CalendarPicker with formatted date and clear button', () => {
    const handleChange = jest.fn();
    render(
      <CalendarPicker
        value={new Date(2026, 8, 19)}
        onChange={handleChange}
        format="DD/MM/YYYY"
        clearable
      />,
    );

    expect(screen.getByText('19/09/2026')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith(null, '');
  });

  it('renders DateRangePicker with formatted range', () => {
    const handleChange = jest.fn();
    render(
      <DateRangePicker
        value={['2026-09-01', '2026-09-15']}
        onChange={handleChange}
        format="DD MMM YYYY"
      />,
    );

    expect(screen.getByText(/01 Sep 2026.*15 Sep 2026/)).toBeInTheDocument();
  });
});

describe('openCalendarModal & openDateRangeModal helpers', () => {
  it('triggers openCalendarModal without error', () => {
    const handleSelect = jest.fn();
    expect(() => {
      openCalendarModal({
        title: 'Choose Milestone Date',
        value: new Date(2026, 8, 19),
        onSelect: handleSelect,
      });
    }).not.toThrow();
  });

  it('triggers openDateRangeModal without error', () => {
    const handleSelect = jest.fn();
    expect(() => {
      openDateRangeModal({
        title: 'Choose Sprint Range',
        value: [new Date(2026, 8, 1), new Date(2026, 8, 15)],
        onSelect: handleSelect,
      });
    }).not.toThrow();
  });
});

describe('DatePicker from date-picker.tsx', () => {
  it('selects a date when clicked', async () => {
    const handleChange = jest.fn();
    render(
      <DatePicker
        placeholder="DD/MM/YYYY"
        value={null}
        onChange={handleChange}
        popoverProps={{ transitionProps: { duration: 0 } }}
      />,
    );

    const trigger = screen.getByRole('button', { name: /DD\/MM\/YYYY/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const bodyDayButtons = await screen.findAllByRole('button', { name: /15/i });
    expect(bodyDayButtons.length).toBeGreaterThan(0);

    const targetButton = bodyDayButtons[0];
    if (targetButton) {
      fireEvent.click(targetButton);
    }
    expect(handleChange).toHaveBeenCalled();
  });
});

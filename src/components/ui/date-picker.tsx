import { MantineProvider } from '@mantine/core';
import { DatePickerInput, type DatePickerInputProps } from '@mantine/dates';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@lib/utils';

export interface DatePickerProps extends Omit<DatePickerInputProps, 'value' | 'onChange'> {
  value?: string | Date | null;
  onChange?: (dateString: string, date: Date | null) => void;
  className?: string;
  error?: boolean | string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      valueFormat = 'DD/MM/YYYY',
      placeholder = 'DD/MM/YYYY',
      maxLevel = 'decade',
      clearable = true,
      maxDate,
      minDate,
      disabled = false,
      className,
      error,
      popoverProps,
      styles,
      ...props
    },
    ref,
  ) => {
    const parsedDate = React.useMemo(() => {
      if (!value) return null;
      if (value instanceof Date) return value;
      const d = dayjs(value);
      return d.isValid() ? d.toDate() : null;
    }, [value]);

    const handleChange = (val: unknown) => {
      if (!onChange) return;
      if (!val) {
        onChange('', null);
        return;
      }
      const dateObj =
        typeof val === 'string' ? dayjs(val).toDate() : val instanceof Date ? val : null;
      const dateString = dayjs(val as string | Date).format('YYYY-MM-DD');
      onChange(dateString, dateObj);
    };

    return (
      <MantineProvider defaultColorScheme="auto">
        <div className={cn('relative w-full', className)}>
          <DatePickerInput
            ref={ref}
            value={parsedDate}
            onChange={(val) => handleChange(val)}
            valueFormat={valueFormat}
            placeholder={placeholder}
            maxLevel={maxLevel}
            clearable={clearable}
            maxDate={maxDate}
            minDate={minDate}
            disabled={disabled}
            popoverProps={{
              withinPortal: false,
              zIndex: 1000,
              shadow: 'md',
              ...popoverProps,
            }}
            styles={{
              input: {
                height: '2.375rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: error ? 'var(--destructive)' : 'var(--border)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
              },
              calendarHeaderLevel: {
                fontWeight: 600,
                cursor: 'pointer',
              },
              calendarHeaderControl: {
                cursor: 'pointer',
              },
              day: {
                cursor: 'pointer',
              },
              ...styles,
            }}
            {...props}
          />
        </div>
      </MantineProvider>
    );
  },
);

DatePicker.displayName = 'DatePicker';
export { CalendarIcon };

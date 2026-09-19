import {
  DateInput as MantineDateInput,
  DatePickerInput as MantineDatePickerInput,
  type DateInputProps as MantineDateInputProps,
  type DatePickerInputProps as MantineDatePickerInputProps,
  type DateValue,
} from '@mantine/dates';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { parseDate, toDateInputValue } from '@/utils/date';
import { SafeMantineWrapper } from '@components/ui/calendar';

export { CalendarIcon };
export { MantineDatePickerInput as DatePickerInput, MantineDateInput as DateInput };
export type {
  MantineDatePickerInputProps as DatePickerInputProps,
  MantineDateInputProps as DateInputProps,
};

export interface DatePickerProps extends Omit<
  MantineDatePickerInputProps,
  'value' | 'onChange' | 'error'
> {
  value?: string | Date | null;
  onChange?: (dateString: string, date: Date | null) => void;
  error?: React.ReactNode;
  format?: string;
  triggerClassName?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      valueFormat = 'DD/MM/YYYY',
      format: formatProp,
      placeholder = 'DD/MM/YYYY',
      clearable = true,
      leftSection,
      minDate,
      maxDate,
      error,
      dropdownType = 'popover',
      popoverProps,
      triggerClassName,
      ...props
    },
    ref,
  ) => {
    const parsedValue = React.useMemo(() => parseDate(value), [value]);
    const activeFormat = formatProp || valueFormat;

    const handleChange = (val: DateValue) => {
      const str = val ? toDateInputValue(val) : '';
      onChange?.(str, parseDate(val));
    };

    return (
      <SafeMantineWrapper>
        <MantineDatePickerInput
          ref={ref}
          value={parsedValue}
          onChange={handleChange}
          valueFormat={activeFormat}
          placeholder={placeholder}
          clearable={clearable}
          clearButtonProps={{
            'aria-label': 'Clear value',
            ...props.clearButtonProps,
          }}
          leftSection={leftSection || <CalendarIcon className="size-4 text-[#FF4500]" />}
          minDate={parseDate(minDate) || undefined}
          maxDate={parseDate(maxDate) || undefined}
          error={typeof error === 'boolean' ? (error ? true : undefined) : error}
          dropdownType={dropdownType}
          classNames={
            triggerClassName
              ? {
                  input: triggerClassName,
                  ...(typeof props.classNames === 'object' ? props.classNames : {}),
                }
              : props.classNames
          }
          popoverProps={{
            shadow: 'md',
            withinPortal:
              process.env.NODE_ENV === 'test' ? false : (popoverProps?.withinPortal ?? true),
            zIndex: 9999,
            ...popoverProps,
          }}
          {...props}
        />
      </SafeMantineWrapper>
    );
  },
);

DatePicker.displayName = 'DatePicker';

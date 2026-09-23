import {
  Button,
  Group,
  MantineContext,
  MantineProvider,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  DatePicker as MantineDatePicker,
  DatePickerInput as MantineDatePickerInput,
  type DatePickerInputProps as MantineDatePickerInputProps,
  type DateValue,
} from '@mantine/dates';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import * as React from 'react';

import { theme as calendarBrandTheme } from '@/theme';
import { formatDate, formatDateRange, parseDate, toDateInputValue } from '@/utils/date';

export function SafeMantineWrapper({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(MantineContext);
  if (!ctx) {
    return <MantineProvider theme={calendarBrandTheme}>{children}</MantineProvider>;
  }
  return <>{children}</>;
}

export { calendarBrandTheme, formatDate, formatDateRange, parseDate, toDateInputValue };

export type CalendarMode = 'single' | 'range' | 'multiple' | 'default';

export interface CalendarPreset {
  label: string;
  value: Date | [Date, Date] | Date[];
}

export interface BaseCalendarProps {
  className?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  defaultDate?: Date | string;
  date?: Date | string;
  onDateChange?: (date: Date) => void;
  numberOfColumns?: number;
  disabledDates?: (date: Date) => boolean;
  excludeDate?: (date: Date) => boolean;
  withPresets?: boolean;
  presets?: CalendarPreset[];
  withActions?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hideOutsideDates?: boolean;
}

export interface SingleCalendarProps extends BaseCalendarProps {
  mode?: 'default' | 'single';
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null, dateString: string) => void;
  allowDeselect?: boolean;
}

export interface RangeCalendarProps extends BaseCalendarProps {
  mode: 'range';
  value?: [Date | string | null, Date | string | null];
  defaultValue?: [Date | string | null, Date | string | null];
  onChange?: (range: [Date | null, Date | null], rangeStrings: [string, string]) => void;
  allowSingleDateInRange?: boolean;
}

export interface MultipleCalendarProps extends BaseCalendarProps {
  mode: 'multiple';
  value?: (Date | string)[];
  defaultValue?: (Date | string)[];
  onChange?: (dates: Date[], dateStrings: string[]) => void;
}

export type CalendarProps = SingleCalendarProps | RangeCalendarProps | MultipleCalendarProps;

export function getDefaultPresets(mode: CalendarMode): CalendarPreset[] {
  const today = new Date();
  if (mode === 'range') {
    return [
      { label: 'Today', value: [today, today] },
      {
        label: 'Yesterday',
        value: [dayjs().subtract(1, 'day').toDate(), dayjs().subtract(1, 'day').toDate()],
      },
      {
        label: 'Last 7 Days',
        value: [dayjs().subtract(6, 'day').toDate(), today],
      },
      {
        label: 'Last 30 Days',
        value: [dayjs().subtract(29, 'day').toDate(), today],
      },
      {
        label: 'This Month',
        value: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
      },
      {
        label: 'Last Month',
        value: [
          dayjs().subtract(1, 'month').startOf('month').toDate(),
          dayjs().subtract(1, 'month').endOf('month').toDate(),
        ],
      },
      {
        label: 'Year to Date',
        value: [dayjs().startOf('year').toDate(), today],
      },
    ];
  }

  return [
    { label: 'Today', value: today },
    { label: 'Yesterday', value: dayjs().subtract(1, 'day').toDate() },
    { label: 'Tomorrow', value: dayjs().add(1, 'day').toDate() },
  ];
}

export function Calendar(props: CalendarProps) {
  const {
    className,
    minDate: minDateProp,
    maxDate: maxDateProp,
    defaultDate: defaultDateProp,
    date: dateProp,
    numberOfColumns = 1,
    disabledDates,
    excludeDate,
    withPresets = false,
    presets: customPresets,
    withActions = false,
    onApply,
    onClear,
    size = 'sm',
    hideOutsideDates = false,
  } = props;

  const mode = props.mode || 'default';

  const minDate = React.useMemo(() => parseDate(minDateProp) || undefined, [minDateProp]);
  const maxDate = React.useMemo(() => parseDate(maxDateProp) || undefined, [maxDateProp]);
  const defaultDate = React.useMemo(
    () => parseDate(defaultDateProp) || undefined,
    [defaultDateProp],
  );

  const shouldExcludeDate = React.useCallback(
    (date: Date | string) => {
      const d = parseDate(date);
      if (!d) return false;
      if (disabledDates?.(d)) return true;
      if (excludeDate?.(d)) return true;
      return false;
    },
    [disabledDates, excludeDate],
  );

  const presets = React.useMemo(() => {
    if (!withPresets) return [];
    return customPresets || getDefaultPresets(mode);
  }, [withPresets, customPresets, mode]);

  const handleSingleChange = (val: DateValue) => {
    const singleProps = props as SingleCalendarProps;
    const str = val ? toDateInputValue(val) : '';
    singleProps.onChange?.(parseDate(val), str);
  };

  const handleRangeChange = (val: [DateValue, DateValue]) => {
    const rangeProps = props as RangeCalendarProps;
    const rangeStrings: [string, string] = [
      val[0] ? toDateInputValue(val[0]) : '',
      val[1] ? toDateInputValue(val[1]) : '',
    ];
    rangeProps.onChange?.([parseDate(val[0]), parseDate(val[1])], rangeStrings);
  };

  const handleMultipleChange = (val: DateValue[]) => {
    const multiProps = props as MultipleCalendarProps;
    const dates: Date[] = [];
    for (const d of val) {
      const parsed = parseDate(d);
      if (parsed) {
        dates.push(parsed);
      }
    }
    const strings = dates.map((d) => toDateInputValue(d));
    multiProps.onChange?.(dates, strings);
  };

  const handleApplyClick = () => {
    onApply?.();
  };

  const handleClearClick = () => {
    if (mode === 'range') {
      (props as RangeCalendarProps).onChange?.([null, null], ['', '']);
    } else if (mode === 'multiple') {
      (props as MultipleCalendarProps).onChange?.([], []);
    } else {
      (props as SingleCalendarProps).onChange?.(null, '');
    }
    onClear?.();
  };

  const renderPresets = () => {
    if (!withPresets || presets.length === 0) return null;
    return (
      <div className="border-border/70 mr-3 flex min-w-[120px] flex-col gap-1 border-r pr-3">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" className="px-2 pb-1">
          Presets
        </Text>
        {presets.map((preset) => (
          <UnstyledButton
            key={preset.label}
            onClick={() => {
              if (mode === 'range' && Array.isArray(preset.value) && preset.value.length === 2) {
                handleRangeChange([preset.value[0], preset.value[1]]);
              } else if (mode === 'multiple' && Array.isArray(preset.value)) {
                handleMultipleChange(preset.value);
              } else if (!Array.isArray(preset.value)) {
                handleSingleChange(preset.value);
              }
            }}
            className="text-foreground rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-orange-500/10 hover:text-[#FF4500] dark:hover:bg-orange-950/40"
          >
            {preset.label}
          </UnstyledButton>
        ))}
      </div>
    );
  };

  const renderActions = () => {
    if (!withActions) return null;
    return (
      <Group justify="flex-end" gap="xs" className="border-border/70 mt-2 border-t pt-3">
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          onClick={handleClearClick}
          className="cursor-pointer"
        >
          Clear
        </Button>
        <Button
          variant="filled"
          color="orange"
          size="xs"
          onClick={handleApplyClick}
          className="cursor-pointer bg-[#FF4500] hover:bg-[#FF4500]/90"
        >
          Apply
        </Button>
      </Group>
    );
  };

  return (
    <SafeMantineWrapper>
      <div
        className={`border-border bg-card text-card-foreground inline-flex flex-col rounded-xl border p-3 shadow-sm ${
          className || ''
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {renderPresets()}
          <div className="flex-1">
            {mode === 'range' ? (
              <MantineDatePicker
                type="range"
                value={
                  (props as RangeCalendarProps).value
                    ? [
                        parseDate((props as RangeCalendarProps).value?.[0]),
                        parseDate((props as RangeCalendarProps).value?.[1]),
                      ]
                    : undefined
                }
                defaultValue={
                  (props as RangeCalendarProps).defaultValue
                    ? [
                        parseDate((props as RangeCalendarProps).defaultValue?.[0]),
                        parseDate((props as RangeCalendarProps).defaultValue?.[1]),
                      ]
                    : undefined
                }
                onChange={handleRangeChange}
                numberOfColumns={numberOfColumns}
                minDate={minDate}
                maxDate={maxDate}
                defaultDate={defaultDate}
                date={dateProp ? parseDate(dateProp) || undefined : undefined}
                excludeDate={shouldExcludeDate}
                hideOutsideDates={hideOutsideDates}
                size={size}
              />
            ) : mode === 'multiple' ? (
              <MantineDatePicker
                type="multiple"
                value={
                  Array.isArray((props as MultipleCalendarProps).value)
                    ? ((props as MultipleCalendarProps).value ?? [])
                        .map((d) => parseDate(d))
                        .filter((d): d is Date => d !== null)
                    : undefined
                }
                defaultValue={
                  Array.isArray((props as MultipleCalendarProps).defaultValue)
                    ? ((props as MultipleCalendarProps).defaultValue ?? [])
                        .map((d) => parseDate(d))
                        .filter((d): d is Date => d !== null)
                    : undefined
                }
                onChange={(val) => handleMultipleChange(val)}
                numberOfColumns={numberOfColumns}
                minDate={minDate}
                maxDate={maxDate}
                defaultDate={defaultDate}
                date={dateProp ? parseDate(dateProp) || undefined : undefined}
                excludeDate={shouldExcludeDate}
                hideOutsideDates={hideOutsideDates}
                size={size}
              />
            ) : (
              <MantineDatePicker
                type="default"
                value={parseDate((props as SingleCalendarProps).value)}
                defaultValue={parseDate((props as SingleCalendarProps).defaultValue) || undefined}
                onChange={handleSingleChange}
                allowDeselect={(props as SingleCalendarProps).allowDeselect}
                numberOfColumns={numberOfColumns}
                minDate={minDate}
                maxDate={maxDate}
                defaultDate={defaultDate}
                date={dateProp ? parseDate(dateProp) || undefined : undefined}
                excludeDate={shouldExcludeDate}
                hideOutsideDates={hideOutsideDates}
                size={size}
              />
            )}
          </div>
        </div>
        {renderActions()}
      </div>
    </SafeMantineWrapper>
  );
}

export interface CalendarPickerProps extends Omit<
  MantineDatePickerInputProps,
  'value' | 'onChange'
> {
  value?: Date | string | null;
  onChange?: (date: Date | null, dateString: string) => void;
  format?: string;
}

export const CalendarPicker = React.forwardRef<HTMLButtonElement, CalendarPickerProps>(
  (
    {
      value,
      onChange,
      format: formatProp,
      valueFormat = 'DD MMM YYYY',
      placeholder = 'Pick a date',
      clearable = true,
      leftSection,
      minDate,
      maxDate,
      ...props
    },
    ref,
  ) => {
    const parsedValue = React.useMemo(() => parseDate(value), [value]);
    const activeFormat = formatProp || valueFormat;

    const handleChange = (val: DateValue) => {
      const str = val ? toDateInputValue(val) : '';
      onChange?.(parseDate(val), str);
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
          popoverProps={{
            shadow: 'md',
            withinPortal: props.popoverProps?.withinPortal ?? false,
            zIndex: 9999,
            ...props.popoverProps,
          }}
          {...props}
        />
      </SafeMantineWrapper>
    );
  },
);

CalendarPicker.displayName = 'CalendarPicker';

export interface DateRangePickerProps extends Omit<
  MantineDatePickerInputProps<'range'>,
  'value' | 'onChange' | 'type'
> {
  value?: [Date | string | null, Date | string | null];
  onChange?: (range: [Date | null, Date | null], rangeStrings: [string, string]) => void;
  format?: string;
  labelSeparator?: string;
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      value,
      onChange,
      format: formatProp,
      valueFormat = 'DD MMM YYYY',
      placeholder = 'Pick dates range',
      clearable = true,
      leftSection,
      minDate,
      maxDate,
      labelSeparator = ' - ',
      ...props
    },
    ref,
  ) => {
    const parsedRange = React.useMemo((): [DateValue, DateValue] => {
      if (!value) return [null, null];
      return [parseDate(value[0]), parseDate(value[1])];
    }, [value]);

    const activeFormat = formatProp || valueFormat;

    const handleChange = (range: [DateValue, DateValue]) => {
      const strings: [string, string] = [
        range[0] ? toDateInputValue(range[0]) : '',
        range[1] ? toDateInputValue(range[1]) : '',
      ];
      onChange?.([parseDate(range[0]), parseDate(range[1])], strings);
    };

    return (
      <SafeMantineWrapper>
        <MantineDatePickerInput
          ref={ref}
          type="range"
          value={parsedRange}
          onChange={handleChange}
          valueFormat={activeFormat}
          labelSeparator={labelSeparator}
          placeholder={placeholder}
          clearable={clearable}
          clearButtonProps={{
            'aria-label': 'Clear value',
            ...props.clearButtonProps,
          }}
          leftSection={leftSection || <CalendarIcon className="size-4 text-[#FF4500]" />}
          minDate={parseDate(minDate) || undefined}
          maxDate={parseDate(maxDate) || undefined}
          popoverProps={{
            shadow: 'md',
            withinPortal:
              process.env.NODE_ENV === 'test' ? false : (props.popoverProps?.withinPortal ?? true),
            zIndex: 9999,
            ...props.popoverProps,
          }}
          {...props}
        />
      </SafeMantineWrapper>
    );
  },
);

DateRangePicker.displayName = 'DateRangePicker';

export interface CalendarModalOptions {
  title?: string;
  value?: Date | string | null;
  minDate?: Date | string;
  maxDate?: Date | string;
  onSelect?: (date: Date | null, dateString: string) => void;
}

export function openCalendarModal(options: CalendarModalOptions) {
  const modalId = `calendar-modal-${Date.now()}`;
  let selectedDate: Date | null = parseDate(options.value) || null;

  modals.open({
    modalId,
    title: (
      <Group gap="xs">
        <CalendarIcon className="size-4 text-[#FF4500]" />
        <Text fw={600} size="sm">
          {options.title || 'Select Date'}
        </Text>
      </Group>
    ),
    centered: true,
    radius: 'md',
    children: (
      <Stack gap="md" align="center" pt="xs">
        <MantineDatePicker
          value={selectedDate}
          onChange={(val) => {
            selectedDate = parseDate(val);
          }}
          minDate={parseDate(options.minDate) || undefined}
          maxDate={parseDate(options.maxDate) || undefined}
          size="sm"
        />
        <Group justify="flex-end" w="100%" gap="xs" pt="sm">
          <Button
            variant="default"
            size="xs"
            onClick={() => modals.close(modalId)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="orange"
            size="xs"
            onClick={() => {
              const str = selectedDate ? toDateInputValue(selectedDate) : '';
              options.onSelect?.(selectedDate, str);
              modals.close(modalId);
            }}
            className="cursor-pointer bg-[#FF4500] hover:bg-[#FF4500]/90"
            leftSection={<Check className="size-3.5" />}
          >
            Confirm
          </Button>
        </Group>
      </Stack>
    ),
  });
}

export interface DateRangeModalOptions {
  title?: string;
  value?: [Date | string | null, Date | string | null];
  minDate?: Date | string;
  maxDate?: Date | string;
  onSelect?: (range: [Date | null, Date | null], rangeStrings: [string, string]) => void;
}

export function openDateRangeModal(options: DateRangeModalOptions) {
  const modalId = `date-range-modal-${Date.now()}`;
  let selectedRange: [DateValue, DateValue] = [
    parseDate(options.value?.[0]),
    parseDate(options.value?.[1]),
  ];

  modals.open({
    modalId,
    title: (
      <Group gap="xs">
        <CalendarIcon className="size-4 text-[#FF4500]" />
        <Text fw={600} size="sm">
          {options.title || 'Select Date Range'}
        </Text>
      </Group>
    ),
    centered: true,
    radius: 'md',
    children: (
      <Stack gap="md" align="center" pt="xs">
        <MantineDatePicker
          type="range"
          value={selectedRange}
          onChange={(range) => {
            selectedRange = range;
          }}
          minDate={parseDate(options.minDate) || undefined}
          maxDate={parseDate(options.maxDate) || undefined}
          size="sm"
        />
        <Group justify="flex-end" w="100%" gap="xs" pt="sm">
          <Button
            variant="default"
            size="xs"
            onClick={() => modals.close(modalId)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="orange"
            size="xs"
            onClick={() => {
              const strings: [string, string] = [
                selectedRange[0] ? toDateInputValue(selectedRange[0]) : '',
                selectedRange[1] ? toDateInputValue(selectedRange[1]) : '',
              ];
              options.onSelect?.(
                [parseDate(selectedRange[0]), parseDate(selectedRange[1])],
                strings,
              );
              modals.close(modalId);
            }}
            className="cursor-pointer bg-[#FF4500] hover:bg-[#FF4500]/90"
            leftSection={<Check className="size-3.5" />}
          >
            Confirm
          </Button>
        </Group>
      </Stack>
    ),
  });
}

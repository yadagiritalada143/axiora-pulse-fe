import { createTheme } from '@mantine/core';

import { orangeBrand } from './colors';
import { typography } from './typography';

export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: orangeBrand,
  },
  defaultRadius: 'md',
  fontFamily: typography.fontFamily,
  headings: {
    fontFamily: typography.fontFamily,
  },
  components: {
    DatePickerInput: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    },
    DatePicker: {
      defaultProps: {
        size: 'sm',
      },
    },
    Calendar: {
      defaultProps: {
        size: 'sm',
      },
    },
    DateInput: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
    },
  },
});

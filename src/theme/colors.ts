import type { MantineColorsTuple } from '@mantine/core';

export const orangeBrand: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff922b',
  '#fd7e14',
  '#FF4500',
  '#e8590c',
  '#d9480f',
];

export const colors = {
  primary: 'var(--app-primary, #FF4500)',
  secondary: 'var(--app-accent, #ff7537)',
  success: 'var(--app-success, #22c55e)',
  warning: 'var(--app-warning, #f59e0b)',
  error: 'var(--app-danger, #ef4444)',
  gray: 'var(--app-text-muted, #71717a)',
  background: 'var(--app-bg, #ffffff)',
  white: 'var(--app-surface, #ffffff)',
} as const;

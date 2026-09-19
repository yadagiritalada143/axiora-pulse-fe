export const token = {
  bg: 'var(--app-bg)',
  surface: 'var(--app-surface)',
  surface2: 'var(--app-surface-2)',
  surfaceHover: 'var(--app-surface-hover)',
  border: 'var(--app-border)',
  text: 'var(--app-text)',
  textMuted: 'var(--app-text-muted)',

  primary: 'var(--app-primary)',
  primaryHover: 'var(--app-primary-hover)',

  accent: 'var(--app-accent)',
  accentFg: 'var(--app-accent-fg)',
  accentSoft: 'var(--app-accent-soft)',

  success: 'var(--app-success)',
  warning: 'var(--app-warning)',
  danger: 'var(--app-danger)',

  brandGradient: 'var(--app-brand-gradient)',
  brandOn: 'var(--app-brand-on)',
  overlay: 'var(--app-overlay)',
  glassBg: 'var(--app-glass-bg)',
  glassBorder: 'var(--app-glass-border)',
} as const;

export type ColorToken = keyof typeof token;

/**
 * Phonon UI - Theme Definitions
 */

export interface PhononThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
  // Nature accents
  sage: string;
  lake: string;
  warm: string;
  charcoal: string;
}

export interface PhononThemeTypography {
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}

export interface PhononThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface PhononTheme {
  name: string;
  colors: PhononThemeColors;
  typography: PhononThemeTypography;
  spacing: PhononThemeSpacing;
  radius: string;
}

/**
 * Swiss Dark Theme (Default)
 */
export const swissTheme: PhononTheme = {
  name: 'swiss',
  colors: {
    background: '220 12% 10%',
    foreground: '40 15% 88%',
    primary: '40 18% 82%',
    primaryForeground: '220 12% 12%',
    secondary: '35 10% 55%',
    secondaryForeground: '40 15% 88%',
    muted: '220 10% 16%',
    mutedForeground: '40 8% 55%',
    accent: '20 25% 48%',
    accentForeground: '40 15% 88%',
    card: '220 10% 12%',
    cardForeground: '40 15% 88%',
    border: '220 8% 22%',
    input: '220 10% 18%',
    ring: '150 22% 42%',
    sage: '150 22% 42%',
    lake: '200 25% 45%',
    warm: '35 35% 65%',
    charcoal: '220 12% 14%',
  },
  typography: {
    fontDisplay: "'Space Grotesk', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    fontMono: "'IBM Plex Mono', 'SF Mono', monospace",
  },
  spacing: {
    xs: '0.382rem',
    sm: '0.618rem',
    md: '1rem',
    lg: '1.618rem',
    xl: '2.618rem',
    '2xl': '4.236rem',
    '3xl': '6.854rem',
  },
  radius: '0.5rem',
};

/**
 * Swiss Light Theme
 */
export const swissLightTheme: PhononTheme = {
  name: 'swiss-light',
  colors: {
    background: '42 18% 95%',
    foreground: '220 12% 15%',
    primary: '220 12% 18%',
    primaryForeground: '40 15% 92%',
    secondary: '35 12% 78%',
    secondaryForeground: '220 12% 15%',
    muted: '40 12% 90%',
    mutedForeground: '220 8% 40%',
    accent: '20 28% 42%',
    accentForeground: '40 15% 92%',
    card: '42 16% 97%',
    cardForeground: '220 12% 15%',
    border: '40 10% 85%',
    input: '40 10% 88%',
    ring: '150 22% 42%',
    sage: '150 25% 38%',
    lake: '200 28% 42%',
    warm: '35 40% 55%',
    charcoal: '220 12% 86%',
  },
  typography: swissTheme.typography,
  spacing: swissTheme.spacing,
  radius: swissTheme.radius,
};

/**
 * Minimal Theme (Black & White)
 */
export const minimalTheme: PhononTheme = {
  name: 'minimal',
  colors: {
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    primary: '0 0% 100%',
    primaryForeground: '0 0% 0%',
    secondary: '0 0% 20%',
    secondaryForeground: '0 0% 100%',
    muted: '0 0% 10%',
    mutedForeground: '0 0% 60%',
    accent: '0 0% 30%',
    accentForeground: '0 0% 100%',
    card: '0 0% 5%',
    cardForeground: '0 0% 100%',
    border: '0 0% 20%',
    input: '0 0% 15%',
    ring: '0 0% 50%',
    sage: '0 0% 40%',
    lake: '0 0% 50%',
    warm: '0 0% 60%',
    charcoal: '0 0% 10%',
  },
  typography: {
    fontDisplay: "'Helvetica Neue', 'Arial', sans-serif",
    fontBody: "'Helvetica Neue', 'Arial', sans-serif",
    fontMono: "'SF Mono', 'Monaco', monospace",
  },
  spacing: swissTheme.spacing,
  radius: '0',
};

/**
 * All built-in themes
 */
export const themes = {
  swiss: swissTheme,
  swissLight: swissLightTheme,
  minimal: minimalTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Phonon UI - Design DNA System
 *
 * Chromatic coupling and visual hierarchy tokens.
 * Every element has a defined role and visual weight.
 */

// ============================================
// COLOR TOKENS - Light Theme
// ============================================
export const COLORS_LIGHT = {
  // Text hierarchy (darkest to lightest)
  text: {
    primary: '#0a0a0a',      // Headlines, H1-H2 - MAXIMUM contrast
    secondary: '#1a1a1a',    // H3-H4, body text
    tertiary: '#2d2d2d',     // Captions, labels
    muted: '#4a4a4a',        // Placeholder, disabled
    inverse: '#fafafa',      // Text on dark backgrounds
  },

  // Backgrounds
  bg: {
    paper: '#f4f1ea',        // Newspaper cream
    card: '#faf9f7',         // Elevated surfaces
    muted: '#e8e5de',        // Subtle backgrounds
    inverse: '#0a0a0a',      // Dark mode base
  },

  // Accents
  accent: {
    primary: '#4a7c59',      // Sage green (CTA)
    secondary: '#6b8e7a',    // Light sage
    border: '#2f2f2f',       // Lines, dividers
    borderLight: '#d1cdc4',  // Subtle borders
  },
} as const;

// ============================================
// COLOR TOKENS - Dark Theme
// ============================================
export const COLORS_DARK = {
  text: {
    primary: '#fafafa',
    secondary: '#e8e8e8',
    tertiary: '#b0b0b0',
    muted: '#707070',
    inverse: '#0a0a0a',
  },
  bg: {
    paper: '#0f0f0f',
    card: '#1a1a1a',
    muted: '#252525',
    inverse: '#fafafa',
  },
  accent: {
    primary: '#6b9b7a',
    secondary: '#4a7c59',
    border: '#444444',
    borderLight: '#333333',
  },
} as const;

// ============================================
// TYPOGRAPHY DNA
// ============================================
export const TYPOGRAPHY = {
  // Font families by role
  family: {
    display: "'Playfair Display', Georgia, serif",    // Headlines, quotes
    body: "'Droid Serif', Georgia, serif",            // Body text
    sans: "'Space Grotesk', 'Inter', sans-serif",     // UI elements
    mono: "'IBM Plex Mono', monospace",               // Code
  },

  // Font weights by function
  weight: {
    headline: 700,      // H1, H2
    subhead: 600,       // H3, H4
    body: 400,          // Paragraph text
    bold: 700,          // Emphasis
    caption: 400,       // Small text
  },

  // Font sizes (rem) - PHI based
  size: {
    hero: '4.236rem',     // φ⁴
    h1: '2.618rem',       // φ²
    h2: '1.618rem',       // φ
    h3: '1.25rem',
    h4: '1rem',
    body: '1rem',
    caption: '0.875rem',
    small: '0.75rem',
  },

  // Line heights
  leading: {
    tight: 1.1,           // Headlines
    snug: 1.25,           // Subheads
    normal: 1.5,          // Body
    relaxed: 1.7,         // Long-form reading
  },
} as const;

// ============================================
// VISUAL ELEMENTS DNA
// ============================================
export const ELEMENTS = {
  // Lines and borders
  lines: {
    vertical: {
      width: '1px',
      color: 'var(--dna-border)',
      style: 'solid',
    },
    horizontal: {
      width: '2px',
      color: 'var(--dna-border)',
      style: 'solid',
    },
    emphasis: {
      width: '100px',
      color: 'var(--dna-text-primary)',
      style: 'solid',
    },
  },

  // Spacing (PHI based)
  space: {
    xs: '0.382rem',   // 1/φ²
    sm: '0.618rem',   // 1/φ
    md: '1rem',       // Base
    lg: '1.618rem',   // φ
    xl: '2.618rem',   // φ²
    xxl: '4.236rem',  // φ³
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
  },
} as const;

// ============================================
// HIERARCHY RULES
// ============================================
export const HIERARCHY = {
  // Each element type has defined visual properties
  headline: {
    h1: { color: 'primary', weight: 'headline', size: 'h1', leading: 'tight' },
    h2: { color: 'primary', weight: 'headline', size: 'h2', leading: 'tight' },
    h3: { color: 'secondary', weight: 'subhead', size: 'h3', leading: 'snug' },
    h4: { color: 'secondary', weight: 'subhead', size: 'h4', leading: 'snug' },
  },
  text: {
    body: { color: 'secondary', weight: 'body', size: 'body', leading: 'relaxed' },
    caption: { color: 'tertiary', weight: 'caption', size: 'caption', leading: 'normal' },
    quote: { color: 'secondary', weight: 'body', size: 'h3', leading: 'snug', family: 'display' },
  },
  emphasis: {
    bold: { weight: 'bold' },
    italic: { style: 'italic' },
  },
} as const;

// ============================================
// CSS VARIABLE GENERATOR
// ============================================
export function generateCSSVariables(theme: 'light' | 'dark' = 'light'): string {
  const colors = theme === 'light' ? COLORS_LIGHT : COLORS_DARK;

  return `
    --dna-text-primary: ${colors.text.primary};
    --dna-text-secondary: ${colors.text.secondary};
    --dna-text-tertiary: ${colors.text.tertiary};
    --dna-text-muted: ${colors.text.muted};
    --dna-text-inverse: ${colors.text.inverse};

    --dna-bg-paper: ${colors.bg.paper};
    --dna-bg-card: ${colors.bg.card};
    --dna-bg-muted: ${colors.bg.muted};
    --dna-bg-inverse: ${colors.bg.inverse};

    --dna-accent-primary: ${colors.accent.primary};
    --dna-accent-secondary: ${colors.accent.secondary};
    --dna-border: ${colors.accent.border};
    --dna-border-light: ${colors.accent.borderLight};
  `.trim();
}

export type Theme = 'light' | 'dark';
export type TextRole = keyof typeof COLORS_LIGHT.text;
export type ElementRole = keyof typeof HIERARCHY;

// ============================================
// RENDERING INSTRUCTIONS (LLM Routines)
// ============================================

/**
 * Text rendering rules that can be passed to LLM
 * as "action routines" for how to render content.
 */
export interface RenderingInstructions {
  // Text flow rules
  wordsPerLine?: {
    min: number;
    max: number;
    target: number;
  };

  // Line breaking rules
  lineBreaking?: {
    avoidOrphans: boolean;      // Avoid single words on last line
    avoidWidows: boolean;       // Avoid single words at top
    balanceLines: boolean;      // Even out line lengths
  };

  // Element-specific rules
  citations?: {
    wordsPerLine: number;       // Target 4-6 words per line
    maxLines: number;           // Max lines before truncate
    style: 'centered' | 'left' | 'indented';
  };

  headlines?: {
    maxWordsPerLine: number;    // e.g., 3-4 for impact
    breakAtPunctuation: boolean;
  };

  body?: {
    targetLineLength: number;   // Characters per line (45-75 ideal)
    paragraphSpacing: 'tight' | 'normal' | 'relaxed';
  };
}

// Default rendering instructions
export const DEFAULT_RENDERING: RenderingInstructions = {
  wordsPerLine: {
    min: 3,
    max: 8,
    target: 5,
  },
  lineBreaking: {
    avoidOrphans: true,
    avoidWidows: true,
    balanceLines: true,
  },
  citations: {
    wordsPerLine: 5,
    maxLines: 6,
    style: 'centered',
  },
  headlines: {
    maxWordsPerLine: 4,
    breakAtPunctuation: true,
  },
  body: {
    targetLineLength: 65,
    paragraphSpacing: 'normal',
  },
};

// Preset configurations
export const RENDERING_PRESETS = {
  newspaper: {
    ...DEFAULT_RENDERING,
    citations: { wordsPerLine: 5, maxLines: 4, style: 'centered' as const },
    headlines: { maxWordsPerLine: 3, breakAtPunctuation: true },
  },

  magazine: {
    ...DEFAULT_RENDERING,
    citations: { wordsPerLine: 6, maxLines: 5, style: 'indented' as const },
    body: { targetLineLength: 55, paragraphSpacing: 'relaxed' as const },
  },

  book: {
    ...DEFAULT_RENDERING,
    citations: { wordsPerLine: 8, maxLines: 8, style: 'left' as const },
    body: { targetLineLength: 70, paragraphSpacing: 'tight' as const },
  },
} as const;

/**
 * Generate LLM prompt instructions from rendering config
 */
export function generateLLMInstructions(config: RenderingInstructions): string {
  const instructions: string[] = [];

  if (config.citations) {
    instructions.push(
      `For pull quotes/citations: aim for ${config.citations.wordsPerLine} words per line, ` +
      `maximum ${config.citations.maxLines} lines, ${config.citations.style} alignment.`
    );
  }

  if (config.headlines) {
    instructions.push(
      `For headlines: maximum ${config.headlines.maxWordsPerLine} words per line for impact.`
    );
  }

  if (config.lineBreaking) {
    if (config.lineBreaking.avoidOrphans) {
      instructions.push('Avoid orphans (single words on last line).');
    }
    if (config.lineBreaking.balanceLines) {
      instructions.push('Balance line lengths for visual harmony.');
    }
  }

  return instructions.join(' ');
}

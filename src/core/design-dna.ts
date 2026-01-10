/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PHONON UI - DESIGN DNA SYSTEM                                            ║
 * ║  Unified Theory: Physics + Biology + Optics + Linguistics + Manufacturing ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Everything is one: phonons are quanta of vibration in solids.
 * This framework treats UI elements as physical entities governed by:
 *
 *   PHYSICS    → Collision detection, boundaries, forces (from games/architecture)
 *   BIOLOGY    → DNA, growth hierarchy, evolution (from genetics)
 *   OPTICS     → Color coupling, contrast, perception (from physics)
 *   LINGUISTICS → Semantic structure, grammar of layout (from language)
 *   MANUFACTURING → Assembly line, QA departments, quality control (from industry)
 *
 * GROWTH HIERARCHY (like a flower):
 *   Layer 0: TERRAIN   → Viewport, the world exists here
 *   Layer 1: WALLS     → Collision boxes, nothing passes through
 *   Layer 2: STEMS     → Vertical/horizontal support structures (columns, dividers)
 *   Layer 3: PETALS    → Content (text, images, quotes)
 *   Layer 4: POLLEN    → Decorations (shadows, accents) - only if space allows
 */

// ════════════════════════════════════════════════════════════════════════════
// PART I: PHYSICS ENGINE
// Borrowed from game engines and architecture - constraints that cannot be violated
// ════════════════════════════════════════════════════════════════════════════

/**
 * COLLISION BOUNDS
 * Like in games: a character cannot walk through walls.
 * Content cannot overflow its container.
 */
export interface CollisionBounds {
  /** Minimum size - cannot shrink below this (px or relative) */
  min: number | 'content' | 'auto';
  /** Maximum size - cannot grow beyond this */
  max: number | 'content' | 'auto' | 'container' | 'viewport' | 'infinite';
  /** Can this element compress under pressure? */
  elastic: boolean;
  /** Compression ratio if elastic (0-1, where 1 = fully compressible) */
  elasticity?: number;
}

/**
 * PHYSICAL FORCES
 * Elements interact with forces like gravity (content weight) and pressure (overflow)
 */
export interface PhysicalForces {
  /** Does content "push" outward? (like text wanting more space) */
  internalPressure: 'none' | 'low' | 'medium' | 'high';
  /** How does element respond to external pressure? */
  resistsCompression: boolean;
  /** Does element "attract" other elements? (for alignment) */
  magnetism: 'none' | 'weak' | 'strong';
}

/**
 * OVERFLOW BEHAVIOR
 * What happens when content hits the wall?
 */
export type OverflowBehavior =
  | 'block'      // Hard stop - content is cut (like a wall)
  | 'wrap'       // Content flows to next line (like water around obstacle)
  | 'compress'   // Element shrinks to fit (elastic)
  | 'scroll'     // Creates viewport into larger space (portal)
  | 'hyphenate'; // Breaks words at syllables (controlled fracture)

// ════════════════════════════════════════════════════════════════════════════
// PART II: BIOLOGICAL DNA
// Each element has a genetic code that defines its nature and behavior
// ════════════════════════════════════════════════════════════════════════════

/**
 * ELEMENT TYPE
 * The fundamental nature of an element in the growth hierarchy
 */
export type ElementType =
  | 'terrain'  // Layer 0: The viewport itself
  | 'wall'     // Layer 1: Collision boundaries (containers)
  | 'stem'     // Layer 2: Support structures (columns, dividers)
  | 'petal'    // Layer 3: Content (text, images)
  | 'pollen';  // Layer 4: Decorations (shadows, accents)

/**
 * AXIS ORIENTATION
 * The primary direction of an element
 */
export type Axis = 'vertical' | 'horizontal' | 'both' | 'none';

/**
 * DNA STRUCTURE
 * The complete genetic code of an element
 */
export interface ElementDNA {
  // ─── IDENTITY ───
  /** What type of element is this? */
  type: ElementType;
  /** Element identifier for reference */
  label: string;
  /** Primary axis orientation */
  axis: Axis;

  // ─── PHYSICS (from games/architecture) ───
  /** Collision bounds - the walls */
  bounds: {
    width: CollisionBounds;
    height: CollisionBounds;
  };
  /** Physical forces acting on/from element */
  forces: PhysicalForces;
  /** What happens when overflow occurs */
  overflow: {
    x: OverflowBehavior;
    y: OverflowBehavior;
  };

  // ─── BIOLOGY (growth and relationships) ───
  /** Growth order - lower numbers grow first (like stem before petal) */
  growthOrder: number;
  /** What element types can this contain? */
  canContain: ElementType[];
  /** What element types can contain this? */
  containedBy: ElementType[];
  /** Can this element be broken/split? */
  breakable: boolean;
  /** If breakable, what are the rules? */
  breakRules?: {
    /** Minimum units before break */
    minBeforeBreak: number;
    /** Minimum units after break */
    minAfterBreak: number;
    /** Preferred break points */
    breakPoints: ('syllable' | 'word' | 'sentence' | 'paragraph' | 'never')[];
  };

  // ─── SEMANTICS (linguistics) ───
  /** The semantic role of this element */
  role: string;
  /** Importance weight (affects what gets cut first under pressure) */
  importance: 1 | 2 | 3 | 4 | 5; // 5 = critical, 1 = decorative

  // ─── OPTICS (visual properties) ───
  /** Default visual properties */
  visuals?: {
    color?: string;
    background?: string;
    border?: string;
    shadow?: string;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PART III: DNA LIBRARY
// The scaffale (shelf) of pieces ready to assemble
// ════════════════════════════════════════════════════════════════════════════

/**
 * TERRAIN DNA
 * The world - Layer 0
 */
export const DNA_TERRAIN: ElementDNA = {
  type: 'terrain',
  label: 'viewport',
  axis: 'both',
  bounds: {
    width: { min: 320, max: 'viewport', elastic: false },
    height: { min: 'content', max: 'infinite', elastic: true },
  },
  forces: {
    internalPressure: 'none',
    resistsCompression: true,
    magnetism: 'none',
  },
  overflow: {
    x: 'block',  // Viewport never scrolls horizontally (golden rule)
    y: 'scroll', // Vertical scroll is allowed
  },
  growthOrder: 0,
  canContain: ['wall', 'stem'],
  containedBy: [],
  breakable: false,
  role: 'viewport',
  importance: 5,
};

/**
 * WALL DNA - Container
 * Collision boundaries - Layer 1
 */
export const DNA_WALL: ElementDNA = {
  type: 'wall',
  label: 'container',
  axis: 'both',
  bounds: {
    width: { min: 280, max: 'container', elastic: true, elasticity: 0.8 },
    height: { min: 'content', max: 'infinite', elastic: true },
  },
  forces: {
    internalPressure: 'medium',
    resistsCompression: true,
    magnetism: 'weak',
  },
  overflow: {
    x: 'block',     // Horizontal overflow is BLOCKED
    y: 'wrap',      // Vertical overflow wraps
  },
  growthOrder: 1,
  canContain: ['stem', 'petal'],
  containedBy: ['terrain'],
  breakable: false,
  role: 'container',
  importance: 5,
};

/**
 * STEM DNA - Vertical Column
 * Support structure - Layer 2
 */
export const DNA_STEM_VERTICAL: ElementDNA = {
  type: 'stem',
  label: 'column',
  axis: 'vertical',
  bounds: {
    width: { min: 140, max: 'container', elastic: true, elasticity: 0.6 },
    height: { min: 'content', max: 'infinite', elastic: true },
  },
  forces: {
    internalPressure: 'low',
    resistsCompression: true,
    magnetism: 'strong', // Columns align to each other
  },
  overflow: {
    x: 'hyphenate', // Text wraps and hyphenates
    y: 'wrap',
  },
  growthOrder: 2,
  canContain: ['petal', 'pollen'],
  containedBy: ['wall', 'terrain'],
  breakable: false, // Column itself doesn't break
  role: 'column',
  importance: 4,
};

/**
 * STEM DNA - Horizontal Divider
 * Support structure - Layer 2
 */
export const DNA_STEM_HORIZONTAL: ElementDNA = {
  type: 'stem',
  label: 'divider',
  axis: 'horizontal',
  bounds: {
    width: { min: 100, max: 'container', elastic: true },
    height: { min: 1, max: 4, elastic: false }, // Lines don't stretch vertically
  },
  forces: {
    internalPressure: 'none',
    resistsCompression: false,
    magnetism: 'weak',
  },
  overflow: {
    x: 'compress',
    y: 'block',
  },
  growthOrder: 2,
  canContain: [],
  containedBy: ['wall', 'stem'],
  breakable: false,
  role: 'separator',
  importance: 3,
};

/**
 * PETAL DNA - Headline
 * Content - Layer 3
 */
export const DNA_PETAL_HEADLINE: ElementDNA = {
  type: 'petal',
  label: 'headline',
  axis: 'horizontal',
  bounds: {
    width: { min: 'content', max: 'container', elastic: true },
    height: { min: 'content', max: 'auto', elastic: true },
  },
  forces: {
    internalPressure: 'high', // Headlines want space
    resistsCompression: true,
    magnetism: 'strong',
  },
  overflow: {
    x: 'wrap',      // Words wrap, but...
    y: 'wrap',
  },
  growthOrder: 3,
  canContain: [],
  containedBy: ['stem', 'wall'],
  breakable: true,
  breakRules: {
    minBeforeBreak: 2,  // At least 2 words before break
    minAfterBreak: 2,   // At least 2 words after
    breakPoints: ['word', 'never'], // NEVER break mid-word
  },
  role: 'headline',
  importance: 5,
};

/**
 * PETAL DNA - Body Text
 * Content - Layer 3
 */
export const DNA_PETAL_BODY: ElementDNA = {
  type: 'petal',
  label: 'body',
  axis: 'horizontal',
  bounds: {
    width: { min: 'content', max: 'container', elastic: true },
    height: { min: 'content', max: 'infinite', elastic: true },
  },
  forces: {
    internalPressure: 'medium',
    resistsCompression: false, // Body text can compress
    magnetism: 'weak',
  },
  overflow: {
    x: 'hyphenate',  // Can hyphenate words
    y: 'wrap',
  },
  growthOrder: 3,
  canContain: ['pollen'],
  containedBy: ['stem', 'wall'],
  breakable: true,
  breakRules: {
    minBeforeBreak: 3,
    minAfterBreak: 3,
    breakPoints: ['syllable', 'word', 'sentence'],
  },
  role: 'body-text',
  importance: 4,
};

/**
 * PETAL DNA - Citation/Quote
 * Content - Layer 3
 */
export const DNA_PETAL_CITATION: ElementDNA = {
  type: 'petal',
  label: 'citation',
  axis: 'horizontal',
  bounds: {
    width: { min: 200, max: 'container', elastic: true, elasticity: 0.4 },
    height: { min: 'content', max: 'auto', elastic: true },
  },
  forces: {
    internalPressure: 'high',
    resistsCompression: true, // Citations resist being squished
    magnetism: 'strong',
  },
  overflow: {
    x: 'wrap',
    y: 'wrap',
  },
  growthOrder: 3,
  canContain: [],
  containedBy: ['stem', 'wall'],
  breakable: true,
  breakRules: {
    minBeforeBreak: 4, // More words per line for readability
    minAfterBreak: 4,
    breakPoints: ['word', 'sentence', 'never'], // Prefer sentence breaks
  },
  role: 'citation',
  importance: 4,
};

/**
 * PETAL DNA - Word (atomic unit)
 * The smallest unbreakable text unit
 */
export const DNA_PETAL_WORD: ElementDNA = {
  type: 'petal',
  label: 'word',
  axis: 'horizontal',
  bounds: {
    width: { min: 'content', max: 'content', elastic: false },
    height: { min: 'content', max: 'content', elastic: false },
  },
  forces: {
    internalPressure: 'high',
    resistsCompression: true, // Words are rigid
    magnetism: 'strong',
  },
  overflow: {
    x: 'block', // Word does NOT break
    y: 'block',
  },
  growthOrder: 4,
  canContain: [],
  containedBy: ['petal'],
  breakable: false, // CRITICAL: Words do not break
  role: 'word',
  importance: 5,
};

/**
 * POLLEN DNA - Border/Accent
 * Decoration - Layer 4
 */
export const DNA_POLLEN_BORDER: ElementDNA = {
  type: 'pollen',
  label: 'border',
  axis: 'both',
  bounds: {
    width: { min: 1, max: 4, elastic: false },
    height: { min: 1, max: 4, elastic: false },
  },
  forces: {
    internalPressure: 'none',
    resistsCompression: false,
    magnetism: 'none',
  },
  overflow: {
    x: 'block',
    y: 'block',
  },
  growthOrder: 5,
  canContain: [],
  containedBy: ['stem', 'petal', 'wall'],
  breakable: true, // Can be removed if no space
  role: 'decoration',
  importance: 1, // First to go under pressure
};

// ════════════════════════════════════════════════════════════════════════════
// PART IV: OPTICS DEPARTMENT
// Color theory, contrast, perception - from physics of light
// ════════════════════════════════════════════════════════════════════════════

/**
 * COLOR COUPLING RULES
 * Based on optical physics - which colors can be adjacent
 */
export interface ColorCoupling {
  /** Minimum contrast ratio (WCAG) */
  minContrast: number;
  /** Complementary color for accents */
  complement?: string;
  /** Safe pairs that always work together */
  safePairs: Array<[string, string]>;
}

/**
 * LIGHT THEME PALETTE
 * Newspaper cream base
 */
export const OPTICS_LIGHT = {
  // Text hierarchy (darkest to lightest)
  text: {
    primary: '#0a0a0a',    // Maximum contrast - headlines
    secondary: '#1a1a1a',  // Body text
    tertiary: '#2d2d2d',   // Captions
    muted: '#4a4a4a',      // Placeholder
    inverse: '#fafafa',    // On dark backgrounds
  },

  // Backgrounds
  bg: {
    paper: '#f4f1ea',      // Newspaper cream
    card: '#faf9f7',       // Elevated surfaces
    muted: '#e8e5de',      // Subtle backgrounds
    inverse: '#0a0a0a',    // Dark mode base
  },

  // Accents
  accent: {
    primary: '#4a7c59',    // Sage green
    secondary: '#6b8e7a',  // Light sage
    border: '#2f2f2f',     // Lines, dividers
    borderLight: '#d1cdc4', // Subtle borders
  },

  // Coupling rules
  coupling: {
    minContrast: 4.5, // WCAG AA
    safePairs: [
      ['#0a0a0a', '#f4f1ea'], // Black on cream
      ['#1a1a1a', '#faf9f7'], // Dark gray on white
      ['#fafafa', '#0a0a0a'], // White on black
    ],
  } as ColorCoupling,
} as const;

/**
 * DARK THEME PALETTE
 */
export const OPTICS_DARK = {
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
  coupling: {
    minContrast: 4.5,
    safePairs: [
      ['#fafafa', '#0f0f0f'],
      ['#e8e8e8', '#1a1a1a'],
    ],
  } as ColorCoupling,
} as const;

// ════════════════════════════════════════════════════════════════════════════
// PART V: LINGUISTICS DEPARTMENT
// Typography, semantic structure, grammar of layout
// ════════════════════════════════════════════════════════════════════════════

/**
 * TYPOGRAPHY DNA
 * Font families, weights, sizes - the language of text
 */
export const LINGUISTICS = {
  // Font families by semantic role
  family: {
    display: "'Playfair Display', Georgia, serif",  // Headlines, quotes
    body: "'Droid Serif', Georgia, serif",          // Body text
    sans: "'Space Grotesk', 'Inter', sans-serif",   // UI elements
    mono: "'IBM Plex Mono', monospace",             // Code
  },

  // Font weights by function
  weight: {
    headline: 700,
    subhead: 600,
    body: 400,
    bold: 700,
    caption: 400,
  },

  // PHI-based scale (Golden Ratio: 1.618)
  scale: {
    hero: 4.236,    // φ³
    h1: 2.618,      // φ²
    h2: 1.618,      // φ
    h3: 1.25,
    h4: 1,
    body: 1,
    caption: 0.875,
    small: 0.75,
  },

  // Line heights (leading)
  leading: {
    tight: 1.1,     // Headlines
    snug: 1.25,     // Subheads
    normal: 1.5,    // Body
    relaxed: 1.7,   // Long-form reading
  },

  // Hyphenation rules by language
  hyphenation: {
    en: { minWordLength: 6, minBefore: 3, minAfter: 3 },
    it: { minWordLength: 5, minBefore: 2, minAfter: 2 },
    de: { minWordLength: 4, minBefore: 2, minAfter: 2 }, // German has long compounds
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════
// PART VI: MANUFACTURING DEPARTMENT
// Assembly line, quality control, production rules
// ════════════════════════════════════════════════════════════════════════════

/**
 * ASSEMBLY RULES
 * How elements are assembled together - like a factory
 */
export interface AssemblyRules {
  /** Order of assembly (which DNA pieces go first) */
  assemblyOrder: ElementType[];
  /** Quality checks at each stage */
  qualityGates: QualityGate[];
  /** Tolerance for defects before rejection */
  defectTolerance: number;
}

/**
 * QUALITY GATE
 * Checkpoint in the assembly line
 */
export interface QualityGate {
  name: string;
  stage: 'pre-assembly' | 'mid-assembly' | 'post-assembly';
  checks: QualityCheck[];
}

/**
 * QUALITY CHECK
 * Individual inspection in a quality gate
 */
export interface QualityCheck {
  name: string;
  type: 'collision' | 'overflow' | 'contrast' | 'hierarchy' | 'spacing';
  severity: 'critical' | 'warning' | 'info';
  test: (element: HTMLElement) => boolean;
  fix?: (element: HTMLElement) => void;
}

/**
 * DEFAULT ASSEMBLY RULES
 */
export const ASSEMBLY: AssemblyRules = {
  // Build order: terrain → walls → stems → petals → pollen
  assemblyOrder: ['terrain', 'wall', 'stem', 'petal', 'pollen'],

  qualityGates: [
    {
      name: 'Foundation Check',
      stage: 'pre-assembly',
      checks: [
        {
          name: 'Viewport Bounds',
          type: 'collision',
          severity: 'critical',
          test: (el) => el.scrollWidth <= el.clientWidth,
        },
      ],
    },
    {
      name: 'Structure Integrity',
      stage: 'mid-assembly',
      checks: [
        {
          name: 'Column Width',
          type: 'collision',
          severity: 'critical',
          test: (el) => el.clientWidth >= 140, // min-width from DNA
        },
        {
          name: 'No Horizontal Overflow',
          type: 'overflow',
          severity: 'critical',
          test: (el) => el.scrollWidth <= el.clientWidth + 1, // 1px tolerance
        },
      ],
    },
    {
      name: 'Content Quality',
      stage: 'post-assembly',
      checks: [
        {
          name: 'Text Contrast',
          type: 'contrast',
          severity: 'warning',
          test: () => true, // Implemented in optics department
        },
        {
          name: 'Word Integrity',
          type: 'overflow',
          severity: 'critical',
          test: (el) => {
            // Check if any word is cut mid-character
            const style = window.getComputedStyle(el);
            return style.wordBreak !== 'break-all';
          },
        },
      ],
    },
  ],

  defectTolerance: 0, // Zero tolerance for critical defects
};

// ════════════════════════════════════════════════════════════════════════════
// PART VII: PHYSICS ENGINE - CSS GENERATION
// Translate DNA into actual CSS constraints
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate CSS from ElementDNA
 * This is where DNA becomes physical reality
 */
export function dnaToCSS(dna: ElementDNA): Record<string, string> {
  const css: Record<string, string> = {};

  // Width constraints (collision bounds)
  if (typeof dna.bounds.width.min === 'number') {
    css['min-width'] = `${dna.bounds.width.min}px`;
  }
  if (dna.bounds.width.max === 'container') {
    css['max-width'] = '100%';
  } else if (typeof dna.bounds.width.max === 'number') {
    css['max-width'] = `${dna.bounds.width.max}px`;
  }

  // Overflow behavior (physics)
  if (dna.overflow.x === 'block') {
    css['overflow-x'] = 'hidden';
  } else if (dna.overflow.x === 'scroll') {
    css['overflow-x'] = 'auto';
  } else if (dna.overflow.x === 'hyphenate') {
    css['hyphens'] = 'auto';
    css['overflow-wrap'] = 'break-word';
    css['word-wrap'] = 'break-word';
  }

  // Word breaking rules (from breakRules)
  if (dna.breakable && dna.breakRules) {
    if (dna.breakRules.breakPoints.includes('never')) {
      css['word-break'] = 'keep-all';
      css['hyphens'] = 'none';
    } else if (dna.breakRules.breakPoints.includes('syllable')) {
      css['hyphens'] = 'auto';
      css['hyphenate-limit-chars'] = `${dna.breakRules.minBeforeBreak + dna.breakRules.minAfterBreak} ${dna.breakRules.minBeforeBreak} ${dna.breakRules.minAfterBreak}`;
    }
  } else if (!dna.breakable) {
    css['word-break'] = 'keep-all';
    css['white-space'] = 'nowrap';
  }

  // Container queries for elastic elements
  if (dna.bounds.width.elastic) {
    css['container-type'] = 'inline-size';
  }

  return css;
}

/**
 * Generate CSS variables for theming
 */
export function generateCSSVariables(theme: 'light' | 'dark' = 'light'): string {
  const colors = theme === 'light' ? OPTICS_LIGHT : OPTICS_DARK;

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

// ════════════════════════════════════════════════════════════════════════════
// PART VIII: LLM INSTRUCTIONS GENERATOR
// Translate DNA rules into natural language for LLM prompting
// ════════════════════════════════════════════════════════════════════════════

/**
 * RENDERING INSTRUCTIONS
 * Rules that can be passed to LLM for content generation
 */
export interface RenderingInstructions {
  wordsPerLine?: { min: number; max: number; target: number };
  lineBreaking?: { avoidOrphans: boolean; avoidWidows: boolean; balanceLines: boolean };
  citations?: { wordsPerLine: number; maxLines: number; style: 'centered' | 'left' | 'indented' };
  headlines?: { maxWordsPerLine: number; breakAtPunctuation: boolean };
  body?: { targetLineLength: number; paragraphSpacing: 'tight' | 'normal' | 'relaxed' };
}

/**
 * PRESET CONFIGURATIONS
 */
export const RENDERING_PRESETS = {
  newspaper: {
    wordsPerLine: { min: 3, max: 8, target: 5 },
    lineBreaking: { avoidOrphans: true, avoidWidows: true, balanceLines: true },
    citations: { wordsPerLine: 5, maxLines: 4, style: 'centered' as const },
    headlines: { maxWordsPerLine: 3, breakAtPunctuation: true },
    body: { targetLineLength: 65, paragraphSpacing: 'normal' as const },
  },
  magazine: {
    wordsPerLine: { min: 4, max: 10, target: 6 },
    lineBreaking: { avoidOrphans: true, avoidWidows: true, balanceLines: true },
    citations: { wordsPerLine: 6, maxLines: 5, style: 'indented' as const },
    body: { targetLineLength: 55, paragraphSpacing: 'relaxed' as const },
    headlines: { maxWordsPerLine: 4, breakAtPunctuation: true },
  },
  book: {
    wordsPerLine: { min: 5, max: 12, target: 8 },
    lineBreaking: { avoidOrphans: true, avoidWidows: true, balanceLines: false },
    citations: { wordsPerLine: 8, maxLines: 8, style: 'left' as const },
    body: { targetLineLength: 70, paragraphSpacing: 'tight' as const },
    headlines: { maxWordsPerLine: 5, breakAtPunctuation: false },
  },
} as const;

/**
 * Generate LLM System Prompt from DNA and rendering config
 */
export function generateLLMSystemPrompt(
  preset: keyof typeof RENDERING_PRESETS = 'newspaper',
  topic?: string
): string {
  const config = RENDERING_PRESETS[preset];

  return `
<role>
You are a Swiss-style editorial content writer. Your output will be rendered
in a physics-based layout system where content MUST respect boundaries.
</role>

<physics_constraints>
- Content CANNOT overflow its container (like a wall in games)
- Words are ATOMIC units - they do NOT break mid-word
- Headlines must have ${config.headlines.maxWordsPerLine} words max per line
- Citations need ${config.citations.wordsPerLine} words per line for readability
- Body text targets ${config.body.targetLineLength} characters per line
</physics_constraints>

<layout_rules>
- Avoid orphans (single words on last line)
- Avoid widows (single words at top of column)
- Balance line lengths for visual harmony
- Citation style: ${config.citations.style}
</layout_rules>

${topic ? `
<topic_constraint>
You MUST write EXCLUSIVELY about: ${topic}
Every paragraph must directly relate to this topic.
Do NOT drift to tangential subjects.
</topic_constraint>
` : ''}

<output_format>
Structure your response as:
1. Headline (main title, impactful)
2. Subheadline (context, hook)
3. Body (3-5 paragraphs, ${config.body.paragraphSpacing} spacing)
4. Pull quote (1 impactful statement)
</output_format>
`.trim();
}

/**
 * Generate complete prompt with topic injection
 */
export function generateLLMPrompt(
  userTopic: string,
  preset: keyof typeof RENDERING_PRESETS = 'newspaper'
): { system: string; user: string } {
  return {
    system: generateLLMSystemPrompt(preset, userTopic),
    user: `Write a ${preset}-style article about: ${userTopic}

Remember: EVERY paragraph must tie directly back to "${userTopic}".
Focus on interesting aspects, historical context, and specific details.`,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS - The public API of the DNA system
// ════════════════════════════════════════════════════════════════════════════

export type Theme = 'light' | 'dark';
export type PresetName = keyof typeof RENDERING_PRESETS;

// DNA Library
export const DNA_LIBRARY = {
  terrain: DNA_TERRAIN,
  wall: DNA_WALL,
  stemVertical: DNA_STEM_VERTICAL,
  stemHorizontal: DNA_STEM_HORIZONTAL,
  petalHeadline: DNA_PETAL_HEADLINE,
  petalBody: DNA_PETAL_BODY,
  petalCitation: DNA_PETAL_CITATION,
  petalWord: DNA_PETAL_WORD,
  pollenBorder: DNA_POLLEN_BORDER,
} as const;

// Re-export for backward compatibility
export const COLORS_LIGHT = OPTICS_LIGHT;
export const COLORS_DARK = OPTICS_DARK;
export const TYPOGRAPHY = LINGUISTICS;
export const ELEMENTS = {
  lines: {
    vertical: { width: '1px', color: 'var(--dna-border)', style: 'solid' },
    horizontal: { width: '2px', color: 'var(--dna-border)', style: 'solid' },
    emphasis: { width: '100px', color: 'var(--dna-text-primary)', style: 'solid' },
  },
  space: {
    xs: '0.382rem',
    sm: '0.618rem',
    md: '1rem',
    lg: '1.618rem',
    xl: '2.618rem',
    xxl: '4.236rem',
  },
  radius: { none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem' },
} as const;

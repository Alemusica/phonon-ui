/**
 * CONCRETE POUR PATTERN
 * =====================
 * A unique rendering system by Alessio Cazzaniga.
 *
 * Like pouring concrete into forms:
 * 1. FORMWORK PHASE: Buffer content, detect structure, calculate exact layout
 * 2. POUR PHASE: Render characters into pre-calculated positions
 * 3. CURE PHASE: Content is stable, no more movement
 *
 * Inspired by:
 * - Newspaper printing presses (layout first, then ink)
 * - GPUAudio SDK pipeline scheduling (parallel stages)
 * - Swiss Typography grid systems
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { countSyllables, getTypingSpeedMultiplier } from './use-typewriter';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

/** Content structure detected during buffering */
export interface ContentStructure {
  type: 'newspaper' | 'chat' | 'plain';
  hasHeadline: boolean;
  headlineText?: string;
  hasSubheadline: boolean;
  subheadlineText?: string;
  hasCitations: boolean;
  citationCount: number;
  hasSections: boolean;
  sectionHeaders: string[];
  estimatedColumns: 1 | 2 | 3 | 4;
  totalCharacters: number;
  totalWords: number;
  totalParagraphs: number;
}

/** Pre-calculated layout for a text region */
export interface LayoutRegion {
  id: string;
  type: 'headline' | 'subheadline' | 'citation' | 'body' | 'section-header';
  column: number;
  startLine: number;
  endLine: number;
  width: number; // in characters or percentage
  content: string;
  charPositions: CharPosition[];
}

/** Exact position for each character */
export interface CharPosition {
  char: string;
  x: number; // percentage or px
  y: number; // line number
  delay: number; // ms before this char appears
  syllableWeight: number; // for rhythmic timing
}

/** Pour state for animation */
export interface PourState {
  phase: 'buffering' | 'calculating' | 'pouring' | 'cured';
  progress: number; // 0-1
  currentChar: number;
  totalChars: number;
  layout: LayoutRegion[];
  visibleChars: number;
}

// ════════════════════════════════════════════════════════════════
// CONTENT ANALYZER
// ════════════════════════════════════════════════════════════════

/**
 * Analyze content structure from buffered text
 * Detects: headlines, citations, sections, estimates columns
 */
export function analyzeStructure(content: string): ContentStructure {
  const isNewspaper = content.includes('[NEWSPAPER_STYLE]');

  // Detect headlines (# and ##)
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h2Match = content.match(/^##\s+(.+)$/m);

  // Detect citations (> quotes)
  const citations = content.match(/^>\s+.+$/gm) || [];

  // Detect section headers (###)
  const sections = content.match(/^###\s+(.+)$/gm) || [];

  // Count words and paragraphs
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Estimate columns based on content length and structure
  let columns: 1 | 2 | 3 | 4 = 1;
  if (isNewspaper) {
    if (words.length > 300) columns = 3;
    else if (words.length > 150) columns = 2;
  }

  return {
    type: isNewspaper ? 'newspaper' : 'chat',
    hasHeadline: !!h1Match,
    headlineText: h1Match?.[1],
    hasSubheadline: !!h2Match,
    subheadlineText: h2Match?.[1],
    hasCitations: citations.length > 0,
    citationCount: citations.length,
    hasSections: sections.length > 0,
    sectionHeaders: sections.map(s => s.replace(/^###\s+/, '')),
    estimatedColumns: columns,
    totalCharacters: content.length,
    totalWords: words.length,
    totalParagraphs: paragraphs.length,
  };
}

// ════════════════════════════════════════════════════════════════
// LAYOUT CALCULATOR
// ════════════════════════════════════════════════════════════════

const PHI = 1.618;
const BASE_CHAR_DELAY = 25; // ms

/**
 * Calculate exact positions for every character
 * This is the "formwork" - defines where concrete will go
 */
export function calculateLayout(
  content: string,
  _structure: ContentStructure,
  containerWidth: number = 100 // percentage
): LayoutRegion[] {
  const regions: LayoutRegion[] = [];
  const lines = content.split('\n');

  let currentLine = 0;

  for (const line of lines) {
    // Detect region type
    let type: LayoutRegion['type'] = 'body';
    if (line.startsWith('# ') && !line.startsWith('## ') && !line.startsWith('### ')) {
      type = 'headline';
    } else if (line.startsWith('## ')) {
      type = 'subheadline';
    } else if (line.startsWith('### ')) {
      type = 'section-header';
    } else if (line.startsWith('> ')) {
      type = 'citation';
    }

    // Create region
    const charPositions = calculateCharPositions(line, regions.length > 0 ? regions[regions.length - 1].charPositions[regions[regions.length - 1].charPositions.length - 1]?.delay || 0 : 0, currentLine, type);

    regions.push({
      id: `region-${regions.length}`,
      type,
      column: 0, // Will be calculated by renderer
      startLine: currentLine,
      endLine: currentLine,
      width: containerWidth,
      content: line,
      charPositions,
    });

    currentLine++;
  }

  return regions;
}

/**
 * Calculate timing and position for each character in a line
 * Uses syllable-based rhythm for natural pacing
 */
function calculateCharPositions(
  line: string,
  startDelay: number,
  lineNumber: number,
  type: LayoutRegion['type']
): CharPosition[] {
  const positions: CharPosition[] = [];
  const words = line.split(/(\s+)/); // Keep spaces

  let x = 0;
  let cumulativeDelay = startDelay;

  // Type-based delay multiplier
  const typeMultiplier = {
    'headline': 1.5,      // Slower for impact
    'subheadline': 1.3,
    'citation': 1.4,      // Dramatic pause feel
    'section-header': 1.2,
    'body': 1.0,
  }[type];

  for (const word of words) {
    const isSpace = /^\s+$/.test(word);
    const syllables = isSpace ? 0 : countSyllables(word);

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      // Calculate delay based on character context
      let delay = BASE_CHAR_DELAY * typeMultiplier;

      // Add jitter for human feel (±15%)
      delay *= 0.85 + Math.random() * 0.3;

      // Syllable-based pause at word end (space after word)
      if (isSpace && i === 0 && positions.length > 0) {
        const syllableMultiplier = Math.pow(PHI, Math.max(0, syllables - 1) * 0.5);
        delay *= syllableMultiplier;
      }

      positions.push({
        char,
        x: (x / Math.max(line.length, 1)) * 100, // percentage
        y: lineNumber,
        delay: cumulativeDelay,
        syllableWeight: syllables,
      });

      cumulativeDelay += delay;
      x++;
    }
  }

  return positions;
}

// ════════════════════════════════════════════════════════════════
// POUR CONTROLLER
// ════════════════════════════════════════════════════════════════

/**
 * Controller for the pouring animation
 * Manages timing and reveals characters progressively
 */
export class PourController {
  private state: PourState;
  private layout: LayoutRegion[];
  private startTime: number = 0;
  private observers: Set<(state: PourState) => void> = new Set();
  private animationFrame: number | null = null;

  constructor() {
    this.layout = [];
    this.state = {
      phase: 'buffering',
      progress: 0,
      currentChar: 0,
      totalChars: 0,
      layout: [],
      visibleChars: 0,
    };
  }

  /**
   * Buffer content and prepare layout
   */
  async prepare(content: string): Promise<void> {
    this.state.phase = 'buffering';
    this.notifyObservers();

    // Analyze structure
    const structure = analyzeStructure(content);

    this.state.phase = 'calculating';
    this.notifyObservers();

    // Calculate layout
    this.layout = calculateLayout(content, structure);

    // Count total chars
    let totalChars = 0;
    for (const region of this.layout) {
      totalChars += region.charPositions.length;
    }

    this.state = {
      ...this.state,
      phase: 'pouring',
      totalChars,
      layout: this.layout,
    };

    this.notifyObservers();
  }

  /**
   * Start the pour animation
   */
  pour(speedMultiplier: number = 1.0): void {
    this.startTime = performance.now();
    this.animate(speedMultiplier);
  }

  /**
   * Animation loop
   */
  private animate(speedMultiplier: number): void {
    const elapsed = performance.now() - this.startTime;
    const adjustedTime = elapsed / speedMultiplier;

    // Find how many chars should be visible
    let visibleChars = 0;
    for (const region of this.layout) {
      for (const pos of region.charPositions) {
        if (pos.delay <= adjustedTime) {
          visibleChars++;
        }
      }
    }

    this.state = {
      ...this.state,
      visibleChars,
      currentChar: visibleChars,
      progress: this.state.totalChars > 0 ? visibleChars / this.state.totalChars : 0,
    };

    this.notifyObservers();

    // Continue if not done
    if (visibleChars < this.state.totalChars) {
      this.animationFrame = requestAnimationFrame(() => this.animate(speedMultiplier));
    } else {
      this.state.phase = 'cured';
      this.notifyObservers();
    }
  }

  /**
   * Stop animation
   */
  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Skip to end
   */
  skip(): void {
    this.stop();
    this.state = {
      ...this.state,
      phase: 'cured',
      visibleChars: this.state.totalChars,
      currentChar: this.state.totalChars,
      progress: 1,
    };
    this.notifyObservers();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: PourState) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(cb => cb(this.state));
  }

  /**
   * Get current state
   */
  getState(): PourState {
    return this.state;
  }

  /**
   * Get visible text up to current point
   */
  getVisibleText(): string {
    let result = '';
    let charCount = 0;

    for (const region of this.layout) {
      for (const pos of region.charPositions) {
        if (charCount < this.state.visibleChars) {
          result += pos.char;
        }
        charCount++;
      }
      if (charCount < this.state.visibleChars) {
        result += '\n';
      }
    }

    return result;
  }
}

// ════════════════════════════════════════════════════════════════
// REACT HOOK
// ════════════════════════════════════════════════════════════════

export interface UseConcretePourOptions {
  content: string;
  enabled?: boolean;
  autoStart?: boolean;
  onComplete?: () => void;
}

export interface UseConcretePourReturn {
  visibleText: string;
  phase: PourState['phase'];
  progress: number;
  isPouring: boolean;
  isComplete: boolean;
  start: () => void;
  skip: () => void;
  reset: () => void;
  structure: ContentStructure | null;
  layout: LayoutRegion[];
}

/**
 * Hook for concrete pour rendering
 * Pre-calculates layout then animates text into exact positions
 */
export function useConcretePour(options: UseConcretePourOptions): UseConcretePourReturn {
  const { content, enabled = true, autoStart = true, onComplete } = options;

  const controllerRef = useRef<PourController | null>(null);
  const [state, setState] = useState<PourState>({
    phase: 'buffering',
    progress: 0,
    currentChar: 0,
    totalChars: 0,
    layout: [],
    visibleChars: 0,
  });
  const [structure, setStructure] = useState<ContentStructure | null>(null);
  const [visibleText, setVisibleText] = useState('');

  // Initialize controller
  useEffect(() => {
    if (!enabled || !content) {
      setVisibleText(content || '');
      return;
    }

    const controller = new PourController();
    controllerRef.current = controller;

    // Subscribe to state changes
    const unsubscribe = controller.subscribe((newState) => {
      setState(newState);
      setVisibleText(controller.getVisibleText());

      if (newState.phase === 'cured') {
        onComplete?.();
      }
    });

    // Analyze and prepare
    const struct = analyzeStructure(content);
    setStructure(struct);

    controller.prepare(content).then(() => {
      if (autoStart) {
        controller.pour(getTypingSpeedMultiplier());
      }
    });

    return () => {
      unsubscribe();
      controller.stop();
    };
  }, [content, enabled, autoStart, onComplete]);

  const start = useCallback(() => {
    controllerRef.current?.pour(getTypingSpeedMultiplier());
  }, []);

  const skip = useCallback(() => {
    controllerRef.current?.skip();
    setVisibleText(content);
  }, [content]);

  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current.prepare(content).then(() => {
        controllerRef.current?.pour(getTypingSpeedMultiplier());
      });
    }
  }, [content]);

  return {
    visibleText,
    phase: state.phase,
    progress: state.progress,
    isPouring: state.phase === 'pouring',
    isComplete: state.phase === 'cured',
    start,
    skip,
    reset,
    structure,
    layout: state.layout,
  };
}

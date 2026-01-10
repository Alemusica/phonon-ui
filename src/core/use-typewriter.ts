/**
 * Phonon UI - useTypewriter Hook
 *
 * Humanized typing effect with PHI-based rhythmic timing.
 * Supports smooth fade-in animation (ChatGPT/Grok style).
 *
 * DNA Pattern: Characters appear like construction - once placed, they don't move.
 * New characters fade in smoothly without displacing existing content.
 *
 * READING RHYTHM RESEARCH (Brysbaert 2019):
 * - 238 wpm: average silent reading (non-fiction)
 * - 300 wpm: optimal comprehension rate
 * - 200 wpm: learning/studying rate
 * - 138 wpm: memorization rate
 *
 * PHI-based timing (Golden Ratio 1.618):
 * - Base: 40ms (300 wpm optimal)
 * - Normal: 40 × 1.618 = 65ms (comfortable reading)
 * - Slow: 65 × 1.618 = 105ms (learning pace)
 * - Fast: 40 / 1.618 = 25ms (rapid display)
 *
 * Musical rhythm (3:2 hemiola ratio):
 * - Punctuation pauses follow 3:2 ratio for natural flow
 * - Like endecasillabi poetry - breathing rhythm
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type TypingSpeed = 'instant' | 'fast' | 'normal' | 'slow' | 'study';

/**
 * PHI constant (Golden Ratio)
 */
const PHI = 1.618;

/**
 * Musical ratio for punctuation pauses (hemiola)
 * Creates natural breathing rhythm like poetry
 */
const HEMIOLA = 3 / 2; // 1.5

/**
 * Speed configuration based on reading research + PHI ratio
 * Base timing derived from 300 wpm optimal reading speed
 */
interface SpeedConfig {
  /** Base character delay in ms */
  charDelay: number;
  /** Multiplier for sentence-end punctuation (.!?) */
  sentenceMultiplier: number;
  /** Multiplier for mid-sentence punctuation (,;:) */
  pauseMultiplier: number;
  /** Multiplier for newlines */
  newlineMultiplier: number;
}

/**
 * PHI-based speed presets
 * Derived from cognitive reading research
 */
const SPEED_CONFIG: Record<TypingSpeed, SpeedConfig> = {
  // Instant - no delay
  instant: {
    charDelay: 0,
    sentenceMultiplier: 0,
    pauseMultiplier: 0,
    newlineMultiplier: 0,
  },
  // Fast - 25ms (300 wpm / PHI)
  // For quick scanning, notifications
  fast: {
    charDelay: 25,
    sentenceMultiplier: HEMIOLA * 2,   // 3.0x for sentence end
    pauseMultiplier: HEMIOLA,          // 1.5x for comma
    newlineMultiplier: PHI,            // 1.618x for newline
  },
  // Normal - 40ms (300 wpm optimal)
  // Comfortable reading pace
  normal: {
    charDelay: 40,
    sentenceMultiplier: HEMIOLA * 2.5, // 3.75x
    pauseMultiplier: HEMIOLA * 1.2,    // 1.8x
    newlineMultiplier: PHI,            // 1.618x
  },
  // Slow - 65ms (300 wpm × PHI)
  // Relaxed, enjoyable reading
  slow: {
    charDelay: 65,
    sentenceMultiplier: HEMIOLA * 3,   // 4.5x
    pauseMultiplier: HEMIOLA * 1.5,    // 2.25x
    newlineMultiplier: PHI * 1.2,      // 1.94x
  },
  // Study - 105ms (300 wpm × PHI²)
  // Learning/memorization pace
  study: {
    charDelay: 105,
    sentenceMultiplier: PHI * 3,       // 4.85x
    pauseMultiplier: PHI * 1.5,        // 2.43x
    newlineMultiplier: PHI * 1.5,      // 2.43x
  },
};

/**
 * Global speed multiplier (1.0 = normal, 0.5 = 2x faster, 2.0 = 2x slower)
 * Exposed for runtime adjustment via UI controls or LLM commands
 *
 * API for LLM: setTypingSpeedMultiplier(0.5) makes text appear faster
 */
let globalSpeedMultiplier = 1.0;

/**
 * Set global typing speed multiplier
 * @param multiplier - Speed multiplier (0.1 to 5.0)
 * @returns The clamped value that was set
 *
 * @example
 * ```tsx
 * // LLM command: [ACTION:{"type":"setTypingSpeed","value":0.5}]
 * setTypingSpeedMultiplier(0.5); // 2x faster
 * setTypingSpeedMultiplier(2.0); // 2x slower
 * ```
 */
export function setTypingSpeedMultiplier(multiplier: number): number {
  globalSpeedMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
  return globalSpeedMultiplier;
}

/**
 * Get current typing speed multiplier
 */
export function getTypingSpeedMultiplier(): number {
  return globalSpeedMultiplier;
}

/**
 * Get typing delay for a character based on context
 * Uses PHI-based timing with musical rhythm for punctuation
 */
function getTypingDelay(char: string, prevChar: string, speed: TypingSpeed): number {
  const config = SPEED_CONFIG[speed];

  if (speed === 'instant') return 0;

  // Base delay with slight humanization (±15%)
  const jitter = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
  let delay = config.charDelay * jitter;

  // Apply rhythm multipliers based on previous character
  // This creates the "breathing" effect like in poetry

  // Sentence end (.!?) - longest pause (like a breath between stanzas)
  if ('.!?'.includes(prevChar)) {
    delay *= config.sentenceMultiplier;
  }
  // Mid-sentence punctuation (,;:) - medium pause (like a caesura)
  else if (',;:'.includes(prevChar)) {
    delay *= config.pauseMultiplier;
  }
  // Newline - paragraph break
  else if (prevChar === '\n') {
    delay *= config.newlineMultiplier;
  }
  // Space after word - slight word boundary emphasis
  else if (prevChar === ' ' && char !== ' ') {
    delay *= 1.1; // 10% longer between words
  }

  // Apply global multiplier (user/LLM control)
  return delay * globalSpeedMultiplier;
}

export interface UseTypewriterOptions {
  /** Text to display with typewriter effect */
  text: string;
  /** Typing speed preset */
  speed?: TypingSpeed;
  /** Enable/disable typewriter effect */
  enabled?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Number of trailing characters to mark as "new" for fade-in effect */
  fadeInChars?: number;
}

export interface UseTypewriterReturn {
  /** Currently displayed text */
  displayedText: string;
  /** Whether typing is in progress */
  isTyping: boolean;
  /** Whether typing has completed */
  isComplete: boolean;
  /** Skip to end immediately */
  skip: () => void;
  /** Reset to beginning */
  reset: () => void;
  /** Index where "stable" text ends (for fade-in rendering) */
  stableEndIndex: number;
  /** Current speed multiplier */
  speedMultiplier: number;
}

/**
 * Hook for typewriter effect with PHI-based rhythmic timing
 *
 * DNA Pattern: Text "construction" - characters are laid like bricks.
 * Once placed, they become stable and don't shift.
 *
 * @example
 * ```tsx
 * const { displayedText, isTyping, stableEndIndex } = useTypewriter({
 *   text: "Hello world",
 *   speed: "normal",
 *   fadeInChars: 3, // Last 3 chars fade in
 * });
 *
 * // Render with fade-in effect
 * <span>
 *   {displayedText.slice(0, stableEndIndex)}
 *   <span className="phonon-typewriter-fadein">{displayedText.slice(stableEndIndex)}</span>
 * </span>
 * ```
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const {
    text,
    speed = 'normal',
    enabled = true,
    onComplete,
    fadeInChars = 1, // Default: only the latest character fades in
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedTextRef = useRef<string>('');

  // Reset when text changes significantly (not just appending)
  useEffect(() => {
    // If text is shorter or completely different, reset
    if (text && !text.startsWith(completedTextRef.current.slice(0, Math.min(10, completedTextRef.current.length)))) {
      setDisplayedText('');
      completedTextRef.current = '';
    }
  }, [text]);

  // Typing effect
  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text || '');
      setIsTyping(false);
      return;
    }

    if (speed === 'instant') {
      setDisplayedText(text);
      setIsTyping(false);
      completedTextRef.current = text;
      onComplete?.();
      return;
    }

    if (displayedText.length >= text.length) {
      setIsTyping(false);
      if (completedTextRef.current !== text) {
        completedTextRef.current = text;
        onComplete?.();
      }
      return;
    }

    setIsTyping(true);

    const currentIndex = displayedText.length;
    const currentChar = text[currentIndex] || '';
    const prevChar = currentIndex > 0 ? text[currentIndex - 1] : '';
    const delay = getTypingDelay(currentChar, prevChar, speed);

    timeoutRef.current = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, displayedText, speed, enabled, onComplete]);

  // Skip to end
  const skip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(text);
    setIsTyping(false);
    completedTextRef.current = text;
    onComplete?.();
  }, [text, onComplete]);

  // Reset
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText('');
    completedTextRef.current = '';
    setIsTyping(false);
  }, []);

  // Calculate stable text index (text that should not fade)
  const stableEndIndex = Math.max(0, displayedText.length - fadeInChars);

  return {
    displayedText,
    isTyping,
    isComplete: displayedText.length >= text.length,
    skip,
    reset,
    stableEndIndex,
    speedMultiplier: globalSpeedMultiplier,
  };
}

/**
 * Reading speed constants for reference
 * Based on Brysbaert 2019 meta-analysis
 */
export const READING_SPEEDS = {
  /** Average silent reading (non-fiction) */
  AVERAGE: 238,
  /** Optimal comprehension rate */
  OPTIMAL: 300,
  /** Learning/studying rate */
  LEARNING: 200,
  /** Memorization rate */
  MEMORIZE: 138,
} as const;

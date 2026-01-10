/**
 * Phonon UI - useTypewriter Hook
 *
 * RHYTHMIC TYPOGRAPHY SYSTEM
 * ===========================
 * A unique approach to text animation inspired by poetry, music, and reading research.
 * Created by Alessio Cazzaniga - this system applies PHI ratios to TIME, not just space.
 *
 * CORE CONCEPT: Text as Music
 * ---------------------------
 * Every word has rhythm. Like in Italian endecasillabi poetry or operatic recitative,
 * the timing between characters and words creates a natural breathing pattern.
 *
 * SYLLABLE-BASED WORD PAUSES
 * --------------------------
 * The pause after each word is proportional to its syllable count:
 * - "AI" (1 syl) → base pause × 1
 * - "neural" (2 syl) → base pause × PHI
 * - "cognitive" (4 syl) → base pause × PHI³
 *
 * This creates "recitative" rhythm - longer words earn longer breathing space.
 *
 * PHI-BASED TIMING (Golden Ratio 1.618)
 * -------------------------------------
 * Derived from Brysbaert 2019 reading research + musical hemiola (3:2):
 * - Base: 40ms (300 wpm optimal comprehension)
 * - Multiplied by PHI for each speed tier
 *
 * CHARACTER FLOW (Vocal Rhythm)
 * -----------------------------
 * Each character appears with slight timing variation (±15%) to create
 * human-like flow, avoiding mechanical regularity.
 *
 * DNA Pattern: Characters appear like construction - once placed, stable.
 * New characters fade in smoothly without displacing existing content.
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
 * Count syllables in a word (heuristic)
 * Works for English/Italian - counts vowel groups
 *
 * OPERATIC RECITATIVE TIMING
 * This creates natural breathing rhythm like in opera:
 * - "AI" (1 syl) → base pause
 * - "neural" (2 syl) → PHI × pause
 * - "architecture" (4 syl) → PHI² × pause
 *
 * @example
 * ```typescript
 * countSyllables("hello")     // 2
 * countSyllables("beautiful") // 4
 * countSyllables("AI")        // 1
 * ```
 */
export function countSyllables(word: string): number {
  if (!word || word.length === 0) return 1;
  const clean = word.toLowerCase().replace(/[^a-zàèéìòù]/g, '');
  if (clean.length <= 2) return 1;

  // Count vowel groups (consecutive vowels = 1 syllable)
  const vowels = 'aeiouyàèéìòù';
  let count = 0;
  let prevWasVowel = false;

  for (const char of clean) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevWasVowel) count++;
    prevWasVowel = isVowel;
  }

  // Handle silent e at end
  if (clean.endsWith('e') && count > 1) count--;

  return Math.max(1, count);
}

/**
 * Extract the word that just ended (before current space)
 */
function getPreviousWord(text: string, currentIndex: number): string {
  let end = currentIndex;
  let start = end - 1;

  // Skip back to find word start
  while (start >= 0 && text[start] !== ' ' && text[start] !== '\n') {
    start--;
  }

  return text.slice(start + 1, end);
}

/**
 * Get typing delay for a character based on context
 * Uses PHI-based timing with musical rhythm for punctuation
 * and syllable-based pauses for word boundaries (recitative rhythm)
 */
function getTypingDelay(char: string, prevChar: string, speed: TypingSpeed, text: string, currentIndex: number): number {
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
  // Space after word - SYLLABLE-BASED PAUSE (recitative rhythm)
  // Longer words (more syllables) get proportionally longer pauses
  else if (prevChar === ' ' && char !== ' ') {
    // This is the start of a new word - pause based on PREVIOUS word syllables
    delay *= 1.1; // Base word boundary emphasis
  }
  // When we type a space, calculate pause based on word that just ended
  else if (char === ' ') {
    const previousWord = getPreviousWord(text, currentIndex);
    const syllables = countSyllables(previousWord);
    // PHI-based scaling: 1 syl = 1x, 2 syl = PHI^0.5, 3 syl = PHI, etc.
    const syllableMultiplier = Math.pow(PHI, Math.max(0, syllables - 1) * 0.5);
    delay *= syllableMultiplier;
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
    const delay = getTypingDelay(currentChar, prevChar, speed, text, currentIndex);

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

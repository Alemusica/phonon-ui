/**
 * Phonon UI - Typewriter Component
 *
 * Renders text with typewriter effect, smooth fade-in, and optional cursor.
 * ChatGPT/Grok style: new characters fade in smoothly.
 *
 * DNA Pattern: Like construction - once placed, characters don't move.
 */

import { useTypewriter, TypingSpeed } from '../core/use-typewriter';
import { cn } from '../core/utils';

export interface TypewriterProps {
  /** Text to display */
  text: string;
  /** Typing speed preset */
  speed?: TypingSpeed;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Enable smooth fade-in effect (ChatGPT/Grok style) */
  fadeIn?: boolean;
  /** Number of characters that fade in (default: 1) */
  fadeInChars?: number;
  /** Additional class name */
  className?: string;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** HTML tag to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Typewriter effect component with humanized timing and smooth fade-in
 *
 * @example
 * ```tsx
 * // Basic typewriter
 * <Typewriter text="Hello world" speed="normal" />
 *
 * // With fade-in effect (like ChatGPT)
 * <Typewriter text="Hello world" fadeIn fadeInChars={2} />
 * ```
 */
export function Typewriter({
  text,
  speed = 'fast',
  showCursor = true,
  fadeIn = true,
  fadeInChars = 1,
  className,
  onComplete,
  as: Tag = 'span',
}: TypewriterProps) {
  const { displayedText, isTyping, stableEndIndex } = useTypewriter({
    text,
    speed,
    onComplete,
    fadeInChars: fadeIn ? fadeInChars : 0,
  });

  // Split text into stable (already visible) and fading (new) parts
  const stableText = fadeIn ? displayedText.slice(0, stableEndIndex) : displayedText;
  const fadingText = fadeIn ? displayedText.slice(stableEndIndex) : '';

  return (
    <Tag className={cn('phonon-typewriter', className)}>
      {/* Stable text - fully visible, no animation */}
      {stableText}
      {/* Fading text - new characters with fade-in animation */}
      {fadeIn && fadingText && (
        <span className="phonon-typewriter-fadein" aria-hidden="false">
          {fadingText}
        </span>
      )}
      {/* Blinking cursor */}
      {showCursor && isTyping && (
        <span className="phonon-cursor" aria-hidden="true" />
      )}
    </Tag>
  );
}

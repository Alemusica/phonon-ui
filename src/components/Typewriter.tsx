/**
 * Phonon UI - Typewriter Component
 * 
 * Renders text with typewriter effect and optional cursor.
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
  /** Additional class name */
  className?: string;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** HTML tag to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Typewriter effect component with humanized timing
 */
export function Typewriter({
  text,
  speed = 'fast',
  showCursor = true,
  className,
  onComplete,
  as: Tag = 'span',
}: TypewriterProps) {
  const { displayedText, isTyping } = useTypewriter({
    text,
    speed,
    onComplete,
  });

  return (
    <Tag className={cn('phonon-typewriter', className)}>
      {displayedText}
      {showCursor && isTyping && (
        <span className="phonon-cursor" aria-hidden="true" />
      )}
    </Tag>
  );
}

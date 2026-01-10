/**
 * Phonon UI - useTypewriter Hook
 * 
 * Humanized typing effect with variable delays based on punctuation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type TypingSpeed = 'instant' | 'fast' | 'normal' | 'slow';

interface SpeedConfig {
  base: number;
  punctuation: number;
  newline: number;
}

const SPEED_CONFIG: Record<TypingSpeed, SpeedConfig> = {
  instant: { base: 0, punctuation: 0, newline: 0 },
  fast: { base: 0.25, punctuation: 0.2, newline: 0.15 },
  normal: { base: 1, punctuation: 1, newline: 1 },
  slow: { base: 1.8, punctuation: 1.5, newline: 1.2 },
};

/**
 * Get typing delay for a character based on context
 */
function getTypingDelay(_char: string, prevChar: string, speed: TypingSpeed): number {
  const config = SPEED_CONFIG[speed];
  
  if (speed === 'instant') return 0;
  
  // Longer pause after sentence-ending punctuation
  if ('.!?'.includes(prevChar)) {
    return (80 + Math.random() * 60) * config.punctuation;
  }
  
  // Medium pause after other punctuation
  if (',;:'.includes(prevChar)) {
    return (40 + Math.random() * 30) * config.punctuation;
  }
  
  // Short pause after newline
  if (prevChar === '\n') {
    return (50 + Math.random() * 30) * config.newline;
  }
  
  // Base typing speed with slight randomness
  return (15 + Math.random() * 10) * config.base;
}

export interface UseTypewriterOptions {
  text: string;
  speed?: TypingSpeed;
  enabled?: boolean;
  onComplete?: () => void;
}

export interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  skip: () => void;
  reset: () => void;
}

/**
 * Hook for typewriter effect with humanized timing
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const { text, speed = 'fast', enabled = true, onComplete } = options;
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedTextRef = useRef<string>('');
  
  // Reset when text changes
  useEffect(() => {
    if (text !== completedTextRef.current) {
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

  return {
    displayedText,
    isTyping,
    isComplete: displayedText.length >= text.length,
    skip,
    reset,
  };
}

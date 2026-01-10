/**
 * Phonon UI - MarkdownRenderer Component
 * 
 * Renders markdown with optional typewriter effect and Medium-like styling.
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTypewriter, TypingSpeed } from '../core/use-typewriter';
import { cn } from '../core/utils';

export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Enable typewriter effect */
  typewriter?: boolean;
  /** Typing speed when typewriter is enabled */
  typingSpeed?: TypingSpeed;
  /** Show blinking cursor during typing */
  showCursor?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback when typing completes */
  onComplete?: () => void;
}

/**
 * Markdown renderer with typewriter effect and Medium-like styling
 */
export function MarkdownRenderer({
  content,
  typewriter = false,
  typingSpeed = 'fast',
  showCursor = true,
  className,
  onComplete,
}: MarkdownRendererProps) {
  const { displayedText, isTyping } = useTypewriter({
    text: content,
    speed: typingSpeed,
    enabled: typewriter,
    onComplete,
  });

  const textToRender = typewriter ? displayedText : content;

  // Custom components for React Markdown
  const components = useMemo(() => ({
    // Links open in new tab
    a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {children}
      </a>
    ),
    // Code blocks with proper styling
    code: ({ inline, className: codeClassName, children, ...props }: { 
      inline?: boolean; 
      className?: string; 
      children?: React.ReactNode;
    }) => {
      if (inline) {
        return <code className={codeClassName} {...props}>{children}</code>;
      }
      return (
        <pre className="phonon-prose-pre">
          <code className={codeClassName} {...props}>{children}</code>
        </pre>
      );
    },
  }), []);

  return (
    <div className={cn('phonon-prose', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {textToRender}
      </ReactMarkdown>
      {typewriter && showCursor && isTyping && (
        <span className="phonon-cursor" aria-hidden="true" />
      )}
    </div>
  );
}

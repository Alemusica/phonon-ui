/**
 * Phonon UI - MarkdownRenderer Component
 *
 * Renders markdown with Swiss editorial typography styling.
 * Supports typewriter effect and multiple variants.
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTypewriter, TypingSpeed } from '../core/use-typewriter';
import { cn } from '../core/utils';

/** Prose styling variants */
export type ProseVariant = 'default' | 'editorial' | 'compact';

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
  /** Prose styling variant */
  variant?: ProseVariant;
  /** Enable drop cap for first paragraph (editorial variant) */
  dropCap?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
}

/**
 * Markdown renderer with Swiss editorial typography
 */
export function MarkdownRenderer({
  content,
  typewriter = false,
  typingSpeed = 'fast',
  showCursor = true,
  className,
  variant = 'default',
  dropCap = false,
  onComplete,
}: MarkdownRendererProps) {
  const { displayedText, isTyping } = useTypewriter({
    text: content,
    speed: typingSpeed,
    enabled: typewriter,
    onComplete,
  });

  const textToRender = typewriter ? displayedText : content;

  // Variant-based class selection
  const proseClass = useMemo(() => {
    switch (variant) {
      case 'compact':
        return 'phonon-prose-compact';
      case 'editorial':
        return dropCap ? 'phonon-prose phonon-prose-dropcap' : 'phonon-prose';
      default:
        return 'phonon-prose';
    }
  }, [variant, dropCap]);

  // Custom components for React Markdown with Swiss styling
  const components = useMemo(
    () => ({
      // Links open in new tab
      a: ({
        href,
        children,
        ...props
      }: React.ComponentPropsWithoutRef<'a'>) => (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      ),
      // Strong with semibold weight
      strong: ({
        children,
        ...props
      }: React.ComponentPropsWithoutRef<'strong'>) => (
        <strong className="font-semibold" {...props}>
          {children}
        </strong>
      ),
      // Emphasis with subtle opacity
      em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
        <em className="italic opacity-90" {...props}>
          {children}
        </em>
      ),
      // Blockquote - editorial variant renders as newspaper citation
      // Standard variant: border-left style
      // Editorial variant: newspaper-citation styling
      blockquote: ({
        children,
        ...props
      }: React.ComponentPropsWithoutRef<'blockquote'>) => {
        if (variant === 'editorial') {
          return (
            <blockquote className="newspaper-citation" {...props}>
              {children}
            </blockquote>
          );
        }
        return (
          <blockquote
            className="border-l-4 border-sage/40 pl-5 my-6 not-italic"
            {...props}
          >
            {children}
          </blockquote>
        );
      },
      // Code blocks with language detection
      code: ({
        inline,
        className: codeClassName,
        children,
        ...props
      }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      }) => {
        // Extract language from className (e.g., "language-typescript")
        const language = codeClassName?.replace('language-', '') || '';

        if (inline) {
          return (
            <code className={codeClassName} {...props}>
              {children}
            </code>
          );
        }
        // Note: Styling comes from .phonon-prose pre in globals.css
        return (
          <pre data-language={language}>
            <code className={codeClassName} {...props}>
              {children}
            </code>
          </pre>
        );
      },
    }),
    [variant]
  );

  return (
    <div className={cn(proseClass, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {textToRender}
      </ReactMarkdown>
      {typewriter && showCursor && isTyping && (
        <span className="phonon-cursor" aria-hidden="true" />
      )}
    </div>
  );
}

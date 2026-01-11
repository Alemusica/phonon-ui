/**
 * CONCRETE MARKDOWN RENDERER
 * ==========================
 * Phonon UI Component - GPUAudio-inspired stable DOM rendering
 *
 * Problem: MarkdownRenderer + useTypewriter re-parses markdown on every char,
 * causing constant reflow and layout thrashing.
 *
 * Solution: GPUAudio-style pipeline
 * 1. BUFFER: Accumulate content during streaming
 * 2. LAYOUT: Calculate positions when streaming ends (~20ms)
 * 3. BATCH: Group characters for efficient rendering
 * 4. RENDER: Reveal batches at scheduled times (no reflow)
 *
 * The DOM is rendered ONCE with all content. Characters start hidden
 * and are revealed via CSS opacity - zero layout changes during animation.
 *
 * @author Alessio Cazzaniga
 */

import React, { useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePhononPipeline } from '../core/use-phonon-pipeline';
import { cn } from '../core/utils';


// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export type ProseVariant = 'default' | 'editorial' | 'compact';

export interface ConcreteMarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Is content still streaming from LLM? */
  isStreaming?: boolean;
  /** Enable character-reveal animation */
  animated?: boolean;
  /** Additional class name */
  className?: string;
  /** Prose styling variant */
  variant?: ProseVariant;
  /** Enable drop cap for first paragraph */
  dropCap?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Enable debug logging (also set window.__PHONON_DEBUG__ = true) */
  debug?: boolean;
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Wraps all text nodes in character spans for individual reveal
 * CRITICAL: This must run synchronously before browser paint
 */
function wrapCharactersInSpans(element: Element): number {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  const nodesToReplace: Array<{ node: Text; startIndex: number }> = [];
  let textNode: Text | null;
  let globalCharIndex = 0;

  while ((textNode = walker.nextNode() as Text | null)) {
    const text = textNode.textContent || '';
    if (text.length > 0) {
      nodesToReplace.push({ node: textNode, startIndex: globalCharIndex });
      globalCharIndex += text.length;
    }
  }

  for (const { node, startIndex } of nodesToReplace) {
    const text = node.textContent || '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'concrete-char concrete-char-hidden';
      span.setAttribute('data-char-index', String(startIndex + i));
      span.textContent = text[i];
      fragment.appendChild(span);
    }

    node.parentNode?.replaceChild(fragment, node);
  }

  return globalCharIndex;
}

/**
 * Reveal characters up to given index
 */
function revealCharacters(container: Element, upToIndex: number): void {
  const chars = container.querySelectorAll('.concrete-char');
  chars.forEach((char, index) => {
    if (index < upToIndex) {
      char.classList.remove('concrete-char-hidden');
      char.classList.add('concrete-char-revealed');
    }
  });
}

/**
 * Reveal all characters immediately
 */
function revealAllCharacters(container: Element): void {
  const chars = container.querySelectorAll('.concrete-char');
  chars.forEach(char => {
    char.classList.remove('concrete-char-hidden');
    char.classList.add('concrete-char-revealed');
  });
}

// ════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════

export function ConcreteMarkdownRenderer({
  content,
  isStreaming = false,
  animated = false,
  className,
  variant = 'default',
  dropCap = false,
  onComplete,
  debug = false,
}: ConcreteMarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrappedRef = useRef(false);
  const lastRevealedRef = useRef(0);

  // Enable debug mode
  useEffect(() => {
    if (debug && typeof window !== 'undefined') {
      (window as any).__PHONON_DEBUG__ = true;
      console.log('[ConcreteMarkdownRenderer] Debug mode ENABLED');
    }
  }, [debug]);

  // Use the GPUAudio-style pipeline
  const {
    stage,
    revealedCount,
    isComplete,
    isBuffering,
    skip,
  } = usePhononPipeline({
    content,
    isStreaming,
    animated,
    onComplete,
  });

  // Prose class based on variant
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

  // ReactMarkdown components
  const components = useMemo(
    () => ({
      a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      ),
      strong: ({ children, ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
        <strong className="font-semibold" {...props}>
          {children}
        </strong>
      ),
      em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
        <em className="italic opacity-90" {...props}>
          {children}
        </em>
      ),
      blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => {
        if (variant === 'editorial') {
          return (
            <blockquote className="newspaper-citation" {...props}>
              {children}
            </blockquote>
          );
        }
        return (
          <blockquote className="border-l-4 border-sage/40 pl-5 my-6 not-italic" {...props}>
            {children}
          </blockquote>
        );
      },
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
        const language = codeClassName?.replace('language-', '') || '';
        if (inline) {
          return <code className={codeClassName} {...props}>{children}</code>;
        }
        return (
          <pre data-language={language}>
            <code className={codeClassName} {...props}>{children}</code>
          </pre>
        );
      },
    }),
    [variant]
  );

  // Wrap characters SYNCHRONOUSLY before browser paint
  // useLayoutEffect runs after DOM mutations but BEFORE paint
  // This ensures the user NEVER sees unwrapped text
  useLayoutEffect(() => {
    if (!containerRef.current || !animated || wrappedRef.current) return;

    // Only wrap when we have content and streaming is done
    if (content.length > 0 && !isStreaming) {
      // SYNCHRONOUS wrapping - no requestAnimationFrame!
      // The browser will paint AFTER this completes
      const charCount = wrapCharactersInSpans(containerRef.current);
      wrappedRef.current = true;

      if (debug) {
        console.log(`[ConcreteMarkdownRenderer] Wrapped ${charCount} chars BEFORE paint`);
      }
    }
  }, [content, isStreaming, animated, debug]);

  // Reveal characters as pipeline progresses
  useEffect(() => {
    if (!containerRef.current || !animated || !wrappedRef.current) return;

    if (revealedCount > lastRevealedRef.current) {
      // DEBUG: Log reveal progress
      if (debug || (typeof window !== 'undefined' && (window as any).__PHONON_DEBUG__)) {
        console.log(`[ConcreteMarkdownRenderer] Revealing ${revealedCount} chars (was ${lastRevealedRef.current}), stage: ${stage}`);
      }
      revealCharacters(containerRef.current, revealedCount);
      lastRevealedRef.current = revealedCount;
    }
  }, [revealedCount, animated, debug, stage]);

  // When complete or not animated, show everything
  useEffect(() => {
    if (!containerRef.current) return;

    if (isComplete || !animated) {
      if (wrappedRef.current) {
        revealAllCharacters(containerRef.current);
      }

      if (debug) {
        const chars = containerRef.current.querySelectorAll('.concrete-char');
        console.log(`[ConcreteMarkdownRenderer] Animation complete. ${chars.length} chars revealed.`);
      }
    }
  }, [isComplete, animated, debug]);

  // Reset refs when content changes significantly
  useEffect(() => {
    if (isStreaming) {
      wrappedRef.current = false;
      lastRevealedRef.current = 0;
    }
  }, [isStreaming]);

  // Buffering state (no longer used for visual indicator to avoid reflow)

  // During streaming, buffer content - don't render ReactMarkdown
  // This prevents constant re-renders and column redistribution
  const shouldRenderContent = !isStreaming || !animated;

  return (
    <div
      ref={containerRef}
      className={cn(
        proseClass,
        animated && 'concrete-markdown-renderer',
        className
      )}
      data-stage={stage}
      data-animated={animated}
    >
      {shouldRenderContent ? (
        // Streaming complete: render full content ONCE
        // Characters will be wrapped and revealed via animation
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      ) : (
        // Still streaming: show typing indicator
        // This prevents ReactMarkdown re-renders during content accumulation
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse" />
          <span className="text-sm font-mono">Composing...</span>
        </div>
      )}
    </div>
  );
}

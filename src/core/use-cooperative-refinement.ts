/**
 * Phonon UI - useCooperativeRefinement Hook
 *
 * React hook for iterative content refinement using LLM and layout constraints.
 * Implements bidirectional pipeline between Groq LLM and layout analyzer.
 *
 * Architecture:
 * 1. Analyze initial content against layout constraints
 * 2. Generate refinement prompts for constraint violations
 * 3. Call Groq LLM to refine content
 * 4. Iterate until constraints are met or max iterations reached
 *
 * @author Alessio Cazzaniga
 */

import { useState, useCallback, useRef } from 'react';
import { useGroq } from './use-groq';
import {
  RefinementLoop,
  analyzeLayout,
  DEFAULT_NEWSPAPER_CONSTRAINTS,
  type LayoutFeedback,
  type LayoutConstraints,
} from './cooperative-refinement';
import type { GroqConfig, GroqMessage } from './use-groq';

/**
 * Options for useCooperativeRefinement hook
 */
export interface UseCooperativeRefinementOptions {
  /** Initial content to refine */
  content: string;
  /** Layout constraints to enforce */
  constraints?: LayoutConstraints;
  /** Maximum refinement iterations */
  maxIterations?: number;
  /** Whether refinement is enabled */
  enabled?: boolean;
  /** Groq API configuration */
  groqConfig?: GroqConfig;
}

/**
 * Return type for useCooperativeRefinement hook
 */
export interface UseCooperativeRefinementReturn {
  /** Current refined content */
  refinedContent: string;
  /** Current layout feedback */
  feedback: LayoutFeedback | null;
  /** Is refinement in progress */
  isRefining: boolean;
  /** Current iteration count */
  iterations: number;
  /** Trigger refinement manually */
  refine: () => Promise<void>;
  /** Error message if refinement fails */
  error: string | null;
}

/**
 * Hook for cooperative content refinement using LLM and layout analyzer
 *
 * Example:
 * ```tsx
 * const { refinedContent, feedback, isRefining, refine } = useCooperativeRefinement({
 *   content: rawContent,
 *   constraints: DEFAULT_NEWSPAPER_CONSTRAINTS,
 *   maxIterations: 3,
 *   enabled: true,
 *   groqConfig: { apiKey: 'xxx', model: 'llama-3.3-70b-versatile' },
 * });
 * ```
 */
export function useCooperativeRefinement(
  options: UseCooperativeRefinementOptions
): UseCooperativeRefinementReturn {
  const {
    content,
    constraints = DEFAULT_NEWSPAPER_CONSTRAINTS,
    maxIterations = 3,
    enabled = true,
    groqConfig,
  } = options;

  // State
  const [refinedContent, setRefinedContent] = useState(content);
  const [feedback, setFeedback] = useState<LayoutFeedback | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const refinementLoopRef = useRef(new RefinementLoop(constraints));
  const abortControllerRef = useRef<AbortController | null>(null);

  // Groq integration
  const groq = useGroq(groqConfig);

  /**
   * Main refinement function
   * Iteratively refines content until constraints are met or max iterations reached
   */
  const refine = useCallback(async () => {
    if (!enabled) {
      setError('Refinement is disabled');
      return;
    }

    if (!groqConfig?.apiKey) {
      setError('Groq API key is required');
      return;
    }

    setIsRefining(true);
    setError(null);
    setIterations(0);

    // Abort any ongoing refinement
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let currentContent = content;
    let currentIteration = 0;

    try {
      // Initial analysis
      const initialFeedback = analyzeLayout(currentContent, constraints);
      setFeedback(initialFeedback);

      // If content already fits, no need to refine
      if (initialFeedback.fits) {
        setRefinedContent(currentContent);
        setIterations(0);
        setIsRefining(false);
        return;
      }

      // Refinement loop
      while (currentIteration < maxIterations) {
        // Check if aborted
        if (abortControllerRef.current.signal.aborted) {
          setError('Refinement aborted');
          break;
        }

        // Generate refinement prompt
        const { prompt, feedback: currentFeedback } =
          refinementLoopRef.current.getRefinementPrompt(currentContent);

        setFeedback(currentFeedback);

        // If content fits, we're done
        if (currentFeedback.fits) {
          setRefinedContent(currentContent);
          setIterations(currentIteration);
          break;
        }

        // Prepare messages for LLM
        const messages: GroqMessage[] = [
          {
            role: 'system',
            content:
              'You are a professional content editor. Revise the content to meet layout constraints while maintaining quality and coherence. Return only the revised content, no explanations.',
          },
          {
            role: 'user',
            content: `Original content:\n\n${currentContent}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ];

        // Call LLM for refinement
        try {
          let refinedText = '';

          // Stream LLM response
          for await (const chunk of groq.chat(messages)) {
            if (abortControllerRef.current.signal.aborted) {
              break;
            }
            refinedText += chunk;
          }

          // Update content
          currentContent = refinedText.trim();
          currentIteration++;
          setIterations(currentIteration);
          setRefinedContent(currentContent);

          // Analyze refined content
          const newFeedback = analyzeLayout(currentContent, constraints);
          setFeedback(newFeedback);

          // If constraints are met, exit loop
          if (newFeedback.fits) {
            break;
          }
        } catch (llmError) {
          const errorMsg =
            llmError instanceof Error ? llmError.message : 'LLM refinement failed';
          setError(errorMsg);
          break;
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Refinement failed';
      setError(errorMsg);
    } finally {
      setIsRefining(false);
      abortControllerRef.current = null;
    }
  }, [content, constraints, maxIterations, enabled, groqConfig, groq]);

  return {
    refinedContent,
    feedback,
    isRefining,
    iterations,
    refine,
    error,
  };
}

/**
 * USE PHONON PIPELINE
 * ====================
 * React hook that orchestrates the full GPUAudio-style rendering pipeline.
 *
 * Flow:
 * 1. BUFFERING: Accumulate content during streaming
 * 2. LAYOUT: Calculate positions when streaming ends (milliseconds)
 * 3. BATCHING: Group characters for efficient rendering
 * 4. RENDERING: Reveal batches at scheduled times with PHI timing
 *
 * @author Alessio Cazzaniga
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  PhononScheduler,
  type PipelineStage,
  type CharacterBatch,
  type SchedulerConfig,
} from './phonon-scheduler';
import { getTypingSpeedMultiplier } from './use-typewriter';
import {
  analyzeLayout,
  DEFAULT_NEWSPAPER_CONSTRAINTS,
  type LayoutFeedback,
  type LayoutConstraints,
} from './cooperative-refinement';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface UsePhononPipelineOptions {
  /** Content to render */
  content: string;
  /** Is content still streaming from LLM? */
  isStreaming: boolean;
  /** Enable animation (false = show all immediately) */
  animated?: boolean;
  /** Characters per batch */
  batchSize?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Enable cooperative refinement analysis */
  enableRefinement?: boolean;
  /** Layout constraints for refinement (defaults to newspaper constraints) */
  layoutConstraints?: LayoutConstraints;
}

export interface UsePhononPipelineReturn {
  /** Current pipeline stage */
  stage: PipelineStage;
  /** Number of characters revealed */
  revealedCount: number;
  /** Total characters to reveal */
  totalCount: number;
  /** Progress 0-1 */
  progress: number;
  /** Is animation complete? */
  isComplete: boolean;
  /** Is still buffering (streaming)? */
  isBuffering: boolean;
  /** Skip to end */
  skip: () => void;
  /** Reset animation */
  reset: () => void;
  /** Batches for debugging */
  batches: CharacterBatch[];
  /** Layout feedback from cooperative refinement (if enabled) */
  layoutFeedback: LayoutFeedback | null;
  /** Does content fit layout constraints? */
  layoutFits: boolean;
}

// ════════════════════════════════════════════════════════════════
// HOOK
// ════════════════════════════════════════════════════════════════

export function usePhononPipeline(
  options: UsePhononPipelineOptions
): UsePhononPipelineReturn {
  const {
    content,
    isStreaming,
    animated = true,
    batchSize = 8,
    onComplete,
    enableRefinement = false,
    layoutConstraints = DEFAULT_NEWSPAPER_CONSTRAINTS,
  } = options;

  // Refs
  const schedulerRef = useRef<PhononScheduler | null>(null);
  const contentRef = useRef<string>('');
  const hasStartedRef = useRef<boolean>(false);

  // State
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [revealedCount, setRevealedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [batches, setBatches] = useState<CharacterBatch[]>([]);
  const [layoutFeedback, setLayoutFeedback] = useState<LayoutFeedback | null>(null);

  // Initialize scheduler once
  useEffect(() => {
    const config: Partial<SchedulerConfig> = {
      batchSize,
      speedMultiplier: getTypingSpeedMultiplier(),
    };

    const scheduler = new PhononScheduler(config, {
      onStageChange: setStage,
      onBatchReady: (batch) => {
        // Batch is ready to be revealed
        setBatches(prev => [...prev, batch]);
      },
      onProgress: (revealed, total) => {
        setRevealedCount(revealed);
        setTotalCount(total);
      },
      onComplete: () => {
        onComplete?.();
      },
    });

    schedulerRef.current = scheduler;

    return () => {
      scheduler.stop();
      scheduler.reset();
    };
  }, [batchSize, onComplete]);

  // Handle content changes during streaming
  useEffect(() => {
    if (!schedulerRef.current || !animated) return;

    // If content changed, update buffer
    if (content !== contentRef.current) {
      contentRef.current = content;

      if (isStreaming) {
        // Still streaming - just buffer
        schedulerRef.current.setContent(content);
      }
    }
  }, [content, isStreaming, animated]);

  // When streaming ends, finalize and start animation
  useEffect(() => {
    if (!schedulerRef.current || !animated) return;

    // Streaming just ended and we have content
    if (!isStreaming && content.length > 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;

      // COOPERATIVE REFINEMENT: Analyze layout before rendering
      if (enableRefinement) {
        const feedback = analyzeLayout(content, layoutConstraints);
        setLayoutFeedback(feedback);

        // Debug logging
        if (typeof window !== 'undefined' && (window as any).__PHONON_DEBUG__) {
          console.log('[usePhononPipeline] Cooperative Refinement Analysis:', {
            fits: feedback.fits,
            issueCount: feedback.issues.length,
            issues: feedback.issues.map(i => `${i.region}: ${i.type}`),
            suggestions: feedback.suggestions,
          });
        }

        // If content doesn't fit, log warnings (but still render)
        if (!feedback.fits && feedback.issues.length > 0) {
          console.warn('[usePhononPipeline] Layout constraints not met:', feedback.suggestions);
        }
      }

      // Finalize (calculates layout + batches) - this is FAST (~20ms)
      schedulerRef.current.setContent(content);
      schedulerRef.current.finalize();

      // Update total count
      setTotalCount(schedulerRef.current.getTotalCount());

      // Start render loop
      schedulerRef.current.start();
    }
  }, [isStreaming, content, animated, enableRefinement, layoutConstraints]);

  // Non-animated mode: show everything immediately
  useEffect(() => {
    if (!animated && content.length > 0) {
      setRevealedCount(content.length);
      setTotalCount(content.length);
      setStage('complete');
    }
  }, [animated, content]);

  // Skip function
  const skip = useCallback(() => {
    schedulerRef.current?.skip();
  }, []);

  // Reset function
  const reset = useCallback(() => {
    hasStartedRef.current = false;
    contentRef.current = '';
    setRevealedCount(0);
    setTotalCount(0);
    setBatches([]);
    setStage('idle');
    setLayoutFeedback(null);
    schedulerRef.current?.reset();
  }, []);

  // Computed values
  const progress = useMemo(() => {
    return totalCount > 0 ? revealedCount / totalCount : 0;
  }, [revealedCount, totalCount]);

  const isComplete = stage === 'complete';
  const isBuffering = stage === 'buffering' || isStreaming;
  const layoutFits = layoutFeedback?.fits ?? true;

  return {
    stage,
    revealedCount,
    totalCount,
    progress,
    isComplete,
    isBuffering,
    skip,
    reset,
    batches,
    layoutFeedback,
    layoutFits,
  };
}

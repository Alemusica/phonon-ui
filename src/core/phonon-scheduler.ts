/**
 * PHONON SCHEDULER
 * =================
 * GPUAudio-inspired dual scheduler for typography rendering.
 *
 * Architecture (from GPUAudio SDK):
 * - ContentScheduler: Manages content arrival (like Host Scheduler/CPU)
 * - RenderScheduler: Manages DOM updates (like Device Scheduler/GPU)
 * - Lock-free batching: Characters grouped for efficient rendering
 * - Pipeline stages: Clear state machine for predictable behavior
 *
 * Key insight from GPUAudio:
 * - 100-200μs execution windows → We use batches of ~10 chars
 * - Pre-allocated resources → Layout calculated upfront
 * - DAG processing → Buffer → Layout → Batch → Render
 *
 * @author Alessio Cazzaniga
 */

import { calculateLayout, analyzeStructure, type LayoutRegion } from './concrete-pour';
import { MusicalOrchestrator } from './musical-orchestration';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

/** Pipeline stages (state machine) */
export type PipelineStage =
  | 'idle'        // Waiting for content
  | 'buffering'   // Accumulating streaming content
  | 'layout'      // Calculating positions
  | 'batching'    // Grouping into render batches
  | 'rendering'   // Revealing batches
  | 'complete';   // All done

/** Single character with pre-calculated position and timing */
export interface ScheduledChar {
  char: string;
  index: number;        // Global character index
  regionIndex: number;  // Which layout region
  x: number;            // Position (percentage)
  y: number;            // Line number
  delay: number;        // Absolute time to reveal (ms from start)
}

/** Batch of characters to reveal together */
export interface CharacterBatch {
  id: number;
  chars: ScheduledChar[];
  scheduledTime: number;  // When to reveal this batch (ms from start)
}

/** Scheduler configuration */
export interface SchedulerConfig {
  /** Characters per batch (default: 8) */
  batchSize: number;
  /** Target frame interval in ms (default: 16 for 60fps) */
  frameInterval: number;
  /** Speed multiplier (1.0 = normal) */
  speedMultiplier: number;
}

/** Scheduler callbacks */
export interface SchedulerCallbacks {
  onStageChange?: (stage: PipelineStage) => void;
  onBatchReady?: (batch: CharacterBatch) => void;
  onProgress?: (revealed: number, total: number) => void;
  onComplete?: () => void;
}

// ════════════════════════════════════════════════════════════════
// PHONON SCHEDULER CLASS
// ════════════════════════════════════════════════════════════════

export class PhononScheduler {
  // State
  private stage: PipelineStage = 'idle';
  private contentBuffer: string = '';
  private layout: LayoutRegion[] = [];
  private scheduledChars: ScheduledChar[] = [];
  private batches: CharacterBatch[] = [];

  // Animation state
  private startTime: number = 0;
  private frameId: number | null = null;
  private revealedCount: number = 0;

  // Configuration
  private config: SchedulerConfig;
  private callbacks: SchedulerCallbacks;

  // Musical timing
  private orchestrator: MusicalOrchestrator;

  constructor(
    config?: Partial<SchedulerConfig>,
    callbacks?: SchedulerCallbacks
  ) {
    this.config = {
      batchSize: 8,
      frameInterval: 16,
      speedMultiplier: 1.0,
      ...config,
    };
    this.callbacks = callbacks || {};
    this.orchestrator = new MusicalOrchestrator();
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 1: BUFFERING (Content accumulation during streaming)
  // ════════════════════════════════════════════════════════════════

  /**
   * Append content chunk (called during streaming)
   */
  appendContent(chunk: string): void {
    if (this.stage === 'idle') {
      this.setStage('buffering');
    }
    this.contentBuffer += chunk;
  }

  /**
   * Set complete content at once (non-streaming mode)
   */
  setContent(content: string): void {
    this.contentBuffer = content;
    this.setStage('buffering');
  }

  /**
   * Get current buffered content
   */
  getContent(): string {
    return this.contentBuffer;
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 2: LAYOUT (Calculate positions when content complete)
  // ════════════════════════════════════════════════════════════════

  /**
   * Finalize content and calculate layout
   * Called when streaming ends
   */
  finalize(): void {
    if (this.contentBuffer.length === 0) {
      this.setStage('complete');
      return;
    }

    this.setStage('layout');

    // Analyze structure
    const structure = analyzeStructure(this.contentBuffer);

    // Calculate layout regions with character positions
    this.layout = calculateLayout(this.contentBuffer, structure);

    // Flatten to scheduled chars with absolute timing
    this.scheduledChars = this.flattenLayout();

    // DEBUG: Log timing info
    if (typeof window !== 'undefined' && (window as any).__PHONON_DEBUG__) {
      const lastChar = this.scheduledChars[this.scheduledChars.length - 1];
      console.log('[PhononScheduler] finalize:', {
        totalChars: this.scheduledChars.length,
        speedMultiplier: this.config.speedMultiplier,
        firstDelay: this.scheduledChars[0]?.delay,
        lastDelay: lastChar?.delay,
        estimatedDuration: `${((lastChar?.delay || 0) / 1000).toFixed(1)}s`,
      });
    }

    // Create batches
    this.setStage('batching');
    this.batches = this.createBatches();

    // Ready to render
    this.setStage('rendering');
  }

  /**
   * Flatten layout regions into single array of scheduled chars
   */
  private flattenLayout(): ScheduledChar[] {
    const chars: ScheduledChar[] = [];
    let globalIndex = 0;

    for (let regionIdx = 0; regionIdx < this.layout.length; regionIdx++) {
      const region = this.layout[regionIdx];

      for (const pos of region.charPositions) {
        chars.push({
          char: pos.char,
          index: globalIndex,
          regionIndex: regionIdx,
          x: pos.x,
          y: pos.y,
          delay: pos.delay * this.config.speedMultiplier,
        });
        globalIndex++;
      }
    }

    return chars;
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 3: BATCHING (Group chars for efficient rendering)
  // ════════════════════════════════════════════════════════════════

  /**
   * Create batches from scheduled chars
   * Groups by time proximity, not just count
   */
  private createBatches(): CharacterBatch[] {
    const batches: CharacterBatch[] = [];

    if (this.scheduledChars.length === 0) return batches;

    let currentBatch: ScheduledChar[] = [];
    let batchId = 0;
    let batchStartTime = this.scheduledChars[0].delay;

    for (const char of this.scheduledChars) {
      // Start new batch if:
      // 1. Current batch is full, OR
      // 2. Time gap is too large (> 50ms)
      const timeGap = char.delay - batchStartTime;

      if (currentBatch.length >= this.config.batchSize || timeGap > 50) {
        if (currentBatch.length > 0) {
          batches.push({
            id: batchId++,
            chars: currentBatch,
            scheduledTime: batchStartTime,
          });
        }
        currentBatch = [];
        batchStartTime = char.delay;
      }

      currentBatch.push(char);
    }

    // Last batch
    if (currentBatch.length > 0) {
      batches.push({
        id: batchId,
        chars: currentBatch,
        scheduledTime: batchStartTime,
      });
    }

    return batches;
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 4: RENDERING (Release batches at scheduled times)
  // ════════════════════════════════════════════════════════════════

  /**
   * Start the render loop
   */
  start(): void {
    if (this.stage !== 'rendering') {
      console.warn('PhononScheduler: Cannot start, not in rendering stage');
      return;
    }

    this.startTime = performance.now();
    this.revealedCount = 0;
    this.renderLoop();
  }

  /**
   * Main render loop (GPUAudio-style frame scheduling)
   */
  private renderLoop = (): void => {
    const elapsed = performance.now() - this.startTime;

    // Find batches that should be revealed now
    let newRevealed = 0;

    for (const batch of this.batches) {
      if (batch.scheduledTime <= elapsed) {
        // This batch should be visible
        const lastCharIndex = batch.chars[batch.chars.length - 1]?.index ?? -1;
        if (lastCharIndex >= this.revealedCount) {
          // New batch to reveal
          this.callbacks.onBatchReady?.(batch);
          newRevealed = Math.max(newRevealed, lastCharIndex + 1);
        }
      }
    }

    if (newRevealed > this.revealedCount) {
      this.revealedCount = newRevealed;
      this.callbacks.onProgress?.(this.revealedCount, this.scheduledChars.length);
    }

    // Continue or complete
    if (this.revealedCount < this.scheduledChars.length) {
      this.frameId = requestAnimationFrame(this.renderLoop);
    } else {
      this.setStage('complete');
      this.callbacks.onComplete?.();
    }
  };

  /**
   * Stop rendering
   */
  stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Skip to end (reveal all immediately)
   */
  skip(): void {
    this.stop();

    // Reveal all batches
    for (const batch of this.batches) {
      this.callbacks.onBatchReady?.(batch);
    }

    this.revealedCount = this.scheduledChars.length;
    this.callbacks.onProgress?.(this.revealedCount, this.scheduledChars.length);
    this.setStage('complete');
    this.callbacks.onComplete?.();
  }

  // ════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ════════════════════════════════════════════════════════════════

  private setStage(stage: PipelineStage): void {
    this.stage = stage;
    this.callbacks.onStageChange?.(stage);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.stop();
    this.stage = 'idle';
    this.contentBuffer = '';
    this.layout = [];
    this.scheduledChars = [];
    this.batches = [];
    this.revealedCount = 0;
    this.startTime = 0;
  }

  // ════════════════════════════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════════════════════════════

  getStage(): PipelineStage { return this.stage; }
  getRevealedCount(): number { return this.revealedCount; }
  getTotalCount(): number { return this.scheduledChars.length; }
  getProgress(): number {
    return this.scheduledChars.length > 0
      ? this.revealedCount / this.scheduledChars.length
      : 0;
  }
  getBatches(): CharacterBatch[] { return this.batches; }
  getLayout(): LayoutRegion[] { return this.layout; }

  /**
   * Update speed multiplier (can be called during animation)
   */
  setSpeedMultiplier(multiplier: number): void {
    this.config.speedMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
  }
}

// ════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ════════════════════════════════════════════════════════════════

/**
 * Create a new scheduler instance
 */
export function createScheduler(
  config?: Partial<SchedulerConfig>,
  callbacks?: SchedulerCallbacks
): PhononScheduler {
  return new PhononScheduler(config, callbacks);
}

/**
 * VISUAL DEBUGGER
 * ================
 * Testing system for typography rendering pipeline.
 *
 * Features:
 * - Captures absolute coordinates of every character
 * - Records timing of appearance
 * - Tracks position changes (reflow detection)
 * - Compares actual vs expected from pipeline plan
 *
 * Usage:
 * 1. Attach to container: debugger.attach(element)
 * 2. Start recording: debugger.startRecording()
 * 3. After animation: debugger.getReport()
 *
 * @author Alessio Cazzaniga
 */

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

/** Single character observation */
export interface CharObservation {
  charIndex: number;
  char: string;
  /** Absolute X position in viewport */
  x: number;
  /** Absolute Y position in viewport */
  y: number;
  /** Width of character */
  width: number;
  /** Height of character */
  height: number;
  /** Time when first observed visible (ms from start) */
  appearedAt: number;
  /** Was it visible when observed? */
  visible: boolean;
  /** CSS opacity value */
  opacity: number;
}

/** Position change record (reflow detection) */
export interface PositionChange {
  charIndex: number;
  char: string;
  /** Previous position */
  from: { x: number; y: number };
  /** New position */
  to: { x: number; y: number };
  /** Delta */
  delta: { x: number; y: number };
  /** When change was detected */
  timestamp: number;
}

/** Expected vs Actual comparison */
export interface CharComparison {
  charIndex: number;
  char: string;
  expected: {
    x: number;
    y: number;
    delay: number;
  } | null;
  actual: {
    x: number;
    y: number;
    appearedAt: number;
  } | null;
  /** Position difference */
  positionDelta: { x: number; y: number } | null;
  /** Timing difference (ms) */
  timingDelta: number | null;
  /** Did position match? */
  positionMatch: boolean;
  /** Did timing match (within tolerance)? */
  timingMatch: boolean;
}

/** Full debug report */
export interface DebugReport {
  /** Total characters tracked */
  totalChars: number;
  /** Characters that appeared */
  appearedChars: number;
  /** Position changes detected (reflows) */
  positionChanges: PositionChange[];
  /** Number of reflows */
  reflowCount: number;
  /** All character observations */
  observations: CharObservation[];
  /** Expected vs Actual comparisons */
  comparisons: CharComparison[];
  /** Timing stats */
  timing: {
    firstCharAt: number;
    lastCharAt: number;
    totalDuration: number;
    avgInterval: number;
  };
  /** Summary */
  summary: {
    positionAccuracy: number; // 0-100%
    timingAccuracy: number;   // 0-100%
    reflowFree: boolean;
    issues: string[];
  };
}

/** Expected plan from scheduler */
export interface ExpectedPlan {
  chars: Array<{
    index: number;
    char: string;
    x: number;
    y: number;
    delay: number;
  }>;
}

// ════════════════════════════════════════════════════════════════
// VISUAL DEBUGGER CLASS
// ════════════════════════════════════════════════════════════════

/** Phase event for detailed logging */
export interface PhaseEvent {
  phase: string;
  timestamp: number;
  details: Record<string, unknown>;
}

/** DOM snapshot for comparison */
export interface DOMSnapshot {
  timestamp: number;
  phase: string;
  elementCount: number;
  charCount: number;
  containerRect: { width: number; height: number; top: number; left: number };
  firstCharPosition: { x: number; y: number } | null;
  lastCharPosition: { x: number; y: number } | null;
}

export class VisualDebugger {
  private container: Element | null = null;
  private observer: MutationObserver | null = null;
  private rafId: number | null = null;
  private startTime: number = 0;
  private isRecording: boolean = false;

  // Tracking data
  private observations: Map<number, CharObservation> = new Map();
  private previousPositions: Map<number, { x: number; y: number }> = new Map();
  private positionChanges: PositionChange[] = [];
  private expectedPlan: ExpectedPlan | null = null;

  // Enhanced logging
  private phaseEvents: PhaseEvent[] = [];
  private domSnapshots: DOMSnapshot[] = [];
  private verboseLogging: boolean = false;

  // Configuration
  private positionTolerance: number = 2; // pixels
  private timingTolerance: number = 50;  // ms

  constructor(options?: {
    positionTolerance?: number;
    timingTolerance?: number;
    verbose?: boolean;
  }) {
    if (options?.positionTolerance) this.positionTolerance = options.positionTolerance;
    if (options?.timingTolerance) this.timingTolerance = options.timingTolerance;
    if (options?.verbose) this.verboseLogging = options.verbose;
  }

  /**
   * Enable verbose logging mode
   */
  setVerbose(enabled: boolean): void {
    this.verboseLogging = enabled;
    console.log(`[VisualDebugger] Verbose logging ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Log a phase event with details
   */
  logPhase(phase: string, details: Record<string, unknown> = {}): void {
    const event: PhaseEvent = {
      phase,
      timestamp: this.startTime > 0 ? performance.now() - this.startTime : 0,
      details,
    };
    this.phaseEvents.push(event);

    if (this.verboseLogging) {
      console.log(`[PHASE] ${phase} @ ${event.timestamp.toFixed(1)}ms`, details);
    }
  }

  /**
   * Take a DOM snapshot for comparison
   */
  takeSnapshot(phase: string): DOMSnapshot {
    if (!this.container) {
      throw new Error('[VisualDebugger] No container attached');
    }

    const containerRect = this.container.getBoundingClientRect();
    const chars = this.container.querySelectorAll('.concrete-char');
    const textNodes = this.container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');

    let firstCharPos: { x: number; y: number } | null = null;
    let lastCharPos: { x: number; y: number } | null = null;

    if (chars.length > 0) {
      const firstRect = chars[0].getBoundingClientRect();
      const lastRect = chars[chars.length - 1].getBoundingClientRect();
      firstCharPos = { x: firstRect.left, y: firstRect.top };
      lastCharPos = { x: lastRect.left, y: lastRect.top };
    }

    const snapshot: DOMSnapshot = {
      timestamp: this.startTime > 0 ? performance.now() - this.startTime : 0,
      phase,
      elementCount: textNodes.length,
      charCount: chars.length,
      containerRect: {
        width: containerRect.width,
        height: containerRect.height,
        top: containerRect.top,
        left: containerRect.left,
      },
      firstCharPosition: firstCharPos,
      lastCharPosition: lastCharPos,
    };

    this.domSnapshots.push(snapshot);

    if (this.verboseLogging) {
      console.log(`[SNAPSHOT] ${phase}:`, {
        chars: snapshot.charCount,
        container: `${snapshot.containerRect.width.toFixed(0)}x${snapshot.containerRect.height.toFixed(0)}`,
        firstChar: firstCharPos ? `(${firstCharPos.x.toFixed(0)}, ${firstCharPos.y.toFixed(0)})` : 'N/A',
      });
    }

    return snapshot;
  }

  /**
   * Compare two snapshots and report differences
   */
  compareSnapshots(before: DOMSnapshot, after: DOMSnapshot): void {
    const heightDiff = after.containerRect.height - before.containerRect.height;
    const charDiff = after.charCount - before.charCount;

    let firstCharShift = { x: 0, y: 0 };
    if (before.firstCharPosition && after.firstCharPosition) {
      firstCharShift = {
        x: after.firstCharPosition.x - before.firstCharPosition.x,
        y: after.firstCharPosition.y - before.firstCharPosition.y,
      };
    }

    console.log(`\n═══ SNAPSHOT COMPARISON: ${before.phase} → ${after.phase} ═══`);
    console.log(`  Time: ${before.timestamp.toFixed(1)}ms → ${after.timestamp.toFixed(1)}ms`);
    console.log(`  Chars: ${before.charCount} → ${after.charCount} (${charDiff >= 0 ? '+' : ''}${charDiff})`);
    console.log(`  Container height: ${before.containerRect.height.toFixed(0)} → ${after.containerRect.height.toFixed(0)} (${heightDiff >= 0 ? '+' : ''}${heightDiff.toFixed(1)}px)`);

    if (Math.abs(firstCharShift.x) > 0.5 || Math.abs(firstCharShift.y) > 0.5) {
      console.log(`  ⚠️ FIRST CHAR SHIFT: Δ(${firstCharShift.x.toFixed(1)}, ${firstCharShift.y.toFixed(1)})`);
    } else {
      console.log(`  ✓ First char stable`);
    }
    console.log('═══════════════════════════════════════════════════════\n');
  }

  /**
   * Get all phase events
   */
  getPhaseEvents(): PhaseEvent[] {
    return [...this.phaseEvents];
  }

  /**
   * Get all DOM snapshots
   */
  getSnapshots(): DOMSnapshot[] {
    return [...this.domSnapshots];
  }

  /**
   * Attach to a container element
   */
  attach(container: Element): void {
    this.container = container;
    console.log('[VisualDebugger] Attached to container');
  }

  /**
   * Set expected plan from scheduler for comparison
   */
  setExpectedPlan(plan: ExpectedPlan): void {
    this.expectedPlan = plan;
    console.log(`[VisualDebugger] Expected plan set: ${plan.chars.length} chars`);
  }

  /**
   * Start recording observations
   */
  startRecording(): void {
    if (!this.container) {
      console.error('[VisualDebugger] No container attached');
      return;
    }

    this.reset();
    this.startTime = performance.now();
    this.isRecording = true;

    // Initial scan
    this.scanCharacters();

    // Set up mutation observer for DOM changes
    this.observer = new MutationObserver(() => {
      if (this.isRecording) {
        this.scanCharacters();
      }
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Also poll with RAF for smooth tracking
    const poll = () => {
      if (this.isRecording) {
        this.scanCharacters();
        this.rafId = requestAnimationFrame(poll);
      }
    };
    this.rafId = requestAnimationFrame(poll);

    console.log('[VisualDebugger] Recording started');
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    this.isRecording = false;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    console.log('[VisualDebugger] Recording stopped');
  }

  /**
   * Scan all character elements and record observations
   */
  private scanCharacters(): void {
    if (!this.container) return;

    const elapsed = performance.now() - this.startTime;
    const chars = this.container.querySelectorAll('.concrete-char');

    chars.forEach((charEl) => {
      const indexAttr = charEl.getAttribute('data-char-index');
      if (!indexAttr) return;

      const index = parseInt(indexAttr, 10);
      const rect = charEl.getBoundingClientRect();
      const style = window.getComputedStyle(charEl);
      const opacity = parseFloat(style.opacity);
      const isVisible = !charEl.classList.contains('concrete-char-hidden') && opacity > 0;

      const observation: CharObservation = {
        charIndex: index,
        char: charEl.textContent || '',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        appearedAt: elapsed,
        visible: isVisible,
        opacity,
      };

      // Check for position changes (reflow)
      const prevPos = this.previousPositions.get(index);
      if (prevPos) {
        const dx = Math.abs(rect.left - prevPos.x);
        const dy = Math.abs(rect.top - prevPos.y);

        if (dx > this.positionTolerance || dy > this.positionTolerance) {
          this.positionChanges.push({
            charIndex: index,
            char: charEl.textContent || '',
            from: prevPos,
            to: { x: rect.left, y: rect.top },
            delta: { x: rect.left - prevPos.x, y: rect.top - prevPos.y },
            timestamp: elapsed,
          });
        }
      }

      // Update previous position
      this.previousPositions.set(index, { x: rect.left, y: rect.top });

      // Only record first appearance time
      const existing = this.observations.get(index);
      if (!existing || (!existing.visible && isVisible)) {
        if (isVisible) {
          observation.appearedAt = elapsed;
        }
        this.observations.set(index, observation);
      } else if (existing && !existing.visible && isVisible) {
        existing.appearedAt = elapsed;
        existing.visible = true;
      }
    });
  }

  /**
   * Generate full debug report
   */
  getReport(): DebugReport {
    const observations = Array.from(this.observations.values());
    const appearedChars = observations.filter(o => o.visible);

    // Calculate timing stats
    const appearTimes = appearedChars.map(o => o.appearedAt).sort((a, b) => a - b);
    const firstCharAt = appearTimes[0] || 0;
    const lastCharAt = appearTimes[appearTimes.length - 1] || 0;
    const totalDuration = lastCharAt - firstCharAt;

    let avgInterval = 0;
    if (appearTimes.length > 1) {
      let totalInterval = 0;
      for (let i = 1; i < appearTimes.length; i++) {
        totalInterval += appearTimes[i] - appearTimes[i - 1];
      }
      avgInterval = totalInterval / (appearTimes.length - 1);
    }

    // Generate comparisons if we have expected plan
    const comparisons: CharComparison[] = [];
    if (this.expectedPlan) {
      for (const expected of this.expectedPlan.chars) {
        const actual = this.observations.get(expected.index);

        const positionDelta = actual ? {
          x: actual.x - expected.x,
          y: actual.y - expected.y,
        } : null;

        const timingDelta = actual ? actual.appearedAt - expected.delay : null;

        const positionMatch = positionDelta
          ? Math.abs(positionDelta.x) <= this.positionTolerance &&
            Math.abs(positionDelta.y) <= this.positionTolerance
          : false;

        const timingMatch = timingDelta !== null
          ? Math.abs(timingDelta) <= this.timingTolerance
          : false;

        comparisons.push({
          charIndex: expected.index,
          char: expected.char,
          expected: {
            x: expected.x,
            y: expected.y,
            delay: expected.delay,
          },
          actual: actual ? {
            x: actual.x,
            y: actual.y,
            appearedAt: actual.appearedAt,
          } : null,
          positionDelta,
          timingDelta,
          positionMatch,
          timingMatch,
        });
      }
    }

    // Calculate accuracy
    const positionMatches = comparisons.filter(c => c.positionMatch).length;
    const timingMatches = comparisons.filter(c => c.timingMatch).length;
    const positionAccuracy = comparisons.length > 0
      ? (positionMatches / comparisons.length) * 100
      : 100;
    const timingAccuracy = comparisons.length > 0
      ? (timingMatches / comparisons.length) * 100
      : 100;

    // Generate issues list
    const issues: string[] = [];
    if (this.positionChanges.length > 0) {
      issues.push(`REFLOW DETECTED: ${this.positionChanges.length} position changes`);
    }
    if (positionAccuracy < 90) {
      issues.push(`Position accuracy low: ${positionAccuracy.toFixed(1)}%`);
    }
    if (timingAccuracy < 80) {
      issues.push(`Timing accuracy low: ${timingAccuracy.toFixed(1)}%`);
    }
    if (appearedChars.length < observations.length) {
      issues.push(`${observations.length - appearedChars.length} chars never appeared`);
    }

    return {
      totalChars: observations.length,
      appearedChars: appearedChars.length,
      positionChanges: this.positionChanges,
      reflowCount: this.positionChanges.length,
      observations,
      comparisons,
      timing: {
        firstCharAt,
        lastCharAt,
        totalDuration,
        avgInterval,
      },
      summary: {
        positionAccuracy,
        timingAccuracy,
        reflowFree: this.positionChanges.length === 0,
        issues,
      },
    };
  }

  /**
   * Print report to console
   */
  printReport(): void {
    const report = this.getReport();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('              VISUAL DEBUGGER REPORT');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Total Characters: ${report.totalChars}`);
    console.log(`Appeared: ${report.appearedChars}`);
    console.log(`Reflows Detected: ${report.reflowCount}`);

    console.log('\n── TIMING ──');
    console.log(`First char at: ${report.timing.firstCharAt.toFixed(1)}ms`);
    console.log(`Last char at: ${report.timing.lastCharAt.toFixed(1)}ms`);
    console.log(`Total duration: ${report.timing.totalDuration.toFixed(1)}ms`);
    console.log(`Avg interval: ${report.timing.avgInterval.toFixed(1)}ms`);

    console.log('\n── ACCURACY ──');
    console.log(`Position: ${report.summary.positionAccuracy.toFixed(1)}%`);
    console.log(`Timing: ${report.summary.timingAccuracy.toFixed(1)}%`);
    console.log(`Reflow-free: ${report.summary.reflowFree ? 'YES ✓' : 'NO ✗'}`);

    if (report.summary.issues.length > 0) {
      console.log('\n── ISSUES ──');
      report.summary.issues.forEach(issue => {
        console.log(`  ✗ ${issue}`);
      });
    }

    if (report.positionChanges.length > 0) {
      console.log('\n── REFLOWS (first 10) ──');
      report.positionChanges.slice(0, 10).forEach(change => {
        console.log(`  Char ${change.charIndex} "${change.char}": (${change.from.x.toFixed(0)},${change.from.y.toFixed(0)}) → (${change.to.x.toFixed(0)},${change.to.y.toFixed(0)}) Δ(${change.delta.x.toFixed(0)},${change.delta.y.toFixed(0)})`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Reset all tracking data
   */
  reset(): void {
    this.observations.clear();
    this.previousPositions.clear();
    this.positionChanges = [];
    this.phaseEvents = [];
    this.domSnapshots = [];
    this.startTime = 0;
  }

  /**
   * Detach from container
   */
  detach(): void {
    this.stopRecording();
    this.container = null;
  }
}

// ════════════════════════════════════════════════════════════════
// FACTORY & HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Create a new debugger instance
 */
export function createVisualDebugger(options?: {
  positionTolerance?: number;
  timingTolerance?: number;
}): VisualDebugger {
  return new VisualDebugger(options);
}

/**
 * Quick debug helper - attaches to element and logs report after delay
 */
export async function debugElement(
  element: Element,
  durationMs: number = 5000
): Promise<DebugReport> {
  const debugger_ = new VisualDebugger();
  debugger_.attach(element);
  debugger_.startRecording();

  await new Promise(resolve => setTimeout(resolve, durationMs));

  debugger_.stopRecording();
  debugger_.printReport();

  return debugger_.getReport();
}

// Export singleton for easy access in console
export const visualDebugger = new VisualDebugger();

// Make available globally for browser console debugging
if (typeof window !== 'undefined') {
  (window as unknown as { phononDebugger: VisualDebugger }).phononDebugger = visualDebugger;
}

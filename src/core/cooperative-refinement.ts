/**
 * COOPERATIVE REFINEMENT SYSTEM
 * ==============================
 * Bidirectional iterative pipeline between LLM and Layouter.
 *
 * Architecture inspired by GPUAudio SDK's buffer negotiation pattern:
 * 1. LLM generates initial content
 * 2. Layouter analyzes and provides feedback
 * 3. LLM refines based on constraints
 * 4. Iterate until convergence or max iterations
 *
 * This is analogous to GPUAudio's negotiation between CPU and GPU buffers:
 * - LLM = Content Producer (like audio source)
 * - Layouter = Content Consumer (like audio renderer)
 * - Feedback = Buffer size negotiation (format/capacity constraints)
 *
 * Key insight: Instead of forcing content into fixed layouts, we negotiate
 * the optimal content shape through iterative refinement.
 *
 * @author Alessio Cazzaniga
 */

import { analyzeStructure, type ContentStructure } from './concrete-pour';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

/**
 * Issue detected by layouter during constraint validation
 */
export interface LayoutIssue {
  /** Type of layout constraint violation */
  type: 'overflow' | 'orphan' | 'widow' | 'too_short' | 'too_long';
  /** Which region has the issue (headline, body, citation, etc.) */
  region: string;
  /** Human-readable description for LLM */
  message: string;
  /** Character limit that was exceeded (if applicable) */
  charLimit?: number;
  /** Current character count (if applicable) */
  currentCount?: number;
}

/**
 * Feedback from layouter to LLM
 * Analogous to GPU buffer capability report in GPUAudio
 */
export interface LayoutFeedback {
  /** Does content fit within constraints? */
  fits: boolean;
  /** List of constraint violations */
  issues: LayoutIssue[];
  /** Actionable suggestions for LLM to refine content */
  suggestions: string[];
  /** Content structure analysis */
  structure?: ContentStructure;
}

/**
 * Hard constraints for newspaper layout
 * Based on Swiss typography and print traditions
 */
export interface LayoutConstraints {
  /** Maximum characters for headline */
  headlineMaxChars: number;
  /** Maximum characters for subheadline */
  subheadlineMaxChars: number;
  /** Maximum characters for citations/quotes */
  citationMaxChars: number;
  /** Target characters per line in body columns */
  columnCharWidth: number;
  /** Minimum number of paragraphs for article */
  minParagraphs: number;
  /** Minimum words per paragraph */
  minWordsPerParagraph: number;
  /** Maximum consecutive lines ending with hyphens */
  maxConsecutiveHyphens: number;
  /** Avoid single-word last lines (orphans) */
  preventOrphans: boolean;
  /** Avoid single-line column starters from prev paragraph (widows) */
  preventWidows: boolean;
}

/**
 * Default newspaper layout constraints
 */
export const DEFAULT_NEWSPAPER_CONSTRAINTS: LayoutConstraints = {
  headlineMaxChars: 60,
  subheadlineMaxChars: 100,
  citationMaxChars: 200,
  columnCharWidth: 45,
  minParagraphs: 3,
  minWordsPerParagraph: 20,
  maxConsecutiveHyphens: 2,
  preventOrphans: true,
  preventWidows: true,
};

/**
 * Metrics tracking refinement performance
 */
export interface RefinementMetrics {
  /** Total iterations executed */
  iterations: number;
  /** Time per iteration (ms) */
  iterationTimes: number[];
  /** Number of issues fixed per iteration */
  issuesFixed: number[];
  /** Final layout quality score (0-100) */
  finalScore: number;
  /** Whether refinement converged successfully */
  converged: boolean;
  /** Total time spent (ms) */
  totalTime: number;
}

/**
 * Result of refinement process
 */
export interface RefinementResult {
  /** Final refined content */
  content: string;
  /** Final feedback state */
  feedback: LayoutFeedback;
  /** Performance metrics */
  metrics: RefinementMetrics;
  /** History of all feedbacks */
  history: LayoutFeedback[];
}

// ════════════════════════════════════════════════════════════════
// LAYOUT ANALYSIS
// ════════════════════════════════════════════════════════════════

/**
 * Analyze content against layout constraints
 * This is the "Layouter" role - validates and provides feedback
 */
export function analyzeLayout(
  content: string,
  constraints: LayoutConstraints
): LayoutFeedback {
  const issues: LayoutIssue[] = [];
  const suggestions: string[] = [];

  // Analyze structure using concrete-pour
  const structure = analyzeStructure(content);

  // Check headline length
  if (structure.hasHeadline && structure.headlineText) {
    const headlineLen = structure.headlineText.length;
    if (headlineLen > constraints.headlineMaxChars) {
      issues.push({
        type: 'too_long',
        region: 'headline',
        message: `Headline is ${headlineLen} chars, exceeds limit of ${constraints.headlineMaxChars}`,
        charLimit: constraints.headlineMaxChars,
        currentCount: headlineLen,
      });
      suggestions.push(
        `Shorten headline to ${constraints.headlineMaxChars} characters or less. Current: ${headlineLen} chars.`
      );
    }
  }

  // Check subheadline length
  if (structure.hasSubheadline && structure.subheadlineText) {
    const subheadlineLen = structure.subheadlineText.length;
    if (subheadlineLen > constraints.subheadlineMaxChars) {
      issues.push({
        type: 'too_long',
        region: 'subheadline',
        message: `Subheadline is ${subheadlineLen} chars, exceeds limit of ${constraints.subheadlineMaxChars}`,
        charLimit: constraints.subheadlineMaxChars,
        currentCount: subheadlineLen,
      });
      suggestions.push(
        `Shorten subheadline to ${constraints.subheadlineMaxChars} characters or less. Current: ${subheadlineLen} chars.`
      );
    }
  }

  // Check citations
  if (structure.hasCitations) {
    const citations = content.match(/^>\s+(.+)$/gm) || [];
    citations.forEach((citation, idx) => {
      const citationText = citation.replace(/^>\s+/, '');
      if (citationText.length > constraints.citationMaxChars) {
        issues.push({
          type: 'too_long',
          region: `citation-${idx}`,
          message: `Citation ${idx + 1} is ${citationText.length} chars, exceeds limit of ${constraints.citationMaxChars}`,
          charLimit: constraints.citationMaxChars,
          currentCount: citationText.length,
        });
        suggestions.push(
          `Shorten citation ${idx + 1} to ${constraints.citationMaxChars} characters or less.`
        );
      }
    });
  }

  // Check minimum paragraphs
  if (structure.totalParagraphs < constraints.minParagraphs) {
    issues.push({
      type: 'too_short',
      region: 'body',
      message: `Only ${structure.totalParagraphs} paragraphs, need at least ${constraints.minParagraphs}`,
      currentCount: structure.totalParagraphs,
    });
    suggestions.push(
      `Add more paragraphs to reach minimum of ${constraints.minParagraphs}. Consider expanding on key points.`
    );
  }

  // Check paragraph length
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  paragraphs.forEach((para, idx) => {
    const words = para.split(/\s+/).filter(w => w.length > 0);
    if (words.length < constraints.minWordsPerParagraph && !para.startsWith('#') && !para.startsWith('>')) {
      issues.push({
        type: 'too_short',
        region: `paragraph-${idx}`,
        message: `Paragraph ${idx + 1} has only ${words.length} words, minimum is ${constraints.minWordsPerParagraph}`,
        currentCount: words.length,
      });
      suggestions.push(
        `Expand paragraph ${idx + 1} to at least ${constraints.minWordsPerParagraph} words.`
      );
    }
  });

  // Check for orphans (single words on last line)
  if (constraints.preventOrphans) {
    paragraphs.forEach((para, idx) => {
      if (para.startsWith('#') || para.startsWith('>')) return;

      const lines = para.split('\n');
      const lastLine = lines[lines.length - 1]?.trim();
      const words = lastLine?.split(/\s+/) || [];

      if (words.length === 1 && words[0].length < 15) {
        issues.push({
          type: 'orphan',
          region: `paragraph-${idx}`,
          message: `Paragraph ${idx + 1} ends with a single short word (orphan)`,
        });
        suggestions.push(
          `Reword paragraph ${idx + 1} to avoid single-word last line.`
        );
      }
    });
  }

  // Check column width estimation
  const bodyParagraphs = paragraphs.filter(p => !p.startsWith('#') && !p.startsWith('>'));
  bodyParagraphs.forEach((para, idx) => {
    const lines = para.split('\n');
    lines.forEach(line => {
      if (line.length > constraints.columnCharWidth * 1.5) {
        issues.push({
          type: 'overflow',
          region: `paragraph-${idx}`,
          message: `Line exceeds comfortable column width`,
          charLimit: constraints.columnCharWidth,
          currentCount: line.length,
        });
      }
    });
  });

  const fits = issues.length === 0;

  return {
    fits,
    issues,
    suggestions,
    structure,
  };
}

/**
 * Calculate layout quality score (0-100)
 * Higher score = better adherence to constraints
 */
export function calculateQualityScore(
  feedback: LayoutFeedback
): number {
  if (feedback.fits) return 100;

  // Weight different issue types
  const weights = {
    too_long: 15,
    too_short: 10,
    overflow: 20,
    orphan: 5,
    widow: 5,
  };

  let deductions = 0;
  for (const issue of feedback.issues) {
    deductions += weights[issue.type] || 10;
  }

  // Cap at 0
  return Math.max(0, 100 - deductions);
}

// ════════════════════════════════════════════════════════════════
// REFINEMENT LOOP
// ════════════════════════════════════════════════════════════════

/**
 * Refinement loop controller
 * Manages iterative content refinement between LLM and Layouter
 *
 * Inspired by GPUAudio buffer negotiation:
 * - Initial content = initial buffer proposal
 * - Feedback = capability report
 * - Refinement = buffer size adjustment
 * - Convergence = optimal buffer agreement
 */
export class RefinementLoop {
  private constraints: LayoutConstraints;
  private history: LayoutFeedback[] = [];
  private iterationTimes: number[] = [];
  private issuesFixed: number[] = [];

  constructor(constraints: LayoutConstraints = DEFAULT_NEWSPAPER_CONSTRAINTS) {
    this.constraints = constraints;
  }

  /**
   * Generate refinement prompt for LLM
   * Translates layout feedback into actionable instructions
   */
  private generateRefinementPrompt(
    feedback: LayoutFeedback,
    iteration: number
  ): string {
    const parts: string[] = [];

    parts.push(`[REFINEMENT ITERATION ${iteration}]`);
    parts.push('');
    parts.push('The layout analysis found the following issues:');
    parts.push('');

    // Group issues by region
    const issuesByRegion = new Map<string, LayoutIssue[]>();
    for (const issue of feedback.issues) {
      const existing = issuesByRegion.get(issue.region) || [];
      existing.push(issue);
      issuesByRegion.set(issue.region, existing);
    }

    // Format issues
    issuesByRegion.forEach((issues, region) => {
      parts.push(`**${region}**:`);
      issues.forEach(issue => {
        parts.push(`- ${issue.message}`);
      });
      parts.push('');
    });

    // Add suggestions
    if (feedback.suggestions.length > 0) {
      parts.push('**Action items**:');
      feedback.suggestions.forEach((suggestion, idx) => {
        parts.push(`${idx + 1}. ${suggestion}`);
      });
      parts.push('');
    }

    parts.push('Please revise the content to address these issues while maintaining quality and coherence.');

    return parts.join('\n');
  }

  /**
   * Main refinement method
   * Iteratively analyzes and provides feedback until convergence
   *
   * @param content Initial content from LLM
   * @param constraintsOverride Layout constraints to enforce
   * @param maxIterations Maximum refinement iterations
   * @returns Refinement result with final content and metrics
   */
  async refine(
    content: string,
    constraintsOverride?: LayoutConstraints,
    maxIterations: number = 3
  ): Promise<RefinementResult> {
    const startTime = performance.now();

    if (constraintsOverride) {
      this.constraints = constraintsOverride;
    }

    this.history = [];
    this.iterationTimes = [];
    this.issuesFixed = [];

    let currentContent = content;
    let currentFeedback: LayoutFeedback | null = null;
    let iteration = 0;

    // Initial analysis
    const iterationStart = performance.now();
    currentFeedback = analyzeLayout(currentContent, this.constraints);
    this.history.push(currentFeedback);
    this.iterationTimes.push(performance.now() - iterationStart);

    // Track initial issues
    const initialIssueCount = currentFeedback.issues.length;

    // Refinement loop
    while (!currentFeedback.fits && iteration < maxIterations) {
      iteration++;

      // Generate refinement prompt
      const prompt = this.generateRefinementPrompt(currentFeedback, iteration);

      // NOTE: In real implementation, this would call the LLM
      // For now, we just store the prompt and return feedback
      // The actual LLM call would happen in the consuming code
      console.log('[RefinementLoop] Generated prompt:', prompt);

      // In a full implementation, we'd wait for LLM response here
      // For now, we'll track the feedback and break
      break;
    }

    const totalTime = performance.now() - startTime;

    // Calculate final score
    const finalScore = calculateQualityScore(currentFeedback);

    // Track issues fixed
    const finalIssueCount = currentFeedback.issues.length;
    this.issuesFixed.push(Math.max(0, initialIssueCount - finalIssueCount));

    const metrics: RefinementMetrics = {
      iterations: this.history.length,
      iterationTimes: this.iterationTimes,
      issuesFixed: this.issuesFixed,
      finalScore,
      converged: currentFeedback.fits,
      totalTime,
    };

    return {
      content: currentContent,
      feedback: currentFeedback,
      metrics,
      history: this.history,
    };
  }

  /**
   * Get refinement prompt without running full loop
   * Useful for generating prompts to send to LLM externally
   */
  getRefinementPrompt(content: string): { prompt: string; feedback: LayoutFeedback } {
    const feedback = analyzeLayout(content, this.constraints);
    const prompt = this.generateRefinementPrompt(feedback, 1);
    return { prompt, feedback };
  }

  /**
   * Analyze content and return feedback
   * One-shot analysis without refinement loop
   */
  analyze(content: string): LayoutFeedback {
    return analyzeLayout(content, this.constraints);
  }

  /**
   * Get current constraints
   */
  getConstraints(): LayoutConstraints {
    return { ...this.constraints };
  }

  /**
   * Update constraints
   */
  setConstraints(constraints: Partial<LayoutConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints };
  }

  /**
   * Get refinement history
   */
  getHistory(): LayoutFeedback[] {
    return [...this.history];
  }

  /**
   * Clear history and reset state
   */
  reset(): void {
    this.history = [];
    this.iterationTimes = [];
    this.issuesFixed = [];
  }
}

// ════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════

/**
 * Create a summary of refinement metrics for logging
 */
export function summarizeMetrics(metrics: RefinementMetrics): string {
  const parts: string[] = [];

  parts.push('Refinement Metrics:');
  parts.push(`- Iterations: ${metrics.iterations}`);
  parts.push(`- Total time: ${metrics.totalTime.toFixed(0)}ms`);
  parts.push(`- Avg iteration: ${(metrics.totalTime / metrics.iterations).toFixed(0)}ms`);
  parts.push(`- Issues fixed: ${metrics.issuesFixed.reduce((a, b) => a + b, 0)}`);
  parts.push(`- Final score: ${metrics.finalScore}/100`);
  parts.push(`- Converged: ${metrics.converged ? 'Yes' : 'No'}`);

  return parts.join('\n');
}

/**
 * Validate that content meets minimum newspaper standards
 */
export function validateNewspaperContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const structure = analyzeStructure(content);

  if (!structure.hasHeadline) {
    errors.push('Missing headline (# Headline)');
  }

  if (structure.totalParagraphs < 1) {
    errors.push('No body paragraphs found');
  }

  if (structure.totalWords < 50) {
    errors.push('Content too short for newspaper layout');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

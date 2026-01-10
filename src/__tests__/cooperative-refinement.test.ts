/**
 * Cooperative Refinement Benchmark Tests
 * Compares forward-only vs iterative refinement pipelines
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orchestrator, type ProductionResult } from '../core/orchestrator';
import { runVisualQA, type QAIssue } from '../core/visual-qa';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface BenchmarkResult {
  pipeline: 'forward' | 'iterative';
  testCase: string;
  duration: number;
  iterations: number;
  qualityScore: number;
  issues: {
    critical: number;
    warning: number;
    info: number;
  };
  fixesApplied: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

interface TestContent {
  name: string;
  text: string;
  expectedIssues: string[];
  complexity: 'low' | 'medium' | 'high';
}

// ════════════════════════════════════════════════════════════════════════════
// TEST CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const TEST_CONTENT: TestContent[] = [
  {
    name: 'Short Content (< 100 words)',
    text: `The quick brown fox jumps over the lazy dog. Swiss design principles emphasize clarity, readability, and the use of the typographic grid. These principles guide modern interface design.`,
    expectedIssues: [],
    complexity: 'low',
  },
  {
    name: 'Medium Content (200-400 words)',
    text: `
      # The Evolution of Typography

      Swiss typography, also known as International Typographic Style, emerged in the 1950s
      in Switzerland. It emphasized cleanliness, readability, and objectivity. Pioneers like
      Max Bill, Emil Ruder, and Josef Müller-Brockmann developed principles that still
      influence design today.

      ## Core Principles

      The use of sans-serif typefaces, often Helvetica, became a hallmark. Grid systems
      provided structure and hierarchy. Photography replaced illustrations. Asymmetric layouts
      created dynamic compositions. These elements combined to form a systematic approach to
      visual communication.

      The movement prioritized content over decoration, believing that form should follow
      function. This philosophy aligned with modernist ideals and influenced architecture,
      product design, and graphic design globally. The mathematical precision of Swiss design
      created timeless work that remains relevant decades later.

      Today's digital interfaces owe much to these principles. The clarity of Swiss typography
      translates naturally to screen-based media, where readability and hierarchy are paramount.
    `,
    expectedIssues: ['hierarchy'],
    complexity: 'medium',
  },
  {
    name: 'Long Content (> 500 words)',
    text: `
      # The Golden Ratio in Design

      ## Historical Context

      The golden ratio, approximately 1.618, has fascinated mathematicians, artists, and
      designers for centuries. Ancient Greek architects used it in the Parthenon. Renaissance
      painters like Leonardo da Vinci incorporated it into their compositions. This mathematical
      constant appears throughout nature: in spiral galaxies, nautilus shells, and the
      proportions of the human body.

      ## Mathematical Foundation

      The golden ratio emerges from the Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55...
      As the sequence progresses, the ratio between consecutive numbers approaches phi (φ = 1.618).
      This self-similar property creates aesthetically pleasing proportions that feel natural
      to the human eye.

      ## Application in Typography

      In typography, the golden ratio informs line length, line height, and margin proportions.
      A body text with 65 characters per line relates to line height through phi. Margins can
      follow golden ratio proportions: if the inner margin is 1 unit, the outer might be 1.618
      units. This creates visual balance without conscious awareness.

      ## Digital Design

      Modern web design uses the golden ratio in column widths, spacing systems, and component
      sizing. A two-column layout might allocate space in a 1:1.618 ratio. Font size scales can
      follow the ratio: if body text is 16px, headings might be 26px (16 × 1.618). This creates
      harmonious hierarchies.

      ## Criticism and Debate

      Critics argue the golden ratio's importance is overstated. Some studies suggest humans
      don't inherently prefer golden ratio proportions over other balanced ratios. The ratio's
      presence in nature may be coincidental rather than fundamental. Despite skepticism, many
      designers find it a useful tool for creating pleasing proportions.

      ## Practical Implementation

      In Phonon UI, we use PHI-based spacing throughout the component library. Space scales
      follow powers of the golden ratio: xs, sm, md, lg, xl. Component sizing, padding, and
      margins reference this system. While users may not consciously notice, the mathematical
      consistency creates cohesive visual rhythm.

      The golden ratio serves as a guide, not a rule. Context and content should always take
      priority over mathematical perfection. When proportions serve the user's needs and enhance
      readability, the design succeeds regardless of mathematical purity.
    `,
    expectedIssues: ['overflow', 'hierarchy'],
    complexity: 'high',
  },
  {
    name: 'Content with Overflow Issues',
    text: `
      ## VeryLongWordWithoutBreaksThatWillDefinitelyCauseHorizontalOverflowInMostLayoutContainers

      This text contains supercalifragilisticexpialidocious words and
      pneumonoultramicroscopicsilicovolcanoconiosis terms that challenge word-breaking algorithms.

      https://this-is-an-extremely-long-url-that-will-not-break-naturally-and-will-cause-overflow-in-most-container-widths-especially-on-mobile-devices.example.com/path/to/resource

      ConsecutiveCapitalizedWordsWithoutSpacesLikeThisCanAlsoCauseLayoutProblemsInNarrowContainers.
    `,
    expectedIssues: ['overflow', 'word-break'],
    complexity: 'high',
  },
  {
    name: 'Content with Structure Problems',
    text: `
      # Heading 1
      ## Heading 2
      ### Heading 3
      #### Heading 4
      ##### Heading 5
      ###### Heading 6
      # Another Heading 1
      #### Heading 4 (skipped levels)
      ## Heading 2

      Paragraph with **bold** and *italic* and ***bold italic*** text.

      - List item 1
      - List item 2
        - Nested item 2.1
          - Deep nested 2.1.1

      > Blockquote with a very long line that might cause overflow issues depending on the container width and the font size being used for the quotation text.

      \`\`\`
      // Code block that might overflow
      const veryLongVariableName = 'This is a very long string that might cause horizontal overflow in code blocks';
      \`\`\`
    `,
    expectedIssues: ['hierarchy', 'overflow'],
    complexity: 'high',
  },
];

// ════════════════════════════════════════════════════════════════════════════
// MOCK LLM RESPONSES
// ════════════════════════════════════════════════════════════════════════════

interface MockLLMResponse {
  layout: string;
  iteration: number;
}

/**
 * Mock LLM that generates deterministic layout responses
 * Simulates iterative improvement based on feedback
 */
class MockLLM {
  private responseDelay: number;

  constructor(responseDelay = 50) {
    this.responseDelay = responseDelay;
  }

  /**
   * Generate initial layout (forward pass)
   */
  async generateLayout(content: string): Promise<MockLLMResponse> {
    await this.simulateDelay();

    // Simple deterministic layout based on content length
    const wordCount = content.split(/\s+/).length;
    const hasHeadings = content.includes('#');
    const hasLongWords = /\w{30,}/.test(content);

    let layout = '<div class="newspaper-page">';

    if (wordCount < 100) {
      layout += '<div class="newspaper-column single">';
      layout += `<div class="newspaper-body">${content}</div>`;
      layout += '</div>';
    } else if (wordCount < 300) {
      layout += '<div class="newspaper-grid columns-2">';
      layout += `<div class="newspaper-column"><div class="newspaper-body">${content.slice(0, content.length / 2)}</div></div>`;
      layout += `<div class="newspaper-column"><div class="newspaper-body">${content.slice(content.length / 2)}</div></div>`;
      layout += '</div>';
    } else {
      layout += '<div class="newspaper-grid columns-3">';
      const third = Math.floor(content.length / 3);
      layout += `<div class="newspaper-column"><div class="newspaper-body">${content.slice(0, third)}</div></div>`;
      layout += `<div class="newspaper-column"><div class="newspaper-body">${content.slice(third, third * 2)}</div></div>`;
      layout += `<div class="newspaper-column"><div class="newspaper-body">${content.slice(third * 2)}</div></div>`;
      layout += '</div>';
    }

    // Intentionally add overflow issues for long words (to test fixing)
    if (hasLongWords) {
      layout = layout.replace('<div class="newspaper-body"', '<div class="newspaper-body" style="overflow: visible; word-break: normal"');
    }

    layout += '</div>';

    return { layout, iteration: 0 };
  }

  /**
   * Refine layout based on QA feedback (iterative pass)
   */
  async refineLayout(
    previousLayout: string,
    feedback: QAIssue[],
    iteration: number
  ): Promise<MockLLMResponse> {
    await this.simulateDelay();

    let refinedLayout = previousLayout;

    // Apply fixes based on feedback
    for (const issue of feedback) {
      if (issue.type === 'overflow') {
        // Add overflow handling
        refinedLayout = refinedLayout.replace(
          'overflow: visible',
          'overflow: hidden'
        );
        refinedLayout = refinedLayout.replace(
          'word-break: normal',
          'word-break: break-word'
        );
      }

      if (issue.type === 'word-break') {
        // Fix word breaking
        refinedLayout = refinedLayout.replace(
          'hyphens: none',
          'hyphens: auto'
        );
      }

      if (issue.type === 'contrast') {
        // Improve contrast
        refinedLayout = refinedLayout.replace(
          'color: #888',
          'color: #1a1a1a'
        );
      }
    }

    return { layout: refinedLayout, iteration };
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.responseDelay));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DOM HELPERS
// ════════════════════════════════════════════════════════════════════════════

function createContainerFromHTML(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // Mock client dimensions for testing
  const mockDimensions = (el: HTMLElement) => {
    Object.defineProperty(el, 'clientWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(el, 'clientHeight', {
      configurable: true,
      value: 600,
    });

    // Check if element has overflow styles
    const style = el.getAttribute('style') || '';
    const hasOverflow = style.includes('overflow: visible') || /\w{30,}/.test(el.textContent || '');

    Object.defineProperty(el, 'scrollWidth', {
      configurable: true,
      value: hasOverflow ? 1000 : 800, // Overflow if intentional or long words
    });
    Object.defineProperty(el, 'scrollHeight', {
      configurable: true,
      value: 600,
    });
  };

  // Apply to container and all children
  mockDimensions(container);
  container.querySelectorAll('*').forEach(el => mockDimensions(el as HTMLElement));

  return container;
}

function cleanupContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// QUALITY SCORING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate quality score based on production result
 * Score range: 0-100 (higher is better)
 */
function calculateQualityScore(result: ProductionResult): number {
  let score = 100;

  // Deduct points for issues
  const criticalWeight = 20;
  const warningWeight = 5;
  const infoWeight = 1;

  const allIssues = result.reports.flatMap(r => r.issues);
  const criticalCount = allIssues.filter(i => i.severity === 'critical' && !i.autoFixable).length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;

  score -= criticalCount * criticalWeight;
  score -= warningCount * warningWeight;
  score -= infoCount * infoWeight;

  // Bonus for applied fixes
  score += Math.min(result.fixesApplied * 2, 10);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

// ════════════════════════════════════════════════════════════════════════════
// PIPELINE IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Forward-only pipeline: LLM → Layout → Render
 */
async function runForwardPipeline(
  content: TestContent,
  llm: MockLLM
): Promise<BenchmarkResult> {
  const startTime = performance.now();

  // Step 1: LLM generates layout
  const { layout } = await llm.generateLayout(content.text);

  // Step 2: Render to DOM
  const container = createContainerFromHTML(layout);

  // Step 3: Run QA check
  const orchestrator = new Orchestrator({
    autoFix: true,
    haltOnCritical: false,
  });
  const result = await orchestrator.runProduction(container);

  const duration = performance.now() - startTime;
  const qualityScore = calculateQualityScore(result);

  cleanupContainer(container);

  return {
    pipeline: 'forward',
    testCase: content.name,
    duration,
    iterations: 1,
    qualityScore,
    issues: {
      critical: result.criticalIssues,
      warning: result.reports.flatMap(r => r.issues).filter(i => i.severity === 'warning').length,
      info: result.reports.flatMap(r => r.issues).filter(i => i.severity === 'info').length,
    },
    fixesApplied: result.fixesApplied,
    success: result.success,
  };
}

/**
 * Iterative refinement pipeline: LLM ↔ Layouter (iterate) → Render
 */
async function runIterativePipeline(
  content: TestContent,
  llm: MockLLM,
  maxIterations = 3
): Promise<BenchmarkResult> {
  const startTime = performance.now();
  let iteration = 0;
  let layout = '';
  let container: HTMLElement | null = null;
  let result: ProductionResult | null = null;
  let qualityScore = 0;
  let totalFixesApplied = 0;

  // Initial generation
  const initialResponse = await llm.generateLayout(content.text);
  layout = initialResponse.layout;
  iteration++;

  // Iterate until quality threshold or max iterations
  while (iteration <= maxIterations) {
    // Render current layout
    if (container) cleanupContainer(container);
    container = createContainerFromHTML(layout);

    // Run QA
    const orchestrator = new Orchestrator({
      autoFix: false, // Don't auto-fix in iterative mode - let LLM refine
      haltOnCritical: false,
    });
    result = await orchestrator.runProduction(container);
    qualityScore = calculateQualityScore(result);
    totalFixesApplied += result.fixesApplied;

    // Check if quality is acceptable
    if (qualityScore >= 90 || result.criticalIssues === 0) {
      break; // Good enough
    }

    // If not last iteration, ask LLM to refine
    if (iteration < maxIterations) {
      const issues = result.reports.flatMap(r => r.issues);
      const qaIssues: QAIssue[] = issues.map(i => ({
        type: i.type as QAIssue['type'],
        severity: i.severity,
        element: i.elementSelector,
        description: i.description,
        suggestion: i.autoFixable ? 'Apply auto-fix' : 'Manual intervention required',
      }));

      const refinedResponse = await llm.refineLayout(layout, qaIssues, iteration);
      layout = refinedResponse.layout;
      iteration++;
    } else {
      break;
    }
  }

  const duration = performance.now() - startTime;

  if (container) cleanupContainer(container);

  if (!result) {
    throw new Error('No result from iterative pipeline');
  }

  return {
    pipeline: 'iterative',
    testCase: content.name,
    duration,
    iterations: iteration,
    qualityScore,
    issues: {
      critical: result.criticalIssues,
      warning: result.reports.flatMap(r => r.issues).filter(i => i.severity === 'warning').length,
      info: result.reports.flatMap(r => r.issues).filter(i => i.severity === 'info').length,
    },
    fixesApplied: totalFixesApplied,
    success: result.success,
    metadata: {
      finalIteration: iteration,
      converged: qualityScore >= 90,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// BENCHMARK TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Forward Pipeline Benchmark', () => {
  const llm = new MockLLM(10); // Fast mock for testing
  const results: BenchmarkResult[] = [];

  TEST_CONTENT.forEach(content => {
    it(`should process: ${content.name}`, async () => {
      const result = await runForwardPipeline(content, llm);
      results.push(result);

      expect(result.pipeline).toBe('forward');
      expect(result.iterations).toBe(1);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  it('should export forward pipeline results', () => {
    expect(results.length).toBe(TEST_CONTENT.length);

    // Store for comparison
    (globalThis as unknown as Record<string, BenchmarkResult[]>).forwardResults = results;
  });
});

describe('Iterative Pipeline Benchmark', () => {
  const llm = new MockLLM(10);
  const results: BenchmarkResult[] = [];

  TEST_CONTENT.forEach(content => {
    it(`should process: ${content.name}`, async () => {
      const result = await runIterativePipeline(content, llm, 3);
      results.push(result);

      expect(result.pipeline).toBe('iterative');
      expect(result.iterations).toBeGreaterThanOrEqual(1);
      expect(result.iterations).toBeLessThanOrEqual(3);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  it('should export iterative pipeline results', () => {
    expect(results.length).toBe(TEST_CONTENT.length);

    // Store for comparison
    (globalThis as unknown as Record<string, BenchmarkResult[]>).iterativeResults = results;
  });
});

describe('Quality Comparison', () => {
  it('should compare quality scores', () => {
    const forwardResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).forwardResults || [];
    const iterativeResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).iterativeResults || [];

    expect(forwardResults.length).toBe(iterativeResults.length);

    forwardResults.forEach((forward, i) => {
      const iterative = iterativeResults[i];

      console.log(`\n${forward.testCase}:`);
      console.log(`  Forward:   Quality=${forward.qualityScore}, Time=${forward.duration.toFixed(1)}ms`);
      console.log(`  Iterative: Quality=${iterative.qualityScore}, Time=${iterative.duration.toFixed(1)}ms, Iterations=${iterative.iterations}`);

      // Iterative should generally have equal or better quality
      // (May take longer due to iterations)
      expect(iterative.qualityScore).toBeGreaterThanOrEqual(forward.qualityScore - 10);
    });
  });

  it('should analyze time vs quality tradeoff', () => {
    const forwardResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).forwardResults || [];
    const iterativeResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).iterativeResults || [];

    const forwardAvgTime = forwardResults.reduce((sum, r) => sum + r.duration, 0) / forwardResults.length;
    const iterativeAvgTime = iterativeResults.reduce((sum, r) => sum + r.duration, 0) / iterativeResults.length;

    const forwardAvgQuality = forwardResults.reduce((sum, r) => sum + r.qualityScore, 0) / forwardResults.length;
    const iterativeAvgQuality = iterativeResults.reduce((sum, r) => sum + r.qualityScore, 0) / iterativeResults.length;

    console.log('\n=== AGGREGATE STATISTICS ===');
    console.log(`Forward Pipeline:`);
    console.log(`  Avg Time: ${forwardAvgTime.toFixed(1)}ms`);
    console.log(`  Avg Quality: ${forwardAvgQuality.toFixed(1)}`);
    console.log(`Iterative Pipeline:`);
    console.log(`  Avg Time: ${iterativeAvgTime.toFixed(1)}ms`);
    console.log(`  Avg Quality: ${iterativeAvgQuality.toFixed(1)}`);
    console.log(`  Avg Iterations: ${(iterativeResults.reduce((sum, r) => sum + r.iterations, 0) / iterativeResults.length).toFixed(1)}`);
    console.log(`Tradeoff:`);
    console.log(`  Quality Improvement: ${((iterativeAvgQuality - forwardAvgQuality) / forwardAvgQuality * 100).toFixed(1)}%`);
    console.log(`  Time Overhead: ${((iterativeAvgTime - forwardAvgTime) / forwardAvgTime * 100).toFixed(1)}%`);

    expect(forwardAvgTime).toBeGreaterThan(0);
    expect(iterativeAvgTime).toBeGreaterThan(0);
  });

  it('should identify which pipeline is better for each content type', () => {
    const forwardResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).forwardResults || [];
    const iterativeResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).iterativeResults || [];

    const recommendations: Record<string, string> = {};

    forwardResults.forEach((forward, i) => {
      const iterative = iterativeResults[i];

      // Decision logic: if iterative is >10% better quality and <50% slower, recommend iterative
      const qualityImprovement = (iterative.qualityScore - forward.qualityScore) / forward.qualityScore;
      const timeOverhead = (iterative.duration - forward.duration) / forward.duration;

      let recommendation = 'forward';
      if (qualityImprovement > 0.1 && timeOverhead < 0.5) {
        recommendation = 'iterative';
      } else if (iterative.qualityScore > forward.qualityScore && iterative.duration < forward.duration * 2) {
        recommendation = 'iterative';
      }

      recommendations[forward.testCase] = recommendation;
    });

    console.log('\n=== RECOMMENDATIONS ===');
    Object.entries(recommendations).forEach(([testCase, rec]) => {
      console.log(`${testCase}: ${rec}`);
    });

    expect(Object.keys(recommendations).length).toBe(TEST_CONTENT.length);
  });

  it('should export complete benchmark results as JSON', () => {
    const forwardResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).forwardResults || [];
    const iterativeResults = (globalThis as unknown as Record<string, BenchmarkResult[]>).iterativeResults || [];

    const benchmarkData = {
      timestamp: new Date().toISOString(),
      testSuite: 'Cooperative Refinement Benchmark',
      results: {
        forward: forwardResults,
        iterative: iterativeResults,
      },
      summary: {
        totalTests: forwardResults.length,
        forwardAvgTime: forwardResults.reduce((sum, r) => sum + r.duration, 0) / forwardResults.length,
        iterativeAvgTime: iterativeResults.reduce((sum, r) => sum + r.duration, 0) / iterativeResults.length,
        forwardAvgQuality: forwardResults.reduce((sum, r) => sum + r.qualityScore, 0) / forwardResults.length,
        iterativeAvgQuality: iterativeResults.reduce((sum, r) => sum + r.qualityScore, 0) / iterativeResults.length,
        avgIterations: iterativeResults.reduce((sum, r) => sum + r.iterations, 0) / iterativeResults.length,
      },
    };

    // Export to file (only in Node.js environment)
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        const outputPath = resolve(process.cwd(), 'benchmark-results.json');
        writeFileSync(outputPath, JSON.stringify(benchmarkData, null, 2));
        console.log(`\n✓ Benchmark results exported to: ${outputPath}`);
      } catch (error) {
        console.warn('Could not write benchmark results to file:', error);
      }
    }

    expect(benchmarkData.results.forward.length).toBeGreaterThan(0);
    expect(benchmarkData.results.iterative.length).toBeGreaterThan(0);
    expect(benchmarkData.summary.totalTests).toBe(TEST_CONTENT.length);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// EDGE CASES & STRESS TESTS
// ════════════════════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  const llm = new MockLLM(5);

  it('should handle empty content', async () => {
    const emptyContent: TestContent = {
      name: 'Empty Content',
      text: '',
      expectedIssues: [],
      complexity: 'low',
    };

    const forwardResult = await runForwardPipeline(emptyContent, llm);
    expect(forwardResult.success).toBe(true);

    const iterativeResult = await runIterativePipeline(emptyContent, llm, 2);
    expect(iterativeResult.success).toBe(true);
  });

  it('should handle content with only whitespace', async () => {
    const whitespaceContent: TestContent = {
      name: 'Whitespace Only',
      text: '   \n\n   \t\t   ',
      expectedIssues: [],
      complexity: 'low',
    };

    const forwardResult = await runForwardPipeline(whitespaceContent, llm);
    expect(forwardResult.duration).toBeGreaterThan(0);
  });

  it('should handle maximum iterations limit', async () => {
    const complexContent = TEST_CONTENT.find(c => c.complexity === 'high')!;

    const result = await runIterativePipeline(complexContent, llm, 5);
    expect(result.iterations).toBeLessThanOrEqual(5);
  });

  it('should converge early if quality is excellent', async () => {
    const simpleContent = TEST_CONTENT.find(c => c.complexity === 'low')!;

    const result = await runIterativePipeline(simpleContent, llm, 10);

    // Should converge in fewer iterations for simple content
    expect(result.iterations).toBeLessThan(10);
  });
});

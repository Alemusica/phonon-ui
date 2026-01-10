/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PHONON UI - ORCHESTRATOR                                                 ║
 * ║  Production Line System - DNA-Aware Department Coordination               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Like a manufacturing plant with specialized departments:
 *
 *   PHYSICS DEPT    → Collision detection, overflow prevention
 *   LINGUISTICS DEPT → Typography, hyphenation, word integrity
 *   OPTICS DEPT     → Color contrast, visual hierarchy
 *   QA DEPT         → Final inspection, defect reporting
 *
 * Flow: Content → Physics → Linguistics → Optics → QA → Output
 *
 * Each department can:
 *   1. INSPECT - Find issues
 *   2. FIX - Auto-correct if possible
 *   3. ESCALATE - Pass to next department or reject
 */

import {
  DNA_LIBRARY,
  ElementDNA,
  OPTICS_LIGHT,
  OPTICS_DARK,
  type ElementType,
} from './design-dna';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

/** Departments in the production line */
export type Department = 'physics' | 'linguistics' | 'optics' | 'qa';

/** Issue severity levels */
export type Severity = 'critical' | 'warning' | 'info';

/** Issue found by a department */
export interface ProductionIssue {
  department: Department;
  type: 'collision' | 'overflow' | 'contrast' | 'typography' | 'hierarchy' | 'word-break';
  severity: Severity;
  element: HTMLElement | null;
  elementSelector: string;
  dnaType?: ElementType;
  description: string;
  measurement?: {
    actual: number;
    expected: number;
    unit: string;
  };
  autoFixable: boolean;
  fix?: () => void;
}

/** Department report after inspection */
export interface DepartmentReport {
  department: Department;
  status: 'pass' | 'warning' | 'fail';
  issues: ProductionIssue[];
  fixesApplied: number;
  duration: number;
  timestamp: number;
}

/** Production run result */
export interface ProductionResult {
  success: boolean;
  reports: DepartmentReport[];
  totalIssues: number;
  criticalIssues: number;
  fixesApplied: number;
  duration: number;
}

/** Orchestrator configuration */
export interface OrchestratorConfig {
  /** Enable auto-fix for issues */
  autoFix: boolean;
  /** Stop production on critical issues */
  haltOnCritical: boolean;
  /** Theme for optics checks */
  theme: 'light' | 'dark';
  /** Departments to run (in order) */
  pipeline: Department[];
  /** Tolerance for measurements (px) */
  tolerance: number;
}

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: OrchestratorConfig = {
  autoFix: true,
  haltOnCritical: false,
  theme: 'light',
  pipeline: ['physics', 'linguistics', 'optics', 'qa'],
  tolerance: 1, // 1px tolerance
};

// ════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR CLASS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Production Line Orchestrator
 * Coordinates all departments in sequence
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private observers: Set<(result: ProductionResult) => void>;
  private lastResult: ProductionResult | null;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.observers = new Set();
    this.lastResult = null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN PRODUCTION RUN
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Run full production pipeline on a container
   */
  async runProduction(container: HTMLElement): Promise<ProductionResult> {
    const startTime = performance.now();
    const reports: DepartmentReport[] = [];
    let totalFixes = 0;

    // Run each department in pipeline order
    for (const dept of this.config.pipeline) {
      const report = await this.runDepartment(dept, container);
      reports.push(report);
      totalFixes += report.fixesApplied;

      // Halt on critical if configured
      if (this.config.haltOnCritical && report.status === 'fail') {
        break;
      }
    }

    const allIssues = reports.flatMap(r => r.issues);
    const result: ProductionResult = {
      success: !reports.some(r => r.status === 'fail'),
      reports,
      totalIssues: allIssues.length,
      criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
      fixesApplied: totalFixes,
      duration: performance.now() - startTime,
    };

    this.lastResult = result;
    this.notifyObservers(result);
    return result;
  }

  /**
   * Run a single department
   */
  private async runDepartment(dept: Department, container: HTMLElement): Promise<DepartmentReport> {
    const startTime = performance.now();
    const timestamp = Date.now();
    let issues: ProductionIssue[] = [];
    let fixesApplied = 0;

    // Run department-specific inspection
    switch (dept) {
      case 'physics':
        issues = this.inspectPhysics(container);
        break;
      case 'linguistics':
        issues = this.inspectLinguistics(container);
        break;
      case 'optics':
        issues = this.inspectOptics(container);
        break;
      case 'qa':
        issues = this.inspectQA(container);
        break;
    }

    // Auto-fix if enabled
    if (this.config.autoFix) {
      for (const issue of issues) {
        if (issue.autoFixable && issue.fix) {
          issue.fix();
          fixesApplied++;
        }
      }
    }

    // Determine status
    const hasCritical = issues.some(i => i.severity === 'critical' && !i.autoFixable);
    const hasWarning = issues.some(i => i.severity === 'warning');

    return {
      department: dept,
      status: hasCritical ? 'fail' : hasWarning ? 'warning' : 'pass',
      issues,
      fixesApplied,
      duration: performance.now() - startTime,
      timestamp,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHYSICS DEPARTMENT
  // Collision detection, overflow prevention, boundary enforcement
  // ──────────────────────────────────────────────────────────────────────────

  private inspectPhysics(container: HTMLElement): ProductionIssue[] {
    const issues: ProductionIssue[] = [];
    const tolerance = this.config.tolerance;

    // Check for horizontal overflow (CRITICAL - content hitting walls)
    this.queryElements(container, '*').forEach(el => {
      if (el.scrollWidth > el.clientWidth + tolerance) {
        const dnaType = this.detectDNAType(el);
        const dna = this.getDNAForElement(dnaType);

        issues.push({
          department: 'physics',
          type: 'overflow',
          severity: 'critical',
          element: el,
          elementSelector: this.getSelector(el),
          dnaType,
          description: `Horizontal overflow: content (${el.scrollWidth}px) exceeds container (${el.clientWidth}px)`,
          measurement: {
            actual: el.scrollWidth,
            expected: el.clientWidth,
            unit: 'px',
          },
          autoFixable: dna?.bounds.width.elastic ?? false,
          fix: dna?.bounds.width.elastic ? () => this.fixOverflow(el) : undefined,
        });
      }
    });

    // Check column minimum widths (from DNA)
    this.queryElements(container, '.newspaper-column').forEach((el, i) => {
      const minWidth = DNA_LIBRARY.stemVertical.bounds.width.min as number;
      if (el.clientWidth < minWidth - tolerance) {
        issues.push({
          department: 'physics',
          type: 'collision',
          severity: 'warning',
          element: el,
          elementSelector: `.newspaper-column:nth-child(${i + 1})`,
          dnaType: 'stem',
          description: `Column width (${el.clientWidth}px) below DNA minimum (${minWidth}px)`,
          measurement: {
            actual: el.clientWidth,
            expected: minWidth,
            unit: 'px',
          },
          autoFixable: false, // Requires layout change
        });
      }
    });

    // Check citation minimum width
    this.queryElements(container, '.newspaper-citation').forEach(el => {
      const minWidth = DNA_LIBRARY.petalCitation.bounds.width.min as number;
      if (el.clientWidth < minWidth - tolerance) {
        issues.push({
          department: 'physics',
          type: 'collision',
          severity: 'warning',
          element: el,
          elementSelector: '.newspaper-citation',
          dnaType: 'petal',
          description: `Citation width (${el.clientWidth}px) below DNA minimum (${minWidth}px)`,
          measurement: {
            actual: el.clientWidth,
            expected: minWidth,
            unit: 'px',
          },
          autoFixable: false,
        });
      }
    });

    return issues;
  }

  /**
   * Fix overflow by reducing font size iteratively
   */
  private fixOverflow(el: HTMLElement): void {
    const maxIterations = 10;
    let iterations = 0;

    while (el.scrollWidth > el.clientWidth && iterations < maxIterations) {
      const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
      const newSize = currentSize * 0.9; // Reduce by 10%
      el.style.fontSize = `${newSize}px`;
      iterations++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LINGUISTICS DEPARTMENT
  // Typography, hyphenation, word integrity
  // ──────────────────────────────────────────────────────────────────────────

  private inspectLinguistics(container: HTMLElement): ProductionIssue[] {
    const issues: ProductionIssue[] = [];

    // Check for word-break: break-all (violates word integrity)
    this.queryElements(container, '*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.wordBreak === 'break-all') {
        const dnaType = this.detectDNAType(el);
        const dna = this.getDNAForElement(dnaType);

        // Only flag if DNA says element is not breakable
        if (dna && !dna.breakable) {
          issues.push({
            department: 'linguistics',
            type: 'word-break',
            severity: 'critical',
            element: el,
            elementSelector: this.getSelector(el),
            dnaType,
            description: 'Word integrity violated: break-all splits words mid-character',
            autoFixable: true,
            fix: () => {
              el.style.wordBreak = 'keep-all';
              el.style.overflowWrap = 'break-word';
            },
          });
        }
      }
    });

    // Check headlines have proper text-wrap
    this.queryElements(container, '.newspaper-hl1, .newspaper-hl2, .newspaper-hl3, h1, h2, h3').forEach(el => {
      const style = window.getComputedStyle(el);
      const textWrap = (style as unknown as Record<string, string>).textWrap;
      if (textWrap !== 'balance') {
        issues.push({
          department: 'linguistics',
          type: 'typography',
          severity: 'info',
          element: el,
          elementSelector: this.getSelector(el),
          dnaType: 'petal',
          description: 'Headline missing text-wrap: balance for line balancing',
          autoFixable: true,
          fix: () => {
            (el.style as unknown as Record<string, string>).textWrap = 'balance';
          },
        });
      }
    });

    // Check hyphenation on body text
    this.queryElements(container, '.newspaper-body, .newspaper-article-flow p').forEach(el => {
      const style = window.getComputedStyle(el);
      const lang = el.closest('[lang]')?.getAttribute('lang') || 'en';

      if (style.hyphens === 'none' || style.hyphens === 'manual') {
        issues.push({
          department: 'linguistics',
          type: 'typography',
          severity: 'info',
          element: el,
          elementSelector: this.getSelector(el),
          dnaType: 'petal',
          description: `Body text missing auto-hyphenation (lang: ${lang})`,
          autoFixable: true,
          fix: () => {
            el.style.hyphens = 'auto';
          },
        });
      }
    });

    return issues;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OPTICS DEPARTMENT
  // Color contrast, visual hierarchy
  // ──────────────────────────────────────────────────────────────────────────

  private inspectOptics(container: HTMLElement): ProductionIssue[] {
    const issues: ProductionIssue[] = [];
    const colors = this.config.theme === 'light' ? OPTICS_LIGHT : OPTICS_DARK;
    const minContrast = colors.coupling.minContrast;

    // Check text contrast
    this.queryElements(container, 'p, h1, h2, h3, h4, h5, h6, span, .newspaper-body').forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = this.getEffectiveBackgroundColor(el);

      const contrast = this.calculateContrastRatio(color, bgColor);

      if (contrast < minContrast) {
        issues.push({
          department: 'optics',
          type: 'contrast',
          severity: contrast < 3 ? 'critical' : 'warning',
          element: el,
          elementSelector: this.getSelector(el),
          description: `Insufficient contrast ratio: ${contrast.toFixed(2)} (minimum: ${minContrast})`,
          measurement: {
            actual: contrast,
            expected: minContrast,
            unit: ':1',
          },
          autoFixable: true,
          fix: () => {
            el.style.color = colors.text.primary;
          },
        });
      }
    });

    return issues;
  }

  /**
   * Get effective background color (traverse up tree)
   */
  private getEffectiveBackgroundColor(el: HTMLElement): string {
    let current: HTMLElement | null = el;

    while (current) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        return bg;
      }
      current = current.parentElement;
    }

    return this.config.theme === 'light' ? '#f4f1ea' : '#0f0f0f';
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(fg: string, bg: string): number {
    const fgLum = this.getLuminance(fg);
    const bgLum = this.getLuminance(bg);
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance
   */
  private getLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse color string to RGB array
   */
  private parseColor(color: string): [number, number, number] | null {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // QA DEPARTMENT
  // Final inspection, summary
  // ──────────────────────────────────────────────────────────────────────────

  private inspectQA(container: HTMLElement): ProductionIssue[] {
    const issues: ProductionIssue[] = [];

    // Re-check critical overflow after fixes
    this.queryElements(container, '.newspaper-hl1, .newspaper-hl2, .newspaper-citation').forEach(el => {
      if (el.scrollWidth > el.clientWidth + this.config.tolerance) {
        issues.push({
          department: 'qa',
          type: 'overflow',
          severity: 'critical',
          element: el,
          elementSelector: this.getSelector(el),
          description: `FINAL CHECK FAILED: Element still overflows after fixes (${el.scrollWidth}px > ${el.clientWidth}px)`,
          measurement: {
            actual: el.scrollWidth,
            expected: el.clientWidth,
            unit: 'px',
          },
          autoFixable: false,
        });
      }
    });

    return issues;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Query elements safely
   */
  private queryElements(container: HTMLElement, selector: string): HTMLElement[] {
    try {
      return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    } catch {
      return [];
    }
  }

  /**
   * Get a CSS selector for an element
   */
  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ')[0]}`;
    return el.tagName.toLowerCase();
  }

  /**
   * Detect DNA type from element
   */
  private detectDNAType(el: HTMLElement): ElementType | undefined {
    const className = el.className || '';
    const tagName = el.tagName.toLowerCase();

    if (className.includes('newspaper-page')) return 'terrain';
    if (className.includes('newspaper-grid')) return 'wall';
    if (className.includes('newspaper-column')) return 'stem';
    if (className.includes('newspaper-hl')) return 'petal';
    if (className.includes('newspaper-citation')) return 'petal';
    if (className.includes('newspaper-body')) return 'petal';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'petal';
    if (tagName === 'p') return 'petal';

    return undefined;
  }

  /**
   * Get DNA definition for element type
   */
  private getDNAForElement(type?: ElementType): ElementDNA | undefined {
    if (!type) return undefined;

    switch (type) {
      case 'terrain': return DNA_LIBRARY.terrain;
      case 'wall': return DNA_LIBRARY.wall;
      case 'stem': return DNA_LIBRARY.stemVertical;
      case 'petal': return DNA_LIBRARY.petalBody;
      default: return undefined;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to production results
   */
  subscribe(callback: (result: ProductionResult) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(result: ProductionResult): void {
    this.observers.forEach(cb => cb(result));
  }

  /**
   * Get last production result
   */
  getLastResult(): ProductionResult | null {
    return this.lastResult;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get summary for display
   */
  getSummary(): string {
    if (!this.lastResult) return 'No production run yet';

    const { success, totalIssues, criticalIssues, fixesApplied, duration } = this.lastResult;
    const status = success ? '✓ PASS' : '✗ FAIL';

    return `${status} | Issues: ${totalIssues} (${criticalIssues} critical) | Fixes: ${fixesApplied} | ${duration.toFixed(1)}ms`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════════════════

export const orchestrator = new Orchestrator();

// ════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Quick production check on a container
 */
export async function checkProduction(
  container: HTMLElement,
  options?: Partial<OrchestratorConfig>
): Promise<ProductionResult> {
  const orch = new Orchestrator(options);
  return orch.runProduction(container);
}

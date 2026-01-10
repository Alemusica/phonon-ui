/**
 * Phonon UI - Orchestrator System
 *
 * Central coordinator for all QA departments.
 * Ensures visual integrity through coordinated checks.
 */

import type { QAIssue } from './visual-qa';

// Department types
type Department =
  | 'typography'    // Font sizes, weights, colors
  | 'layout'        // Columns, grids, spacing
  | 'contrast'      // Color accessibility
  | 'overflow'      // Content boundaries
  | 'hierarchy';    // Visual weight order

interface DepartmentReport {
  department: Department;
  status: 'pass' | 'warning' | 'fail';
  issues: QAIssue[];
  timestamp: number;
}

interface OrchestratorState {
  reports: Map<Department, DepartmentReport>;
  lastFullScan: number;
  autoFixEnabled: boolean;
}

/**
 * Central Orchestrator - coordinates all QA departments
 */
export class Orchestrator {
  private state: OrchestratorState;
  private observers: Set<(reports: DepartmentReport[]) => void>;

  constructor() {
    this.state = {
      reports: new Map(),
      lastFullScan: 0,
      autoFixEnabled: true,
    };
    this.observers = new Set();
  }

  /**
   * Run a full scan across all departments
   */
  async fullScan(container: HTMLElement): Promise<DepartmentReport[]> {
    const reports: DepartmentReport[] = [];
    const timestamp = Date.now();

    // Typography Department
    reports.push(await this.scanTypography(container, timestamp));

    // Layout Department
    reports.push(await this.scanLayout(container, timestamp));

    // Overflow Department
    reports.push(await this.scanOverflow(container, timestamp));

    // Contrast Department
    reports.push(await this.scanContrast(container, timestamp));

    // Store reports
    reports.forEach(r => this.state.reports.set(r.department, r));
    this.state.lastFullScan = timestamp;

    // Notify observers
    this.notifyObservers(reports);

    // Auto-fix if enabled
    if (this.state.autoFixEnabled) {
      await this.autoFixAll(container, reports);
    }

    return reports;
  }

  /**
   * Typography department scan
   */
  private async scanTypography(container: HTMLElement, timestamp: number): Promise<DepartmentReport> {
    const issues: QAIssue[] = [];

    // Check headline sizes
    container.querySelectorAll('[class*="newspaper-hl"]').forEach((el) => {
      const style = window.getComputedStyle(el as HTMLElement);
      const fontSize = parseFloat(style.fontSize);
      const parentWidth = (el.parentElement?.clientWidth || 0);

      // If font is too large relative to container
      if (fontSize > parentWidth * 0.15) {
        issues.push({
          type: 'overflow',
          severity: 'critical',
          element: el.className,
          description: `Headline font (${fontSize}px) too large for container (${parentWidth}px)`,
          suggestion: `Reduce font-size to max ${Math.floor(parentWidth * 0.1)}px`,
        });
      }
    });

    return {
      department: 'typography',
      status: issues.length === 0 ? 'pass' : issues.some(i => i.severity === 'critical') ? 'fail' : 'warning',
      issues,
      timestamp,
    };
  }

  /**
   * Layout department scan
   */
  private async scanLayout(container: HTMLElement, timestamp: number): Promise<DepartmentReport> {
    const issues: QAIssue[] = [];

    // Check column widths
    container.querySelectorAll('.newspaper-column').forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.clientWidth < 100) {
        issues.push({
          type: 'overflow',
          severity: 'warning',
          element: `column-${i}`,
          description: `Column ${i} is too narrow (${htmlEl.clientWidth}px)`,
          suggestion: 'Reduce number of columns or increase container width',
        });
      }
    });

    return {
      department: 'layout',
      status: issues.length === 0 ? 'pass' : 'warning',
      issues,
      timestamp,
    };
  }

  /**
   * Overflow department scan
   */
  private async scanOverflow(container: HTMLElement, timestamp: number): Promise<DepartmentReport> {
    const issues: QAIssue[] = [];

    // Check for text overflow
    container.querySelectorAll('h1, h2, h3, .newspaper-hl1, .newspaper-hl2, .newspaper-citation').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollWidth > htmlEl.clientWidth) {
        issues.push({
          type: 'overflow',
          severity: 'critical',
          element: htmlEl.className || htmlEl.tagName,
          description: `Content overflows: ${htmlEl.scrollWidth}px > ${htmlEl.clientWidth}px`,
          suggestion: 'Reduce font-size or enable word-wrap',
        });
      }
    });

    return {
      department: 'overflow',
      status: issues.length === 0 ? 'pass' : 'fail',
      issues,
      timestamp,
    };
  }

  /**
   * Contrast department scan
   */
  private async scanContrast(container: HTMLElement, timestamp: number): Promise<DepartmentReport> {
    const issues: QAIssue[] = [];

    // Check text contrast
    container.querySelectorAll('p, h1, h2, h3, span').forEach((el) => {
      const style = window.getComputedStyle(el as HTMLElement);
      const color = style.color;

      // Simple check: if color is too light (gray > 150)
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        const brightness = (r + g + b) / 3;
        if (brightness > 180) {
          issues.push({
            type: 'contrast',
            severity: 'warning',
            element: el.className || el.tagName,
            description: `Low contrast text (brightness: ${Math.round(brightness)})`,
            suggestion: 'Use darker text color (#1a1a1a)',
          });
        }
      }
    });

    return {
      department: 'contrast',
      status: issues.length === 0 ? 'pass' : 'warning',
      issues,
      timestamp,
    };
  }

  /**
   * Auto-fix detected issues
   */
  private async autoFixAll(container: HTMLElement, reports: DepartmentReport[]): Promise<void> {
    for (const report of reports) {
      for (const issue of report.issues) {
        if (issue.severity === 'critical') {
          await this.autoFix(container, issue);
        }
      }
    }
  }

  /**
   * Auto-fix a single issue
   */
  private async autoFix(container: HTMLElement, issue: QAIssue): Promise<void> {
    if (issue.type === 'overflow') {
      // Find and fix oversized elements
      container.querySelectorAll('.newspaper-hl1, .newspaper-hl2').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollWidth > htmlEl.clientWidth) {
          const currentSize = parseFloat(window.getComputedStyle(htmlEl).fontSize);
          htmlEl.style.fontSize = `${currentSize * 0.8}px`;
        }
      });
    }
  }

  /**
   * Subscribe to report updates
   */
  subscribe(callback: (reports: DepartmentReport[]) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(reports: DepartmentReport[]): void {
    this.observers.forEach(cb => cb(reports));
  }

  /**
   * Get summary of all departments
   */
  getSummary(): { total: number; pass: number; warning: number; fail: number } {
    const reports = Array.from(this.state.reports.values());
    return {
      total: reports.length,
      pass: reports.filter(r => r.status === 'pass').length,
      warning: reports.filter(r => r.status === 'warning').length,
      fail: reports.filter(r => r.status === 'fail').length,
    };
  }
}

// Singleton instance
export const orchestrator = new Orchestrator();

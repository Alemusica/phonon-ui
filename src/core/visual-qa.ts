/**
 * Visual QA System - "Eyes of the System"
 * Analyzes layout integrity using constraint rules
 */

export interface LayoutConstraint {
  name: string;
  rule: 'no-overflow' | 'min-contrast' | 'hierarchy-order' | 'word-cohesion';
  selector: string;
  threshold?: number;
}

export interface QAIssue {
  type: 'overflow' | 'contrast' | 'hierarchy' | 'word-break' | 'orphan';
  severity: 'critical' | 'warning' | 'info';
  element: string;
  description: string;
  suggestion: string;
}

// Default layout constraints based on Swiss typography rules
export const NEWSPAPER_CONSTRAINTS: LayoutConstraint[] = [
  {
    name: 'Column boundaries',
    rule: 'no-overflow',
    selector: '.newspaper-column',
  },
  {
    name: 'Citation word cohesion',
    rule: 'word-cohesion',
    selector: '.newspaper-citation',
  },
  {
    name: 'Headline hierarchy',
    rule: 'hierarchy-order',
    selector: '[class*="newspaper-hl"]',
  },
  {
    name: 'Body text contrast',
    rule: 'min-contrast',
    selector: '.newspaper-body',
    threshold: 4.5, // WCAG AA
  },
];

/**
 * Check if an element overflows its container
 */
export function checkOverflow(element: HTMLElement): boolean {
  return (
    element.scrollWidth > element.clientWidth ||
    element.scrollHeight > element.clientHeight
  );
}

/**
 * Check if text has bad word breaks
 */
export function checkWordCohesion(element: HTMLElement): QAIssue | null {
  const text = element.textContent || '';
  const computedStyle = window.getComputedStyle(element);
  const lineHeight = parseFloat(computedStyle.lineHeight);

  // If element height suggests multiple lines for short text, likely bad break
  if (element.clientHeight > lineHeight * 2 && text.length < 50) {
    return {
      type: 'word-break',
      severity: 'critical',
      element: element.className,
      description: `Text "${text.slice(0, 30)}..." may have bad word breaks`,
      suggestion: 'Reduce font-size or increase container width',
    };
  }
  return null;
}

/**
 * Run visual QA checks on newspaper layout
 */
export function runVisualQA(container: HTMLElement): QAIssue[] {
  const issues: QAIssue[] = [];

  // Check citations for word breaks
  container.querySelectorAll('.newspaper-citation').forEach((el) => {
    const issue = checkWordCohesion(el as HTMLElement);
    if (issue) issues.push(issue);
  });

  // Check columns for overflow
  container.querySelectorAll('.newspaper-column').forEach((el) => {
    if (checkOverflow(el as HTMLElement)) {
      issues.push({
        type: 'overflow',
        severity: 'critical',
        element: 'newspaper-column',
        description: 'Column content overflows boundaries',
        suggestion: 'Check child element sizes and overflow settings',
      });
    }
  });

  return issues;
}

/**
 * Auto-fix common issues
 */
export function autoFixIssue(issue: QAIssue, element: HTMLElement): void {
  switch (issue.type) {
    case 'word-break': {
      // Reduce font size until it fits
      const currentSize = parseFloat(window.getComputedStyle(element).fontSize);
      element.style.fontSize = `${currentSize * 0.85}px`;
      break;
    }
    case 'overflow': {
      element.style.overflow = 'hidden';
      break;
    }
  }
}

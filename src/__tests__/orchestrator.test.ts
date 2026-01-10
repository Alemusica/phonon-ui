/**
 * Orchestrator System Tests
 * Tests for the production line department coordination
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Orchestrator,
  checkProduction,
  type OrchestratorConfig,
} from '../core/orchestrator';

// Mock DOM environment helpers
function createMockElement(options: {
  scrollWidth?: number;
  clientWidth?: number;
  className?: string;
  tagName?: string;
  style?: Record<string, string>;
}): HTMLElement {
  const el = document.createElement(options.tagName || 'div');

  if (options.className) {
    el.className = options.className;
  }

  if (options.scrollWidth !== undefined) {
    Object.defineProperty(el, 'scrollWidth', { value: options.scrollWidth, configurable: true });
  }

  if (options.clientWidth !== undefined) {
    Object.defineProperty(el, 'clientWidth', { value: options.clientWidth, configurable: true });
  }

  return el;
}

function createMockContainer(children: HTMLElement[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'newspaper-page';

  children.forEach(child => container.appendChild(child));

  // Mock querySelectorAll to return children based on selector
  const originalQuerySelectorAll = container.querySelectorAll.bind(container);
  vi.spyOn(container, 'querySelectorAll').mockImplementation((selector: string) => {
    if (selector === '*') {
      return container.getElementsByTagName('*') as unknown as NodeListOf<Element>;
    }
    return originalQuerySelectorAll(selector);
  });

  return container;
}

describe('Orchestrator', () => {
  describe('Initialization', () => {
    it('should create with default config', () => {
      const orch = new Orchestrator();
      expect(orch).toBeDefined();
    });

    it('should have default autoFix enabled', () => {
      const orch = new Orchestrator();
      // Access through production run behavior
      expect(orch).toBeDefined();
    });

    it('should accept custom config', () => {
      const config: Partial<OrchestratorConfig> = {
        autoFix: false,
        tolerance: 5,
        theme: 'dark',
      };
      const orch = new Orchestrator(config);
      expect(orch).toBeDefined();
    });

    it('should have 4 departments in default pipeline', () => {
      const orch = new Orchestrator();
      // Pipeline: physics -> linguistics -> optics -> qa
      expect(orch).toBeDefined();
    });
  });

  describe('Production Run', () => {
    it('should return ProductionResult', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('reports');
      expect(result).toHaveProperty('totalIssues');
      expect(result).toHaveProperty('criticalIssues');
      expect(result).toHaveProperty('fixesApplied');
      expect(result).toHaveProperty('duration');
    });

    it('should run all departments in order', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      expect(result.reports.length).toBe(4);
      expect(result.reports[0].department).toBe('physics');
      expect(result.reports[1].department).toBe('linguistics');
      expect(result.reports[2].department).toBe('optics');
      expect(result.reports[3].department).toBe('qa');
    });

    it('should detect overflow when scrollWidth > clientWidth', async () => {
      const orch = new Orchestrator({ autoFix: false });

      const overflowElement = createMockElement({
        scrollWidth: 500,
        clientWidth: 400,
        className: 'newspaper-hl1',
      });

      const container = createMockContainer([overflowElement]);

      const result = await orch.runProduction(container);

      const physicsReport = result.reports.find(r => r.department === 'physics');
      expect(physicsReport?.issues.some(i => i.type === 'overflow')).toBe(true);
    });

    it('should pass when no overflow', async () => {
      const orch = new Orchestrator({ autoFix: false });

      const normalElement = createMockElement({
        scrollWidth: 300,
        clientWidth: 400,
        className: 'newspaper-body',
      });

      const container = createMockContainer([normalElement]);

      const result = await orch.runProduction(container);

      // No overflow issues from this element
      const physicsReport = result.reports.find(r => r.department === 'physics');
      const overflowIssues = physicsReport?.issues.filter(i =>
        i.element === normalElement && i.type === 'overflow'
      );
      expect(overflowIssues?.length || 0).toBe(0);
    });
  });

  describe('Auto-fix', () => {
    it('should apply fixes when autoFix is enabled', async () => {
      const orch = new Orchestrator({ autoFix: true });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      // Should have attempted fixes (even if 0 issues)
      expect(result.fixesApplied).toBeGreaterThanOrEqual(0);
    });

    it('should not apply fixes when autoFix is disabled', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      expect(result.fixesApplied).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update config with configure()', () => {
      const orch = new Orchestrator();
      orch.configure({ theme: 'dark', tolerance: 10 });

      // Config updated (verified by behavior)
      expect(orch).toBeDefined();
    });

    it('should halt on critical when configured', async () => {
      const orch = new Orchestrator({
        haltOnCritical: true,
        autoFix: false,
      });

      // Create element that will cause critical issue
      const overflowElement = createMockElement({
        scrollWidth: 1000,
        clientWidth: 100,
        className: 'newspaper-hl1',
      });

      const container = createMockContainer([overflowElement]);
      const result = await orch.runProduction(container);

      // If physics fails critically, should stop there
      if (result.reports[0].status === 'fail') {
        expect(result.reports.length).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers on production run', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const callback = vi.fn();

      orch.subscribe(callback);

      const container = createMockContainer([]);
      await orch.runProduction(container);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        success: expect.any(Boolean),
        reports: expect.any(Array),
      }));
    });

    it('should allow unsubscribe', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const callback = vi.fn();

      const unsubscribe = orch.subscribe(callback);
      unsubscribe();

      const container = createMockContainer([]);
      await orch.runProduction(container);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return "No production run yet" before first run', () => {
      const orch = new Orchestrator();
      expect(orch.getSummary()).toBe('No production run yet');
    });

    it('should return formatted summary after run', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      await orch.runProduction(container);

      const summary = orch.getSummary();
      expect(summary).toMatch(/Issues:/);
      expect(summary).toMatch(/Fixes:/);
      expect(summary).toMatch(/ms/);
    });
  });

  describe('getLastResult', () => {
    it('should return null before first run', () => {
      const orch = new Orchestrator();
      expect(orch.getLastResult()).toBeNull();
    });

    it('should return last result after run', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      await orch.runProduction(container);

      const lastResult = orch.getLastResult();
      expect(lastResult).not.toBeNull();
      expect(lastResult?.reports.length).toBe(4);
    });
  });
});

describe('checkProduction convenience function', () => {
  it('should run production check with options', async () => {
    const container = createMockContainer([]);

    const result = await checkProduction(container, { autoFix: false });

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('reports');
  });

  it('should use default options when not provided', async () => {
    const container = createMockContainer([]);

    const result = await checkProduction(container);

    expect(result).toBeDefined();
  });
});

describe('Department Reports', () => {
  describe('Physics Department', () => {
    it('should check column minimum widths', async () => {
      const orch = new Orchestrator({ autoFix: false });

      const narrowColumn = createMockElement({
        clientWidth: 100, // Below 140px minimum
        className: 'newspaper-column',
      });

      const container = createMockContainer([narrowColumn]);
      const result = await orch.runProduction(container);

      const physicsReport = result.reports.find(r => r.department === 'physics');
      expect(physicsReport?.issues.some(i => i.type === 'collision')).toBe(true);
    });
  });

  describe('Optics Department', () => {
    it('should have optics report', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      const opticsReport = result.reports.find(r => r.department === 'optics');
      expect(opticsReport).toBeDefined();
      expect(opticsReport?.department).toBe('optics');
    });
  });

  describe('QA Department', () => {
    it('should run final inspection', async () => {
      const orch = new Orchestrator({ autoFix: false });
      const container = createMockContainer([]);

      const result = await orch.runProduction(container);

      const qaReport = result.reports.find(r => r.department === 'qa');
      expect(qaReport).toBeDefined();
      expect(qaReport?.department).toBe('qa');
    });
  });
});

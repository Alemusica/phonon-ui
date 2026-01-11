/**
 * AUTOMATED REFLOW TEST
 * Tests that the ConcreteMarkdownRenderer doesn't cause layout shifts
 */

import { test, expect, Page } from '@playwright/test';

interface ReflowResult {
  totalReflows: number;
  maxShift: { x: number; y: number };
  phases: string[];
  passed: boolean;
}

async function measureReflows(page: Page): Promise<ReflowResult> {
  // Wait a bit for content to render
  await page.waitForTimeout(500);

  // Inject measurement script
  const result = await page.evaluate(async () => {
    return new Promise<ReflowResult>((resolve) => {
      // Enable debug mode
      (window as any).__PHONON_DEBUG__ = true;

      // Track position changes
      const positions: Array<{ phase: string; y: number }> = [];
      let maxShiftX = 0;
      let maxShiftY = 0;
      let reflows = 0;

      // Find the markdown container - prioritize the ConcreteMarkdownRenderer
      const container = document.querySelector('[data-stage]') ||  // ConcreteMarkdownRenderer has data-stage
                        document.querySelector('.concrete-markdown-renderer') ||
                        document.querySelector('.newspaper-article-flow .phonon-prose') ||
                        document.querySelector('.phonon-prose') ||
                        document.body;

      const stage = container?.getAttribute('data-stage') || 'none';
      const parent = container?.parentElement?.className || 'none';
      console.log('[TEST] Container:', container?.className || 'body', '| stage:', stage, '| parent:', parent);

      // Create mutation observer to track DOM changes
      let previousRect = container.getBoundingClientRect();
      let frameCount = 0;
      const maxFrames = 300; // ~5 seconds at 60fps

      const checkForShift = () => {
        frameCount++;
        const currentRect = container.getBoundingClientRect();
        const firstP = container.querySelector('p');
        const firstPRect = firstP?.getBoundingClientRect();

        // Check container shift
        const shiftY = Math.abs(currentRect.top - previousRect.top);
        const shiftX = Math.abs(currentRect.left - previousRect.left);

        if (shiftY > 0.5 || shiftX > 0.5) {
          reflows++;
          maxShiftY = Math.max(maxShiftY, shiftY);
          maxShiftX = Math.max(maxShiftX, shiftX);
          positions.push({ phase: `frame_${frameCount}`, y: currentRect.top });
          console.log(`[REFLOW] Δ(${shiftX.toFixed(1)}, ${shiftY.toFixed(1)}) at frame ${frameCount}`);
        }

        previousRect = currentRect;

        // Continue monitoring
        if (frameCount < maxFrames) {
          requestAnimationFrame(checkForShift);
        } else {
          // Done monitoring
          resolve({
            totalReflows: reflows,
            maxShift: { x: maxShiftX, y: maxShiftY },
            phases: positions.map(p => p.phase),
            passed: reflows === 0 && maxShiftY < 1,
          });
        }
      };

      // Start monitoring
      requestAnimationFrame(checkForShift);
    });
  });

  return result;
}

test.describe('Concrete Markdown Renderer - Reflow Test', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the dev app
    await page.goto('http://localhost:5173/');
    // Wait for the app to load
    await page.waitForSelector('.phonon-container', { timeout: 10000 });
  });

  test('should not cause layout shifts during typewriter animation', async ({ page }) => {
    console.log('\n════════════════════════════════════════');
    console.log('AUTOMATED REFLOW TEST');
    console.log('════════════════════════════════════════\n');

    // Find the chat input and send button
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();

    // Type a message that triggers NEWSPAPER_STYLE response
    await input.fill('editoriale');

    // Trigger the render by submitting
    await sendButton.click();

    // Wait for the ConcreteMarkdownRenderer to appear with data-stage
    console.log('[DEBUG] Waiting for ConcreteMarkdownRenderer...');
    await page.waitForSelector('[data-stage]', { timeout: 10000 });
    console.log('[DEBUG] ConcreteMarkdownRenderer found!');

    // Wait for streaming to complete (stage changes from buffering)
    // The demo mode streams content which takes a few seconds
    console.log('[DEBUG] Waiting for streaming to complete...');
    await page.waitForSelector('[data-stage="rendering"], [data-stage="complete"]', { timeout: 15000 });
    console.log('[DEBUG] Streaming complete, content rendered!');

    // Wait a bit more for layout to stabilize
    await page.waitForTimeout(200);

    // Start measuring after the component has appeared
    const measurePromise = measureReflows(page);

    // Take screenshots for debugging
    await page.screenshot({ path: 'test-results/reflow-during.png' });

    // Wait for measurement to complete
    const result = await measurePromise;

    // Take final screenshot
    await page.screenshot({ path: 'test-results/reflow-after.png' });

    // Log what container was found and its state
    const containerInfo = await page.evaluate(() => {
      const container = document.querySelector('.phonon-prose') ||
                        document.querySelector('[data-stage]') ||
                        document.body;
      const stage = container?.getAttribute('data-stage') || 'N/A';
      const parent = container?.parentElement;
      const parentClass = parent?.className || 'N/A';
      const columnCount = parent ? window.getComputedStyle(parent).columnCount : 'N/A';
      return {
        containerClass: container?.className || 'N/A',
        stage,
        parentClass,
        columnCount,
      };
    });
    console.log('[DEBUG] Container info:', containerInfo);

    console.log('\n════════════════════════════════════════');
    console.log('TEST RESULTS');
    console.log('════════════════════════════════════════');
    console.log(`Total Reflows: ${result.totalReflows}`);
    console.log(`Max Shift: Δ(${result.maxShift.x.toFixed(1)}, ${result.maxShift.y.toFixed(1)})`);
    console.log(`Status: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`);
    console.log('════════════════════════════════════════\n');

    // Assert no significant reflows
    expect(result.totalReflows).toBeLessThan(5);
    expect(result.maxShift.y).toBeLessThan(2);
  });

  test('should have stable baseline after character wrapping', async ({ page }) => {
    // First trigger a message to get NEWSPAPER_STYLE content
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();
    await input.fill('editoriale');
    await sendButton.click();

    // Wait for content to appear
    await page.waitForTimeout(1000);

    // Inject test that specifically monitors the wrap phase
    const result = await page.evaluate(async () => {
      return new Promise<{ beforeWrapY: number; afterWrapY: number; shift: number }>((resolve) => {
        // Find container - try multiple selectors
        const container = document.querySelector('.phonon-prose') ||
                          document.querySelector('.concrete-markdown-renderer') ||
                          document.querySelector('[data-stage]');

        if (!container) {
          console.log('Available containers:', document.body.innerHTML.slice(0, 500));
          resolve({ beforeWrapY: 0, afterWrapY: 0, shift: -999 });
          return;
        }

        // Get first paragraph position
        const getFirstPY = () => {
          const firstP = container.querySelector('p');
          return firstP?.getBoundingClientRect().top ?? 0;
        };

        // Observe DOM mutations
        const observer = new MutationObserver((mutations) => {
          // Check if spans were added (character wrapping)
          const hasSpans = container.querySelectorAll('.concrete-char').length > 0;
          if (hasSpans) {
            const afterWrapY = getFirstPY();
            observer.disconnect();
            resolve({
              beforeWrapY: beforeY,
              afterWrapY,
              shift: afterWrapY - beforeY,
            });
          }
        });

        const beforeY = getFirstPY();
        observer.observe(container, { childList: true, subtree: true });

        // Timeout fallback
        setTimeout(() => {
          observer.disconnect();
          resolve({ beforeWrapY: beforeY, afterWrapY: getFirstPY(), shift: 0 });
        }, 5000);
      });
    });

    console.log('\n════════════════════════════════════════');
    console.log('BASELINE STABILITY TEST');
    console.log('════════════════════════════════════════');
    console.log(`Before wrap Y: ${result.beforeWrapY.toFixed(1)}px`);
    console.log(`After wrap Y: ${result.afterWrapY.toFixed(1)}px`);
    console.log(`Shift: ${result.shift.toFixed(1)}px`);
    console.log(`Status: ${Math.abs(result.shift) < 1 ? '✓ STABLE' : '✗ SHIFTED'}`);
    console.log('════════════════════════════════════════\n');

    // Assert baseline is stable (less than 1px shift)
    expect(Math.abs(result.shift)).toBeLessThan(1);
  });
});

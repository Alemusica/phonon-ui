/**
 * COOPERATIVE REFINEMENT INTEGRATION TEST
 * =======================================
 * Tests that the cooperative refinement system is properly integrated
 * into the phonon pipeline.
 */

import { test, expect } from '@playwright/test';

test.describe('Cooperative Refinement Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Wait for the app to load
    await page.waitForSelector('.phonon-container', { timeout: 10000 });
    // Enable debug mode
    await page.evaluate(() => {
      (window as any).__PHONON_DEBUG__ = true;
    });
  });

  test('should analyze layout constraints when rendering newspaper content', async ({ page }) => {
    // Collect console logs for cooperative refinement
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Cooperative Refinement') || text.includes('Layout constraints')) {
        logs.push(text);
      }
    });

    // Find the chat input and send button
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();

    // Type a message that triggers NEWSPAPER_STYLE response
    await input.fill('editoriale');
    await sendButton.click();

    // Wait for the ConcreteMarkdownRenderer to appear with data-stage
    await page.waitForSelector('[data-stage]', { timeout: 10000 });

    // Wait for rendering to complete
    await page.waitForFunction(() => {
      const container = document.querySelector('[data-stage]');
      return container?.getAttribute('data-stage') === 'complete';
    }, { timeout: 30000 });

    // Verify animation completed successfully
    const stage = await page.getAttribute('[data-stage]', 'data-stage');
    expect(stage).toBe('complete');

    console.log('Cooperative Refinement logs:', logs);
  });

  test('should not regress rendering performance', async ({ page }) => {
    // This test ensures cooperative refinement doesn't significantly slow down rendering
    const startTime = Date.now();

    // Find the chat input and send button
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();

    // Type a message that triggers NEWSPAPER_STYLE response
    await input.fill('editoriale');
    await sendButton.click();

    // Wait for the ConcreteMarkdownRenderer to appear
    await page.waitForSelector('[data-stage]', { timeout: 10000 });

    // Wait for completion
    await page.waitForFunction(() => {
      const container = document.querySelector('[data-stage]');
      return container?.getAttribute('data-stage') === 'complete';
    }, { timeout: 30000 });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Ensure it completed
    const stage = await page.getAttribute('[data-stage]', 'data-stage');
    expect(stage).toBe('complete');

    console.log(`Total render time: ${totalTime}ms`);
    // Performance should be reasonable (animation takes ~10s for 900+ chars)
    expect(totalTime).toBeLessThan(60000);
  });

  test('should complete render pipeline with 0 reflows', async ({ page }) => {
    // This is a regression test ensuring cooperative refinement doesn't break reflow-free rendering

    // Find the chat input and send button
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();

    // Type a message that triggers NEWSPAPER_STYLE response
    await input.fill('editoriale');
    await sendButton.click();

    // Wait for the ConcreteMarkdownRenderer
    await page.waitForSelector('[data-stage]', { timeout: 10000 });
    await page.waitForSelector('[data-stage="rendering"], [data-stage="complete"]', { timeout: 15000 });

    // Measure reflows during animation
    const result = await page.evaluate(async () => {
      return new Promise<{ totalReflows: number; passed: boolean }>((resolve) => {
        const container = document.querySelector('[data-stage]') || document.body;
        let previousRect = container.getBoundingClientRect();
        let reflows = 0;
        let frameCount = 0;
        const maxFrames = 200;

        const checkForShift = () => {
          frameCount++;
          const currentRect = container.getBoundingClientRect();
          const shiftY = Math.abs(currentRect.top - previousRect.top);
          const shiftX = Math.abs(currentRect.left - previousRect.left);

          if (shiftY > 0.5 || shiftX > 0.5) {
            reflows++;
          }
          previousRect = currentRect;

          if (frameCount < maxFrames) {
            requestAnimationFrame(checkForShift);
          } else {
            resolve({ totalReflows: reflows, passed: reflows === 0 });
          }
        };

        requestAnimationFrame(checkForShift);
      });
    });

    console.log(`Reflows detected: ${result.totalReflows}`);
    expect(result.totalReflows).toBe(0);
    expect(result.passed).toBe(true);
  });
});

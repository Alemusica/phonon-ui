/**
 * TIMING DEBUG TEST
 * Check the actual delay values in the PhononScheduler
 */

import { test, expect } from '@playwright/test';

test('debug timing values', async ({ page }) => {
  // Enable debug mode
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.phonon-container', { timeout: 10000 });

  // Inject debug flag
  await page.evaluate(() => {
    (window as any).__PHONON_DEBUG__ = true;
  });

  // Collect console logs
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('PhononScheduler') || text.includes('ConcreteMarkdownRenderer') || text.includes('Revealing')) {
      logs.push(text);
      console.log('[BROWSER]', text);
    }
  });

  // Send a message to trigger the animation
  const input = page.locator('input[type="text"]').first();
  const sendButton = page.locator('button[type="submit"]').first();
  await input.fill('editoriale');
  await sendButton.click();

  // Wait for streaming to complete (stage changes from buffering to rendering)
  console.log('[TEST] Waiting for streaming to complete...');
  await page.waitForSelector('[data-stage="rendering"], [data-stage="complete"]', { timeout: 30000 });
  console.log('[TEST] Streaming complete!');

  // Now measure the typewriter animation progress over time
  const measurements: { time: number; revealed: number; total: number }[] = [];
  const startTime = Date.now();

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500); // Check every 500ms
    const info = await page.evaluate(() => {
      const container = document.querySelector('[data-stage]');
      const chars = container?.querySelectorAll('.concrete-char');
      const revealedChars = container?.querySelectorAll('.concrete-char-revealed');
      return {
        stage: container?.getAttribute('data-stage'),
        totalChars: chars?.length || 0,
        revealedChars: revealedChars?.length || 0,
      };
    });
    measurements.push({
      time: Date.now() - startTime,
      revealed: info.revealedChars,
      total: info.totalChars,
    });
    console.log(`[TEST] t=${measurements[measurements.length - 1].time}ms: ${info.revealedChars}/${info.totalChars} chars revealed (${info.stage})`);

    // Stop if complete
    if (info.stage === 'complete' || info.revealedChars === info.totalChars) {
      break;
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('TIMING DEBUG INFO');
  console.log('════════════════════════════════════════');
  console.log('Measurements over time:');
  measurements.forEach(m => {
    console.log(`  ${m.time}ms: ${m.revealed}/${m.total} (${((m.revealed/m.total)*100).toFixed(1)}%)`);
  });
  console.log('\nConsole logs collected:', logs.length);
  logs.forEach(log => console.log(' -', log));
  console.log('════════════════════════════════════════\n');

  // Verify we got some data
  expect(measurements[0].total).toBeGreaterThan(0);
});

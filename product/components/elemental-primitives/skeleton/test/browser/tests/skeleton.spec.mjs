import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Skeleton exposes decorative block, line, and circle geometry while loading semantics stay authored around it', async ({ page }) => {
  await page.goto('/components/skeleton/web.html');

  const block = page.locator('#block');
  const line = page.locator('#line');
  const circle = page.locator('#circle');

  for (const skeleton of [block, line, circle]) {
    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-skeleton-pulse');
  }

  await expect(block).not.toHaveAttribute('data-vf-skeleton-shape', /.+/);
  expect(await block.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('8px');

  expect(await line.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('999px');
  expect(await line.evaluate((el) => getComputedStyle(el).minBlockSize)).toBe('12px');

  const circleSize = await circle.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      inlineSize: style.inlineSize,
      blockSize: style.blockSize,
      borderRadius: style.borderRadius,
    };
  });
  expect(circleSize.inlineSize).toBe(circleSize.blockSize);
  expect(circleSize.borderRadius).toBe('50%');

  await expect(page.locator('#region')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#status')).toHaveAttribute('role', 'status');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const skeleton of [block, line, circle]) {
    expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  }

  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  expect(await block.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.25');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

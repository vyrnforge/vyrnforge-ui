import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Skeleton reuses shared loading motion and composes existing layout/surface responsibilities', async ({ page }) => {
  await page.goto('/components/skeleton/web.html');

  const media = page.locator('#media');
  const circle = page.locator('#circle');
  const uncomposedCircle = page.locator('#circle-uncomposed');
  const lineA = page.locator('#line-a');
  const lineB = page.locator('#line-b');

  for (const skeleton of [media, circle, uncomposedCircle, lineA, lineB]) {
    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    const motion = await skeleton.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
      };
    });
    expect(motion).toEqual({
      name: 'vf-loading-shimmer',
      duration: '1.4s',
      timing: 'linear',
    });
  }

  await expect(media).not.toHaveAttribute('data-vf-skeleton-shape', /.+/);
  await expect(circle).toHaveAttribute('data-vf-aspect-ratio', '');
  await expect(circle).toHaveAttribute('data-vf-aspect-ratio-value', 'square');

  expect(await page.locator('#region').evaluate((el) => getComputedStyle(el).display)).toBe('grid');
  expect(await page.locator('#stack').evaluate((el) => getComputedStyle(el).display)).toBe('flex');
  expect(await page.locator('#card').evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))).toBeGreaterThan(0);

  const circleSize = await circle.evaluate((el) => {
    const style = getComputedStyle(el);
    return { inlineSize: style.inlineSize, blockSize: style.blockSize, borderRadius: style.borderRadius };
  });
  expect(circleSize.inlineSize).toBe(circleSize.blockSize);
  expect(circleSize.borderRadius).toBe('50%');

  const uncomposedSize = await uncomposedCircle.evaluate((el) => {
    const style = getComputedStyle(el);
    return { inlineSize: style.inlineSize, blockSize: style.blockSize };
  });
  expect(uncomposedSize.inlineSize).not.toBe(uncomposedSize.blockSize);

  expect(await lineA.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('999px');
  expect(await lineB.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('999px');

  await expect(page.locator('#region')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#status')).toHaveAttribute('role', 'status');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const skeleton of [media, circle, uncomposedCircle, lineA, lineB]) {
    expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  }

  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  expect(await media.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.25');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

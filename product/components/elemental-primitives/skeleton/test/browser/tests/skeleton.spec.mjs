import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Skeleton stays decorative while loading semantics remain authored around it', async ({ page }) => {
  await page.goto('/components/skeleton/web.html');
  const skeleton = page.locator('#skeleton');
  await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#region')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#status')).toHaveAttribute('role', 'status');
  expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-skeleton-pulse');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

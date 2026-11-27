import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Skeleton independent Web presentation and accessibility', async ({ page }) => {
  test.skip((process.env.VF_COMPONENT_PORT || 'web') !== 'web', 'Native Web CSS fixture');
  await page.goto('/components/skeleton/web.html');
  const line = page.locator('#line');
  const block = page.locator('#block');
  const circle = page.locator('#circle');
  expect(await line.evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(
    await block.evaluate(el => el.getBoundingClientRect().height),
  );
  expect(await circle.evaluate(el => getComputedStyle(el).inlineSize === getComputedStyle(el).blockSize)).toBe(true);
  await expect(line).toHaveCSS('animation-name', 'vf-loading-shimmer');
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await expect(line).toHaveCSS('animation-name', 'none');
  await expect(line).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

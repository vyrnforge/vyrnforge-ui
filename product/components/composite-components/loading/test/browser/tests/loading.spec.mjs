import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Loading supports built-ins, placeholders, native progress, and custom authored presentation', async ({ page }) => {
  await page.goto('/components/loading/web.html');

  for (const [id, animationName] of [
    ['spinner', 'vf-loading-spin'],
    ['dots', 'vf-loading-dots'],
    ['bars', 'vf-loading-bars'],
    ['pulse', 'vf-loading-pulse'],
  ]) {
    const indicator = page.locator('#' + id);
    await expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(await indicator.evaluate((el) => getComputedStyle(el).animationName)).toBe(animationName);
  }

  expect(await page.locator('#spinner').evaluate((el) => getComputedStyle(el).inlineSize)).toBe('16px');
  expect(await page.locator('#pulse').evaluate((el) => getComputedStyle(el).inlineSize)).toBe('32px');

  const media = page.locator('#media');
  const avatar = page.locator('#avatar');
  const lineA = page.locator('#line-a');
  for (const placeholder of [media, avatar, lineA]) {
    await expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(await placeholder.evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-loading-shimmer');
  }
  expect(await avatar.evaluate((el) => {
    const style = getComputedStyle(el);
    return style.inlineSize === style.blockSize && style.borderRadius === '50%';
  })).toBe(true);
  expect(await lineA.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('999px');
  await expect(page.locator('#busy-region')).toHaveAttribute('aria-busy', 'true');

  const determinate = page.locator('#determinate');
  const indeterminate = page.locator('#indeterminate');
  await expect(determinate).toHaveJSProperty('value', 48);
  await expect(determinate).toHaveAttribute('max', '100');
  await expect(indeterminate).not.toHaveAttribute('value');
  expect(await determinate.evaluate((el) => el.matches(':indeterminate'))).toBe(false);
  expect(await indeterminate.evaluate((el) => el.matches(':indeterminate'))).toBe(true);

  const custom = page.locator('#custom');
  await expect(custom.locator('svg')).toHaveCount(1);
  await expect(custom).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#status')).toHaveAttribute('role', 'status');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const id of ['spinner', 'dots', 'bars', 'pulse', 'media', 'avatar', 'line-a']) {
    expect(await page.locator('#' + id).evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  }

  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  expect(await media.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.25');
  await expect(determinate).toBeVisible();
  await expect(page.locator('#spinner')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

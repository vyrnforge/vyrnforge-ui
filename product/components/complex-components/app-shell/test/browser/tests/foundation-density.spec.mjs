import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test.describe('STD-02 inherited density foundation', () => {
  test.skip(port !== 'react', 'Representative density evidence is intentionally bounded to the React public-entrypoint consumer.');

  test('keeps density inherited and independent from size and theme', async ({ page }) => {
    await page.goto('/components/app-shell/foundation-density-react.html');

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const density = page.getByLabel('Density');
    const appearance = page.getByLabel('Appearance');
    const save = page.getByRole('button', { name: 'Save settings' });
    const small = page.getByRole('button', { name: 'Small action' });
    const large = page.getByRole('button', { name: 'Large action' });
    const nested = page.getByRole('button', { name: 'Nested comfortable action' });
    const updates = page.getByRole('switch', { name: 'Product updates' });

    await expect(form).toHaveAttribute('data-vf-density', 'comfortable');
    await expect(save).toHaveCSS('min-height', '40px');
    await expect(density).toHaveCSS('min-height', '40px');
    await expect(small).toHaveCSS('min-height', '32px');
    await expect(large).toHaveCSS('min-height', '48px');
    await expect(nested).toHaveCSS('min-height', '40px');

    await density.selectOption('compact');
    await expect(form).toHaveAttribute('data-vf-density', 'compact');
    await expect(save).toHaveCSS('min-height', '32px');
    await expect(density).toHaveCSS('min-height', '32px');
    await expect(small).toHaveCSS('min-height', '32px');
    await expect(large).toHaveCSS('min-height', '40px');
    await expect(nested).toHaveCSS('min-height', '40px');

    await appearance.selectOption('dark');
    await expect(form).toHaveAttribute('data-vf-theme', 'dark');
    await expect(save).toHaveCSS('min-height', '32px');
    await expect(large).toHaveCSS('min-height', '40px');

    await save.focus();
    await expect(save).toHaveCSS('outline-width', '2px');
    await updates.focus();
    await expect(updates).toHaveCSS('outline-width', '2px');
    await expect(updates).toHaveCSS('height', '22px');
  });

  test('preserves reduced-motion duration inside explicit light and dark theme scopes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/app-shell/foundation-density-react.html');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const appearance = page.getByLabel('Appearance');
    const updates = page.getByRole('switch', { name: 'Product updates' });
    const save = page.getByRole('button', { name: 'Save settings' });

    expect(await form.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-control-motion-duration').trim())).toBe('0ms');
    await expect(appearance).toHaveCSS('transition-duration', '0s');
    await expect(updates).toHaveCSS('transition-duration', '0s');
    await expect(save).toHaveCSS('transition-duration', '0s');

    await appearance.selectOption('dark');
    await expect(form).toHaveAttribute('data-vf-theme', 'dark');
    expect(await form.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-control-motion-duration').trim())).toBe('0ms');
    await expect(appearance).toHaveCSS('transition-duration', '0s');
    await expect(updates).toHaveCSS('transition-duration', '0s');
    await expect(save).toHaveCSS('transition-duration', '0s');
  });

  test('preserves task access and page reflow at 320 CSS pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/app-shell/foundation-density-react.html');
    await page.getByLabel('Density').selectOption('compact');

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(page.getByLabel('Appearance')).toBeVisible();
    await expect(page.getByLabel('Density')).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Product updates' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save settings' })).toBeVisible();
  });
});
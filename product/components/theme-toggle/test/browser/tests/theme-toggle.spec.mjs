import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Theme Toggle real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('preserves native switch semantics, state, focus, direction, media modes, and visual state changes', async ({ page }) => {
    await page.goto('/components/theme-toggle/web.html');

    const control = page.locator('#light-theme');
    const root = control.locator('xpath=..');
    const track = root.locator('[data-vf-theme-toggle-track]');
    const thumb = root.locator('[data-vf-theme-toggle-thumb]');
    const clouds = root.locator('[data-vf-theme-toggle-clouds]');
    const stars = root.locator('[data-vf-theme-toggle-stars]');

    await expect(control).toHaveAttribute('type', 'checkbox');
    await expect(control).toHaveAttribute('role', 'switch');
    await expect(control).not.toBeChecked();

    const target = await control.boundingBox();
    expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

    const lightTransform = await thumb.evaluate((element) => getComputedStyle(element).transform);
    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
    await expect.poll(() => stars.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect.poll(() => clouds.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');

    await control.focus();
    expect(await track.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    const disabled = page.locator('#disabled-theme');
    await expect(disabled).toBeDisabled();
    await disabled.evaluate((element) => element.click());
    await expect(disabled).not.toBeChecked();

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await control.uncheck();
    await control.check();
    await expect(control).toBeChecked();
    const rtlTransform = await thumb.evaluate((element) => getComputedStyle(element).transform);
    expect(rtlTransform).toContain('-');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(track).toBeVisible();
    await expect(thumb).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

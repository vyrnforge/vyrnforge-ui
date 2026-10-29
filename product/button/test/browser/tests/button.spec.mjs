import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Button real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('native activation, disabled, loading, forms, focus, accessibility, theme, direction, and media states', async ({ page, browserName }) => {
    await page.goto('/components/button/web.html');
    const activation = page.locator('#activation');
    await activation.click();
    await expect(page.locator('body')).toHaveAttribute('data-activations', '1');
    await activation.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toHaveAttribute('data-activations', '3');

    const disabled = page.locator('#disabled');
    await expect(disabled).toBeDisabled();
    await expect(disabled).not.toHaveAttribute('aria-disabled', 'true');
    const busy = page.locator('#busy');
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await expect(busy).toBeEnabled();
    await busy.click();
    await expect(page.locator('body')).toHaveAttribute('data-busy-activated', 'true');

    await page.locator('#submit').click();
    await expect(page.locator('body')).toHaveAttribute('data-submitted', 'true');
    await page.locator('input[name="field"]').fill('new');
    await page.locator('#reset').click();
    await expect(page.locator('input[name="field"]')).toHaveValue('changed');

    await page.locator('body').press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    expect(await focused.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    if (browserName === 'chromium') await expect(page.locator('[data-visual-matrix]')).toHaveScreenshot('button-visual-matrix.png');

    await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
    expect(await busy.evaluate((element) => getComputedStyle(element).colorScheme)).toContain('dark');

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    expect(await busy.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await busy.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(busy).toBeVisible();
  });
});

test.describe('Button framework hydration', () => {
  for (const framework of ['react', 'angular', 'vue']) {
    test(`${framework} hydrates native-complete Button markup and retains activation`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(`/components/button/${framework}.html`);
      const button = page.locator(`#${framework}-button`);
      await expect(button).toHaveAttribute('data-vf-button', '');
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toBeEnabled();
      await button.click();
      await expect(page.locator('body')).toHaveAttribute('data-activated', 'true');
      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);

        const results = await new AxeBuilder({ page }).include(`#${framework}-button`).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

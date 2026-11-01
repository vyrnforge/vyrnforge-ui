import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Dialog Web semantic and styling contract', () => {
  test.skip(port !== 'web', 'Web owns canonical Dialog CSS evidence.');

  test('dialog styling remains usable with focus, reduced motion, forced colors, and accessibility', async ({ page }) => {
    await page.goto('/components/dialog/web.html');
    const dialog = page.locator('#web-dialog');
    const close = dialog.locator('[data-vf-dialog-close]');
    await expect(dialog).toBeVisible();
    await close.focus();
    expect(await close.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(dialog).toBeVisible();
  });
});

test.describe('Dialog framework native modality and hydration', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} uses showModal, Escape intent, close controls, backdrop dismissal, focus lifecycle, and hydrates cleanly`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(`/components/dialog/${framework}.html`);

      const trigger = page.locator(`#${framework}-open`);
      const dialog = page.locator(`#${framework}-dialog`);
      const initial = page.locator(`#${framework}-initial`);
      const close = page.locator(`#${framework}-close`);

      await expect(dialog).not.toHaveAttribute('open', '');
      await trigger.focus();
      await trigger.click();
      await expect(dialog).toHaveAttribute('open', '');
      await expect(dialog).toHaveAttribute('data-vf-open', '');
      await expect(initial).toBeFocused();
      expect(await page.evaluate((id) => {
        const triggerElement = document.querySelector(`#${id}-open`);
        triggerElement.focus();
        return document.activeElement === triggerElement;
      }, framework)).toBe(false);

        const results = await new AxeBuilder({ page }).include(`#${framework}-dialog`).analyze();
      expect(results.violations).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(dialog).not.toHaveAttribute('open', '');
      await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'escape');
      await expect(trigger).toBeFocused();

      await trigger.click();
      await expect(dialog).toHaveAttribute('open', '');
      await close.click();
      await expect(dialog).not.toHaveAttribute('open', '');
      await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'close-control');
      await expect(trigger).toBeFocused();

      await trigger.click();
      await expect(dialog).toHaveAttribute('open', '');
      await page.mouse.click(5, 5);
      await expect(dialog).not.toHaveAttribute('open', '');
      await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'backdrop');
      await expect(trigger).toBeFocused();

      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);
    });

    test(`${framework} keeps nested dismissal scoped to the topmost modal`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/components/dialog/${framework}.html`);

      const parentTrigger = page.locator(`#${framework}-parent-open`);
      const parent = page.locator(`#${framework}-parent-dialog`);
      const childTrigger = page.locator(`#${framework}-child-open`);
      const child = page.locator(`#${framework}-child-dialog`);

      await parentTrigger.click();
      await expect(parent).toHaveAttribute('open', '');
      await childTrigger.click();
      await expect(child).toHaveAttribute('open', '');
      await expect(parent).toHaveAttribute('open', '');

      await page.keyboard.press('Escape');
      await expect(child).not.toHaveAttribute('open', '');
      await expect(parent).toHaveAttribute('open', '');
      await expect(childTrigger).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(parent).not.toHaveAttribute('open', '');
      await expect(parentTrigger).toBeFocused();
    });
  }
});

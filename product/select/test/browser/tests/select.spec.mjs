import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectAxeClean(page, options = {}) {
  expect((await expectNoAxeViolations(page, options)).violations).toEqual([]);
}

test('Select Web baseline exposes authored listbox semantics and canonical styling', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns the static semantic and canonical styling baseline.');
  await page.goto('/components/select/web.html');
  const trigger = page.locator('#trigger');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute('aria-controls', 'list');
  await trigger.click();
  await expect(page.getByRole('listbox', { name: 'Choose an option' })).toBeVisible();
  await expect(page.locator('#web-disabled')).toBeDisabled();
  await expectAxeClean(page);

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(trigger).toHaveCSS('border-radius', '6px');
  }
});

test.describe('Select enhanced port behavior', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} reuses enabled navigation and typeahead without changing selection`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/components/select/${framework}.html`);

      const trigger = page.locator('#trigger');
      const listbox = page.getByRole('listbox', { name: 'Choose an option' });
      const one = page.locator(`#${framework}-one`);
      const disabled = page.locator(`#${framework}-disabled`);
      const three = page.locator(`#${framework}-three`);
      const banana = page.locator(`#${framework}-banana`);

      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-controls', 'list');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(listbox).toBeVisible();
      await expect(one).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');

      await page.keyboard.press('ArrowDown');
      await expect(three).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'false');

      await page.keyboard.press('End');
      await expect(banana).toBeFocused();
      await page.keyboard.press('Home');
      await expect(one).toBeFocused();
      await page.keyboard.press('b');
      await expect(banana).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(listbox).toBeHidden();
      expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
    });

    test(`${framework} selects the focused option and restores the trigger`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/components/select/${framework}.html`);

      const trigger = page.locator('#trigger');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-three`)).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      if (framework === 'elements') {
        await expect(page.locator('#elements-select')).toHaveAttribute('value', 'three');
      } else {
        await expect(page.locator('body')).toHaveAttribute('data-value', 'three');
      }

      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-three`)).toBeFocused();
      await expect(page.locator(`#${framework}-three`)).toHaveAttribute('aria-selected', 'true');
      await expectAxeClean(page, framework === 'react'
        ? { disableRules: ['region'] }
        : undefined);
    });
  }
});

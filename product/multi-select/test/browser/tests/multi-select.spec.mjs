import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectAxeClean(page, options = {}) {
  expect((await expectNoAxeViolations(page, options)).violations).toEqual([]);
}

test('MultiSelect Web baseline exposes authored semantics and canonical styling', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns the static semantic and canonical styling baseline.');
  await page.goto('/components/multi-select/web.html');
  const trigger = page.locator('#trigger');
  const listbox = page.getByRole('listbox', { name: 'Choose items' });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute('aria-controls', 'list');
  await trigger.click();
  await expect(listbox).toBeVisible();
  await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  await expect(listbox).toHaveCSS('display', 'grid');
  await expect(listbox).toHaveCSS('min-width', '192px');
  await expect(page.locator('#web-one')).toHaveCSS('padding-left', '16px');
  await expect(page.locator('#web-disabled')).toBeDisabled();
  await expectAxeClean(page);
});

test.describe('MultiSelect enhanced port behavior', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} navigates enabled options without collapsing multi-selection`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/components/multi-select/${framework}.html`);

      const trigger = page.locator('#trigger');
      const listbox = page.getByRole('listbox', { name: 'Choose items' });
      const one = page.locator(`#${framework}-one`);
      const disabled = page.locator(`#${framework}-disabled`);
      const three = page.locator(`#${framework}-three`);
      const banana = page.locator(`#${framework}-banana`);

      await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(listbox).toBeVisible();
      await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
      await expect(one).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');

      await page.keyboard.press('ArrowDown');
      await expect(three).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'false');

      await page.keyboard.press('Space');
      await expect(three).toBeFocused();
      await expect(listbox).toBeVisible();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'true');

      if (framework === 'elements') {
        await expect(three).toHaveAttribute('aria-selected', 'true');
      } else {
        await expect(page.locator('body')).toHaveAttribute('data-values', 'one,three');
      }

      await page.keyboard.press('End');
      await expect(banana).toBeFocused();
      await page.keyboard.press('Home');
      await expect(one).toBeFocused();
      await page.keyboard.press('b');
      await expect(banana).toBeFocused();
      await expect(one).toHaveAttribute('aria-selected', 'true');
      await expect(three).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(listbox).toBeHidden();
      expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
    });

    test(`${framework} reopens on a selected option and preserves accessible option state`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/components/multi-select/${framework}.html`);

      const trigger = page.locator('#trigger');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator(`#${framework}-one`)).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      await page.keyboard.press('Escape');
      await page.keyboard.press('ArrowDown');

      await expect(page.locator(`#${framework}-one`)).toBeFocused();
      await expect(page.locator(`#${framework}-one`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#${framework}-three`)).toHaveAttribute('aria-selected', 'true');
      await expectAxeClean(page, framework === 'react'
        ? { disableRules: ['region'] }
        : undefined);
    });
  }
});

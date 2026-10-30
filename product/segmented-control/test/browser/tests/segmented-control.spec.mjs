import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const item = (name) => `#${port}-${name}`;

async function expectAxeClean(page) {
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
}

test('SegmentedControl Web baseline exposes canonical radio semantics and styling', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns the static semantic and canonical styling baseline.');
  await page.goto('/components/segmented-control/web.html');
  const group = page.getByRole('radiogroup', { name: 'View' });
  await expect(group).toHaveAttribute('data-vf-segmented-control-root', '');
  await expect(page.locator('#web-list')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#web-disabled')).toBeDisabled();
  expect(await group.evaluate((element) => getComputedStyle(element).maxInlineSize)).toBe('100%');
  await expectAxeClean(page);
});

test.describe('SegmentedControl enhanced port behavior', () => {
  for (const framework of ['react', 'angular', 'vue', 'elements']) {
    test(`${framework} follows radio-group directional navigation and skips disabled items`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/components/segmented-control/${framework}.html`);

      const group = page.getByRole('radiogroup', { name: 'View' });
      const list = page.locator(item('list'));
      const disabled = page.locator(item('disabled'));
      const grid = page.locator(item('grid'));
      const details = page.locator(item('details'));

      await expect(list).toHaveAttribute('aria-checked', 'true');
      await expect(list).toHaveAttribute('tabindex', '0');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAttribute('tabindex', '-1');
      await expect(grid).toHaveAttribute('tabindex', '-1');

      await list.focus();
      await page.keyboard.press('ArrowRight');
      await expect(grid).toBeFocused();
      await expect(grid).toHaveAttribute('aria-checked', 'true');
      await expect(list).toHaveAttribute('aria-checked', 'false');

      await page.keyboard.press('ArrowRight');
      await expect(details).toBeFocused();
      await expect(details).toHaveAttribute('aria-checked', 'true');

      await page.keyboard.press('ArrowRight');
      await expect(list).toBeFocused();
      await expect(list).toHaveAttribute('aria-checked', 'true');

      await group.evaluate((element) => element.setAttribute('dir', 'rtl'));
      await page.keyboard.press('ArrowRight');
      await expect(details).toBeFocused();
      await expect(details).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('ArrowLeft');
      await expect(list).toBeFocused();
      await expect(list).toHaveAttribute('aria-checked', 'true');

      await grid.click();
      await expect(grid).toHaveAttribute('aria-checked', 'true');
      await page.locator('#before').focus();
      await page.keyboard.press('Tab');
      await expect(grid).toBeFocused();
      await expect(grid).toHaveAttribute('tabindex', '0');
      await expect(list).toHaveAttribute('tabindex', '-1');

      await expectAxeClean(page);
      expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
    });
  }
});

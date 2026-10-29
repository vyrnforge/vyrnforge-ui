import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('pagination exposes a named landmark and current page', async ({ page }) => {
  await page.goto(`/components/pagination/${port}.html`);
  await expect(page.locator('#pagination')).toHaveAttribute('aria-label', 'Pagination');
  await expect(page.getByText('2')).toHaveAttribute('aria-current', 'page');
  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('React public entrypoint uses semantic tokens and exposes keyboard focus', async ({ page }) => {
  test.skip(port !== 'react', 'Public-entrypoint styling evidence is intentionally bounded to React for this repair.');

  await page.goto('/components/pagination/public-react.html');
  const pagination = page.locator('#public-pagination');
  const current = pagination.getByText('2');

  await expect(pagination).toHaveAttribute('aria-label', 'Pagination');
  await expect(current).toHaveAttribute('aria-current', 'page');

  const currentStyles = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, color: style.color };
  });
  expect(currentStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(currentStyles.color).not.toBe('rgba(0, 0, 0, 0)');

  await current.focus();
  const focusStyles = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyles.outlineStyle).not.toBe('none');
  expect(focusStyles.outlineWidth).toBe('2px');

  await page.emulateMedia({ forcedColors: 'active' });
  const forcedColorStyles = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, outlineStyle: style.outlineStyle };
  });
  expect(forcedColorStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(forcedColorStyles.outlineStyle).not.toBe('none');

  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

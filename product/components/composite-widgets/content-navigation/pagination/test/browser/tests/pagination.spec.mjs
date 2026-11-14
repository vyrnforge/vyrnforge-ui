import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public Pagination exposes a named landmark and authored current page before activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/pagination/${port}.html`);
    const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });
    await expect(pagination.getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(pagination.getByRole('link', { name: 'Next', exact: true })).toHaveAttribute('href', '#page3');
  } finally {
    await context.close();
  }
});

test('native link activation preserves application-owned current page and unavailable boundary semantics', async ({
  page,
}) => {
  await page.goto(`/components/pagination/${port}.html`);
  if (port === 'elements') await page.waitForFunction(() => Boolean(customElements.get('vf-pagination')));
  const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });
  const current = pagination.getByRole('link', { name: '2', exact: true });
  const next = pagination.getByRole('link', { name: 'Next', exact: true });
  await current.focus();
  await current.press('Tab');
  await expect(next).toBeFocused();
  await next.press('Enter');
  await expect(page).toHaveURL(/#page3$/);
  await expect(current).toHaveAttribute('aria-current', 'page');

  const boundary = page.getByRole('navigation', { name: 'First page navigation' });
  await expect(boundary.getByRole('link', { name: 'No previous page' })).toHaveCount(0);
  await expect(boundary.getByText('No previous page')).not.toHaveAttribute('href');
  await next.focus();
  await next.press('Tab');
  await expect(boundary.getByRole('link', { name: '1', exact: true })).toBeFocused();
  await expectNoAxeViolations(page);
});

test('public Pagination styles retain focus, current state and reflow in a narrow container', async ({ page }) => {
  await page.goto(`/components/pagination/${port}.html`);
  const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });
  const current = pagination.getByRole('link', { name: '2', exact: true });
  const background = await current.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  await current.focus();
  await expect(current).toHaveCSS('outline-width', '2px');
  await pagination.evaluate((element) => (element.style.inlineSize = '120px'));
  await expect(pagination).toHaveCSS('flex-wrap', 'wrap');
  expect(await pagination.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(current).toHaveCSS('outline-width', '2px');
  const forcedBackground = await current.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(forcedBackground).not.toBe('rgba(0, 0, 0, 0)');
  await expectNoAxeViolations(page);
});

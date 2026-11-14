import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('native Web disclosure baseline preserves native activation', async ({ page }) => {
  test.skip(port !== 'web', 'Web supplies authored native markup, not an accordion runtime.');
  await page.goto('/components/accordion/web.html');
  const summary = page.locator('#first');
  await summary.focus();
  await summary.press('Space');
  await expect(page.locator('#first-panel')).toBeHidden();
  await summary.press('Enter');
  await expect(page.locator('#first-panel')).toBeVisible();
  await expectNoAxeViolations(page);
});

test('Accordion initial relationships and unique IDs are valid before activation', async ({ browser }) => {
  test.skip(port === 'web', 'Managed accordion semantics apply to runtime ports.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/accordion/${port}.html`);
    const root = page.locator('#root');
    const first = root.getByRole('button', { name: 'First section', exact: true });
    const third = root.getByRole('button', { name: 'Third section', exact: true });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(third).toHaveAttribute('aria-expanded', 'false');
    const firstId = await first.getAttribute('aria-controls');
    const thirdId = await third.getAttribute('aria-controls');
    expect(firstId).not.toBe(thirdId);
    const firstPanel = root.locator(`[id="${firstId}"]`);
    const thirdPanel = root.locator(`[id="${thirdId}"]`);
    await expect(firstPanel).toBeVisible();
    await expect(thirdPanel).toBeHidden();
    await expect(firstPanel).toHaveAttribute('role', 'region');
    await expect(firstPanel).toHaveAttribute('aria-labelledby', await first.getAttribute('id'));
    await expect(thirdPanel).not.toHaveAttribute('role', 'region');
    await expect(root.getByRole('heading', { level: 2, name: 'First section' })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('Accordion native activation, nested focus ownership, and disabled skipping', async ({ page }) => {
  test.skip(port === 'web', 'Managed accordion runtime only.');
  await page.goto(`/components/accordion/${port}.html`);
  const root = page.locator('#root');
  const first = root.getByRole('button', { name: 'First section', exact: true });
  const third = root.getByRole('button', { name: 'Third section', exact: true });
  const inner = root.getByRole('button', { name: 'Inner section', exact: true });
  await expect(root.getByRole('button', { name: 'Disabled section' })).toBeDisabled();
  await first.focus();
  await first.press('ArrowDown');
  await expect(third).toBeFocused();
  await third.press('Home');
  await expect(first).toBeFocused();
  await inner.focus();
  await inner.press('End');
  await expect(inner).toBeFocused();
  await inner.press('Space');
  await expect(inner).toHaveAttribute('aria-expanded', 'false');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await first.focus();
  await first.press('Space');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(root.locator(`[id="${await first.getAttribute('aria-controls')}"]`)).toBeHidden();
  await first.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await first.press('End');
  await expect(third).toBeFocused();
  await third.press('Enter');
  await expect(third).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(third).toBeFocused();
  await expectNoAxeViolations(page);
});

test('noncollapsible expanded trigger remains focusable without redundant intent', async ({ page }) => {
  test.skip(port === 'web', 'Managed accordion runtime only.');
  await page.goto(`/components/accordion/${port}.html`);
  const root = page.locator('#locked');
  const first = root.getByRole('button', { name: 'Locked first' });
  await expect(first).toHaveAttribute('aria-disabled', 'true');
  await first.focus();
  await first.press('Enter');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(root).not.toHaveAttribute('data-requested');
  const second = root.getByRole('button', { name: 'Locked second' });
  await second.focus();
  await second.press('Space');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-disabled', 'true');
  await expect(first).not.toHaveAttribute('aria-disabled', 'true');
});

test('controlled Accordion requests a change without committing rejection', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Framework controlled state only.');
  await page.goto(`/components/accordion/${port}.html`);
  const root = page.locator('#controlled');
  await root.getByRole('button', { name: 'Controlled second' }).click();
  await expect(root).toHaveAttribute('data-requested', '"b"');
  await expect(root.getByRole('button', { name: 'Controlled first' })).toHaveAttribute('aria-expanded', 'true');
  await expect(root.getByRole('button', { name: 'Controlled second' })).toHaveAttribute('aria-expanded', 'false');
});

test('multiple Accordion preserves arbitrary string values without delimiter collisions', async ({ page }) => {
  test.skip(port === 'web', 'Managed accordion runtime only.');
  await page.goto(`/components/accordion/${port}.html`);
  const root = page.locator('#multiple');
  const comma = root.getByRole('button', { name: 'Comma item' });
  const other = root.getByRole('button', { name: 'Other item' });
  await expect(comma).toHaveAttribute('aria-expanded', 'true');
  await other.click();
  await expect(other).toHaveAttribute('aria-expanded', 'true');
  await expect(comma).toHaveAttribute('aria-expanded', 'true');
  await expect(root).toHaveAttribute('data-requested', '["a,b","c"]');
});

test('Elements navigation uses owned triggers even when a nested panel precedes its header', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements DOM ownership regression.');
  await page.goto('/components/accordion/elements.html');
  await page.waitForFunction(() => Boolean(customElements.get('vf-accordion')));
  const root = page.locator('#root');
  const first = root.getByRole('button', { name: 'First section', exact: true });
  const third = root.getByRole('button', { name: 'Third section', exact: true });
  await first.evaluate((trigger) => {
    const item = trigger.closest('[data-vf-accordion-item]');
    item.prepend(item.querySelector('[data-vf-accordion-panel]'));
  });
  await first.focus();
  await first.press('ArrowDown');
  await expect(third).toBeFocused();
  await third.press('Home');
  await expect(first).toBeFocused();
});

import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('search field clears with authored naming and restores focus', async ({ page }) => {
  await page.goto(`/components/search-field/${port}.html`);
  await expect(page.locator('#clear')).toHaveAccessibleName('Clear query');
  await page.locator('#clear').click();
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#search')).toBeFocused();

  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('clear preserves read-only and disabled inputs and respects canceled activation', async ({ page }) => {
  test.skip(port === 'web', 'The native Web fixture is authored application behavior, not a runtime port.');
  await page.goto(`/components/search-field/${port}.html`);
  const input = page.locator('#search');
  const clear = page.locator('#clear');
  await expect(input).toHaveValue('forge');

  await input.evaluate((element) => {
    element.readOnly = true;
  });
  await clear.click();
  await expect(input).toHaveValue('forge');

  await input.evaluate((element) => {
    element.readOnly = false;
    element.disabled = true;
  });
  await clear.click();
  await expect(input).toHaveValue('forge');

  await input.evaluate((element) => {
    element.disabled = false;
  });
  await page.evaluate(() => {
    document.addEventListener('click', (event) => event.preventDefault(), { capture: true, once: true });
  });
  await clear.click();
  await expect(input).toHaveValue('forge');

  await clear.click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});

test('public SearchField styles avoid duplicate native and authored clear controls', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'Representative public SearchField CSS is bundled in the React fixture.');
  await page.goto('/components/search-field/react.html');
  const input = page.locator('#search');
  const clear = page.locator('#clear');
  await expect(input).toHaveAttribute('type', 'search');
  await expect(clear).toHaveCount(1);
  await expect(clear).toHaveAccessibleName('Clear query');

  const response = await page.request.get('/components/search-field/react.css');
  expect(response.ok()).toBe(true);
  const css = await response.text();
  expect(css).toContain('::-webkit-search-cancel-button');
  expect(css).toContain('[data-vf-search-field-clear]');
  expect(css).toMatch(/display:\s*none/);

  await input.fill('canonical');
  await page.screenshot({ path: testInfo.outputPath('search-field-single-clear.png'), fullPage: false });
  await clear.click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});

test('public SearchField CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'react', 'Representative public CSS resolution evidence uses the React public entrypoint.');
  await page.goto('/components/search-field/react.html');

  const clear = page.locator('#clear');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(clear).toHaveCSS('border-top-right-radius', '6px');
    await expect(clear).toHaveCSS('border-bottom-right-radius', '6px');
  }
});

test('STD-08 list explorer preserves committed criteria, history, IME, stale-response, and zero-result recovery', async ({
  page,
}) => {
  test.skip(port !== 'react', 'Representative STD-08 application integration is intentionally React-only.');

  await page.goto('/components/search-field/data-explorer-react.html?q=forge&active=1&sort=updated');
  const query = page.getByLabel('Search projects');
  const active = page.getByLabel('Active only');
  const mine = page.getByLabel('Owned by me');
  const sort = page.getByLabel('Sort by');

  await expect(query).toHaveValue('forge');
  await expect(active).toBeChecked();
  await expect(mine).not.toBeChecked();
  await expect(sort).toHaveValue('updated');
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await expect(page.getByRole('status')).toHaveText('1 project');

  await query.fill('Atlas');
  await expect(page).toHaveURL(/q=forge/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');

  await query.dispatchEvent('compositionstart');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=forge/);
  await query.dispatchEvent('compositionend');
  await query.fill('Delta');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=Delta/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Delta research');

  await query.fill('atlas');
  await query.press('Enter');
  await query.fill('forge');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=forge/);
  await expect(page.getByRole('status')).toHaveText('1 project');
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await page.waitForTimeout(120);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await expect(page.getByRole('list', { name: 'Project results' })).not.toContainText('Atlas migration');

  await active.uncheck();
  await expect(page).toHaveURL(/q=forge/);
  await expect(page).not.toHaveURL(/active=1/);
  await expect(active).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('1 project');

  await mine.check();
  await expect(page).toHaveURL(/mine=1/);
  await expect(page.getByRole('status')).toHaveText('0 projects');
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();

  await page.goBack();
  await expect(mine).not.toBeChecked();
  await expect(page).not.toHaveURL(/mine=1/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');

  await query.fill('temporary draft');
  await page.getByRole('button', { name: 'Clear project search' }).click();
  await expect(query).toHaveValue('');
  await expect(query).toBeFocused();
  await expect(page).toHaveURL(/q=forge/);

  await query.fill('zzzz');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=zzzz/);
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
  await expect(query).toHaveValue('zzzz');

  await page.getByRole('button', { name: 'Reset search and filters' }).first().click();
  await expect(query).toHaveValue('');
  await expect(active).not.toBeChecked();
  await expect(mine).not.toBeChecked();
  await expect(sort).toHaveValue('name');
  await expect(page).not.toHaveURL(/[?&](q|active|mine|sort)=/);
  await expect(page.getByRole('status')).toHaveText('6 projects');

  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('native form reset restores the initial search query without emitting a query intent', async ({ page }) => {
  await page.goto(`/components/search-field/${port}.html`);
  const input = page.locator('#search');
  const form = page.locator('#search-form');
  await input.fill('changed');
  await expect(input).toHaveValue('changed');
  await form.evaluate(async (element) => {
    element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(input).toHaveValue('changed');
  await page.getByRole('button', { name: 'Reset search' }).click();
  await expect(input).toHaveValue('forge');
  expect(await form.evaluate((element) => new FormData(element).get('query'))).toBe('forge');
  if (['react', 'vue', 'angular'].includes(port)) {
    await expect(page.locator('body')).toHaveAttribute('data-requested', 'changed');
  }
  await page.locator('#clear').click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await input.fill('changed');
  if (['react', 'vue', 'angular'].includes(port)) {
    await expect(page.locator('body')).toHaveAttribute('data-requested', 'changed');
  }
});

test('controlled query rejection and reset preserve the consumer value', async ({ page }) => {
  test.skip(!['react', 'vue', 'angular'].includes(port), 'Managed query contract.');
  await page.goto(`/components/search-field/${port}.html`);
  const input = page.locator('#controlled');
  await expect(input).toHaveValue('committed');
  await input.fill('rejected');
  await expect(page.locator('body')).toHaveAttribute('data-requested', 'rejected');
  await expect(input).toHaveValue('committed');
  await page.locator('#update-controlled').click();
  await expect(input).toHaveValue('latest');
  await page.getByRole('button', { name: 'Reset controlled' }).click();
  await expect(input).toHaveValue('latest');
  expect(await page.locator('#controlled-form').evaluate((element) => new FormData(element).get('query'))).toBe(
    'latest',
  );
  await expect(page.locator('body')).toHaveAttribute('data-requested', 'rejected');
  await page.locator('#controlled-clear').click();
  await expect(page.locator('body')).toHaveAttribute('data-requested', '');
  await expect(input).toHaveValue('latest');
  await expect(input).toBeFocused();
});

test('canonical SearchField clear states work without documentation CSS', async ({ page }) => {
  test.skip(port !== 'react', 'Public React fixture verifies the canonical Web CSS contract.');
  await page.goto('/components/search-field/react.html');

  const clear = page.locator('#clear');
  await expect(clear).toHaveCSS('cursor', 'pointer');
  await clear.focus();
  await expect(clear).toHaveCSS('outline-style', 'solid');

  await clear.evaluate((element) => {
    element.disabled = true;
  });
  await expect(clear).toHaveCSS('cursor', 'not-allowed');
  const values = await clear.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, foreground: style.color };
  });
  expect(values.background).not.toBe('');
  expect(values.foreground).not.toBe('');

  const loadedDocsCss = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
    links.some((link) => link.href.includes('/assets/docs.css')),
  );
  expect(loadedDocsCss).toBe(false);
});

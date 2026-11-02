import { test, expect } from '@playwright/test';

async function expectNoRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('model-native React docs own search and playground interactions', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/react/components/button/');

  const shell = page.locator('[data-vf-app-shell][data-vf-docs-renderer="react"]');
  await expect(shell).toHaveAttribute('data-vf-docs-client-owner', 'react');

  const reactSearch = page.locator('[data-vf-docs-search-owner="react"]');
  await expect(reactSearch).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-search]')).toHaveCount(0);
  await expect(page.locator('[data-vf-docs-search-results]')).toHaveCount(0);

  const search = page.getByRole('searchbox', { name: 'Search' });
  await search.fill('button');
  const buttonResult = reactSearch.getByRole('link', { name: 'Button', exact: true });
  await expect(buttonResult).toBeVisible();
  await expect(buttonResult).toHaveAttribute('href', /\/next\/react\/components\/button\/$/);
  await search.press('Escape');
  await expect(buttonResult).toHaveCount(0);

  const playground = page.locator('[data-vf-example-id="button/basic"]');
  await expect(playground).toHaveAttribute('data-vf-example-owner', 'react');
  await expect(playground.locator('[data-vf-example-data]')).toHaveCount(0);

  await playground.getByRole('button', { name: 'Show code' }).click();
  const editor = playground.getByRole('textbox', { name: 'Basic button code editor' });
  await expect(editor).toBeVisible();
  await expect(editor).toHaveValue(/@vyrnforge\/react\/button/);

  const source = await editor.inputValue();
  await editor.fill(source.replace('Save changes', 'Ship release'));
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(page.frameLocator('[data-vf-example-id="button/basic"] iframe').getByRole('button', { name: 'Ship release' })).toBeVisible();

  await playground.getByRole('button', { name: 'Reset' }).click();
  await expect(editor).toHaveValue(/Save changes/);
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('react example ready.');

  verifyNoErrors();
});

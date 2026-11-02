import { test, expect } from '@playwright/test';

async function expectNoRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('docs gateway locks framework selection before entering documentation', async ({ page }) => {
  await page.goto('/next/');
  await expect(page).toHaveTitle(/Choose your framework · VyrnForge/);
  await expect(page.getByRole('heading', { level: 1, name: 'Choose your framework' })).toBeVisible();
  const choices = page.locator('[data-vf-framework-gateway-choice]');
  await expect(choices).toHaveCount(5);
  await page.getByRole('link', { name: /React documentation/ }).click();
  await expect(page).toHaveURL(/\/next\/react\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Getting Started' })).toBeVisible();
});

test('each framework documentation view owns its AppShell runtime while preserving one shell contract', async ({ page }) => {
  const cases = [
    ['native-web', 'div'],
    ['react', 'div'],
    ['angular', 'div'],
    ['vue', 'div'],
    ['elements', 'vf-app-shell']
  ];

  for (const [framework, expectedTag] of cases) {
    const verifyNoErrors = await expectNoRuntimeErrors(page);
    await page.goto(`/next/${framework}/`);
    const shell = page.locator(`[data-vf-app-shell][data-vf-docs-renderer="${framework}"]`);
    await expect(shell).toHaveCount(1);
    await expect(shell).toHaveJSProperty('tagName', expectedTag.toUpperCase());
    await expect(shell.locator('[data-vf-app-shell-header]')).toHaveCount(1);
    await expect(shell.locator('[data-vf-app-shell-navigation]')).toHaveCount(1);
    await expect(shell.locator('[data-vf-app-shell-main]')).toHaveCount(1);
    await expect(shell.locator('[data-vf-app-shell-footer]')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Getting Started' })).toBeVisible();
    const frameworkSwitcher = page.getByRole('navigation', { name: 'Framework' });
    await expect(frameworkSwitcher).toBeVisible();
    await expect(frameworkSwitcher.getByRole('link')).toHaveCount(5);
    await expect(frameworkSwitcher.locator('.vf-framework-mark')).toHaveCount(5);
    if (framework !== 'elements') await expect(page.locator('vf-app-shell')).toHaveCount(0);
    verifyNoErrors();
  }
});

test('framework switch is one icon list, performs route navigation, and preserves component context', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/react/components/button/');
  const switcher = page.getByRole('navigation', { name: 'Framework' });
  await expect(switcher).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Framework' })).toHaveCount(0);
  const choices = switcher.locator('[data-vf-framework-choice]');
  await expect(choices).toHaveCount(5);

  const reactChoice = switcher.getByRole('link', { name: 'React documentation' });
  await expect(reactChoice).toHaveAttribute('aria-current', 'page');
  await expect(reactChoice).toHaveAttribute('title', 'React');
  await expect(reactChoice.locator('[data-vf-framework-mark="react"]')).toHaveCount(1);

  for (const choice of await choices.all()) {
    const box = await choice.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  }

  await switcher.getByRole('link', { name: 'Vue documentation' }).click();
  await expect(page).toHaveURL(/\/next\/vue\/components\/button\/$/);
  await expect(page.locator('[data-vf-framework-context="vue"]')).toContainText('@vyrnforge/vue/button');
  verifyNoErrors();
});

test('framework-scoped navigation and search never escape the selected framework', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/react/');
  const navigation = page.getByRole('navigation', { name: 'Documentation' });
  const buttonNavLink = navigation.locator('[data-vf-side-nav-link][href$="components/button/"]');
  await expect(buttonNavLink).toHaveCount(1);
  await expect(buttonNavLink).toHaveAttribute('href', /components\/button\/$/);
  const search = page.getByRole('searchbox', { name: 'Search' });
  await search.fill('button');
  const result = page.getByRole('link', { name: 'Button', exact: true }).last();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);
  verifyNoErrors();
});

test('Button documentation exposes idiomatic usage and executes each implemented framework surface', async ({ page }) => {
  const cases = [
    {
      framework: 'native-web',
      heading: 'Native Web usage',
      usage: /data-vf-button[\s\S]*data-vf-variant/,
      executable: /data-vf-button/
    },
    {
      framework: 'react',
      heading: 'React usage',
      usage: /@vyrnforge\/react\/button[\s\S]*<Button/,
      executable: /@vyrnforge\/react\/button/
    },
    {
      framework: 'angular',
      heading: 'Angular usage',
      usage: /@vyrnforge\/angular\/button[\s\S]*VfButtonDirective[\s\S]*vfButton/,
      executable: /@vyrnforge\/angular\/button/
    },
    {
      framework: 'vue',
      heading: 'Vue usage',
      usage: /<script setup lang="ts">[\s\S]*@vyrnforge\/vue\/button[\s\S]*<Button/,
      executable: /@vyrnforge\/vue\/button/
    }
  ];

  for (const { framework, heading, usage, executable } of cases) {
    const verifyNoErrors = await expectNoRuntimeErrors(page);
    await page.goto(`/next/${framework}/components/button/`);

    const adaptation = page.locator(`[data-vf-framework-adaptation="${framework}"]`);
    await expect(adaptation).toHaveCount(1);
    await expect(adaptation.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    const usageCode = adaptation.locator(`[data-vf-framework-usage-code="${framework}"]`);
    await expect(usageCode).toHaveCount(1);
    await expect(usageCode).toContainText(usage);
    await expect(page.locator('[data-vf-framework-usage-code]')).toHaveCount(1);

    const playground = page.locator('[data-vf-example-id="button/basic"]');
    await expect(playground).toHaveAttribute('data-vf-example-locked-framework', framework);
    const frame = page.frameLocator('[data-vf-example-id="button/basic"] iframe');
    await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();

    await playground.locator('[data-vf-example-code-toggle]').click();
    const editor = playground.getByRole('textbox', { name: 'Basic button code editor' });
    await expect(editor).toHaveValue(executable);

    if (framework === 'react') {
      const reactSource = await editor.inputValue();
      await editor.fill(reactSource.replace('Save changes', 'Ship release'));
      await playground.getByRole('button', { name: 'Run' }).click();
      await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
      await expect(frame.getByRole('button', { name: 'Ship release' })).toBeVisible();
    }

    verifyNoErrors();
  }
});

test('unavailable framework component remains an explicit route instead of falling back', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/elements/components/button/');
  await expect(page).toHaveURL(/\/next\/elements\/components\/button\/$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Not available for Custom Elements' })).toBeVisible();
  await expect(page.locator('[data-vf-framework-unavailable="elements"]')).toContainText('does not expose a supported Custom Elements surface');
  await expect(page.locator('[data-vf-example-id]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button', exact: true })).toHaveCount(0);
  verifyNoErrors();
});

test('Text documentation keeps the same visual content contract inside a framework-scoped app', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/react/components/text/');
  const guide = page.locator('[data-vf-typography-guide]');
  await expect(guide).toBeVisible();
  await expect(page.locator('[data-vf-type-specimen]')).toHaveCount(18);
  const displaySize = await page.locator('[data-vf-type-specimen="display-lg"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const bodySize = await page.locator('[data-vf-type-specimen="body-md"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(displaySize).toBeGreaterThan(bodySize);
  verifyNoErrors();
});

test('framework-scoped docs remain navigable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/native-web/foundations/accessibility/');
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeVisible();
  const frameworkSwitcher = page.getByRole('navigation', { name: 'Framework' });
  await expect(frameworkSwitcher).toBeVisible();
  await expect(frameworkSwitcher.getByRole('link')).toHaveCount(5);
  const box = await frameworkSwitcher.boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
});

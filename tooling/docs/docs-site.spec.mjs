import { test, expect } from '@playwright/test';

async function expectNoRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('docs home consumes the reusable AppShell and exposes versioned accessible navigation and search', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');
  await expect(page).toHaveTitle(/Getting Started · VyrnForge/);
  await expect(page.locator('vf-app-shell')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => customElements.get('vf-app-shell')?.name ?? '')).toBe('VfAppShellElement');
  await expect(page.locator('vf-app-shell')).toHaveAttribute('data-vf-app-shell', '');
  await expect(page.locator('vf-app-shell > [data-vf-app-shell-header]')).toHaveCount(1);
  await expect(page.locator('vf-app-shell > [data-vf-app-shell-body]')).toHaveCount(1);
  await expect(page.locator('vf-app-shell > [data-vf-app-shell-footer]')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'Getting Started' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
  await expect(page.locator('[data-vf-docs-version]')).toContainText('next');

  const frameworkPicker = page.getByRole('group', { name: 'Framework' });
  await expect(frameworkPicker).toBeVisible();
  await expect(frameworkPicker.getByRole('button')).toHaveCount(5);
  await expect(frameworkPicker.locator('[data-vf-framework-mark]')).toHaveCount(5);
  for (const mark of await frameworkPicker.locator('[data-vf-framework-mark]').all()) await expect(mark).toHaveAttribute('aria-hidden', 'true');

  const search = page.getByRole('searchbox', { name: 'Search' });
  await search.fill('styling');
  const result = page.getByRole('link', { name: 'Styling' }).last();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Styling' })).toBeVisible();
  verifyNoErrors();
});

test('component navigation groups the discovered inventory by developer usage', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');

  const navigation = page.getByRole('navigation', { name: 'Documentation' });
  const componentSection = navigation.locator('[data-vf-side-nav-group]').filter({ has: page.locator('[data-vf-side-nav-group-label]', { hasText: 'Components' }) });
  const groups = componentSection.locator('[data-vf-docs-component-subgroup]');
  await expect(groups).toHaveCount(9);

  const expectedGroups = [
    'Actions',
    'Form Controls',
    'Selection & Choice',
    'Specialized Fields',
    'Navigation & Menus',
    'Layout & Structure',
    'Content & Disclosure',
    'Overlays & Feedback',
    'Utilities & Accessibility'
  ];
  for (const label of expectedGroups) await expect(componentSection.locator('summary', { hasText: label })).toBeVisible();

  const formControls = groups.filter({ has: page.locator('summary', { hasText: 'Form Controls' }) });
  await expect(formControls).not.toHaveAttribute('open', '');
  await formControls.locator('summary').click();
  await expect(formControls.getByRole('link', { name: 'Input', exact: true })).toBeVisible();
  await expect(formControls.getByRole('link', { name: 'Textarea', exact: true })).toBeVisible();

  await page.goto('/next/components/button/');
  const actions = page.locator('[data-vf-docs-component-subgroup]').filter({ has: page.locator('summary', { hasText: 'Actions' }) });
  await expect(actions).toHaveAttribute('open', '');
  await expect(actions).toHaveAttribute('data-vf-current-group', 'true');
  await expect(actions.getByRole('link', { name: 'Button', exact: true })).toHaveAttribute('aria-current', 'page');
  verifyNoErrors();
});

test('framework selection exposes current public component availability', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');
  let frameworkPicker = page.getByRole('group', { name: 'Framework' });
  await frameworkPicker.getByRole('button', { name: 'React' }).click();
  await expect(page).toHaveURL(/\/next\/frameworks\/react\/$/);
  frameworkPicker = page.getByRole('group', { name: 'Framework' });
  await expect(frameworkPicker.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { level: 1, name: 'React' }).locator('[data-vf-framework-mark="react"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-support-status="partial"]')).toContainText('React integration is available');
  await expect(page.getByRole('heading', { level: 2, name: 'Available component entrypoints' })).toBeVisible();
  await expect(page.locator('main')).toContainText('@vyrnforge/react/dialog');

  await frameworkPicker.getByRole('button', { name: 'Custom Elements' }).click();
  await expect(page).toHaveURL(/\/next\/frameworks\/elements\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Custom Elements' })).toBeVisible();
  await expect(page.locator('[data-vf-support-status="partial"]')).toContainText('Icon and Tabs');
  await expect(page.locator('main')).toContainText('@vyrnforge/elements/tabs');
  verifyNoErrors();
});

test('Button documentation uses executable multi-framework examples and a sandboxed live editor', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/button/');

  const playground = page.locator('[data-vf-example-id="button/basic"]');
  const editor = playground.getByRole('textbox', { name: 'Basic button code editor' });
  const frame = page.frameLocator('[data-vf-example-id="button/basic"] iframe');
  await expect(playground).toBeVisible();
  await expect(playground.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');

  const expectations = [
    ['React', 'react', '@vyrnforge/react/button'],
    ['Angular', 'angular', '@vyrnforge/angular/button'],
    ['Vue', 'vue', '@vyrnforge/vue/button'],
    ['Native Web', 'native-web', 'data-vf-button']
  ];
  for (const [label, framework, sourceNeedle] of expectations) {
    const tab = playground.getByRole('tab', { name: label });
    await expect(tab.locator(`[data-vf-framework-mark="${framework}"]`)).toHaveCount(1);
    await tab.click();
    await expect(editor).toHaveValue(new RegExp(sourceNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();
  }

  await playground.getByRole('tab', { name: 'React' }).click();
  const reactSource = await editor.inputValue();
  await editor.fill(reactSource.replace('Save changes', 'Ship release'));
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Ship release' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Angular' }).click();
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Vue' }).click();
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Native Web' }).click();
  const nativeSource = await editor.inputValue();
  await editor.fill(nativeSource.replace('Save changes', 'Publish changes'));
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Publish changes' })).toBeVisible();

  verifyNoErrors();
});

test('Icon documentation renders the sample glyph in every executable framework example', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/icon/');

  const playground = page.locator('[data-vf-example-id="icon/basic"]');
  const frame = page.frameLocator('[data-vf-example-id="icon/basic"] iframe');
  await expect(playground).toBeVisible();

  const frameworks = [
    ['React', 'react'],
    ['Angular', 'angular'],
    ['Vue', 'vue'],
    ['Custom Elements', 'elements'],
    ['Native Web', 'native-web']
  ];
  for (const [label, framework] of frameworks) {
    const tab = playground.getByRole('tab', { name: label });
    await expect(tab.locator(`[data-vf-framework-mark="${framework}"]`)).toHaveCount(1);
    await tab.click();
    await expect(frame.locator('[data-vf-icon]')).toBeVisible();
    await expect(frame.locator('[data-vf-icon] path')).toHaveCount(1);
  }

  verifyNoErrors();
});

test('Text documentation teaches the live typography scale instead of only listing variants', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/text/');

  const guide = page.locator('[data-vf-typography-guide]');
  await expect(guide).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Variants and sizes' })).toBeVisible();
  await expect(page.locator('[data-vf-type-specimen]')).toHaveCount(18);
  await expect(page.locator('[data-vf-type-specimen="overline"] [data-vf-text]')).toHaveCSS('text-transform', 'uppercase');

  const displaySize = await page.locator('[data-vf-type-specimen="display-lg"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const bodySize = await page.locator('[data-vf-type-specimen="body-md"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(displaySize).toBeGreaterThan(bodySize);

  await expect(page.getByRole('heading', { level: 2, name: 'Semantics and appearance' })).toBeVisible();
  await expect(guide).toContainText('Semantics and style are separate');
  await expect(guide).toContainText('--vf-font-family-display');
  await expect(guide).toContainText('TextVariantOverrides');

  await page.setViewportSize({ width: 390, height: 844 });
  const horizontalOverflow = await guide.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  verifyNoErrors();
});

test('docs remain navigable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/foundations/accessibility/');
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeVisible();
  const frameworkPicker = page.getByRole('group', { name: 'Framework' });
  await expect(frameworkPicker).toBeVisible();
  const overflow = await frameworkPicker.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeGreaterThanOrEqual(0);
});
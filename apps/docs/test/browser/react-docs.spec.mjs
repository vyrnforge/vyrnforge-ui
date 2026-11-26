import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
import { compileFrameworkDocumentation } from '../../../../tooling/docs/framework-documentation.mjs';

test('React example documents load canonical Web CSS without documentation chrome CSS', () => {
  const app = readFileSync('dist/docs/next/react/components/button/index.html', 'utf8');
  expect(app).toContain('assets/docs.css');
  const docsCss = readFileSync('dist/docs/assets/docs.css', 'utf8');
  expect(docsCss).not.toContain('[data-vf-search-field-clear]');
  expect(docsCss).not.toContain('.vf-docs-icon-grid [data-vf-button]');
  expect(docsCss).toContain('[data-vf-docs-icon-card]');

  for (const route of [
    'examples/button-basic/',
    'examples/typography/text/',
    'examples/list/rich/',
  ]) {
    const html = readFileSync('dist/docs/next/react/' + route + 'index.html', 'utf8');
    expect(html).not.toContain('docs.css');
    expect(html).toContain('vyrnforge-web/');
  }
});

test('React pilot artifact is Product Graph-backed and SSR-rendered with public React components', () => {
  const manifestPath = 'dist/docs/next/react/site-manifest.json';
  expect(existsSync(manifestPath)).toBe(true);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const button = compileFrameworkDocumentation('react').componentCatalog.find((entry) => entry.id === 'button');
  expect(manifest.framework).toBe('react');
  expect(manifest.status).toBe('button-layout-typography-icon-image-divider-avatar-badge-list-chip-loading-backdrop-status-alert-feedback-pilot');
  expect(manifest.button.sharedSourcePath).toBe(button.sharedSourcePath);
  expect(manifest.button.frameworkSourcePath).toBe(button.frameworkSourcePath);
  expect(manifest.button.publicEntrypoints).toContain('@vyrnforge/react/button');
  expect(manifest.button.examples).toHaveLength(7);
  expect(manifest.buttonGroup).toMatchObject({ guideRoute: 'patterns/button-group/', apiRoute: null, guideOnly: true, publicEntrypoints: [] });
  expect(manifest.buttonGroup.examples.map(example => example.id).sort()).toEqual([
    'button-group/horizontal', 'button-group/icons', 'button-group/mixed', 'button-group/separate', 'button-group/toggles', 'button-group/vertical',
  ]);
  expect(manifest.toggle).toMatchObject({
    guideRoute: 'components/toggle-button/',
    apiRoute: 'api/components/toggle-button/',
    publicEntrypoints: ['@vyrnforge/react/toggle-button'],
    frameworkSourcePath: 'product/components/interactive-controls/toggle-button/react/docs/index.md',
  });
  expect(manifest.toggle.examples.map(example => example.id)).toEqual(['toggle-button/basic', 'toggle-button/controlled', 'toggle-button/icon-text', 'toggle-button/icons', 'toggle-button/sizes', 'toggle-button/states', 'toggle-button/text-only']);
  expect(readFileSync('dist/docs/next/react/examples/toggle-button/basic/index.html', 'utf8'))
    .toContain('react-toggle-button-basic.js');
  expect(manifest.layout).toMatchObject({ guideOnly: false, api: true,
    publicEntrypoints: ['@vyrnforge/react/layout'], cssRecipeStyle: '@vyrnforge/web/styles/layout.css' });
  expect(manifest.layout.examples).toHaveLength(7);
  expect(manifest.layout.examples.map((example) => example.id)).toContain('layout/dividers');
  expect(manifest.routes.filter((entry) => entry.view !== 'unavailable').map((entry) => entry.route)).toEqual([
    '', 'foundations/tokens/', 'foundations/themes/', 'foundations/color/', 'foundations/theme-builder/', 'foundations/dark-mode/',
    'foundations/right-to-left/', 'utilities/overlay/', 'utilities/motion/', 'foundations/styling/',  'components/button/', 'api/components/button/',
    'patterns/button-group/', 'components/toggle-button/', 'api/components/toggle-button/', 'components/toggle-group/', 'api/components/toggle-group/', 'components/checkbox/', 'api/components/checkbox/', 'components/radio/', 'api/components/radio/', 'patterns/checkbox-group/', 'patterns/radio-group/', 'components/layout/', 'api/components/layout/',
    'components/divider/', 'api/components/divider/',
    ...['text', 'code', 'kbd'].flatMap((id) => [
      'components/' + id + '/', 'api/components/' + id + '/',
    ]),
    'icons/', 'components/icon/', 'api/components/icon/',
    'components/image/', 'api/components/image/',
    'components/list/', 'api/components/list/',
    'patterns/banner/',
    'patterns/empty-state/',
    'patterns/inline-feedback/',
    'patterns/feedback-composition/',
    'components/status-indicator/', 'api/components/status-indicator/',
    'components/alert/', 'api/components/alert/',
    'components/dialog/', 'api/components/dialog/',
    'components/alert-dialog/', 'api/components/alert-dialog/',
    'components/drawer/', 'api/components/drawer/',
    'components/toast/', 'api/components/toast/',
    'components/backdrop/', 'api/components/backdrop/',
    'patterns/loading/', 'api/patterns/loading/',
    'components/chip/', 'api/components/chip/',
    'components/badge/', 'api/components/badge/',
    'components/avatar/', 'api/components/avatar/',
  ]);
  expect(manifest.list).toMatchObject({
    guideRoute: 'components/list/', apiRoute: 'api/components/list/',
    publicEntrypoints: ['@vyrnforge/react/list'],
    frameworkSourcePath: 'product/components/composition-primitives/list/react/docs/index.md',
  });
  expect(manifest.list.examples.map((example) => example.id)).toEqual([
    'list/actions', 'list/density', 'list/grouped', 'list/gutters',
    'list/interactive', 'list/markers', 'list/nested', 'list/rich',
  ]);
  for (const example of manifest.list.examples) {
    const slug = example.id.slice('list/'.length);
    const frame = 'dist/docs/next/react/examples/list/' + slug + '/index.html';
    expect(readFileSync(frame, 'utf8')).toContain('react-list-' + slug + '.js');
    expect(readFileSync(frame, 'utf8')).toContain('react-list-' + slug + '.css');
  }
  expect(manifest.divider).toMatchObject({
    guideRoute: 'components/divider/', apiRoute: 'api/components/divider/',
    publicEntrypoints: ['@vyrnforge/react/divider'],
    frameworkSourcePath: 'product/components/composition-primitives/divider/react/docs/index.md',
  });
  expect(manifest.divider.examples.map((entry) => entry.id)).toEqual([
    'divider/basic', 'divider/labeled-horizontal', 'divider/labeled-vertical', 'divider/text-direction', 'divider/vertical',
  ]);
  for (const example of manifest.divider.examples) {
    const slug = example.id.split('/')[1];
    const html = readFileSync('dist/docs/next/react/examples/divider/' + slug + '/index.html', 'utf8');
    expect(html).toContain('react-divider-' + slug + '.js');
    expect(html).toContain('react-divider-' + slug + '.css');
  }
  expect(manifest.icon).toMatchObject({
    libraryRoute: 'icons/', guideRoute: 'components/icon/', apiRoute: 'api/components/icon/',
    publicEntrypoints: ['@vyrnforge/react/icon'],
    frameworkSourcePath: 'product/components/elemental-primitives/media/icon/react/docs/index.md',
  });
  expect(manifest.icon.examples.map((example) => example.id)).toEqual([
    'icon/accessibility', 'icon/basic', 'icon/colors', 'icon/custom', 'icon/inline-svg',
    'icon/sizes', 'icon/svg-wrapper', 'icon/variants',
  ]);
  for (const example of manifest.icon.examples) {
    const slug = example.id.slice('icon/'.length);
    const frame = 'dist/docs/next/react/examples/icon/' + slug + '/index.html';
    expect(readFileSync(frame, 'utf8')).toContain('react-icon-' + slug + '.js');
    expect(readFileSync(frame, 'utf8')).toContain('react-icon-' + slug + '.css');
  }
  expect(manifest.chip).toMatchObject({
    guideRoute: 'components/chip/', apiRoute: 'api/components/chip/',
    publicEntrypoints: ['@vyrnforge/react/chip'],
    frameworkSourcePath: 'product/components/composition-primitives/chip/react/docs/index.md',
  });
  expect(manifest.chip.examples.map(example => example.id)).toEqual([
    'chip/action-removal', 'chip/appearance', 'chip/array', 'chip/artwork', 'chip/basic', 'chip/clickable', 'chip/custom-delete', 'chip/deletable', 'chip/icon', 'chip/links', 'chip/multiline', 'chip/removal', 'chip/selection', 'chip/sizes',
  ]);
  for (const example of manifest.chip.examples) {
    const slug = example.id.slice('chip/'.length);
    const frame = readFileSync('dist/docs/next/react/examples/chip/' + slug + '/index.html', 'utf8');
    expect(frame).toContain('react-chip-' + slug + '.js');
    expect(frame).toContain('react-chip-' + slug + '.css');
  }
  expect(manifest.badge).toMatchObject({
    guideRoute: 'components/badge/', apiRoute: 'api/components/badge/',
    publicEntrypoints: ['@vyrnforge/react/badge'],
    frameworkSourcePath: 'product/components/composition-primitives/badge/react/docs/index.md',
  });
  expect(manifest.badge.examples.map((example) => example.id)).toEqual([
    'badge/basic', 'badge/dot', 'badge/positioning', 'badge/variants', 'badge/visibility',
  ]);
  for (const entry of manifest.badge.examples) {
    const slug = entry.id.slice('badge/'.length);
    const html = readFileSync('dist/docs/next/react/examples/badge/' + slug + '/index.html', 'utf8');
    expect(html).toContain('react-badge-' + slug + '.js');
    expect(html).toContain('react-badge-' + slug + '.css');
  }
  expect(manifest.avatar).toMatchObject({
    guideRoute: 'components/avatar/', apiRoute: 'api/components/avatar/',
    publicEntrypoints: ['@vyrnforge/react/avatar'],
    frameworkSourcePath: 'product/components/composition-primitives/avatar/react/docs/index.md',
  });
  expect(manifest.avatar.examples.map((entry) => entry.id)).toEqual([
    'avatar/decorative', 'avatar/fallback', 'avatar/group', 'avatar/icon',
    'avatar/image', 'avatar/initials', 'avatar/shapes', 'avatar/sizing',
    'avatar/spacing', 'avatar/total',
  ]);
  for (const example of manifest.avatar.examples) {
    const slug = example.id.split('/')[1];
    const html = readFileSync('dist/docs/next/react/examples/avatar/' + slug + '/index.html', 'utf8');
    expect(html).toContain('react-avatar-' + slug + '.js');
    expect(html).toContain('react-avatar-' + slug + '.css');
  }
  expect(manifest.image).toMatchObject({
    guideRoute: 'components/image/', apiRoute: 'api/components/image/',
    publicEntrypoints: ['@vyrnforge/react/image'],
    frameworkSourcePath: 'product/components/elemental-primitives/media/image/react/docs/index.md',
  });
  expect(manifest.image.examples.map((example) => example.id)).toEqual([
    'image/basic', 'image/captioned', 'image/decorative', 'image/responsive',
  ]);
  for (const example of manifest.image.examples) {
    const slug = example.id.slice('image/'.length);
    const frame = 'dist/docs/next/react/examples/image/' + slug + '/index.html';
    expect(readFileSync(frame, 'utf8')).toContain('react-image-' + slug + '.js');
    expect(readFileSync(frame, 'utf8')).toContain('react-image-' + slug + '.css');
  }
  for (const id of ['text', 'code', 'kbd']) {
    const entry = manifest.typography[id];
    expect(entry.publicEntrypoints).toContain('@vyrnforge/react/' + id);
    expect(entry.exampleSourcePath).toBe(
      'product/components/elemental-primitives/typography/' + id + '/examples/basic/react.tsx');
    expect(entry.frameworkSourcePath).toBe(
      'product/components/elemental-primitives/typography/' + id + '/react/docs/index.md');
    expect(manifest.routes).toContainEqual({ route: 'components/' + id + '/', view: 'typography' });
    expect(manifest.routes).toContainEqual({ route: 'api/components/' + id + '/', view: 'typography-api' });
    const frame = 'dist/docs/next/react/examples/typography/' + id + '/index.html';
    expect(readFileSync(frame, 'utf8')).toContain('react-typography-' + id + '.js');
    expect(readFileSync(frame, 'utf8')).toContain('react-typography-' + id + '.css');
  }
  for (const route of manifest.routes) {
    const html = readFileSync('dist/docs/next/react/' + route.route + 'index.html', 'utf8');
    expect(html).toContain('data-vf-app-shell');
    expect(html).toContain('data-vf-side-nav');
    expect(html).toContain('id="vf-react-root"');
    expect(html).toContain('id="vf-react-page-data"');
    expect(html).toContain('react-reference.js');
    expect(html).toContain('@vyrnforge/react/button');
  }
});

test('Foundations is a separate discoverable catalog for tokens, themes and CSS', async ({ page }) => {
  await page.goto('/next/react/foundations/tokens/');
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  await expect(nav.getByText('Foundations', { exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Design tokens' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Theming' })).toBeVisible();
  await expect(nav.getByText('Customization', { exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Color / Theme Studio' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Theme Builder' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Dark mode' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Right-to-left' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Styling & CSS' })).toBeVisible();
  const tokens = page.locator('[data-vf-docs-react-tokens]');
  await expect(tokens.getByRole('heading', { name: 'Design tokens' })).toBeVisible();
  await expect(tokens).toContainText('Token categories');
  await nav.getByRole('link', { name: 'Styling & CSS' }).click();
  const styling = page.locator('[data-vf-docs-react-styling]');
  await expect(styling.getByRole('heading', { name: 'Styling & CSS' })).toBeVisible();
  await expect(styling).toContainText('CSS delivery');
  await expect(styling).toContainText('@vyrnforge/web/styles.css');
  await nav.getByRole('link', { name: 'Theming' }).click();
  await expect(page.locator('[data-vf-docs-react-themes]')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('stylesheet');
  await expect(page.locator('[data-vf-docs-react-results]')).toContainText('Styling & CSS');
});

test('React theme guide uses semantic roles across built-in and custom nested theme scopes', async ({ page }) => {
  await page.goto('/next/react/foundations/themes/');
  const guide = page.locator('[data-vf-docs-react-themes]');
  await expect(guide.getByRole('heading', { name: 'Theming' })).toBeVisible();
  await expect(guide).toContainText('Custom themes for both appearances');
  const previews = guide.locator('[data-vf-docs-react-theme-previews]');
  await expect(previews).toHaveAttribute('data-vf-auto-grid', '');
  const light = previews.locator('[data-vf-theme="light"]');
  const dark = previews.locator('[data-vf-theme="dark"]').first();
  const custom = previews.locator('[data-vf-theme="dark"]').last();
  const value = async (scope) => scope.getByText('Primary accent', { exact: true }).evaluate(
    (el) => getComputedStyle(el).color);
  const lightPrimary = await value(light);
  const darkPrimary = await value(dark);
  const customPrimary = await value(custom);
  expect(lightPrimary).not.toBe(darkPrimary);
  expect(customPrimary).not.toBe(darkPrimary);
  const buttonBackground = async (scope) => scope.getByRole('button', { name: 'Primary action' })
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  const lightButton = await buttonBackground(light);
  const darkButton = await buttonBackground(dark);
  const customButton = await buttonBackground(custom);
  expect(lightButton).not.toBe(darkButton);
  expect(customButton).not.toBe(darkButton);
  await expect(light).toContainText('Secondary text');
  await expect(dark).toContainText('Danger text');
  const semantics = await custom.locator('h3[data-vf-text]').evaluate(
    (el) => ({ tag: el.tagName, bg: getComputedStyle(el.parentElement.parentElement).backgroundColor }));
  expect(semantics.tag).toBe('H3');
  expect(semantics.bg).not.toBe('rgba(0, 0, 0, 0)');
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('semantic color');
  await expect(page.locator('[data-vf-docs-react-results]')).toContainText('Theme Builder');
});

test('Theme Studio focuses on palettes and hands a customized draft into Theme Builder', async ({ page }) => {
  await page.goto('/next/react/foundations/color/');
  const studio = page.locator('[data-vf-docs-react-color]');
  await expect(studio.getByRole('heading', { name: 'Color', level: 1 })).toBeVisible();
  await expect(studio.getByRole('navigation', { name: 'Theme Studio sections' }).getByRole('link')).toHaveCount(2);
  await expect(studio.getByRole('heading', { name: 'Semantic token inspector' })).toHaveCount(0);
  await expect(studio.getByRole('heading', { name: 'Export your theme' })).toHaveCount(0);
  const families = studio.locator('[data-vf-docs-color-picker]');
  await families.getByRole('button', { name: 'Teal' }).click();
  const selected = studio.locator('[data-vf-docs-color-selected]');
  await expect(selected).toHaveAttribute('data-vf-docs-color-selected', 'teal');
  await studio.locator('[data-vf-docs-color-shades]')
    .getByRole('button', { name: 'Shade 700, #115e59' }).click();
  const shadeInput = studio.locator('[data-vf-docs-studio-picker="shade"]')
    .getByRole('textbox', { name: 'Selected shade hex', exact: true });
  await shadeInput.fill('#123456');
  await expect(studio.locator('[data-vf-docs-color-shades]')
    .getByRole('button', { name: 'Shade 700, #123456' })).toHaveAttribute('aria-pressed', 'true');
  const preview = studio.locator('[data-vf-docs-theme-preview="light"]');
  await preview.getByRole('button', { name: 'Save changes' }).click();
  await expect(preview.locator('[data-vf-docs-preview-feedback]'))
    .toHaveText('Primary preview action activated');
  await studio.locator('[data-vf-docs-open-builder]').click();
  await expect(page).toHaveURL(/\/next\/react\/foundations\/theme-builder\/\?draft=/);
  const builder = page.locator('[data-vf-docs-theme-builder]');
  await expect(builder.getByRole('heading', { name: 'Theme Builder' })).toBeVisible();
  await expect(builder.locator('[data-vf-docs-builder-palette]')).toHaveValue('teal');
  await expect(builder.locator('[data-vf-docs-builder-notice]')).toContainText('Palette imported');
  await expect(builder.locator('[data-vf-docs-studio-picker="builder-shade"]')
    .getByRole('textbox', { name: 'Builder shade hex', exact: true })).toHaveValue('#123456');
});

test('Theme Builder edits independent light/dark tokens, filters roles and exports two themes', async ({ page }) => {
  await page.goto('/next/react/foundations/theme-builder/');
  const builder = page.locator('[data-vf-docs-theme-builder]');
  await expect(builder.getByRole('navigation', { name: 'Theme Builder sections' })
    .getByRole('link')).toHaveCount(4);
  const roles = builder.locator('[data-vf-docs-builder-roles]');
  await expect(roles.getByRole('button')).toHaveCount(32);
  await builder.locator('#vf-builder-group').selectOption('Feedback');
  await expect(roles.getByRole('button')).toHaveCount(9);
  await expect(roles.getByRole('button', { name: /success foreground/ })).toBeVisible();
  await expect(roles.getByRole('button', { name: /warning border/ })).toBeVisible();
  await expect(roles.getByRole('button', { name: /info background/ })).toBeVisible();
  await builder.locator('#vf-builder-group').selectOption('Disabled');
  await expect(roles.getByRole('button')).toHaveCount(3);
  await builder.locator('#vf-builder-group').selectOption('All');
  const light = builder.locator('[data-vf-docs-theme-preview="light"]');
  const dark = builder.locator('[data-vf-docs-theme-preview="dark"]');
  await expect(light).toHaveCSS('color-scheme', 'light');
  await expect(dark).toHaveCSS('color-scheme', 'dark');
  await roles.getByRole('button', { name: /surface #ffffff/ }).click();
  const roleInput = builder.locator('[data-vf-docs-studio-picker="builder-role"]')
    .getByRole('textbox', { name: 'Builder role hex', exact: true });
  await roleInput.fill('#efefef');
  await expect.poll(async () => light.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe('rgb(239, 239, 239)');
  await expect.poll(async () => dark.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe('rgb(24, 24, 27)');
  await builder.locator('[data-vf-docs-builder-changed-only]').check();
  await expect(roles.getByRole('button')).toHaveCount(1);
  await builder.getByRole('radiogroup', { name: 'Builder editing appearance' })
    .getByRole('radio', { name: 'Dark' }).check();
  await expect(roles.getByRole('button')).toHaveCount(0);
  await builder.locator('[data-vf-docs-builder-changed-only]').uncheck();
  await roleInput.fill('#222222');
  await expect.poll(async () => dark.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe('rgb(34, 34, 34)');
  await builder.locator('[data-vf-docs-builder-restore-role]').click();
  await expect.poll(async () => dark.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe('rgb(24, 24, 27)');
  await builder.locator('[data-vf-docs-builder-name]').fill('acme');
  await builder.getByRole('radiogroup', { name: 'Builder export format' })
    .getByRole('radio', { name: 'CSS' }).check();
  const css = builder.locator('[data-vf-docs-builder-code="css"] code');
  await expect(css).toContainText('[data-vf-theme="acme-light"]');
  await expect(css).toContainText('[data-vf-theme="acme-dark"]');
  await expect(css).toContainText('--vf-color-surface: #efefef;');
  await builder.locator('[data-vf-docs-builder-copy]').click();
  await expect(builder.locator('[data-vf-docs-builder-export-status]'))
    .toContainText(/copied|unavailable/i);
  await builder.locator('[data-vf-docs-builder-name]').fill('Wrong Name!');
  await expect(builder.locator('[data-vf-docs-builder-copy]')).toBeDisabled();
  await expect(builder.getByRole('alert')).toContainText('lowercase slug');
  await builder.locator('[data-vf-docs-builder-reset]').click();
  await expect(builder.locator('[data-vf-docs-builder-name]')).toHaveValue('my-brand');
  await expect(builder.locator('[data-vf-docs-builder-code="function"]'))
    .toContainText('createTheme');
});

test('Theme Builder remains navigable at 320px without page overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/foundations/theme-builder/');
  const builder = page.locator('[data-vf-docs-theme-builder]');
  await builder.locator('[data-vf-docs-builder-filter]').fill('accent');
  await expect(builder.locator('[data-vf-docs-builder-roles]').getByRole('button')).toHaveCount(6);
  await builder.getByRole('radiogroup', { name: 'Builder editing appearance' })
    .getByRole('radio', { name: 'Dark' }).focus();
  await builder.getByRole('radiogroup', { name: 'Builder editing appearance' })
    .getByRole('radio', { name: 'Dark' }).press('Space');
  await expect(builder.locator('[data-vf-docs-builder-contrast="dark"]')).toBeVisible();
  const widths = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath('theme-builder-320.png'), fullPage: false });
});

test('Theme Studio retains light/dark comparison and native keyboard controls', async ({ page }) => {
  await page.goto('/next/react/foundations/color/');
  const studio = page.locator('[data-vf-docs-react-color]');
  const selected = studio.locator('[data-vf-docs-color-selected]');
  const compare = studio.locator('[data-vf-docs-studio-compare]');
  await compare.check();
  await expect(studio.locator('[data-vf-docs-theme-preview]')).toHaveCount(2);
  await studio.getByRole('radiogroup', { name: 'Palette appearance' })
    .getByRole('radio', { name: 'Dark' }).check();
  await expect(selected).toHaveAttribute('data-vf-docs-color-scheme', 'dark');
  await studio.locator('[data-vf-docs-studio-reset]').click();
  await expect(selected).toHaveAttribute('data-vf-docs-color-selected', 'blue');
  await expect(compare).not.toBeChecked();
});

test('Dark-mode page previews light, dark and system from CSS under SSR and browser preferences', async ({ page, browser }) => {
  await page.goto('/next/react/foundations/dark-mode/');
  const guide = page.locator('[data-vf-docs-react-dark-mode]');
  const controls = guide.locator('[data-vf-docs-dark-controls]');
  const selected = guide.locator('[data-vf-docs-dark-selected]');
  const preview = selected.locator('[data-vf-theme]');
  await expect(preview).toHaveAttribute('data-vf-theme', 'light');
  const light = await preview.evaluate((node) => getComputedStyle(node).backgroundColor);
  await controls.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(preview).toHaveAttribute('data-vf-theme', 'dark');
  expect(await preview.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(light);
  await page.emulateMedia({ colorScheme: 'dark' });
  await controls.getByRole('button', { name: 'System' }).click();
  await expect(preview).toHaveAttribute('data-vf-theme', 'system');
  await expect.poll(async () => preview.evaluate((node) => getComputedStyle(node).colorScheme)).toBe('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(async () => preview.evaluate((node) => getComputedStyle(node).colorScheme)).toBe('light');
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await noJsContext.newPage();
    await noJs.goto('/next/react/foundations/dark-mode/');
    await expect(noJs.locator('[data-vf-docs-react-dark-mode]')).toBeVisible();
    await expect(noJs.locator('[data-vf-docs-dark-selected]')).toHaveAttribute('data-vf-docs-dark-selected', 'light');
  } finally { await noJsContext.close(); }
});

test('RTL page preserves native direction and mixed-direction identifiers while switching', async ({ page }) => {
  await page.goto('/next/react/foundations/right-to-left/');
  const guide = page.locator('[data-vf-docs-react-rtl]');
  const preview = guide.locator('[data-vf-docs-rtl-preview]');
  await expect(preview).toHaveAttribute('dir', 'rtl');
  await expect(preview).toHaveAttribute('lang', 'ar');
  await expect(preview.locator('bdi')).toHaveAttribute('dir', 'ltr');
  await expect(preview.locator('bdi')).toHaveText('VF-2048');
  await preview.getByRole('button', { name: 'حفظ' }).click();
  await expect(guide.locator('[data-vf-docs-rtl-feedback]')).toHaveText('تم الحفظ');
  await guide.locator('[data-vf-docs-rtl-controls]').getByRole('button', { name: 'Left-to-right' }).click();
  await expect(preview).toHaveAttribute('dir', 'ltr');
  await expect(preview).toHaveAttribute('lang', 'en');
  await expect(preview.locator('bdi')).toHaveText('VF-2048');
  await expect(guide.locator('[data-vf-docs-rtl-feedback]')).toBeEmpty();
});

test('Nested system themes remap canonical colors in both OS appearances', async ({ page }) => {
  await page.goto('/next/react/foundations/themes/');
  await page.emulateMedia({ colorScheme: 'light' });
  const read = () => page.evaluate(() => {
    let outer = document.querySelector('[data-vf-test-system-parent]');
    if (!outer) {
      outer = document.createElement('section');
      outer.setAttribute('data-vf-test-system-parent', '');
      outer.dataset.vfTheme = 'dark';
      const inner = document.createElement('section');
      inner.dataset.vfTheme = 'system';
      outer.append(inner);
      document.body.append(outer);
    }
    const inner = outer.firstElementChild;
    const view = (element) => ({
      accent: getComputedStyle(element).getPropertyValue('--vf-color-accent-background').trim(),
      text: getComputedStyle(element).getPropertyValue('--vf-color-text').trim(),
      scheme: getComputedStyle(element).colorScheme,
    });
    return { parent: view(outer), system: view(inner) };
  });
  const light = await read();
  expect(light.system.accent).not.toBe(light.parent.accent);
  expect(light.system.text).not.toBe(light.parent.text);
  expect(light.system.scheme).toBe('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await read();
  expect(dark.system.accent).toBe(dark.parent.accent);
  expect(dark.system.text).toBe(dark.parent.text);
  expect(dark.system.scheme).toBe('dark');
});

test('All React guide pages compose with canonical Flow and AutoGrid, not local layout algorithms', async ({ page }) => {
  for (const id of ['button', 'layout', 'divider', 'text', 'code', 'kbd', 'icon', 'image', 'avatar']) {
    await page.goto('/next/react/components/' + id + '/');
    const guide = page.locator('article.vf-docs-usage-guide');
    await expect(guide, id + ' guide must use the public Flow article').toHaveAttribute('data-vf-flow', '');
    await expect(guide).toHaveAttribute('data-vf-flow-gap', '2xl');
    const sections = guide.locator(':scope > section[data-vf-flow][data-vf-flow-gap="md"]');
    await expect(sections, id + ' must preserve authored concept sections')
      .toHaveCount(id === 'button' ? 10 : ['avatar', 'divider'].includes(id) ? 5 : 4);
    const toc = page.locator('nav.vf-docs-toc ol[data-vf-flow]');
    await expect(toc).toHaveCount(1);
    const jumpLinks = page.locator('aside.vf-docs-toc-region nav.vf-docs-toc-examples ol[data-vf-flow]');
    await expect(jumpLinks, id + ' redundant example navigation should only appear on other guides')
      .toHaveCount(id === 'button' ? 0 : 1);
    const related = guide.locator('ul.vf-docs-related-links[data-vf-flow][data-vf-flow-gap="sm"]');
    await expect(related).toHaveCount(1);
    const headers = guide.locator('.vf-docs-example-header[data-vf-flow-direction="inline"]');
    expect(await headers.count(), id + ' examples must use Flow headers').toBeGreaterThan(0);
    await expect(guide.locator('p[data-vf-text]').first()).toBeVisible();
    expect(await guide.locator('.vf-docs-example-header h3[data-vf-text]').count(),
      id + ' example titles must use public Text').toBeGreaterThan(0);
    expect(await guide.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    if (id !== 'button') {
      expect(await jumpLinks.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    }
    const standards = guide.locator('.vf-docs-standards[data-vf-flow]');
    await expect(standards).toHaveCount(1);
    const mapped = standards.locator('ul[aria-label="WCAG requirements"]');
    if (await mapped.count()) {
      await expect(mapped).toHaveAttribute('data-vf-auto-grid', '');
      await expect(mapped).toHaveAttribute('data-vf-auto-grid-gap', 'sm');
    }
  }
});

test('React Button and Text preview examples use public Flow, not a docs-only stack CSS', async ({ page }) => {
  const urls = [
    ['/next/react/examples/button-basic/', 'div', 'inline'],
    ['/next/react/examples/button/forms/', 'form', 'block'],
    ['/next/react/examples/button/sizes/', 'div', 'inline'],
    ['/next/react/examples/typography/text/', 'div', 'block'],
  ];
  for (const [url, host, direction] of urls) {
    await page.goto(url);
    const layout = page.locator('#root > ' + host + '[data-vf-flow]');
    await expect(layout).toHaveCount(1);
    await expect(layout).toHaveAttribute('data-vf-flow-direction', direction);
    await expect(layout).toHaveAttribute('data-vf-flow-gap', 'md');
    expect(await layout.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    await expect(layout).not.toHaveClass(/vf-example-stack/);
  }
});

test('Owner-authored React guide examples use public components for text, layout and controls', () => {
  const manifest = JSON.parse(readFileSync('dist/docs/next/react/site-manifest.json', 'utf8'));
  const examples = [
    ...manifest.button.examples,
    ...manifest.buttonGroup.examples,
    ...manifest.toggle.examples,
    ...manifest.toggleGroup.examples,
    ...manifest.layout.examples,
    ...manifest.divider.examples,
    ...manifest.icon.examples,
    ...manifest.image.examples,
    ...manifest.avatar.examples,
    ...Object.values(manifest.typography).flatMap((unit) => unit.examples),
  ];
  expect(examples.length).toBeGreaterThan(30);
  for (const example of examples) {
    const source = readFileSync(example.sourcePath, 'utf8');
    // Native section, article, main, fieldset, legend, label, list, figure, hr,
    // and SVG artwork remain intentional: they convey semantics the library preserves.
    // These guide examples use Text for styled text and real controls for input/action.
    expect(source, example.id + ': use Text, Flow or an existing public control')
      .not.toMatch(/<(?:p|div|span|button|input|h[1-6]|strong)\b/);
  }
});

test('React guide examples render public typography, layout and controls on native hosts', async ({ page }) => {
  const cases = [
    ['/next/react/examples/divider/basic/', 'h3[data-vf-text]', 'h3'],
    ['/next/react/examples/layout/basic/', 'button[data-vf-button]', 'button'],
    ['/next/react/examples/layout/semantic-groups/', 'input[data-vf-radio]', 'input'],
    ['/next/react/examples/icon/custom/', 'p[data-vf-text]', 'p'],
    ['/next/react/examples/icon/svg-wrapper/', 'div[data-vf-flow] > p[data-vf-text]', 'p'],
    ['/next/react/examples/image/captioned/', 'figure figcaption[data-vf-text]', 'figcaption'],
    ['/next/react/examples/typography/code/', 'p[data-vf-text]', 'p'],
    ['/next/react/examples/typography/kbd/', 'p[data-vf-text]', 'p'],
    ['/next/react/examples/button/forms/', 'input[data-vf-input]', 'input'],
  ];
  for (const [url, selector, semanticTag] of cases) {
    await page.goto(url);
    const item = page.locator(selector).first();
    await expect(item, url).toBeVisible();
    expect(await item.evaluate((element) => element.tagName.toLowerCase())).toBe(semanticTag);
  }
});

test('React Button guide SSR hydrates and uses public Button, AppShell, SideNav and live product example', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/button/');
  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-component="button"]')).toHaveCount(1);
  const standards = page.locator('[data-vf-docs-react-component="button"] [data-vf-docs-accessibility]');
  const disclosure = page.locator('[data-vf-docs-react-component="button"]')
    .getByText('Accessibility standards', { exact: true });
  await disclosure.click();
  await expect(standards.getByRole('heading', { name: 'References' })).toBeVisible();
  await expect(standards).not.toContainText('Mapping status');
  await expect(standards).toContainText('Always test accessibility in your own application.');
  await expect(standards.getByRole('link', { name: /WCAG 2\.2/ })).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  await expect(standards.locator('details')).not.toHaveAttribute('open', '');
  await standards.locator('summary').click();
  await expect(standards.locator('details')).toHaveAttribute('open', '');
  await expect(standards.getByText('Let users perform actions with a keyboard.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
  await expect(page.locator('[data-vf-side-nav]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await expect(page.locator('[data-vf-docs-react-feedback]')).toHaveCount(0);
  await expect(page.frameLocator('iframe[title="Checked-in React Button example"]')
    .getByRole('button', { name: 'Save changes', exact: true })).toBeVisible();
  const source = page.getByText('View checked-in React source');
  await source.click();
  await expect(page.locator('[data-vf-docs-react-button-example="button/basic"] pre'))
    .toContainText("from '@vyrnforge/react/button'");
  await expect(page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' })).toHaveAttribute('href', '../../../native-web/components/button/');
  expect(errors).toEqual([]);
});

test('React Button, Button Group and ToggleButton keep demonstrations on their respective guides', async ({ page }) => {
  await page.goto('/next/react/components/button/');
  const button = page.locator('[data-vf-docs-react-component="button"]');
  await expect(button.locator('[data-vf-docs-react-button-example]')).toHaveCount(7);
  await expect(button.locator('iframe[src*="button-group"], iframe[src*="toggle-button"]')).toHaveCount(0);
  await expect(button.getByRole('link', { name: 'Button Group', exact: true })).toHaveAttribute('href', /patterns\/button-group\//);
  await expect(button.getByRole('link', { name: 'ToggleButton', exact: true })).toHaveAttribute('href', '../toggle-button/');

  await button.getByRole('link', { name: 'Button Group', exact: true }).click();
  const group = page.locator('[data-vf-docs-react-button-group]');
  await expect(group.getByRole('heading', { level: 1, name: 'Button Group' })).toBeVisible();
  await expect(group.locator('[data-vf-docs-react-button-group-example]')).toHaveCount(6);
  for (const [topic, id] of [
    ['separate-actions', 'separate'], ['horizontal-joined-actions', 'horizontal'],
    ['joined-icon-actions', 'icons'], ['vertical-joined-actions', 'vertical'],
    ['joined-toggle-buttons', 'toggles'], ['mixed-button-types', 'mixed'],
  ]) {
    const demo = group.locator('section[aria-labelledby="react-button-group-' + topic + '"]');
    await expect(demo.locator('[data-vf-docs-react-button-group-example="button-group/' + id + '"]')).toHaveCount(1);
  }
  await group.locator('iframe[title="React Horizontal joined actions example"]').scrollIntoViewIfNeeded();
  const joined = group.frameLocator('iframe[title="React Horizontal joined actions example"]');
  await expect(joined.getByRole('group', { name: 'Document actions', exact: true })).toBeVisible();
  await joined.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(joined.getByRole('status')).toHaveText('Copied');
  await expect(joined.getByRole('button', { name: 'Archive' })).toBeDisabled();
  await group.locator('iframe[title="React Joined icon actions example"]').scrollIntoViewIfNeeded();
  const joinedIcons = group.frameLocator('iframe[title="React Joined icon actions example"]')
    .getByRole('group', { name: 'Quick document actions' });
  await expect(joinedIcons.getByRole('button', { name: 'Copy document' })).toHaveAttribute('data-vf-icon-only', '');
  await group.locator('iframe[title="React Vertical joined actions example"]').scrollIntoViewIfNeeded();
  const vertical = group.frameLocator('iframe[title="React Vertical joined actions example"]');
  await expect(vertical.getByRole('group', { name: 'View actions' })).toHaveAttribute('data-vf-button-group-orientation', 'vertical');
  await group.locator('iframe[title="React Joined toggle buttons example"]').scrollIntoViewIfNeeded();
  const formatting = group.frameLocator('iframe[title="React Joined toggle buttons example"]');
  const formatGroup = formatting.getByRole('group', { name: 'Text formatting' });
  await expect(formatGroup).toHaveAttribute('data-vf-button-group', '');
  await expect(formatGroup.locator('[data-vf-toggle-button]')).toHaveCount(4);
  const boldFormat = formatGroup.getByRole('button', { name: 'Bold', exact: true });
  const italicFormat = formatGroup.getByRole('button', { name: 'Italic', exact: true });
  await expect(italicFormat).toHaveCSS('margin-inline-start', '-1px');
  await expect(boldFormat).toHaveAttribute('aria-pressed', 'true');
  await boldFormat.focus();
  await boldFormat.press('Tab');
  await expect(italicFormat).toBeFocused();
  await italicFormat.press('Space');
  await expect(boldFormat).toHaveAttribute('aria-pressed', 'true');
  await expect(italicFormat).toHaveAttribute('aria-pressed', 'true');
  const formatted = formatting.locator('[data-example-preview="formatting"]');
  await expect(formatted).toHaveCSS('font-weight', '700');
  await expect(formatted).toHaveCSS('font-style', 'italic');
  await boldFormat.click();
  await expect(formatted).toHaveCSS('font-weight', '400');
  await expect(formatted).toHaveCSS('font-style', 'italic');

  await group.locator('iframe[title="React Mixed button types example"]').scrollIntoViewIfNeeded();
  const mixed = group.frameLocator('iframe[title="React Mixed button types example"]');
  const mixedGroup = mixed.getByRole('group', { name: 'Article actions' });
  await expect(mixedGroup).toHaveAttribute('data-vf-button-group', '');
  const savedArticle = mixedGroup.getByRole('button', { name: 'Bookmark article' });
  const nextArticle = mixedGroup.getByRole('button', { name: 'Next article' });
  await expect(savedArticle).toHaveAttribute('data-vf-toggle-button', '');
  await expect(nextArticle).not.toHaveAttribute('aria-pressed');
  await savedArticle.click();
  await expect(mixed.getByRole('status')).toHaveText('Bookmarked');
  await nextArticle.click();
  await expect(mixed.locator('[data-example-preview="article"]')).toHaveText('Accessible interactions');
  await expect(savedArticle).toHaveAttribute('aria-pressed', 'false');
  await nextArticle.click();
  await nextArticle.click();
  await expect(mixed.locator('[data-example-preview="article"]')).toHaveText('Design tokens');
  await expect(savedArticle).toHaveAttribute('aria-pressed', 'true');
  await expect(group.getByRole('link', { name: /Button Group API/ })).toHaveCount(0);

  await group.getByRole('link', { name: 'ToggleButton', exact: true }).click();
  const toggleGuide = page.locator('[data-vf-docs-react-toggle]');
  await expect(toggleGuide.locator('[data-vf-docs-react-toggle-example]')).toHaveCount(7);
  await toggleGuide.locator('iframe[title="React ToggleButton icon-only example"]').scrollIntoViewIfNeeded();
  const toggle = toggleGuide.frameLocator('iframe[title="React ToggleButton icon-only example"]');
  const iconToggle = toggle.getByRole('button', { name: 'Bookmark article', exact: true });
  await expect(iconToggle).toHaveAttribute('data-vf-icon-only', '');
  await expect(iconToggle).toHaveAttribute('aria-pressed', 'false');
  const iconToggleSize = await iconToggle.evaluate(el => {
    const box = el.getBoundingClientRect();
    return { width: box.width, height: box.height };
  });
  expect(iconToggleSize).toEqual({ width: 40, height: 40 });
  await iconToggle.click();
  await expect(iconToggle).toHaveAttribute('aria-pressed', 'true');
  await expect(iconToggle.locator('svg')).toHaveAttribute('data-vf-variant', 'filled');
  await expect(toggle.getByRole('status')).toHaveText('Bookmarked');
  await toggle.getByRole('button', { name: 'Favorite article' }).click();
  await expect(toggle.getByRole('status')).toHaveText('Bookmarked · Favorited');
  await expect(toggle.getByRole('button', { name: 'Pin article' })).toHaveAttribute('aria-pressed', 'false');
  await expect(iconToggle).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/next/react/components/button/');
  await page.locator('iframe[title="React Icon buttons example"]').scrollIntoViewIfNeeded();
  const icons = page.frameLocator('iframe[title="React Icon buttons example"]');
  await expect(icons.getByRole('button', { name: 'Save bookmark', exact: true })).toHaveCount(2);
  const iconOnly = icons.getByRole('button', { name: 'Save bookmark', exact: true }).first();
  await expect(iconOnly).toHaveAttribute('data-vf-icon-only', '');
  const dimensions = await iconOnly.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  });
  expect(dimensions).toEqual({ width: 40, height: 40 });
  await iconOnly.click();
  await expect(icons.getByRole('status')).toHaveText('Last action: Save bookmark');
  await expect(icons.getByRole('button', { name: 'Search' })).toHaveAttribute('data-vf-size', 'sm');
  await expect(icons.getByRole('button', { name: 'Saving bookmark' })).toHaveAttribute('aria-busy', 'true');

  await page.locator('iframe[title="React Density example"]').scrollIntoViewIfNeeded();
  const density = page.frameLocator('iframe[title="React Density example"]');
  await density.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await expect(density.locator('[data-vf-density="compact"]')).toHaveCount(1);
});

test('React Button guide keeps all demos visible, source optional and navigation available without JavaScript', async ({
  page,
  browser,
}, testInfo) => {
  await page.goto('/next/react/components/button/');
  const guide = page.locator('[data-vf-docs-react-component="button"]');
  const examples = guide.locator('[data-vf-docs-react-button-example]');
  await expect(examples).toHaveCount(7);
  await expect(guide.locator('.vf-docs-example-collapsible, .vf-docs-example-index')).toHaveCount(0);
  await expect(guide.locator('[data-vf-docs-guide-detail]')).toHaveCount(0);
  for (const example of await examples.all()) {
    await expect(example.locator('h3')).toBeVisible();
    await expect(example.locator('iframe')).toBeVisible();
    await expect(example).toHaveCSS('border-top-width', '0px');
    await expect(example.locator('.vf-docs-source-disclosure')).not.toHaveAttribute('open', '');
  }

  const navigation = page.getByRole('navigation', { name: 'On this page' });
  await expect(navigation.getByRole('link')).toHaveCount(10);
  await expect(navigation.getByRole('link', { name: 'Accessible icon actions' }))
    .toHaveAttribute('href', '#react-button-accessible-icon-actions');
  const source = examples.first().locator('.vf-docs-source-disclosure');
  await source.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(source).toHaveAttribute('open', '');
  await expect(source.locator('pre code')).toContainText("from '@vyrnforge/react/button'");
  await page.keyboard.press('Enter');
  await expect(source).not.toHaveAttribute('open', '');
  await expect(guide.getByRole('heading', { name: 'Accessibility', level: 2 })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Native baseline' })).toBeVisible();

  const placement = [
    ['When to use', 'basic', 'Basic buttons'],
    ['Variants', 'variants', 'Variants'],
    ['Sizes', 'sizes', 'Sizes'],
    ['States and async work', 'states', 'States and loading'],
    ['Accessible icon actions', 'icons', 'Icon buttons'],
    ['Forms', 'forms', 'Form actions'],
    ['Density and target sizing', 'density', 'Density'],
  ];
  for (const [topic, exampleId, exampleTitle] of placement) {
    const section = guide.locator('[data-vf-docs-button-topic="' + topic + '"]');
    await expect(section, topic + ' must have its own authored explanation').toHaveCount(1);
    await expect(section.locator('[data-vf-docs-react-button-example]')).toHaveCount(1);
    const demo = section.locator('[data-vf-docs-react-button-example="button/' + exampleId + '"]');
    await expect(demo.getByRole('heading', { name: exampleTitle })).toBeVisible();
  }
  await expect(guide.locator('[data-vf-docs-button-topic="Variants"]'))
    .toContainText('primary');
  await expect(guide.locator('[data-vf-docs-button-topic="States and async work"]'))
    .toContainText('Loading does not automatically prevent repeat activation.');
  await expect(guide.locator('[data-vf-docs-button-topic="Accessible icon actions"]'))
    .toContainText('accessible name');

  await page.setViewportSize({ width: 1440, height: 900 });
  await guide.locator('#react-button-example-variants').scrollIntoViewIfNeeded();
  await expect(guide.locator('#react-button-example-variants iframe').contentFrame()
    .getByRole('button').first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('react-button-guide-live-demo-desktop.png'),
    fullPage: false,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('.vf-docs-toc-examples')).toBeHidden();
  await guide.locator('#react-button-example-icons').scrollIntoViewIfNeeded();
  await expect(guide.locator('#react-button-example-icons iframe').contentFrame()
    .getByRole('button').first()).toBeVisible();
  const bounds = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport + 1);
  await page.screenshot({
    path: testInfo.outputPath('react-button-guide-live-demo-mobile.png'),
    fullPage: false,
  });

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await noJsContext.newPage();
    await noJs.goto('/next/react/components/button/');
    const preview = noJs.locator('[data-vf-docs-react-button-example="button/icons"]');
    await expect(preview.locator('h3')).toBeVisible();
    await expect(preview.locator('iframe')).toHaveAttribute('src', /examples\/button/);
    const code = preview.locator('.vf-docs-source-disclosure');
    await code.locator('summary').click();
    await expect(code).toHaveAttribute('open', '');
  } finally {
    await noJsContext.close();
  }
});

test('React ToggleButton has an independent native pressed-state guide and source-backed API', async ({ page }) => {
  await page.goto('/next/react/components/toggle-button/');
  const guide = page.locator('[data-vf-docs-react-toggle]');
  await expect(guide).toBeVisible();
  const pressed = guide.locator('[data-vf-docs-react-toggle-topic="pressed"]');
  await expect(pressed.getByRole('heading', { name: 'Pressed state', level: 2 })).toBeVisible();
  await expect(pressed.locator('[data-vf-docs-react-toggle-example]')).toHaveCount(1);
  const frame = page.frameLocator('iframe[title="React ToggleButton pressed-state example"]');
  const bold = frame.getByRole('button', { name: 'Bold', exact: true });
  const preview = frame.locator('[data-example-preview="bold"]');
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await expect(bold).toHaveAttribute('data-vf-icon-only', '');
  await expect(bold.locator('svg')).toHaveAttribute('data-vf-icon-name', 'bold');
  await expect(preview).toHaveCSS('font-weight', '400');
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await expect(preview).toHaveCSS('font-weight', '700');
  await bold.press('Space');
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await expect(preview).toHaveCSS('font-weight', '400');

  const controlled = guide.locator('section[aria-labelledby="react-toggle-controlled-and-uncontrolled-state"]').frameLocator('iframe');
  const controlledBold = controlled.getByRole('button', { name: 'Bold', exact: true });
  const cell = controlled.locator('[data-example-preview="cell"]');
  await expect(controlledBold).toHaveAttribute('aria-pressed', 'true');
  await expect(cell).toHaveCSS('font-weight', '700');
  await controlled.getByRole('button', { name: 'Select A2' }).click();
  await expect(controlledBold).toHaveAttribute('aria-pressed', 'false');
  await expect(cell).toHaveText('A2: Expenses');
  await controlledBold.click();
  await expect(cell).toHaveCSS('font-weight', '700');
  await controlled.getByRole('button', { name: 'Italic' }).click();
  await controlled.getByRole('button', { name: 'Reset bold' }).click();
  await expect(controlledBold).toHaveAttribute('aria-pressed', 'false');
  await expect(cell).toHaveCSS('font-weight', '400');
  await expect(controlled.locator('[data-example-preview="uncontrolled"]')).toHaveCSS('font-style', 'italic');
  await controlled.getByRole('button', { name: 'Select A1' }).click();
  await expect(controlledBold).toHaveAttribute('aria-pressed', 'true');
  await expect(cell).toHaveCSS('font-weight', '700');

  const states = guide.locator('section[aria-labelledby="react-toggle-pressed-and-disabled-states"]').frameLocator('iframe');
  for (const [name, pressed, disabled] of [
    ['Bookmark Report', false, false], ['Bookmark Notes', true, false],
    ['Bookmark Invoice', false, true], ['Bookmark Draft', true, true],
  ]) {
    const button = states.getByRole('button', { name, exact: true });
    await expect(button).toHaveAttribute('data-vf-icon-only', '');
    await expect(button).toHaveAttribute('aria-pressed', String(pressed));
    if (disabled) await expect(button).toBeDisabled();
    else await expect(button).toBeEnabled();
  }
  await states.getByRole('button', { name: 'Bookmark Report', exact: true }).click();
  await expect(states.getByText('Report — Saved', { exact: true })).toBeVisible();
  await expect(states.getByText('Draft — Saved (read-only)', { exact: true })).toBeVisible();
  const sizes = guide.locator('section[aria-labelledby="react-toggle-sizing-and-styling"]').frameLocator('iframe');
  for (const size of ['sm', 'md', 'lg']) {
    const icon = sizes.getByRole('button', { name: 'Bookmark icon (' + size + ')', exact: true });
    const labelled = sizes.getByRole('button', { name: 'Bookmark (' + size + ')', exact: true });
    await expect(icon).toHaveAttribute('data-vf-size', size);
    await expect(icon).toHaveAttribute('data-vf-icon-only', '');
    await expect(labelled).toHaveAttribute('data-vf-size', size);
    await expect(labelled).not.toHaveAttribute('data-vf-icon-only', '');
    await expect(labelled).toHaveText('Bookmark');
  }
  await sizes.getByRole('button', { name: 'Bookmark icon (lg)', exact: true }).click();
  await expect(sizes.getByRole('status')).toHaveText('Article bookmarked');
  await expect(sizes.getByRole('button', { name: 'Bookmark (sm)', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await sizes.getByRole('button', { name: 'Bookmark (sm)', exact: true }).click();
  await expect(sizes.getByRole('status')).toHaveText('Article not bookmarked');
  const wrap = guide.locator('section[aria-labelledby="react-toggle-icon-with-text"]').frameLocator('iframe');
  const wrapToggle = wrap.getByRole('button', { name: 'Wrap text' });
  await expect(wrapToggle).not.toHaveAttribute('data-vf-icon-only', '');
  await expect(wrapToggle.locator('svg')).toHaveAttribute('data-vf-icon-name', 'wrap-text');
  await expect(wrap.locator('[data-example-preview="wrap"]')).toHaveCSS('white-space', 'nowrap');
  await wrapToggle.click();
  await expect(wrap.locator('[data-example-preview="wrap"]')).toHaveCSS('white-space', 'normal');
  const projects = guide.locator('section[aria-labelledby="react-toggle-text-only-toggles"]').frameLocator('iframe');
  const archived = projects.getByRole('button', { name: 'Show archived' });
  await expect(archived).not.toHaveAttribute('data-vf-icon-only', '');
  await expect(projects.getByRole('listitem')).toHaveCount(2);
  await archived.click();
  await expect(projects.getByRole('listitem')).toHaveCount(3);
  await expect(projects.getByText('2025 campaign (archived)')).toBeVisible();
  await archived.click();
  await expect(projects.getByRole('listitem')).toHaveCount(2);
  await page.goto('/next/react/api/components/toggle-button/');
  await expect(page.locator('[data-vf-docs-react-api="toggle-button"]')).toContainText('ToggleButtonProps');
  await expect(page.locator('[data-vf-docs-react-api="toggle-button"]')).toContainText("size?: 'sm' | 'md' | 'lg'");
});

test('React ToggleGroup guide teaches its actual independent-tab-stop selection contract', async ({ page }) => {
  await page.goto('/next/react/components/toggle-button/');
  await page.locator('[data-vf-docs-react-toggle]').getByRole('link', { name: 'ToggleGroup', exact: true }).click();
  const guide = page.locator('[data-vf-docs-react-toggle-group]');
  await expect(guide.getByRole('heading', { level: 1, name: 'ToggleGroup' })).toBeVisible();
  await expect(guide.locator('[data-vf-docs-react-toggle-group-example]')).toHaveCount(4);
  for (const [heading, id] of [['exclusive-selection', 'basic'], ['multiple-selection', 'multiple'], ['icon-only-choices', 'icons'], ['required-selection', 'required']]) {
    await expect(guide.locator('section[aria-labelledby="react-toggle-group-' + heading + '"] [data-vf-docs-react-toggle-group-example="toggle-group/' + id + '"]')).toHaveCount(1);
  }
  const single = guide.locator('[data-vf-docs-react-toggle-group-example="toggle-group/basic"]').frameLocator('iframe');
  const day = single.getByRole('button', { name: 'Day', exact: true });
  const week = single.getByRole('button', { name: 'Week', exact: true });
  await expect(day).toHaveAttribute('aria-pressed', 'true');
  await expect(day).not.toHaveAttribute('data-vf-icon-only', '');
  await expect(single.getByText('Design review · Today', { exact: true })).toBeVisible();
  await day.focus();
  await day.press('Tab');
  await expect(week).toBeFocused();
  await week.press('Space');
  await expect(week).toHaveAttribute('aria-pressed', 'true');
  await expect(day).toHaveAttribute('aria-pressed', 'false');
  await expect(single.getByText('Release planning · 3 days ago', { exact: true })).toBeVisible();
  await expect(single.getByRole('listitem')).toHaveCount(2);
  await week.click();
  await expect(week).toHaveAttribute('aria-pressed', 'false');
  await expect(single.getByRole('status')).toHaveText('All activity');
  await expect(single.getByRole('listitem')).toHaveCount(4);

  const multiple = guide.locator('[data-vf-docs-react-toggle-group-example="toggle-group/multiple"]').frameLocator('iframe');
  const design = multiple.getByRole('button', { name: 'Design', exact: true });
  const engineering = multiple.getByRole('button', { name: 'Engineering', exact: true });
  await expect(design).toHaveAttribute('aria-pressed', 'true');
  await expect(design).not.toHaveAttribute('data-vf-icon-only', '');
  await expect(multiple.getByRole('listitem')).toHaveCount(1);
  await engineering.click();
  await expect(design).toHaveAttribute('aria-pressed', 'true');
  await expect(engineering).toHaveAttribute('aria-pressed', 'true');
  await expect(multiple.getByRole('listitem')).toHaveCount(2);
  await expect(multiple.getByText('Fix keyboard navigation', { exact: true })).toBeVisible();
  await design.click();
  await expect(engineering).toHaveAttribute('aria-pressed', 'true');
  await expect(multiple.getByRole('listitem')).toHaveCount(1);
  await engineering.click();
  await expect(multiple.getByRole('status')).toHaveText('All teams');
  await expect(multiple.getByRole('listitem')).toHaveCount(3);

  const icons = guide.locator('[data-vf-docs-react-toggle-group-example="toggle-group/icons"]').frameLocator('iframe');
  await expect(icons.locator('[data-example-preview="view"]')).toHaveAttribute('data-vf-flow', '');
  await icons.getByRole('button', { name: 'Grid view' }).click();
  await expect(icons.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
  await expect(icons.getByRole('button', { name: 'Grid view' })).toHaveAttribute('data-vf-icon-only', '');
  await expect(icons.locator('[data-example-preview="view"]')).toHaveAttribute('data-vf-auto-grid', '');
  await expect(icons.locator('[data-example-preview="view"]')).toHaveCSS('display', 'grid');
  const required = guide.locator('[data-vf-docs-react-toggle-group-example="toggle-group/required"]').frameLocator('iframe');
  const requiredLeft = required.getByRole('button', { name: 'Align left', exact: true });
  const requiredRight = required.getByRole('button', { name: 'Align right', exact: true });
  await expect(requiredLeft).toHaveAttribute('data-vf-icon-only', '');
  await requiredLeft.click();
  await expect(requiredLeft).toHaveAttribute('aria-pressed', 'true');
  await requiredRight.click();
  await expect(requiredRight).toHaveAttribute('aria-pressed', 'true');
  await expect(required.locator('[data-example-preview="alignment"]')).toHaveCSS('text-align', 'right');
  await requiredRight.click();
  await expect(requiredRight).toHaveAttribute('aria-pressed', 'true');
  await expect(required.getByRole('status')).toHaveText('Alignment: right');
  await guide.getByRole('link', { name: 'ToggleGroup public React API' }).click();
  await expect(page.locator('[data-vf-docs-react-api="toggle-group"]')).toContainText('ToggleGroupRootProps');
  await expect(page.locator('[data-vf-docs-react-api="toggle-group"]')).toContainText('ToggleGroupItemProps');
});

test('React API reference renders public source-derived types and inline semantic code', async ({ page }) => {
  await page.goto('/next/react/api/components/button/');
  await expect(page.getByRole('heading', { name: 'Public TypeScript types' })).toBeVisible();
  const types = page.locator('[data-vf-docs-react-api] pre code');
  await expect(types).toContainText('export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>');
  await expect(types).toContainText('variant?: ButtonVariant');
  await expect(types).toContainText('size?: ButtonSize');
  await expect(types).toContainText('loading?: boolean');
  await expect(page.locator('[data-vf-docs-react-api] section[aria-label="React integration"]')).toHaveCount(0);
});

test('React URL context and framework-scoped search/theme work without inventing unsupported routes', async ({ page }) => {
  await page.goto('/next/react/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('api');
  const results = page.locator('[data-vf-docs-react-results]');
  await expect(results.getByRole('link', { name: 'Button API', exact: true })).toBeVisible();
  await expect(results.getByRole('link', { name: 'React overview' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search React documentation' })).toBeFocused();
  await expect(results).toBeHidden();

  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button API', exact: true }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Button API' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-api="button"] header h1 + [data-vf-docs-standards-disclosure] > summary')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/api\/components\/button\/$/);
});

test('React header keeps an accessible brand and readable context controls at 400% text', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/button/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.evaluate(() => { document.documentElement.style.fontSize = '400%'; });

  const brand = page.getByRole('link', { name: /VF Docs.*VyrnForge/ });
  await expect(brand).toBeVisible();
  await expect(brand.locator('.vf-docs-brand-compact')).toBeVisible();
  await expect(brand.locator('.vf-docs-brand-full')).toBeHidden();
  await expect(page.locator('.vf-docs-surface')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveCSS('white-space', 'nowrap');
  await expect(page.getByRole('searchbox', { name: 'Search React documentation' })).toHaveAttribute('placeholder', 'Search docs');
  const framework = page.getByRole('combobox', { name: 'Framework' });
  await expect(framework.locator('option:checked')).toHaveText('React (pilot)');
  const widths = await page.evaluate(() => {
    const select = document.querySelector('#vf-react-framework').getBoundingClientRect();
    const control = document.querySelector('.vf-docs-framework-control').getBoundingClientRect();
    return {
      select: select.width,
      control: control.width,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    };
  });
  expect(widths.select, 'Framework select occupies full context row').toBeGreaterThanOrEqual(widths.control - 2);
  expect(widths.document, 'React header must not introduce horizontal overflow').toBeLessThanOrEqual(widths.viewport + 1);
  await page.screenshot({
    path: testInfo.outputPath('react-header-320-text400-compact.png'),
    fullPage: false,
  });
});

test('framework selector preserves Native/React guide and API context with browser history', async ({ page }) => {
  await page.goto('/next/native-web/components/button/');
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('next');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);
  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('next');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/components\/button\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);

  await page.goto('/next/react/api/components/button/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/api\/components\/button\/$/);
});

test('Native Web Image switches to the actual React Image guide with context preserved', async ({ page }) => {
  await page.goto('/next/native-web/components/image/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/image\/$/);
  await expect(page.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-image]')).toBeVisible();
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/components\/image\/$/);
});

test('React mobile navigation closes on Escape and returns focus to Menu', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/button/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('framework navigation remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/next/native-web/components/button/');
    await page.getByRole('link', { name: 'Open this topic in React documentation' }).click();
    await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
    await page.getByRole('navigation', { name: 'Documentation framework' })
      .getByRole('link', { name: 'Native Web' }).click();
    await expect(page).toHaveURL(/\/next\/native-web\/components\/button\/$/);
  } finally {
    await context.close();
  }
});

test('React docs remain navigable at 320px/400% text, RTL and forced colors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/button/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '400%';
    document.documentElement.dir = 'rtl';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API', exact: true })).toBeVisible();
  const width = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath('react-button-320-text400-rtl-forced-colors.png'), fullPage: false });
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(results.violations, results.violations.map((entry) => entry.id + ': ' + entry.help).join('\n')).toEqual([]);
});

test('without JavaScript, React SSR content and native links remain readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/next/react/components/button/');
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Button API', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-vf-react-hydrated', 'true');
    await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API', exact: true }).click();
    await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
  } finally {
    await context.close();
  }
});

test('React Divider renders visible horizontal and vertical lines with no extra semantics', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/divider/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await expect(page.getByRole('heading', { level: 1, name: 'Divider' })).toBeVisible();
  const guide = page.locator('[data-vf-docs-react-divider]');
  await expect(page.getByRole('navigation', { name: 'Divider examples' }).getByRole('link')).toHaveCount(5);
  await expect(guide.getByRole('heading', { name: 'Horizontal and vertical' })).toBeVisible();
  const basic = guide.locator('[data-vf-docs-react-divider-example="divider/basic"]');
  await basic.locator('iframe').scrollIntoViewIfNeeded();
  const hline = basic.locator('iframe').contentFrame().locator('[data-vf-divider]');
  await expect(hline).toHaveAttribute('data-vf-divider-orientation', 'horizontal');
  await expect(hline).toHaveAttribute('aria-hidden', 'true');
  const horizontal = await hline.boundingBox();
  expect(horizontal.width).toBeGreaterThan(100);
  expect(horizontal.height).toBeGreaterThanOrEqual(1);
  expect(horizontal.height).toBeLessThanOrEqual(2);
  await expect(basic.locator('iframe').contentFrame().getByRole('separator')).toHaveCount(0);

  const verticalExample = guide.locator('[data-vf-docs-react-divider-example="divider/vertical"]');
  await verticalExample.locator('iframe').scrollIntoViewIfNeeded();
  const vline = verticalExample.locator('iframe').contentFrame().locator('[data-vf-divider]');
  await expect(vline).toHaveAttribute('data-vf-divider-orientation', 'vertical');
  await expect(vline).toHaveAttribute('aria-hidden', 'true');
  const vertical = await vline.boundingBox();
  expect(vertical.width).toBeGreaterThanOrEqual(1);
  expect(vertical.width).toBeLessThanOrEqual(2);
  expect(vertical.height).toBeGreaterThan(10);
  await expect(verticalExample.locator('iframe').contentFrame().getByRole('separator')).toHaveCount(0);
  await verticalExample.getByText('View React TSX source').click();
  await expect(verticalExample.locator('pre code')).toContainText('orientation="vertical"');

  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('vertical divider');
  await expect(page.locator('[data-vf-docs-react-results]').getByRole('link', { name: 'Divider', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Divider API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/divider\/$/);
  await expect(page.locator('[data-vf-docs-react-api="divider"]')).toContainText('@vyrnforge/react/divider');
  await expect(page.locator('[data-vf-docs-react-api="divider"] section[aria-labelledby="react-divider-api-types"] pre code')).toContainText('export type DividerOrientation');
  await expect(page.locator('[data-vf-docs-react-api="divider"] section[aria-labelledby="react-divider-api-types"] pre code')).toContainText('export interface DividerProps');
  expect(errors).toEqual([]);
});

test('React Divider supports readable labels aligned in either orientation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/divider/');
  const guide = page.locator('[data-vf-docs-react-divider]');
  await expect(guide.getByRole('heading', { name: 'Text and alignment' })).toBeVisible();
  for (const [slug, orientation] of [
    ['labeled-horizontal', 'horizontal'],
    ['labeled-vertical', 'vertical'],
  ]) {
    const example = guide.locator('[data-vf-docs-react-divider-example="divider/' + slug + '"]');
    await example.locator('iframe').scrollIntoViewIfNeeded();
    const frame = example.locator('iframe').contentFrame();
    await expect(frame.locator('[data-vf-divider-labeled]')).toHaveCount(3);
    for (const align of ['start', 'center', 'end']) {
      const line = frame.locator('[data-vf-divider-align="' + align + '"]');
      await expect(line).toHaveAttribute('data-vf-divider-orientation', orientation);
      await expect(line).not.toHaveAttribute('aria-hidden');
      await expect(line).not.toHaveAttribute('role');
      const label = line.locator('[data-vf-divider-label]');
      await expect(label).toBeVisible();
      await expect(label).toHaveText(align === 'start' ? 'Start' : align === 'center' ? 'OR' : 'End');
      if (orientation === 'vertical') await expect(label).toHaveCSS('writing-mode', 'vertical-rl');
    }
    await expect(frame.getByRole('separator')).toHaveCount(0);
    await example.getByText('View React TSX source').click();
    await expect(example.locator('pre code')).toContainText('textAlign="start"');
    await expect(example.locator('pre code')).toContainText('textAlign="end"');
  }
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('divider text alignment');
  await expect(page.locator('[data-vf-docs-react-results]').getByRole('link', { name: 'Divider', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Divider API' }).click();
  const api = page.locator('[data-vf-docs-react-api="divider"]');
  await expect(api.locator('section[aria-labelledby="react-divider-api-types"] pre code')).toContainText('export type DividerTextAlign');
  await expect(api.locator('section[aria-labelledby="react-divider-api-types"] pre code')).toContainText('children?: string | number');
  expect(errors).toEqual([]);
});

test('React Divider examples demonstrate configurable vertical text direction', async ({ page }) => {
  await page.goto('/next/react/components/divider/');
  const guide = page.locator('[data-vf-docs-react-divider]');
  await expect(guide.getByRole('heading', { name: 'Vertical label direction' })).toBeVisible();
  const example = guide.locator('[data-vf-docs-react-divider-example="divider/text-direction"]');
  await example.locator('iframe').scrollIntoViewIfNeeded();
  const frame = example.locator('iframe').contentFrame();
  await expect(frame.locator('[data-vf-divider-labeled]')).toHaveCount(3);
  for (const [index, text, direction, writingMode] of [
    [0, 'OR', 'horizontal', 'horizontal-tb'],
    [1, 'Next', null, 'vertical-rl'],
    [2, 'Previous', 'bottom-to-top', 'vertical-rl'],
  ]) {
    const line = frame.locator('[data-vf-divider-labeled]').nth(index);
    await expect(line).toHaveAttribute('data-vf-divider-orientation', 'vertical');
    if (direction) {
      await expect(line).toHaveAttribute('data-vf-divider-text-direction', direction);
    } else {
      await expect(line).not.toHaveAttribute('data-vf-divider-text-direction');
    }
    await expect(line).not.toHaveAttribute('aria-hidden');
    const label = line.locator('[data-vf-divider-label]');
    await expect(label).toHaveText(text);
    await expect(label).toHaveCSS('writing-mode', writingMode);
    await expect(label).toBeVisible();
  }
  await expect(frame.locator('[data-vf-divider-labeled]').nth(2)
    .locator('[data-vf-divider-label]')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  await expect(frame.getByRole('separator')).toHaveCount(0);
  await example.getByText('View React TSX source').click();
  await expect(example.locator('pre code')).toContainText('textDirection="horizontal"');
  await expect(example.locator('pre code')).toContainText('textDirection="bottom-to-top"');

  await page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Divider API' }).click();
  const source = page.locator('[data-vf-docs-react-api="divider"] section[aria-labelledby="react-divider-api-types"] pre code');
  await expect(source).toContainText('export type DividerTextDirection');
  await expect(source).toContainText('textDirection?: DividerTextDirection');
});

test('Divider works in dark theme, forced colors, narrow RTL layout and SSR without JS', async ({ page, browser }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/divider/');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('heading', { level: 1, name: 'Divider' })).toBeVisible();
  const widths = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
  await page.addScriptTag({ content: axeCore.source });
  const a11y = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(a11y.violations, a11y.violations.map((item) => item.id + ': ' + item.help).join('\n')).toEqual([]);

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('/next/react/components/divider/');
    await expect(noJs.getByRole('heading', { level: 1, name: 'Divider' })).toBeVisible();
    await expect(noJs.locator('[data-vf-docs-react-divider-example]')).toHaveCount(5);
    await noJs.getByRole('navigation', { name: 'Documentation framework' })
      .getByRole('link', { name: 'Native Web' }).click();
    await expect(noJs).toHaveURL(/\/next\/native-web\/components\/divider\/$/);
  } finally { await context.close(); }
});

test('React Layout lives under Layout & Structure and runs checked-in React JSX demos', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/layout/');
  await expect(page.getByRole('heading', { level: 1, name: 'Layout: Flow & AutoGrid' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  await expect(nav.getByText('Layout & Structure', { exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Layout', exact: true })).toHaveAttribute('aria-current', 'page');
  const layoutGuide = page.locator('[data-vf-docs-react-layout]');
  await layoutGuide.getByText('Accessibility standards', { exact: true }).click();
  const accessibility = layoutGuide.locator('[data-vf-docs-accessibility]');
  await expect(accessibility).toContainText('Accessibility still needs review.');
  await accessibility.locator('summary').click();
  const mappedCriteria = accessibility.getByRole('list', { name: 'WCAG requirements' });
  await expect(mappedCriteria.getByRole('link')).toHaveCount(6);
  for (const [id, label, slug] of [
    ['1.3.2', 'Meaningful Sequence', 'meaningful-sequence'],
    ['1.4.10', 'Reflow', 'reflow'],
  ]) {
    await expect(mappedCriteria.getByRole('link', { name: `${id} ${label}`, exact: true }))
      .toHaveAttribute('href', `https://www.w3.org/WAI/WCAG22/Understanding/${slug}`);
  }
  await expect(page.locator('[data-vf-docs-react-layout] section[aria-labelledby="react-layout-setup"] pre code'))
    .toContainText("import { Flow, AutoGrid } from '@vyrnforge/react/layout';");

  for (const id of ['basic', 'flow-block', 'flow-inline', 'flow-wrap', 'auto-grid', 'semantic-groups', 'dividers']) {
    const demo = page.locator('[data-vf-docs-react-layout-example="layout/' + id + '"]');
    await expect(demo).toHaveCount(1);
    const iframe = demo.locator('iframe');
    await iframe.scrollIntoViewIfNeeded();
    const frame = iframe.contentFrame();
    await expect(frame.locator('#root > *').first()).toBeVisible();
    await demo.getByText('View React TSX source').click();
    await expect(demo.locator('pre code')).toContainText("from '@vyrnforge/react/layout'");
    await expect(demo.locator('pre code')).toContainText(/<Flow|<AutoGrid/);
  }
  await expect(page.frameLocator('iframe[title="React Intrinsic semantic list example"]')
    .locator('[data-vf-auto-grid]')).toHaveCSS('display', 'grid');
  await expect(page.frameLocator('iframe[title="React Wrapped RTL metadata example"]')
    .locator('[dir="rtl"][data-vf-flow]')).toHaveCSS('flex-wrap', 'wrap');
  const radios = page.frameLocator('iframe[title="React Native radio group with Flow spacing example"]');
  await radios.getByRole('radio', { name: 'Weekly' }).check();
  await expect(radios.getByRole('radio', { name: 'Weekly' })).toBeChecked();
  await expect(radios.getByRole('radio', { name: 'Daily' })).not.toBeChecked();

  await expect(layoutGuide.getByRole('heading', { name: 'Dividers and thematic breaks' })).toBeVisible();
  await expect(layoutGuide.getByRole('heading', { name: 'Native separators in JSX' })).toBeVisible();
  const dividers = page.frameLocator('iframe[title="React Native thematic break example"]');
  await expect(dividers.getByRole('separator')).toHaveCount(1);
  await expect(dividers.locator('hr')).toHaveCount(1);
  await expect(dividers.locator('hr')).not.toHaveAttribute('tabindex');

  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('autogrid');
  await expect(page.locator('[data-vf-docs-react-results]').getByRole('link', { name: 'Layout', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('separator');
  await expect(page.locator('[data-vf-docs-react-results]').getByRole('link', { name: 'Layout', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('[data-vf-docs-react-results]')).toBeHidden();
  await page.getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'Usage guidelines' }).click();
  await expect(page).toHaveURL(/#react-layout-guidelines$/);
  await expect(layoutGuide.getByRole('heading', { name: 'AutoGrid: intrinsic equal tracks' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('react-layout-wide.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('React Layout at 320px / 200% text is readable in RTL, dark theme and forced colors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/layout/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; document.documentElement.dir = 'rtl'; });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('heading', { level: 1, name: 'Layout: Flow & AutoGrid' })).toBeVisible();
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(width.content).toBeLessThanOrEqual(width.viewport + 1);
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Layout', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('react-layout-320-rtl-forced-colors.png'), fullPage: true });
  await page.addScriptTag({ content: axeCore.source });
  const a11y = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(a11y.violations, a11y.violations.map((entry) => entry.id + ': ' + entry.help).join('\n')).toEqual([]);
});

test('Native Layout framework selector preserves the React Layout route; SSR works without scripts', async ({ page, browser }) => {
  await page.goto('/next/native-web/components/layout/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/layout\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Layout: Flow & AutoGrid' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Documentation framework' }).getByRole('link', { name: 'Native Web' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/components\/layout\/$/);

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('/next/react/components/layout/');
    await expect(noJs.getByRole('heading', { level: 1, name: 'Layout: Flow & AutoGrid' })).toBeVisible();
    await expect(noJs.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Layout', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(noJs.locator('html')).not.toHaveAttribute('data-vf-react-hydrated', 'true');
    await noJs.getByText('View React TSX source').first().click();
    await expect(noJs.locator('[data-vf-docs-react-layout-example] pre code').first()).toContainText('<Flow');
  } finally {
    await context.close();
  }
});

test('React Layout API reference exposes actual package entrypoint and typed props', async ({ page }) => {
  await page.goto('/next/react/api/components/layout/');
  await expect(page.getByRole('heading', { level: 1, name: 'Flow & AutoGrid API' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-api="layout"]')).toContainText('@vyrnforge/react/layout');
  const types = page.locator('[data-vf-docs-react-api="layout"] pre code').first();
  await expect(types).toContainText('export type FlowProps');
  await expect(types).toContainText('export type AutoGridProps');
  await expect(types).toContainText('LayoutGap');
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Layout API' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'View Layout examples' }).click();
  await expect(page).toHaveURL(/\/next\/react\/components\/layout\/$/);
});

test('React Text, Code and Kbd guides run checked-in JSX and link real public API sources', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  for (const [id, label, selectors] of [
    ['text', 'Text', { css: '[data-vf-text]', source: '<Text' }],
    ['code', 'Code', { css: '[data-vf-code]', source: '<Code' }],
    ['kbd', 'Kbd', { css: '[data-vf-kbd]', source: '<Kbd' }],
  ]) {
    await page.goto('/next/react/components/' + id + '/');
    await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
    const guide = page.locator('[data-vf-docs-react-typography="' + id + '"]');
    await expect(guide.getByRole('heading', { level: 1, name: label })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    const standards = guide.getByText('Accessibility standards', { exact: true });
    await standards.click();
    await expect(guide.locator('[data-vf-docs-accessibility]')).toBeVisible();
    await standards.click();
    await expect(guide).toContainText('Get started');
    const iframe = guide.locator('iframe[title="React ' + label + ' example"]');
    await iframe.scrollIntoViewIfNeeded();
    const frame = iframe.contentFrame();
    await expect(frame.locator('#root ' + selectors.css).first()).toBeVisible();
    if (id === 'text') {
      await expect(frame.getByRole('heading', { name: 'Typography foundation', level: 2 })).toBeVisible();
    } else if (id === 'code') {
      await expect(frame.locator('[data-vf-code-block] code')).toContainText('pnpm exec vitest run');
      await expect(frame.locator('[data-vf-code]').first()).toContainText('pnpm test');
    } else {
      await expect(frame.locator('kbd')).toHaveCount(2);
      await expect(frame.locator('kbd').first()).toHaveText('Ctrl');
    }
    await guide.getByText('View React TSX source').first().click();
    await expect(guide.locator('.vf-docs-source-disclosure pre code').first()).toContainText(
      "from '@vyrnforge/react/" + id + "'");
    await expect(guide.locator('.vf-docs-source-disclosure pre code').first()).toContainText(selectors.source);
    await guide.getByRole('link', { name: 'View ' + label + ' public React API' }).click();
    await expect(page).toHaveURL(new RegExp('/next/react/api/components/' + id + '/$'));
    const api = page.locator('[data-vf-docs-react-api="' + id + '"]');
    await expect(api.getByRole('heading', { level: 1, name: label + ' API' })).toBeVisible();
    await expect(api).toContainText('@vyrnforge/react/' + id);
    await expect(api.locator('pre code').first()).toContainText('export ');
    await expect(page.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: label + ' API' })).toHaveAttribute('aria-current', 'page');
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('react-kbd-api-wide.png'), fullPage: true,
  });
});

test('React Typography routes preserve SSR with no client JavaScript and framework context', async ({ page, browser }) => {
  await page.goto('/next/native-web/components/text/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/text\/$/);
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('keyboard');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('kbd');
  await expect(page.locator('[data-vf-docs-react-results]')
    .getByRole('link', { name: 'Kbd', exact: true })).toBeVisible();
  await page.locator('[data-vf-docs-react-results]')
    .getByRole('link', { name: 'Kbd', exact: true }).click();
  await expect(page).toHaveURL(/\/next\/react\/components\/kbd\/$/);

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    for (const id of ['text', 'code', 'kbd']) {
      await noJs.goto('/next/react/components/' + id + '/');
      await expect(noJs.locator('[data-vf-docs-react-typography="' + id + '"]')).toBeVisible();
      await expect(noJs.locator('html')).not.toHaveAttribute('data-vf-react-hydrated', 'true');
      await noJs.getByText('View React TSX source').first().click();
      await expect(noJs.locator('.vf-docs-source-disclosure pre code').first()).toContainText(
        "'@vyrnforge/react/" + id + "'");
      await noJs.getByRole('link', { name: /public React API/ }).click();
      await expect(noJs).toHaveURL(new RegExp('/api/components/' + id + '/$'));
      await expect(noJs.locator('[data-vf-docs-react-api="' + id + '"]')).toContainText(
        '@vyrnforge/react/' + id);
    }
  } finally { await context.close(); }
});

test('React Typography remains readable at 320px, 200 percent text, RTL and forced colors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/text/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '200%';
  });
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Text', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  await page.addScriptTag({ content: axeCore.source });
  const a11y = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(a11y.violations, a11y.violations.map((entry) => entry.id + ': ' + entry.help).join('\n')).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.screenshot({ path: testInfo.outputPath('react-text-320-rtl-forced-colors.png'), fullPage: true });
});

test('Button, Layout, Code and Kbd use one task-first guide hierarchy and separate API navigation', async ({ page }) => {
  const expected = [
    'Get started', 'Examples', 'Usage guidelines',
    'Related components and API',
  ];
  for (const id of ['button', 'layout', 'code', 'kbd']) {
    await page.goto('/next/react/components/' + id + '/');
    const selector = id === 'button' ? '[data-vf-docs-react-component="button"]'
      : id === 'layout' ? '[data-vf-docs-react-layout]'
      : '[data-vf-docs-react-typography="' + id + '"]';
    const guide = page.locator(selector);
    await expect(guide).toHaveCount(1);
    const topics = id === 'button' ? [
      'Get started', 'Playground', 'Basic buttons', 'Variants', 'Sizes', 'States and async work',
      'Accessible icon actions', 'Forms', 'Density and target sizing',
      'Related components and API',
    ] : expected;
    expect(await guide.locator(':scope > section > h2').allTextContents()).toEqual(topics);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc.getByRole('link')).toHaveCount(topics.length);
    await expect(toc.getByRole('link', { name: id === 'button' ? 'Variants' : 'Examples' }))
      .toBeVisible();
    await expect(guide.locator('header h1 + [data-vf-docs-standards-disclosure] [data-vf-docs-accessibility]')).toHaveCount(1);
    await expect(guide.getByRole('heading', { name: /^Shared .* semantics$/ })).toHaveCount(0);
    await expect(guide.getByText('Accessibility standards')).toBeVisible();
    await expect(guide.getByRole('link', { name: /public React API|React API/ })).toHaveAttribute(
      'href', /api\/components\//);
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(nav.getByText('API Reference', { exact: true })).toBeVisible();
    // API links remain routed and searchable, but are not embedded in the
    // Components, Typography or Layout & Structure navigation groups.
    await expect(nav.getByRole('link', { name: 'Button API', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Layout API' })).toBeVisible();
  }
});

test('React Icon uses product-owned SVG examples and public source-backed API', async ({ page, browser }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/icon/');
  const guide = page.locator('[data-vf-docs-react-icon]');
  await expect(guide.getByRole('heading', { name: 'Icon', level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Icon', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await guide.locator(':scope > section > h2').allTextContents()).toEqual([
    'Get started', 'Examples', 'Usage guidelines', 'Related components and API',
  ]);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(4);
  await expect(guide.getByText('Accessibility standards')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Icon examples' }).getByRole('link')).toHaveCount(8);
  await expect(guide.locator('[data-vf-docs-react-icon-explorer]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'VyrnForge Icons' })).toHaveAttribute('href', '../../icons/');

  const basic = guide.locator('[data-vf-docs-react-icon-example="icon/basic"]');
  await expect(basic.locator('iframe').contentFrame().getByRole('img', { name: 'Bookmark' })).toBeVisible();

  const variants = guide.locator('[data-vf-docs-react-icon-example="icon/variants"] iframe');
  await variants.scrollIntoViewIfNeeded();
  const variantSvgs = variants.contentFrame().locator('svg[data-vf-icon]');
  await expect(variantSvgs).toHaveCount(4);
  for (const [variant, shape] of [['outlined', 'rounded'], ['outlined', 'sharp'], ['filled', 'rounded'], ['filled', 'sharp']]) {
    await expect(variants.contentFrame().locator(
      'svg[data-vf-variant="' + variant + '"][data-vf-shape="' + shape + '"]')).toHaveAttribute('aria-hidden', 'true');
  }

  const sizes = guide.locator('[data-vf-docs-react-icon-example="icon/sizes"] iframe');
  await sizes.scrollIntoViewIfNeeded();
  await expect(sizes.contentFrame().locator('svg[data-vf-icon]')).toHaveCount(3);
  for (const size of ['sm', 'md', 'lg']) {
    await expect(sizes.contentFrame().locator('svg[data-vf-size="' + size + '"]')).toBeVisible();
  }

  const a11y = guide.locator('[data-vf-docs-react-icon-example="icon/accessibility"] iframe');
  await a11y.scrollIntoViewIfNeeded();
  const a11yFrame = a11y.contentFrame();
  await expect(a11yFrame.getByRole('button', { name: 'Save bookmark' })).toBeVisible();
  await expect(a11yFrame.getByRole('button', { name: 'Save bookmark' })
    .locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await a11yFrame.getByRole('button', { name: 'Save bookmark' }).click();
  await expect(a11yFrame.getByRole('button', { name: 'Remove bookmark' })).toBeVisible();
  await expect(a11yFrame.getByRole('status')).toHaveText('Saved');
  await expect(a11yFrame.getByRole('img', { name: 'Bookmark status' })).toBeVisible();

  const custom = guide.locator('[data-vf-docs-react-icon-example="icon/custom"] iframe');
  await custom.scrollIntoViewIfNeeded();
  await expect(custom.contentFrame().getByRole('img', { name: 'Product mark' }))
    .toHaveAttribute('data-vf-icon-name', 'product-mark');
  await custom.locator('..').getByText('View React TSX source').click();
  await expect(custom.locator('..').locator('pre code')).toContainText("from '@vyrnforge/web/icon'");

  await guide.getByRole('link', { name: 'View Icon public React API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/icon\/$/);
  const api = page.locator('[data-vf-docs-react-api="icon"]');
  await expect(api.locator('pre code')).toContainText('export interface IconProps');
  await expect(api.locator('pre code')).toContainText('label?: string');
  await expect(api).toContainText('@vyrnforge/react/icon');
  await expect(api).toContainText('@vyrnforge/web/styles/icon.css');

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('/next/react/components/icon/');
    await expect(noJs.locator('[data-vf-docs-react-icon]')).toBeVisible();
    await expect(noJs.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Icon', exact: true }))
      .toHaveAttribute('aria-current', 'page');
  } finally { await context.close(); }
  await page.goto('/next/react/components/icon/');
  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '200%';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  await page.addScriptTag({ content: axeCore.source });
  const report = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(report.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('react-icon-320-rtl-forced-colors.png'), fullPage: false });
  expect(errors).toEqual([]);
});

test('React Icon Explorer renders the actual catalog with keyboard-operable filters and source-backed inspection', async ({ page, browser }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value) => { window.__iconExplorerCopied = value; } },
    });
  });
  await page.goto('/next/react/icons/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await expect(page.getByRole('heading', { level: 1, name: 'VyrnForge Icons' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'VyrnForge Icons' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-vf-docs-react-icon]')).toHaveCount(0);
  await expect(page.locator('[data-vf-docs-react-icon-example]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Icon usage guide' })).toHaveAttribute('href', '../components/icon/');
  const explorer = page.locator('[data-vf-docs-react-icon-explorer]');
  await expect(explorer.locator('[data-vf-search-field-root]')).toHaveCount(1);
  await expect(explorer.locator('[data-vf-search-field-input]')).toHaveCount(1);
  await expect(explorer.locator('[data-vf-search-field-clear]')).toBeDisabled();
  await expect(explorer.locator('[data-vf-docs-icon-card]')).toHaveCount(101);
  await expect(explorer.locator('[data-vf-docs-icon-count]')).toHaveText('101 of 101 icons shown');

  // A native search input and a public VyrnForge Button provide ordinary
  // Tab/Space operation instead of an invented composite keyboard model.
  await explorer.getByLabel('Search icons').fill('bookmark');
  await expect(explorer.getByRole('button', { name: 'Clear icon search' })).toBeEnabled();
  await expect(explorer.locator('[data-vf-docs-icon-card]')).toHaveCount(1);
  const bookmark = explorer.getByRole('button', { name: 'bookmark', exact: true });
  await bookmark.focus();
  await page.keyboard.press('Space');
  await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
  await expect(explorer.locator('[data-vf-docs-icon-inspector] h3')).toHaveText('bookmark');

  await explorer.getByLabel('Variant').selectOption('filled');
  await explorer.getByLabel('Shape').selectOption('sharp');
  await explorer.getByLabel('Size').selectOption('lg');
  await explorer.getByLabel('Semantic color').selectOption('danger');
  const preview = explorer.locator('[data-vf-docs-icon-inspector] .vf-docs-icon-preview svg[data-vf-icon]');
  await expect(preview).toHaveAttribute('data-vf-icon-name', 'bookmark');
  await expect(preview).toHaveAttribute('data-vf-variant', 'filled');
  await expect(preview).toHaveAttribute('data-vf-shape', 'sharp');
  await expect(preview).toHaveAttribute('data-vf-size', 'lg');
  await expect(preview).toHaveAttribute('role', 'img');
  await expect(preview).toHaveAttribute('aria-label', 'bookmark preview');
  const comparison = explorer.locator('.vf-docs-icon-variant-grid svg[data-vf-icon]');
  await expect(comparison).toHaveCount(4);
  await expect(comparison.first()).toHaveAttribute('role', 'img');
  for (const [index, pair] of ['outlined-rounded', 'outlined-sharp', 'filled-rounded', 'filled-sharp'].entries()) {
    const [artVariant, artShape] = pair.split('-');
    await expect(comparison.nth(index)).toHaveAttribute('data-vf-variant', artVariant);
    await expect(comparison.nth(index)).toHaveAttribute('data-vf-shape', artShape);
    await expect(comparison.nth(index)).toHaveAttribute('aria-label',
      'bookmark, ' + (artVariant === 'outlined' ? 'Outlined' : 'Filled') + ', ' +
      (artShape === 'rounded' ? 'Rounded' : 'Sharp'));
  }
  await expect(explorer.locator('[data-vf-docs-icon-inspector] pre code'))
    .toContainText("from '@vyrnforge/icons/bookmark'");
  await expect(explorer.locator('[data-vf-docs-icon-inspector] pre code'))
    .toContainText('variant="filled" shape="sharp" size="lg" tone="danger"');

  await explorer.getByRole('button', { name: 'Copy name' }).click();
  await expect.poll(() => page.evaluate(() => window.__iconExplorerCopied)).toBe('bookmark');
  await explorer.getByRole('button', { name: 'Copy usage' }).click();
  await expect.poll(() => page.evaluate(() => window.__iconExplorerCopied))
    .toContain("import { bookmarkIcon } from '@vyrnforge/icons/bookmark'");

  await explorer.getByLabel('Category').selectOption('Files & data');
  await expect(explorer.locator('[data-vf-docs-icon-count]')).toHaveText('0 of 101 icons shown');
  await expect(explorer.getByText('No implemented icons match those filters.')).toBeVisible();
  await explorer.getByRole('button', { name: 'Clear icon search' }).click();
  await expect(explorer.getByLabel('Search icons')).toHaveValue('');
  await expect(explorer.getByLabel('Search icons')).toBeFocused();
  await expect(explorer.getByRole('button', { name: 'Clear icon search' })).toBeDisabled();
  await expect(explorer.locator('[data-vf-docs-icon-card]')).toHaveCount(15);
  await expect(explorer.locator('[data-vf-docs-icon-count]')).toHaveText('15 of 101 icons shown');

  // The full explorer is server rendered, not an interactive-only blank slot.
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('/next/react/icons/');
    await expect(noJs.locator('[data-vf-docs-icon-card]')).toHaveCount(101);
  } finally { await context.close(); }
});

test('All catalog artwork variants have nonempty SVG geometry within the shared 24-unit icon viewBox', async ({ page }) => {
  await page.goto('/next/react/icons/');
  const explorer = page.locator('[data-vf-docs-react-icon-explorer]');
  const elements = explorer.locator('.vf-docs-icon-grid svg[data-vf-icon]');
  await expect(elements).toHaveCount(101);

  for (const variant of ['outlined', 'filled']) {
    await explorer.getByLabel('Variant').selectOption(variant);
    for (const shape of ['rounded', 'sharp']) {
      await explorer.getByLabel('Shape').selectOption(shape);
      const failures = await elements.evaluateAll((nodes) => nodes.flatMap((node) => {
        const box = node.getBBox();
        const paths = [...node.querySelectorAll('path')];
        const invalid = !paths.length || paths.some((path) => !path.getAttribute('d')?.trim()) ||
          !Number.isFinite(box.x + box.y + box.width + box.height) ||
          (box.width <= 0 && box.height <= 0) ||
          box.x < -0.25 || box.y < -0.25 ||
          box.x + box.width > 24.25 || box.y + box.height > 24.25;
        return invalid ? [{ name: node.getAttribute('data-vf-icon-name'),
          variant: node.getAttribute('data-vf-variant'),
          shape: node.getAttribute('data-vf-shape'),
          bbox: { x: box.x, y: box.y, width: box.width, height: box.height } }] : [];
      }));
      expect(failures).toEqual([]);
    }
  }

  // Regression: these arrowheads previously started above/left of the viewBox
  // because the SVG commands were relative to (0,0), not the arrow shaft.
  await explorer.getByLabel('Variant').selectOption('outlined');
  for (const [name, expected] of [
    ['arrow-down', 'M6 13l6 6 6-6'],
    ['arrow-left', 'M11 6l-6 6 6 6'],
    ['arrow-right', 'M13 6l6 6-6 6'],
  ]) {
    await explorer.getByLabel('Search icons').fill(name);
    const icon = explorer.locator('.vf-docs-icon-grid svg[data-vf-icon]');
    await expect(icon).toHaveCount(1);
    await expect(icon.locator('path').nth(1)).toHaveAttribute('d', expected);
  }
});

test('One-import createSvgIcon produces reusable JSX shapes with defaults and themes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/icon/');
  const guide = page.locator('[data-vf-docs-react-icon]');
  await expect(guide).toContainText('one VyrnForge import and one function call is enough');
  const sample = guide.locator('[data-vf-docs-react-icon-example="icon/svg-wrapper"]');
  await sample.locator('iframe').scrollIntoViewIfNeeded();
  const frame = sample.locator('iframe').contentFrame();
  const svgs = frame.locator('svg[data-vf-icon]');
  await expect(svgs).toHaveCount(3);
  const plain = svgs.first();
  await expect(plain).toHaveAttribute('viewBox', '0 0 24 24');
  await expect(plain).toHaveAttribute('data-vf-size', 'md');
  await expect(plain).toHaveAttribute('aria-hidden', 'true');
  await expect(plain).toHaveAttribute('focusable', 'false');
  await expect(plain.locator('path')).toHaveCount(1);
  await expect(plain).not.toHaveAttribute('tabindex', '0');
  const custom = svgs.nth(1);
  await expect(custom).toHaveAttribute('data-vf-size', 'lg');
  await expect(custom).toHaveAttribute('style', /color:\s*var\(--vf-color-accent-background\)/);
  const customColors = await custom.evaluate((element) => ({
    own: getComputedStyle(element).color,
    parent: getComputedStyle(element.parentElement).color,
  }));
  expect(customColors.own).not.toBe(customColors.parent);
  const named = frame.getByRole('img', { name: 'Sparkle' });
  await expect(named).toBeVisible();
  await expect(named).not.toHaveAttribute('aria-hidden', 'true');
  await sample.getByText('View React TSX source').click();
  await expect(sample.locator('pre code')).toContainText("import { createSvgIcon, Flow, Text } from '@vyrnforge/react'");
  await expect(sample.locator('pre code')).toContainText('const SparkleIcon = createSvgIcon(');
  await expect(sample.locator('pre code')).not.toContainText('@vyrnforge/react/layout');
  await guide.getByRole('link', { name: 'View Icon public React API' }).click();
  await expect(page.locator('[data-vf-docs-react-api="icon"] pre code'))
    .toContainText('export function createSvgIcon(content: ReactNode)');
  expect(errors).toEqual([]);
});

test('React Icon colors use inherited semantic tokens and raw SVG JSX remains native', async ({ page }) => {
  await page.goto('/next/react/components/icon/');
  const guide = page.locator('[data-vf-docs-react-icon]');
  await expect(guide.getByRole('heading', { name: 'React color and theming' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Inline SVG tags' })).toBeVisible();
  await expect(guide).toContainText('<Icon><path /></Icon>');

  const colorPreview = guide.locator('[data-vf-docs-react-icon-example="icon/colors"] iframe');
  await colorPreview.scrollIntoViewIfNeeded();
  const swatches = colorPreview.contentFrame().locator('svg[data-vf-icon]');
  await expect(swatches).toHaveCount(4);
  const expectedTokens = ['text', 'accent-background', 'text-muted', 'danger-border'];
  for (const [index, svg] of (await swatches.all()).entries()) {
    const token = expectedTokens[index];
    await expect(svg).toHaveAttribute('style', new RegExp('var\\(--vf-color-' + token + '\\)'));
    const actual = await svg.evaluate((element) => ({
      icon: getComputedStyle(element).color,
      label: getComputedStyle(element.parentElement.querySelector('[data-vf-text]')).color,
    }));
    expect(actual.icon).toBe(actual.label);
    await expect(svg.locator('..').locator('[data-vf-text]')).toHaveText(['Default', 'Accent', 'Muted', 'Danger'][index]);
  }
  const accent = colorPreview.contentFrame().locator('svg[data-vf-icon]').nth(1);
  const light = await accent.evaluate((element) => getComputedStyle(element).color);
  await colorPreview.contentFrame().locator('html').evaluate((element) => {
    element.dataset.vfTheme = 'dark';
  });
  const dark = await accent.evaluate((element) => getComputedStyle(element).color);
  expect(dark).not.toBe(light);

  const inlinePreview = guide.locator('[data-vf-docs-react-icon-example="icon/inline-svg"] iframe');
  await inlinePreview.scrollIntoViewIfNeeded();
  const frame = inlinePreview.contentFrame();
  const named = frame.getByRole('img', { name: 'Sparkle' });
  await expect(named).toBeVisible();
  await expect(named).toHaveAttribute('data-vf-icon', '');
  await expect(named).toHaveAttribute('focusable', 'false');
  await expect(named.locator('path')).toHaveCount(1);
  await expect(named.locator('circle')).toHaveCount(1);
  expect(await named.evaluate((element) => getComputedStyle(element).inlineSize)).toBe('24px');
  const decorative = frame.locator('svg[aria-hidden="true"]');
  await expect(decorative).toHaveCount(1);
  await expect(decorative).toHaveAttribute('focusable', 'false');
  await expect(decorative.locator('rect')).toHaveCount(1);
  await expect(decorative.locator('path')).toHaveCount(1);
  await expect(frame.getByRole('img')).toHaveCount(1);
  const source = guide.locator('[data-vf-docs-react-icon-example="icon/inline-svg"]');
  await source.getByText('View React TSX source').click();
  await expect(source.locator('pre code')).toContainText("import '@vyrnforge/web/styles/icon.css';");
  await expect(source.locator('pre code')).toContainText('<svg data-vf-icon=""');
  await expect(source.locator('pre code')).toContainText('<circle');
});

test('React setup has one shared home and component APIs do not reprint integration guides', async ({ page }) => {
  await page.goto('/next/react/');
  await expect(page.getByRole('heading', { name: 'Styling, SSR and hydration' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'React state and native semantics' })).toBeVisible();
  await expect(page.locator('main pre code').filter({ hasText: "import '@vyrnforge/web/styles.css';" })).toHaveCount(1);

  for (const id of ['button', 'layout', 'text', 'code', 'kbd']) {
    await page.goto('/next/react/components/' + id + '/');
    const selector = id === 'button' ? '[data-vf-docs-react-component="button"]'
      : id === 'layout' ? '[data-vf-docs-react-layout]'
      : '[data-vf-docs-react-typography="' + id + '"]';
    const guide = page.locator(selector);
    await expect(guide.getByRole('heading', { name: 'React integration' })).toHaveCount(0);
    await expect(guide.getByRole('heading', { name: 'Styling and server rendering' })).toHaveCount(0);
    await expect(guide.getByRole('link', { name: 'React overview' })).toHaveAttribute(
      'href', '../../');
    await page.goto('/next/react/api/components/' + id + '/');
    const api = page.locator('[data-vf-docs-react-api="' + id + '"]');
    await expect(api).toBeVisible();
    await expect(api.locator('section[aria-label*="integration"]')).toHaveCount(0);
    await expect(api.getByRole('heading', { name: 'React rendering boundary' })).toHaveCount(0);
  }
});

test('Code and Kbd task-first guides preserve reflow, RTL, forced colors and baseline accessibility', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const id of ['code', 'kbd']) {
    await page.goto('/next/react/components/' + id + '/');
    await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      document.documentElement.style.fontSize = '200%';
    });
    await page.emulateMedia({ forcedColors: 'active' });
    const guide = page.locator('[data-vf-docs-react-typography="' + id + '"]');
    await expect(guide.getByRole('heading', { name: 'Accessibility', level: 2 })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(4);
    const width = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(width.scroll, id + ' guide must not overflow viewport').toBeLessThanOrEqual(width.viewport + 1);
    await page.addScriptTag({ content: axeCore.source });
    const a11y = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    }));
    expect(a11y.violations, a11y.violations.map((issue) => issue.id + ': ' + issue.help).join('\n')).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('react-' + id + '-guide-320-rtl-forced-colors.png'),
      fullPage: false,
    });
  }
});

test('React Button guide renders all five source-backed variants and links the independent API', async ({ page }) => {
  await page.goto('/next/react/components/button/');
  const guide = page.locator('[data-vf-docs-react-component="button"]');
  const cards = guide.locator('[data-vf-docs-react-button-example]');
  await expect(cards).toHaveCount(7);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(10);
  for (const id of ['basic', 'variants', 'sizes', 'states', 'forms']) {
    const card = guide.locator('[data-vf-docs-react-button-example="button/' + id + '"]');
    await expect(card).toHaveCount(1);
    await expect(card.locator('iframe')).toHaveAttribute('src', /examples\/button/);
    await card.locator('iframe').scrollIntoViewIfNeeded();
    await expect(card.locator('iframe').contentFrame().locator('#root button').first()).toBeVisible();
    await card.locator('.vf-docs-source-disclosure > summary').click();
    await expect(card.locator('pre code')).toContainText("from '@vyrnforge/react/button'");
  }
  await guide.getByRole('link', { name: 'View Button public React API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
});

test('React Text guide teaches every public type role with real TSX previews and semantic composition', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/text/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const guide = page.locator('[data-vf-docs-react-typography="text"]');
  const searchWidth = await page.getByRole('searchbox', { name: 'Search React documentation' })
    .evaluate((input) => input.getBoundingClientRect().width);
  expect(searchWidth, 'Desktop docs search must remain readable alongside framework and theme controls')
    .toBeGreaterThan(150);
  expect(await guide.locator(':scope > section > h2').allTextContents()).toEqual([
    'Get started', 'Examples', 'Usage guidelines',
    'Related components and API',
  ]);
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link')).toHaveCount(4);
  await expect(toc.getByRole('link', { name: 'Usage guidelines' }))
    .toHaveAttribute('href', '#react-typography-guidelines');
  await expect(guide.getByRole('heading', { name: 'When to use' })).toHaveCount(1);
  await expect(guide.getByRole('heading', { name: 'When not to use' })).toHaveCount(1);
  await expect(guide.getByRole('heading', { name: 'Shared Text semantics' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'React Text integration' })).toHaveCount(0);
  await expect(guide.locator('header h1 + [data-vf-docs-standards-disclosure] [data-vf-docs-accessibility]')).toHaveCount(1);
  const startCode = guide.locator('section[aria-labelledby="react-typography-setup"] pre code');
  await expect(startCode).toContainText("import { Text } from '@vyrnforge/react/text'");
  await expect(startCode).toContainText('<Text as="h2" variant="heading-md">');
  await expect(guide.getByText('`' + '`' + '`tsx')).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Choosing a semantic host' })).toBeVisible();
  const standardDisclosure = guide.getByText('Accessibility standards', { exact: true });
  await standardDisclosure.click();
  await expect(guide.getByRole('heading', { name: 'References' })).toBeVisible();
  await expect(guide.getByRole('link', { name: /WCAG 2\.2/ })).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  await standardDisclosure.click();
  const gallery = guide.locator('[data-vf-docs-react-usage-gallery="text"]');
  const cards = gallery.locator('[data-vf-docs-react-typography-example]');
  await expect(cards).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Text examples' }).getByRole('link')).toHaveCount(3);
  await cards.first().locator('iframe').scrollIntoViewIfNeeded();
  await expect(cards.first().locator('iframe').contentFrame()
    .getByRole('heading', { name: 'Typography foundation', level: 2 })).toBeVisible();
  const basicFrame = cards.first().locator('iframe').contentFrame();
  await expect(basicFrame.locator('mark[data-vf-text]')).toBeVisible();
  await expect(basicFrame.locator('time[data-vf-text]')).toBeVisible();
  const basicHeight = await basicFrame.locator('html').evaluate((root) => ({
    scroll: root.scrollHeight, client: root.clientHeight,
  }));
  expect(basicHeight.scroll).toBeLessThanOrEqual(basicHeight.client + 1);
  await basicFrame.locator('body').screenshot({
    path: testInfo.outputPath('react-text-basic-example-actual-size.png'),
  });
  const typeScale = cards.filter({ has: page.locator('[data-vf-docs-example-id="text/type-scale"]') });
  const scale = typeScale.locator('iframe').contentFrame();
  const expected = [
    'display-lg', 'display-md', 'display-sm',
    'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
    'title-lg', 'title-md', 'title-sm',
    'body-lg', 'body-md', 'body-sm',
    'label-lg', 'label-md', 'label-sm', 'caption', 'overline',
  ];
  await typeScale.locator('iframe').scrollIntoViewIfNeeded();
  await expect(scale.locator('[data-vf-docs-specimen]')).toHaveCount(expected.length);
  const escapedHtml = await scale.locator('body').evaluate((body) =>
    [...body.childNodes].filter((node) => node.nodeType === 3)
      .map((node) => node.textContent).join(''));
  expect(escapedHtml).not.toContain('\\n');
  for (const variant of expected) {
    const specimen = scale.locator('[data-vf-docs-specimen="' + variant + '"]');
    await expect(specimen.locator('p[data-vf-text-variant="' + variant + '"]')).toHaveCount(1);
    await expect(specimen.locator('p[data-vf-text-variant="' + variant + '"]')).toBeVisible();
    await expect(specimen.locator('small[data-vf-text-variant="caption"]')).toHaveText(variant);
  }
  await expect(scale.getByRole('heading', { name: 'Display', level: 2 })).toBeVisible();
  await scale.locator('body').screenshot({
    path: testInfo.outputPath('react-text-type-scale-actual-size.png'),
  });
  await typeScale.getByText('View React TSX source').click();
  const source = typeScale.locator('pre code');
  await expect(source).toContainText('BuiltInTextVariant');
  await expect(source).toContainText("from '@vyrnforge/react/text'");
  await expect(source).toContainText("from '@vyrnforge/react/layout'");
  await expect(source).not.toContainText('style={{');

  const article = cards.filter({ has: page.locator('[data-vf-docs-example-id="text/semantic-composition"]') });
  await article.locator('iframe').scrollIntoViewIfNeeded();
  const frame = article.locator('iframe').contentFrame();
  await expect(frame.getByRole('article')).toHaveCount(1);
  await expect(frame.getByRole('heading', { level: 2, name: 'Meaning before appearance' })).toBeVisible();
  await expect(frame.locator('strong[data-vf-text]')).toHaveText('real emphasis');
  await expect(frame.locator('blockquote[data-vf-text]')).toContainText('Typography');
  await expect(frame.locator('time[datetime="2026-11-20"]')).toHaveText('20 November 2026');
  await article.getByText('View React TSX source').click();
  await expect(article.locator('pre code')).toContainText('<Text as="h2"');
  await expect(article.locator('pre code')).not.toContainText('style={{');

  await expect(guide).toContainText('When to use');
  await expect(guide).toContainText('When not to use');
  await typeScale.getByText('View React TSX source').click();
  await article.getByText('View React TSX source').click();
  // Capture the document from the beginning so sticky navigation and header
  // appear in owner visual evidence after exercising lazy example iframes.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('react-text-usage-guide-wide.png'), fullPage: true,
  });
  await guide.getByRole('link', { name: 'View Text public React API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/text\/$/);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('react-text-api-source-backed.png'), fullPage: false });
});

test('Text specimen examples retain semantics and reflow at narrow width with dark and forced colors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto('/next/react/components/text/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '200%';
  });
  const gallery = page.locator('[data-vf-docs-react-usage-gallery="text"]');
  await expect(gallery.locator('#react-typography-text-type-scale')).toBeVisible();
  // The secondary example rail is desktop-only; deep links still work at 320px.
  await page.evaluate(() => { window.location.hash = 'react-typography-text-type-scale'; });
  await expect(page).toHaveURL(/#react-typography-text-type-scale$/);
  const scale = page.locator('iframe[data-vf-docs-example-id="text/type-scale"]').contentFrame();
  await expect(scale.locator('[data-vf-docs-specimen]')).toHaveCount(18);
  const docWidths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(docWidths.scroll).toBeLessThanOrEqual(docWidths.client + 1);
  const iframeWidths = await scale.locator('html').evaluate((root) => ({
    client: root.clientWidth, scroll: root.scrollWidth,
  }));
  expect(iframeWidths.scroll).toBeLessThanOrEqual(iframeWidths.client + 1);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(scale.locator('[data-vf-docs-specimen="body-md"] p')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('react-text-guide-320-rtl-dark-forced-colors.png'), fullPage: false,
  });
});

test('Avatar framework switch preserves the Native Web and React topic', async ({ page }) => {
  await page.goto('/next/native-web/components/avatar/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/avatar\/$/);
  await expect(page.locator('[data-vf-docs-react-avatar]')).toBeVisible();
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/components\/avatar\/$/);
});

test('React Badge guide remains focused on React and uses source-backed examples', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('/next/react/components/badge/');
  const guide = page.locator('[data-vf-docs-react-badge]');
  await expect(guide.getByRole('heading', { name: 'Badge', level: 1 })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Get started' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Accessibility', exact: true })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Native Web markup' })).toHaveCount(0);
  const setup = guide.locator('section[aria-labelledby="react-badge-setup"] pre code');
  await expect(setup).toHaveCount(1);
  await expect(setup).toContainText("from '@vyrnforge/react/badge'");
  await expect(setup).not.toContainText('<Badge');
  await expect(page.getByRole('navigation', { name: 'Badge examples' }).getByRole('link')).toHaveCount(5);
  const basic = guide.locator('[data-vf-docs-react-badge-example="badge/basic"] iframe');
  await basic.scrollIntoViewIfNeeded();
  await expect(basic.contentFrame().getByRole('button', { name: 'Inbox, 4 unread messages' })).toBeVisible();
  await expect(basic.contentFrame().locator('[data-vf-badge-indicator]').first()).toHaveText('4');
  await expect(basic.contentFrame().locator('[data-vf-button]')).toHaveCount(2);
  await expect(basic.contentFrame().locator('[data-vf-flow]')).toHaveCount(1);
  await expect(basic.contentFrame().locator('[data-vf-icon]')).toHaveCount(1);
  await expect(guide.getByRole('heading', { name: 'Composition with existing VyrnForge components' })).toBeVisible();
  const dot = guide.locator('[data-vf-docs-react-badge-example="badge/dot"] iframe');
  await dot.scrollIntoViewIfNeeded();
  await expect(dot.contentFrame().getByRole('button', { name: 'Alerts, new notifications' })).toBeVisible();
  await expect(dot.contentFrame().locator('[data-vf-text]')).toHaveCount(1);
  await expect(dot.contentFrame().locator('[aria-hidden="true"][data-vf-badge-indicator]')).toHaveCount(2);
  await expect(dot.contentFrame().locator('[data-vf-badge-size="sm"]')).toHaveCount(1);
  await expect(dot.contentFrame().locator('[data-vf-badge-size="lg"]')).toHaveCount(1);
  const variants = guide.locator('[data-vf-docs-react-badge-example="badge/variants"] iframe');
  await variants.scrollIntoViewIfNeeded();
  await expect(variants.contentFrame().locator('[data-vf-badge-size="lg"]')).toHaveCount(1);
  const positioning = guide.locator('[data-vf-docs-react-badge-example="badge/positioning"] iframe');
  await positioning.scrollIntoViewIfNeeded();
  await expect(positioning.contentFrame().locator('[data-vf-badge-overlap="circular"]')).toHaveCount(1);
  await expect(positioning.contentFrame().locator('[data-vf-avatar]')).toHaveCount(1);
  const visibility = guide.locator('[data-vf-docs-react-badge-example="badge/visibility"] iframe');
  await visibility.scrollIntoViewIfNeeded();
  await expect(visibility.contentFrame().locator('[data-vf-badge-indicator][hidden]')).toHaveCount(2);

  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Badge API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/badge\/$/);
  const api = page.locator('[data-vf-docs-react-api="badge"]');
  await expect(api.locator('section[aria-labelledby="react-badge-api-types"] pre code')).toContainText('export type BadgeProps');
  await expect(api.locator('section[aria-labelledby="react-badge-api-types"] pre code')).toContainText('export type BadgeTone');
  await expect(api.locator('section[aria-labelledby="react-badge-api-types"] pre code')).toContainText('export type BadgeAnchorOrigin');
  await expect(api.getByRole('heading', { name: 'Native Web markup' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('React Avatar guide shows initials, native photo, failed-image fallback and API', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('/next/react/components/avatar/');
  const guide = page.locator('[data-vf-docs-react-avatar]');
  await expect(guide.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Avatar examples' }).getByRole('link')).toHaveCount(10);
  await expect(guide.getByRole('heading', { name: 'Behavior and usage' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Appearances and fallback' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Grouped avatars and totals' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Group spacing', exact: true })).toBeVisible();

  // A React consumer sees one concise setup and one source-backed gallery.
  const setupSource = guide.locator('section[aria-labelledby="react-avatar-setup"] pre code');
  await expect(setupSource).toHaveCount(1);
  await expect(setupSource).toContainText("from '@vyrnforge/react/avatar'");
  await expect(setupSource).not.toContainText('<Avatar');
  await expect(guide.getByRole('heading', { name: 'Native Web markup' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Framework consumption' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'React authoring' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'React accessibility' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Accessibility', exact: true })).toHaveCount(0);
  const initials = guide.locator('[data-vf-docs-react-avatar-example="avatar/initials"] iframe');
  await initials.scrollIntoViewIfNeeded();
  await expect(initials.contentFrame().locator('[data-vf-avatar-initials]').first()).toHaveText('AL');
  await expect(initials.contentFrame().getByRole('img', { name: 'Ada Lovelace' })).toHaveCount(2);

  const photo = guide.locator('[data-vf-docs-react-avatar-example="avatar/image"] iframe');
  await photo.scrollIntoViewIfNeeded();
  await expect(photo.contentFrame().locator('img[data-vf-avatar-image]')).toHaveAttribute('alt', '');
  await expect(photo.contentFrame().getByRole('img', { name: 'Ada Lovelace' })).toHaveCount(1);
  const failed = guide.locator('[data-vf-docs-react-avatar-example="avatar/fallback"] iframe');
  await failed.scrollIntoViewIfNeeded();
  await expect(failed.contentFrame().locator('img[data-vf-avatar-image]')).toHaveCount(0);
  await expect(failed.contentFrame().locator('[data-vf-avatar-initials]')).toHaveText('AC');

  const decorative = guide.locator('[data-vf-docs-react-avatar-example="avatar/decorative"] iframe');
  await decorative.scrollIntoViewIfNeeded();
  await expect(decorative.contentFrame().locator('[data-vf-avatar]')).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative.contentFrame().getByText('Ada Lovelace')).toBeVisible();
  const icon = guide.locator('[data-vf-docs-react-avatar-example="avatar/icon"] iframe');
  await icon.scrollIntoViewIfNeeded();
  await expect(icon.contentFrame().locator('[data-vf-avatar-icon] svg').first()).toBeVisible();
  await expect(icon.contentFrame().getByRole('img', { name: 'Anonymous member' })).toHaveCount(1);

  const shapes = guide.locator('[data-vf-docs-react-avatar-example="avatar/shapes"] iframe');
  await shapes.scrollIntoViewIfNeeded();
  await expect(shapes.contentFrame().locator('[data-vf-avatar-shape="square"]')).toHaveCount(2);

  const members = guide.locator('[data-vf-docs-react-avatar-example="avatar/group"] iframe');
  await members.scrollIntoViewIfNeeded();
  await expect(members.contentFrame().getByRole('list', { name: 'Project contributors' })
    .locator('li')).toHaveCount(4);

  const total = guide.locator('[data-vf-docs-react-avatar-example="avatar/total"] iframe');
  await total.scrollIntoViewIfNeeded();
  await expect(total.contentFrame().getByRole('list', { name: 'Review team' })
    .locator('li')).toHaveCount(4);
  await expect(total.contentFrame().getByRole('img', { name: '9 more reviewers' })).toHaveText('+9');

  const spacing = guide.locator('[data-vf-docs-react-avatar-example="avatar/spacing"] iframe');
  await spacing.scrollIntoViewIfNeeded();
  await expect(spacing.contentFrame().locator('[data-vf-avatar-group]')).toHaveCount(3);

  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('avatar initials');
  await expect(page.locator('[data-vf-docs-react-results]').getByRole('link', { name: 'Avatar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Avatar API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/avatar\/$/);
  const api = page.locator('[data-vf-docs-react-api="avatar"]');
  await expect(api).toContainText('@vyrnforge/react/avatar');
  await expect(api.locator('section[aria-labelledby="react-avatar-api-types"] pre code')).toContainText('export interface AvatarProps');
  await expect(api.locator('section[aria-labelledby="react-avatar-api-types"] pre code')).toContainText('export type AvatarSize');
  await expect(api.locator('section[aria-labelledby="react-avatar-api-types"] pre code')).toContainText('export interface AvatarGroupProps');
  await expect(api.locator('section[aria-labelledby="react-avatar-api-types"] pre code')).toContainText('export type AvatarAppearance');
  await expect(api.locator('section[aria-labelledby="react-avatar-api-types"] pre code')).toContainText('export type AvatarGroupSpacing');
  await expect(api.locator('#react-avatar-api-css')).toHaveCount(0);
  await expect(api.getByRole('heading', { name: 'Shared CSS and native hooks' })).toHaveCount(0);
  await expect(api.getByText('Native Web markup')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Avatar documentation supports no-JS SSR and narrow RTL high-contrast layout', async ({ page, browser }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/avatar/');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  await page.addScriptTag({ content: axeCore.source });
  const a11y = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(a11y.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto('/next/react/components/avatar/');
    await expect(noJs.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
    await expect(noJs.locator('[data-vf-docs-react-avatar-example]')).toHaveCount(10);
    await noJs.getByRole('navigation', { name: 'Documentation framework' })
      .getByRole('link', { name: 'Native Web' }).click();
    await expect(noJs).toHaveURL(/\/next\/native-web\/components\/avatar\/$/);
  } finally {
    await context.close();
  }
});

test('React Image guide uses shared native CSS, source-backed examples and a distinct API', async ({ page, browser }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/image/');
  const guide = page.locator('[data-vf-docs-react-image]');
  await expect(guide.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Image', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await guide.locator(':scope > section > h2').allTextContents()).toEqual([
    'Get started', 'Examples', 'Usage guidelines', 'Related components and API',
  ]);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(4);
  await expect(page.getByRole('navigation', { name: 'Image examples' }).getByRole('link')).toHaveCount(4);
  await expect(guide.getByText('Accessibility standards')).toBeVisible();

  const basic = guide.locator('[data-vf-docs-react-image-example="image/basic"] iframe');
  await expect(basic.contentFrame().locator('img[data-vf-image]'))
    .toHaveAttribute('alt', 'Illustration of green hills beneath a yellow sun');

  const decorative = guide.locator('[data-vf-docs-react-image-example="image/decorative"] iframe');
  await decorative.scrollIntoViewIfNeeded();
  await expect(decorative.contentFrame().locator('img[data-vf-image]')).toHaveAttribute('alt', '');
  await expect(decorative.contentFrame().locator('img[data-vf-image]')).toHaveCount(1);

  const caption = guide.locator('[data-vf-docs-react-image-example="image/captioned"] iframe');
  await caption.scrollIntoViewIfNeeded();
  await expect(caption.contentFrame().locator('figure figcaption')).toHaveText('Study of shape and contrast');
  await expect(caption.contentFrame().locator('figure img[data-vf-image]'))
    .toHaveAttribute('alt', 'A blue circle centered on a pale background');

  const responsive = guide.locator('[data-vf-docs-react-image-example="image/responsive"] iframe');
  await responsive.scrollIntoViewIfNeeded();
  const measured = await responsive.contentFrame().locator('img[data-vf-image]').evaluate((element) => {
    const img = element.getBoundingClientRect();
    const box = element.parentElement.getBoundingClientRect();
    return { inline: img.width, block: img.height, container: box.width,
      max: getComputedStyle(element).maxInlineSize };
  });
  expect(measured.max).toBe('100%');
  expect(measured.inline).toBeLessThanOrEqual(measured.container + 1);
  expect(Math.abs(measured.block - measured.inline / 2)).toBeLessThan(1);

  const sourceCard = guide.locator('[data-vf-docs-react-image-example="image/responsive"]');
  await sourceCard.getByText('View React TSX source').click();
  await expect(sourceCard.locator('pre code')).toContainText("from '@vyrnforge/react/image'");
  await expect(sourceCard.locator('pre code')).toContainText("import '@vyrnforge/web/styles/image.css'");

  await guide.getByRole('link', { name: 'View Image public React API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/image\/$/);
  const api = page.locator('[data-vf-docs-react-api="image"]');
  await expect(api.locator('pre code')).toContainText("ComponentPropsWithoutRef<'img'>");
  await expect(api).toContainText('@vyrnforge/react/image');
  await expect(api).toContainText('@vyrnforge/web/styles/image.css');

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await noJsContext.newPage();
    await noJs.goto('/next/react/components/image/');
    await expect(noJs.locator('[data-vf-docs-react-image]')).toBeVisible();
    await expect(noJs.getByRole('heading', { name: 'Image', level: 1 })).toBeVisible();
  } finally { await noJsContext.close(); }

  await page.goto('/next/react/components/image/');
  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '200%';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  const extent = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(extent.scroll).toBeLessThanOrEqual(extent.client + 1);
  await page.addScriptTag({ content: axeCore.source });
  const report = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(report.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('react-image-320-rtl-forced-colors.png'), fullPage: false });
  expect(errors).toEqual([]);
});


test('React List guide exposes rich semantic examples and a separate source-backed API', async ({ page }) => {
  await page.goto('/next/react/components/list/');
  await expect(page.locator('[data-vf-docs-react-list]')).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-list-example]')).toHaveCount(8);

  await page.locator('iframe[title="React Rich team directory List example"]').scrollIntoViewIfNeeded();
  const rich = page.frameLocator('iframe[title="React Rich team directory List example"]');
  const people = rich.getByRole('list', { name: 'Project team' });
  await expect(people).toBeVisible();
  await expect(people.getByRole('listitem')).toHaveCount(3);
  await expect(rich.getByRole('button', { name: 'View Alex Chen' })).toBeVisible();

  await page.locator('iframe[title="React Ordered and unordered List example"]').scrollIntoViewIfNeeded();
  const markers = page.frameLocator('iframe[title="React Ordered and unordered List example"]');
  await expect(markers.getByRole('list', { name: 'Release steps' })).toHaveCount(1);
  await expect(markers.getByRole('list', { name: 'Project notes' })).toHaveCount(1);

  await page.locator('iframe[title="React Independent actions List example"]').scrollIntoViewIfNeeded();
  const actions = page.frameLocator('iframe[title="React Independent actions List example"]');
  await expect(actions.getByRole('list', { name: 'Saved reports' })).toBeVisible();
  await expect(actions.getByRole('button', { name: 'Unavailable' })).toBeDisabled();

  await page.locator('iframe[title="React Gutters, dividers and inset rules List example"]').scrollIntoViewIfNeeded();
  const gutters = page.frameLocator('iframe[title="React Gutters, dividers and inset rules List example"]');
  await expect(gutters.getByRole('list', { name: 'Edge-to-edge reports' }))
    .toHaveAttribute('data-vf-list-gutter', 'none');

  await page.locator('iframe[title="React Density and three row sizes List example"]').scrollIntoViewIfNeeded();
  const density = page.frameLocator('iframe[title="React Density and three row sizes List example"]');
  await expect(density.getByRole('list', { name: 'sm tasks' })).toBeVisible();
  await density.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await expect(density.locator('[data-vf-density="compact"]')).toHaveCount(1);

  await page.locator('iframe[title="React Nested and collapsible lists List example"]').scrollIntoViewIfNeeded();
  const nested = page.frameLocator('iframe[title="React Nested and collapsible lists List example"]');
  await expect(nested.getByRole('list', { name: 'Frontend files' })).toBeVisible();
  await nested.getByRole('button', { name: 'Frontend areas' }).click();
  await expect(nested.getByRole('list', { name: 'Frontend files' })).toBeHidden();

  await page.locator('iframe[title="React Grouped lists and sticky headings List example"]').scrollIntoViewIfNeeded();
  const grouped = page.frameLocator('iframe[title="React Grouped lists and sticky headings List example"]');
  await expect(grouped.getByRole('list', { name: 'Today' })).toBeVisible();
  await expect(grouped.getByRole('heading', { name: 'Today' })).toHaveCSS('position', 'sticky');

  await page.locator('iframe[title="React Interactive checkbox and action rows List example"]').scrollIntoViewIfNeeded();
  const interactive = page.frameLocator('iframe[title="React Interactive checkbox and action rows List example"]');
  await interactive.getByRole('checkbox', { name: 'Select Monthly report' }).check();
  await expect(interactive.getByText('1 of 3 selected')).toBeVisible();
  await interactive.getByRole('button', { name: 'Details for Monthly report' }).click();
  await expect(interactive.getByText('Details requested for Monthly report')).toBeVisible();

  await page.goto('/next/react/api/components/list/');
  await expect(page.locator('[data-vf-docs-react-api="list"]')).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-api="list"]')).toContainText('ListItemProps');
  await expect(page.locator('[data-vf-docs-react-api="list"]')).toContainText('ListGutter');

  await page.route('**/assets/react-reference.js', (route) => route.abort());
  await page.reload();
  await expect(page.locator('[data-vf-docs-react-api="list"]')).toBeVisible();
});

test('React guides keep Native Web snippets out of consumer code examples', async ({ page }) => {
  for (const [route, nativeSnippet] of [
    ['components/divider/', '<span data-vf-divider'],
    ['components/layout/', '<div data-vf-flow'],
    ['utilities/motion/', '<div data-vf-motion='],
  ]) {
    await page.goto('/next/react/' + route);
    const examples = await page.locator('article pre code').allTextContents();
    expect(examples.join('\n'), route).not.toContain(nativeSnippet);
  }
  await page.goto('/next/react/components/divider/');
  const jsx = await page.locator('article pre code').allTextContents();
  expect(jsx.join('\n')).toContain('<Divider');
});

test('Overlay utility uses one shared guide and real public React surface CSS', async ({ page }) => {
  const manifest = JSON.parse(readFileSync('dist/docs/next/react/site-manifest.json', 'utf8'));
  expect(manifest.utilities).toContainEqual({
    id: 'overlay', route: 'utilities/overlay/',
    source: 'documentation/utilities/overlay.md',
    publicComponents: ['popover', 'tooltip', 'preview-card', 'dialog', 'alert-dialog', 'drawer'],
  });
  const html = readFileSync('dist/docs/next/react/utilities/overlay/index.html', 'utf8');
  expect(html).toContain('assets/docs.css');
  for (const id of ['popover', 'tooltip', 'preview-card', 'dialog', 'drawer'])
    expect(html).toContain('components/' + id + '/' + id + '.css');
  await page.goto('/next/react/utilities/overlay/');
  const utility = page.locator('[data-vf-docs-react-overlay-utility]');
  await expect(utility).toBeVisible();
  await expect(utility.getByRole('heading', { name: 'Overlay utility' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Overlay' })).toHaveAttribute('aria-current', 'page');
  await expect(utility.getByText('not a public', { exact: false })).toBeVisible();
  const sourceLink = utility.getByRole('link', { name: 'Popover React source' });
  await expect(sourceLink).toHaveAttribute('href',
    /github\.com\/vyrnforge\/vyrnforge-ui\/blob\/main\/.*\/popover\/react\/index\.ts$/);
  const exampleSource = await utility.locator('.vf-docs-source-disclosure pre code').textContent();
  expect(exampleSource).toContain('<PopoverTrigger');
  expect(exampleSource).toContain('data-vf-button');
  await expect(utility.locator('[data-vf-docs-overlay-stage] [data-vf-popover-trigger]')).toHaveAttribute('data-vf-button', '');
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('overlay');
  await expect(page.locator('[data-vf-docs-react-results]')).toContainText('Overlay utility');
});

test('Overlay utility exercises native popover, tooltip, preview, Dialog and Drawer', async ({ page }, testInfo) => {
  await page.goto('/next/react/utilities/overlay/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const stage = page.locator('[data-vf-docs-overlay-stage]');
  const kind = page.locator('#overlay-kind');

  await page.locator('#overlay-placement').selectOption('top-end');
  await page.locator('#overlay-elevation').selectOption('strong');
  await page.locator('#overlay-theme').selectOption('dark');
  await page.locator('#overlay-direction').selectOption('rtl');
  await expect(stage).toHaveAttribute('dir', 'rtl');
  await expect(stage).toHaveAttribute('data-vf-theme', 'dark');
  const shadows = await stage.evaluate((element) => {
    const css = getComputedStyle(element);
    return [css.getPropertyValue('--vf-shadow-popover').trim(), css.getPropertyValue('--vf-shadow-lg').trim()];
  });
  expect(shadows[0]).toBe(shadows[1]);
  await stage.scrollIntoViewIfNeeded();
  await stage.getByRole('button', { name: 'Open Popover' }).click();
  const popover = page.locator('[data-vf-popover-content]');
  await expect(popover).toBeVisible();
  await expect(popover).toHaveAttribute('data-vf-placement', 'top-end');
  expect(await popover.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('overlay-utility-dark-rtl-popover-desktop.png') });
  await page.keyboard.press('Escape');
  await expect(popover).not.toBeVisible();

  await kind.selectOption('tooltip');
  await stage.getByRole('button', { name: 'Explain this control' }).focus();
  await expect(page.locator('[data-vf-tooltip-content]')).toBeVisible();
  await stage.getByRole('button', { name: 'Explain this control' }).evaluate((element) => element.blur());
  await kind.selectOption('preview-card');
  await stage.getByRole('button', { name: 'Preview profile' }).focus();
  await expect(page.locator('[data-vf-preview-card-content]')).toBeVisible();

  await kind.selectOption('dialog');
  await expect(page.locator('#overlay-placement')).toBeDisabled();
  await stage.getByRole('button', { name: 'Open Dialog' }).click();
  const dialog = page.locator('dialog[data-vf-dialog-root]');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(true);
  await dialog.getByRole('button', { name: 'Close Dialog' }).click();
  await expect(dialog).not.toBeVisible();

  await kind.selectOption('drawer');
  await stage.getByRole('button', { name: 'Open Drawer' }).click();
  const drawer = page.locator('dialog[data-vf-drawer-root]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('data-vf-placement', 'end');
  await drawer.getByRole('button', { name: 'Close Drawer' }).click();
  await expect(drawer).not.toBeVisible();
});

test('Overlay workbench remains usable at 320px and 200% text', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/next/react/utilities/overlay/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const stage = page.locator('[data-vf-docs-overlay-stage]');
  await stage.scrollIntoViewIfNeeded();
  await stage.getByRole('button', { name: 'Open Popover' }).click();
  await expect(page.locator('[data-vf-popover-content]')).toBeVisible();
  const width = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(width.page).toBeLessThanOrEqual(width.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath('overlay-utility-320px-200pct-popover.png') });
});

test('Motion utility is shared, discoverable and binds real public Web tokens', async ({ page }) => {
  const manifest = JSON.parse(readFileSync('dist/docs/next/react/site-manifest.json', 'utf8'));
  expect(manifest.utilities).toContainEqual({
    id: 'motion', route: 'utilities/motion/',
    source: 'documentation/utilities/motion.md',
    publicComponents: ['button', 'switch', 'disclosure', 'tabs', 'toast'],
    tokens: ['--vf-control-motion-duration', '--vf-motion-duration-enter', '--vf-motion-easing-standard',
      '--vf-motion-duration-loading-spin', '--vf-motion-duration-loading-shimmer',
      '--vf-motion-easing-loading'],
  });
  const html = readFileSync('dist/docs/next/react/utilities/motion/index.html', 'utf8');
  expect(html).toContain('assets/docs.css');
  expect(html).toContain('components/switch/switch.css');
  expect(html).toContain('/styles/foundation.css');
  expect(html).toContain('data-vf-docs-react-motion-utility');
  await page.goto('/next/react/utilities/motion/');
  const utility = page.locator('[data-vf-docs-react-motion-utility]');
  await expect(utility).toBeVisible();
  await expect(utility.getByRole('heading', { name: 'Motion utility' })).toBeVisible();
  await expect(utility.getByRole('heading', { name: 'Native Web usage' })).toHaveCount(0);
  await expect(utility.locator('[data-vf-docs-motion-effects] pre')).toContainText('<Motion effect=');
  const guideSources = await utility.locator('article pre code').allTextContents();
  expect(guideSources.join('\n')).not.toContain('<div data-vf-motion=');
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Motion' })).toHaveAttribute('aria-current', 'page');
  const tokenGuide = utility.locator('section[aria-labelledby="motion-existing-reusable-tokens"]');
  for (const role of ['controlDuration', 'entranceDuration', 'standardEasing',
    'loadingSpinDuration', 'loadingShimmerDuration', 'loadingEasing']) {
    await expect(tokenGuide).toContainText('tokens.motion.' + role);
  }
  await expect(tokenGuide).not.toContainText('--vf-control-motion-duration');
  await expect(utility.getByRole('heading', { name: 'Native Web customization' })).toHaveCount(0);
  expect(guideSources.join('\n')).not.toContain('--vf-control-motion-duration:');
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('reduced motion');
  await expect(page.locator('[data-vf-docs-react-results]')).toContainText('Motion utility');
});

test('Motion tokens affect multiple real controls without changing their state contracts', async ({ page }, testInfo) => {
  await page.goto('/next/react/utilities/motion/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const stage = page.locator('[data-vf-docs-motion-stage]');
  const button = stage.getByRole('button', { name: 'Run action' });
  const toggle = stage.getByRole('switch', { name: 'Option' });
  const durations = await stage.evaluate((node) => {
    const button = node.querySelector('button[data-vf-button]');
    const toggle = node.querySelector('input[data-vf-switch]');
    return [getComputedStyle(button).transitionDuration, getComputedStyle(toggle).transitionDuration];
  });
  expect(durations[0]).toContain('0.12s');
  expect(durations[1]).toContain('0.12s');
  await page.locator('#motion-duration').selectOption('fast');
  await page.locator('#motion-easing').selectOption('linear');
  await expect(stage).toHaveCSS('--vf-control-motion-duration', '80ms');
  await expect(stage).toHaveCSS('--vf-motion-easing-standard', 'linear');
  const source = page.locator('[data-vf-docs-react-motion-utility] details').filter({ hasText: 'View React token customization' });
  await expect(source.locator('pre')).toContainText('motion={{ controlDuration: "80ms", standardEasing: "linear" }}');
  await expect(source.locator('pre')).not.toContainText('--vf-');
  const customized = await stage.evaluate((node) => {
    const button = node.querySelector('button[data-vf-button]');
    const toggle = node.querySelector('input[data-vf-switch]');
    return [getComputedStyle(button).transitionDuration, getComputedStyle(toggle).transitionDuration];
  });
  expect(customized[0]).toContain('0.08s');
  expect(customized[1]).toContain('0.08s');
  await button.click();
  await expect(stage.locator('[data-vf-docs-motion-feedback]')).toContainText('Actions: 1');
  await toggle.check();
  await expect(stage.locator('[data-vf-docs-motion-feedback]')).toContainText('Switch: on');
  await page.locator('#motion-theme').selectOption('dark');
  await expect(stage).toHaveAttribute('data-vf-theme', 'dark');
  await stage.getByRole('button', { name: 'Start busy' }).click();
  await expect(stage.getByRole('button', { name: 'Busy', exact: true })).toHaveAttribute('aria-busy', 'true');
  const spinner = await stage.getByRole('button', { name: 'Busy', exact: true }).evaluate((node) => {
    const css = getComputedStyle(node, '::before');
    return { duration: css.animationDuration, name: css.animationName };
  });
  expect(spinner.name).toContain('vf-loading-spin');
  expect(spinner.duration).toContain('0.7s');
  await page.screenshot({ path: testInfo.outputPath('motion-react-dark-custom-controls.png') });
  await stage.getByRole('button', { name: 'Stop busy' }).click();
  await expect(stage.getByRole('button', { name: 'Ready' })).not.toHaveAttribute('aria-busy', 'true');
});

test('Motion reduced preference disables visual movement but leaves state and loading meaning intact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/next/react/utilities/motion/');
  const stage = page.locator('[data-vf-docs-motion-stage]');
  await page.locator('#motion-duration').selectOption('fast');
  const controls = await stage.evaluate((node) => {
    const button = node.querySelector('button[data-vf-button]');
    const toggle = node.querySelector('input[data-vf-switch]');
    return [getComputedStyle(button).transitionDuration, getComputedStyle(toggle).transitionDuration];
  });
  expect(controls).toEqual(['0s', '0s']);
  await stage.getByRole('button', { name: 'Run action' }).click();
  await stage.getByRole('switch', { name: 'Option' }).check();
  await expect(stage.locator('[data-vf-docs-motion-feedback]')).toContainText('Actions: 1. Switch: on.');
  await stage.getByRole('button', { name: 'Start busy' }).click();
  const busy = stage.getByRole('button', { name: 'Busy', exact: true });
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  const animation = await busy.evaluate((node) => getComputedStyle(node, '::before').animationName);
  expect(animation).toBe('none');
});

test('Motion utility keeps its live controls usable at 320px and 200% text', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/next/react/utilities/motion/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const stage = page.locator('[data-vf-docs-motion-stage]');
  await stage.scrollIntoViewIfNeeded();
  await stage.getByRole('button', { name: 'Run action' }).click();
  await expect(stage.locator('[data-vf-docs-motion-feedback]')).toContainText('Actions: 1');
  await page.locator('#motion-entrance-duration').selectOption('slow');
  await expect(page.locator('[data-vf-docs-motion-preview]')).toHaveCSS('animation-duration', '0.48s');
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1] + 1);
  await page.screenshot({ path: testInfo.outputPath('motion-react-320px-200pct.png') });
});

test('Motion effects expose six reusable real-Web CSS recipes on multiple React targets', async ({ page }, testInfo) => {
  await page.goto('/next/react/utilities/motion/');
  const area = page.locator('[data-vf-docs-motion-effects]');
  await expect(area.getByRole('heading', { name: 'Reusable entrance effects' })).toBeVisible();
  const sample = page.locator('[data-vf-docs-motion-preview]');
  const list = [
    ['fade', 'vf-motion-enter-fade'],
    ['grow', 'vf-motion-enter-grow'],
    ['slide', 'vf-motion-enter-slide'],
    ['zoom', 'vf-motion-enter-zoom'],
    ['fade-slide', 'vf-motion-enter-fade-slide'],
    ['pop', 'vf-motion-enter-pop'],
  ];
  await expect(sample).toHaveCSS('animation-duration', '0.32s');
  await page.locator('#motion-entrance-duration').selectOption('slow');
  await expect(sample).toHaveCSS('animation-duration', '0.48s');
  await page.locator('#motion-entrance-duration').selectOption('default');
  for (const [effect, animation] of list) {
    await page.locator('#motion-effect').selectOption(effect);
    await expect(sample).toHaveAttribute('data-vf-motion', effect);
    await expect.poll(async () => sample.evaluate((node) => getComputedStyle(node).animationName))
      .toBe(animation);
  }
  await page.locator('#motion-effect').selectOption('slide');
  await page.locator('#motion-origin').selectOption('inline-start');
  await page.locator('#motion-direction').selectOption('ltr');
  const ltr = await sample.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    return getComputedStyle(node).translate;
  });
  await page.locator('#motion-direction').selectOption('rtl');
  const rtl = await sample.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    return getComputedStyle(node).translate;
  });
  expect(ltr).not.toBe(rtl);
  await page.locator('#motion-target').selectOption('button');
  await expect(sample.getByRole('button', { name: 'Sample action' })).toBeVisible();
  await sample.getByRole('button', { name: 'Sample action' }).click();
  await expect(area.locator('[data-vf-docs-motion-sample-status]')).toContainText('Sample actions: 1');
  await page.locator('#motion-target').selectOption('switch');
  await expect(area.locator('pre')).toContainText('<Switch id="example-switch"');
  await sample.getByRole('switch', { name: 'Option' }).check();
  await expect(area.locator('[data-vf-docs-motion-sample-status]')).toContainText('Switch: on.');
  await page.locator('#motion-target').selectOption('group');
  await expect(sample.getByRole('button', { name: 'Sample action' })).toBeVisible();
  await expect(sample.getByRole('switch', { name: 'Option' })).toBeChecked();
  await area.getByRole('button', { name: 'Replay effect' }).click();
  await expect(sample).toHaveAttribute('data-vf-motion-sample', 'group');
  await page.screenshot({ path: testInfo.outputPath('motion-reusable-effects-react.png') });
});

test('Motion effects respect reduced motion even with consumer timing overrides', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/next/react/utilities/motion/');
  await page.locator('#motion-duration').selectOption('fast');
  await page.locator('#motion-effect').selectOption('zoom');
  await page.locator('#motion-entrance-duration').selectOption('slow');
  const sample = page.locator('[data-vf-docs-motion-preview]');
  await expect(sample).toHaveCSS('animation-name', 'none');
  await expect(sample.getByRole('button', { name: 'Sample action' })).toBeVisible();
  await sample.getByRole('button', { name: 'Sample action' }).click();
  await expect(page.locator('[data-vf-docs-motion-sample-status]')).toContainText('Sample actions: 1');
  await page.locator('#motion-target').selectOption('switch');
  await sample.getByRole('switch', { name: 'Option' }).check();
  await expect(sample.getByRole('switch', { name: 'Option' })).toBeChecked();
});

test('React built-in component motion uses the scoped tokens and never delays state', async ({ page }, testInfo) => {
  await page.goto('/next/react/utilities/motion/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const area = page.locator('[data-vf-docs-component-motion]');
  const trigger = area.getByRole('button', { name: 'Show details' });
  const panel = area.locator('[data-vf-disclosure-panel]');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  await expect(panel).toHaveCSS('animation-duration', '0.32s');
  await trigger.click();
  await expect(panel).toBeHidden();
  await page.locator('#motion-component-duration').selectOption('slow');
  await trigger.click();
  await expect(panel).toHaveCSS('animation-duration', '0.48s');
  await area.getByRole('tab', { name: 'Details' }).click();
  const tabPanel = area.getByRole('tabpanel', { name: 'Details' });
  await expect(tabPanel).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  await expect(tabPanel).toHaveCSS('animation-duration', '0.48s');
  await area.getByRole('button', { name: 'Show notification' }).click();
  const toast = area.locator('[data-vf-toast-root]');
  await expect(toast).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  await expect(toast).toHaveCSS('animation-duration', '0.48s');
  await page.screenshot({ path: testInfo.outputPath('motion-built-in-react.png') });
  await area.getByRole('button', { name: 'Dismiss motion notification' }).click();
  await expect(toast).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(panel).toHaveCSS('animation-name', 'none');
  await expect(tabPanel).toHaveCSS('animation-name', 'none');
  await area.getByRole('button', { name: 'Show notification' }).click();
  await expect(toast).toHaveCSS('animation-name', 'none');
  await area.getByRole('button', { name: 'Dismiss motion notification' }).click();
  await expect(toast).toHaveCount(0);
  await trigger.click();
  await expect(panel).toBeHidden();
});

test('React Motion active disables decoration while preserving the existing child state and node', async ({ page }) => {
  await page.goto('/next/react/utilities/motion/');
  const area = page.locator('[data-vf-docs-motion-effects]');
  const sample = area.locator('[data-vf-docs-motion-preview]');
  const child = sample.getByRole('switch', { name: 'Option' });
  await child.check();
  await child.evaluate((node) => { node.dataset.motionIdentity = 'preserved'; });
  await area.getByRole('switch', { name: 'Enable effect' }).uncheck();
  await expect(sample).toHaveCSS('animation-name', 'none');
  await expect(child).toBeChecked();
  await expect(child).toHaveAttribute('data-motion-identity', 'preserved');
  await area.getByRole('switch', { name: 'Enable effect' }).check();
  await expect(sample).toHaveCSS('animation-name', 'vf-motion-enter-fade');
  await expect(child).toHaveAttribute('data-motion-identity', 'preserved');
});

test('React native selection guides keep control APIs separate from group composition', async ({ page }) => {
  for (const [id, route] of [['checkbox', 'components/checkbox/'], ['radio', 'components/radio/'],
    ['checkbox-group', 'patterns/checkbox-group/'], ['radio-group', 'patterns/radio-group/']]) {
    await page.goto('/next/react/' + route);
    const guide = page.locator('[data-vf-docs-react-selection="' + id + '"]');
    await expect(guide).toBeVisible();
    await expect(guide.locator('iframe').first()).toBeVisible();
    await expect(guide.locator('iframe[src*="examples/' + id + '/"]').first()).toBeVisible();
    if (id.endsWith('-group')) await expect(guide.getByRole('link', { name: id === 'radio-group' ? 'Radio Group API' : 'Checkbox Group API' })).toHaveCount(0);
  }
});
test('React checkbox select-all derives mixed state and native labels operate on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/react/patterns/checkbox-group/');
  await page.locator('[data-vf-docs-react-selection-example="checkbox-group/select-all"] iframe').scrollIntoViewIfNeeded();
  const demo = page.frameLocator('[data-vf-docs-react-selection-example="checkbox-group/select-all"] iframe');
  const master = demo.getByRole('checkbox', { name: 'Select all available files' });
  await expect.poll(() => master.evaluate(el => el.indeterminate)).toBe(true);
  await master.click();
  await expect(master).toBeChecked();
  await expect.poll(() => master.evaluate(el => el.indeterminate)).toBe(false);
  await expect(demo.getByRole('checkbox', { name: 'Archive.zip — unavailable' })).toBeDisabled();
  await demo.getByRole('checkbox', { name: 'Summary.csv' }).uncheck();
  await expect.poll(() => master.evaluate(el => el.indeterminate)).toBe(true);
  await expect(demo.getByRole('status')).toHaveText('2 of 3 available files selected.');
  await master.focus();
  await master.press('Space');
  await expect(master).toBeChecked();
});
test('React radio native group validates, selects via arrows, submits and resets', async ({ page }) => {
  await page.goto('/next/react/patterns/radio-group/');
  await page.locator('[data-vf-docs-react-selection-example="radio-group/delivery"] iframe').scrollIntoViewIfNeeded();
  const demo = page.frameLocator('[data-vf-docs-react-selection-example="radio-group/delivery"] iframe');
  const standard = demo.getByRole('radio', { name: /Standard/ });
  const express = demo.getByRole('radio', { name: /Express/ });
  await demo.getByRole('button', { name: 'Confirm delivery' }).click();
  await expect(demo.getByRole('status')).toHaveText('No delivery confirmed.');
  await standard.check();
  await standard.press('ArrowRight');
  await expect(express).toBeChecked();
  await expect(standard).not.toBeChecked();
  await demo.getByRole('button', { name: 'Confirm delivery' }).click();
  await expect(demo.getByRole('status')).toHaveText('Confirmed: Express');
  await demo.getByRole('button', { name: 'Reset' }).click();
  await expect(express).not.toBeChecked();
  await expect(demo.getByRole('status')).toHaveText('No delivery confirmed.');
});

test('React selection guides render responsive light and dark previews and preserve form behavior', async ({ page }, testInfo) => {
  await page.goto('/next/react/patterns/checkbox-group/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  const preview = page.locator('[data-vf-docs-react-selection-example="checkbox-group/validation"] iframe');
  await preview.scrollIntoViewIfNeeded();
  const demo = preview.contentFrame();
  await expect(demo.locator('html')).toHaveAttribute('data-vf-theme', 'light');
  const submit = demo.getByRole('button', { name: 'Generate report' });
  const overview = demo.getByRole('checkbox', { name: 'Overview' });
  await submit.click();
  await expect(demo.getByRole('alert')).toHaveText('Choose at least one section.');
  await expect(overview).toHaveAttribute('aria-invalid', 'true');
  await overview.check();
  await expect(overview).not.toHaveAttribute('aria-invalid', 'true');
  await submit.click();
  await expect(demo.getByRole('status')).toHaveText('Report includes: Overview');
  await page.screenshot({ path: testInfo.outputPath('selection-checkbox-group-desktop-light.png') });
  await page.locator('#vf-react-theme').selectOption('dark');
  await expect(demo.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await expect(demo.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.setViewportSize({ width: 390, height: 844 });
  await preview.scrollIntoViewIfNeeded();
  expect(await demo.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('selection-checkbox-group-mobile-dark.png') });

  await page.goto('/next/react/patterns/radio-group/');
  const plans = page.locator('[data-vf-docs-react-selection-example="radio-group/plans"] iframe');
  await plans.scrollIntoViewIfNeeded();
  const radio = plans.contentFrame();
  await expect(radio.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await radio.getByRole('radio', { name: /Business/ }).check();
  await expect(radio.getByRole('status')).toHaveText('Business: $59 per month.');
  await radio.getByRole('button', { name: 'Restore original plan' }).click();
  await expect(radio.getByRole('radio', { name: /Team/ })).toBeChecked();
  expect(await radio.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('selection-radio-group-mobile-dark.png') });
});

test('all React component guide and API titles own exactly one standards disclosure when mapped', async ({ page, browser }, testInfo) => {
  const ids = ['button', 'toggle-button', 'toggle-group', 'checkbox', 'radio', 'layout', 'text', 'code', 'kbd', 'icon', 'divider', 'list', 'badge', 'avatar', 'image', 'chip'];
  for (const id of ids) {
    for (const prefix of ['components', 'api/components']) {
      await page.goto('/next/react/' + prefix + '/' + id + '/');
      const header = page.locator('article > header.vf-docs-component-header').first();
      const details = header.locator('h1 + [data-vf-docs-standards-disclosure]');
      await expect(details, prefix + '/' + id).toHaveCount(1);
      await expect(details).not.toHaveAttribute('open', '');
      await expect(details.locator(':scope > summary')).toHaveText('Accessibility standards');
      await expect(page.locator('[data-vf-docs-accessibility]')).toHaveCount(1);
      await expect(page.locator('article > section > h2').filter({ hasText: /^Accessibility(?:$|[ ,:])/ })).toHaveCount(0);
      await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: /^Accessibility(?:$|[ ,:])/ })).toHaveCount(0);
    }
  }
  for (const id of ['button-group', 'checkbox-group', 'radio-group']) {
    await page.goto('/next/react/patterns/' + id + '/');
    const header = page.locator('article > header.vf-docs-component-header').first();
    const count = await page.locator('[data-vf-docs-accessibility]').count();
    expect(count).toBeLessThanOrEqual(1);
    await expect(header.locator('h1 + [data-vf-docs-standards-disclosure]')).toHaveCount(count);
    await expect(page.locator('article > section > h2').filter({ hasText: /^Accessibility(?:$|[ ,:])/ })).toHaveCount(0);
  }
  // The native disclosure must remain operable after SSR with no script.
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
  const offline = await context.newPage();
  await offline.goto('/next/react/components/button/');
  const details = offline.locator('header h1 + [data-vf-docs-standards-disclosure]');
  const summary = details.locator(':scope > summary');
  await summary.focus();
  await offline.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(details.getByRole('link', { name: 'WCAG 2.2 AA (target)' })).toBeVisible();
  await offline.screenshot({ path: testInfo.outputPath('react-button-standards-mobile-open.png') });
  await context.close();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/next/react/components/button/');
  await page.screenshot({ path: testInfo.outputPath('react-button-standards-desktop-closed.png') });
  await page.locator('header h1 + [data-vf-docs-standards-disclosure] > summary').click();
  await page.screenshot({ path: testInfo.outputPath('react-button-standards-desktop-open.png') });
});

test('React Chip guide uses public components and supports independent selection/removal', async ({ page }) => {
  await page.goto('/next/react/components/chip/');
  const guide = page.locator('[data-vf-docs-react-chip]');
  await expect(guide.getByRole('heading', { name: 'Chip', level: 1 })).toBeVisible();
  await expect(guide.locator('section[aria-labelledby="react-chip-setup"] pre code')).toContainText("@vyrnforge/react/chip");
  const selectionFrame = guide.locator('[data-vf-docs-react-chip-example="chip/selection"] iframe');
  await selectionFrame.scrollIntoViewIfNeeded();
  const selection = selectionFrame.contentFrame();
  const filter = selection.getByRole('button', { name: 'Assigned to me' });
  await expect(filter).toHaveAttribute('aria-pressed', 'false');
  await filter.focus();
  await page.keyboard.press('Space');
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(selection.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  const removalFrame = guide.locator('[data-vf-docs-react-chip-example="chip/removal"] iframe');
  await removalFrame.scrollIntoViewIfNeeded();
  const removal = removalFrame.contentFrame();
  const remove = removal.getByRole('button', { name: 'Remove Design' });
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(remove).toHaveCount(0);
  await expect(removal.getByRole('button', { name: 'Remove Build' })).toBeFocused();
  await expect(removal.getByRole('button', { name: 'Build', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Chip API', exact: true }).click();
  await expect(page.locator('[data-vf-docs-react-api="chip"]')).toContainText('export type ChipProps');
});

test('React Chip responsive and forced-colors examples retain readable labels and independent targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/next/react/examples/chip/removal/');
  const chip = page.locator('[data-vf-chip]').first();
  const remove = page.getByRole('button', { name: 'Remove Design' });
  await expect(remove).toBeVisible();
  expect(await remove.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(24);
  await expect(chip).toHaveCSS('transition-duration', '0s');
  await page.locator('html').evaluate(el => { el.dir = 'rtl'; el.dataset.vfTheme = 'dark'; });
  expect(await page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: test.info().outputPath('chip-rtl-forced-colors.png'), fullPage: true });
});


test('React Chip actual-size appearance, artwork and removal evidence in light and dark', async ({ page }, testInfo) => {
  for (const [theme, width, height] of [['light', 1280, 720], ['dark', 390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const example of ['appearance', 'artwork', 'removal']) {
      await page.goto('/next/react/examples/chip/' + example + '/');
      await page.locator('html').evaluate((el, value) => { el.dataset.vfTheme = value; }, theme);
      await expect(page.locator('[data-vf-chip]').first()).toBeVisible();
      expect(await page.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath('chip-' + example + '-' + theme + '.png') });
    }
  }
});


test('React Chip navigation and removal remain separate native actions', async ({ page }) => {
  await page.goto('/next/react/examples/chip/links/');
  const link = page.getByRole('link', { name: 'Project link', exact: true });
  const remove = page.getByRole('button', { name: 'Remove Project link' });
  await expect(link).toHaveAttribute('href', '#chip-destination');
  await expect(link.locator('button')).toHaveCount(0);
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#chip-destination$/);
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(link).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Restore link' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Unavailable link' })).toHaveAttribute('aria-disabled', 'true');
  await page.goto('/next/react/examples/chip/action-removal/');
  await page.getByRole('button', { name: 'Design', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Design activations: 1');
  await page.getByRole('button', { name: 'Remove Draft' }).click();
  await expect(page.getByRole('status')).toHaveText('Design activations: 1');
  await expect(page.getByRole('button', { name: 'Design', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Draft' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove Design' }).click();
  await expect(page.getByRole('button', { name: 'Design', exact: true })).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Design activations: 1');
});

test('Old Chip playground route redirects to the shared guide playground', async ({ page }) => {
  await page.goto('/next/react/examples/chip/playground/');
  await expect(page).toHaveURL(/\/next\/react\/components\/chip\/#react-chip-playground$/);
  await expect(page.locator('[data-vf-docs-component-playground="Chip"]')).toBeVisible();
});


test('Chip guide teaches capabilities in contextual sections and renders intrinsic-size comparisons', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/next/react/components/chip/');
  const guide = page.locator('[data-vf-docs-react-chip]');
  for (const title of ['Basic chip', 'Actions', 'Adornment', 'Colors', 'Sizes', 'Multiline', 'Chip arrays', 'Playground']) {
    await expect(guide.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
  }
  await expect(guide.getByRole('heading', { name: 'Basic chip', exact: true })).toHaveCount(1);
  const basic = guide.locator('[data-vf-docs-react-chip-example="chip/basic"] iframe');
  await basic.scrollIntoViewIfNeeded();
  const chips = basic.contentFrame().locator('[data-vf-chip]');
  await expect(chips).toHaveCount(2);
  await expect(chips.nth(0)).toHaveAttribute('data-vf-chip-variant', 'filled');
  await expect(chips.nth(1)).toHaveAttribute('data-vf-chip-variant', 'outlined');
  expect(await chips.nth(0).evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(160);
  await page.screenshot({ path: testInfo.outputPath('chip-guide-desktop.png') });
  await page.goto('/next/react/examples/chip/multiline/');
  const multiline = page.locator('[data-vf-chip-wrap]');
  const single = page.locator('[data-vf-chip]').first();
  expect(await multiline.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(await single.evaluate(el => el.getBoundingClientRect().height));
  await page.screenshot({ path: testInfo.outputPath('chip-multiline-desktop.png') });
});


test('React Chip guide exposes circular default and unchanged custom removal artwork', async ({ page }, testInfo) => {
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 760, height: 260 });
    await page.goto('/next/react/examples/chip/deletable/');
    await page.locator('html').evaluate((el, value) => { el.dataset.vfTheme = value; }, theme);
    const mark = page.locator('[data-vf-chip-default-remove]');
    await expect(mark).toHaveCount(2);
    await expect(mark.first()).toHaveCSS('border-radius', '50%');
    await expect(mark.locator('svg[data-vf-icon]')).toHaveCount(2);
    await page.screenshot({ path: testInfo.outputPath('chip-deletable-' + theme + '.png') });
    await page.goto('/next/react/examples/chip/custom-delete/');
    await expect(page.locator('[data-vf-chip-remove] [data-vf-icon]')).toHaveCount(2);
    await expect(page.locator('[data-vf-chip-default-remove]')).toHaveCount(0);
    const custom = page.locator('[data-vf-chip-remove]').first();
    await custom.hover();
    expect(await custom.evaluate(el => getComputedStyle(el, '::before').borderRadius)).toBe('50%');
    await expect(custom).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.screenshot({ path: testInfo.outputPath('chip-custom-delete-' + theme + '.png') });
  }
});


test('React Chip actual pointer actions do not leak between the surface and close target', async ({ page }) => {
  await page.goto('/next/react/examples/chip/action-removal/');
  const primary = page.getByRole('button', { name: 'Design', exact: true });
  const chip = primary.locator('..');
  const remove = page.getByRole('button', { name: 'Remove Design' });
  const mark = remove.locator('[data-vf-chip-default-remove]');
  await expect(primary).toBeVisible();
  const primaryBounds = await primary.boundingBox();
  const removalBounds = await remove.boundingBox();
  expect(primaryBounds.x + primaryBounds.width).toBeGreaterThanOrEqual(removalBounds.x + removalBounds.width);
  // The primary's leading edge and the small trailing gutter are independent of removal.
  await page.mouse.click(primaryBounds.x + 3, primaryBounds.y + primaryBounds.height / 2);
  await page.mouse.click((removalBounds.x + removalBounds.width + primaryBounds.x + primaryBounds.width) / 2, primaryBounds.y + primaryBounds.height / 2);
  await expect(page.getByRole('status')).toHaveText('Design activations: 2');
  await expect(chip).toBeVisible();
  await mark.click();
  await expect(chip).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Design activations: 2');
});

test('React Loading guide reuses the shared playground and native progress', async ({ page }) => {
  await page.goto('/next/react/patterns/loading/');
  const playground = page.locator('[data-vf-docs-component-playground="Loading"]');
  await expect(playground.locator('[data-vf-loading-indicator]')).toBeVisible();
  await playground.getByRole('radio', { name: 'progress', exact: true }).check();
  const progress = playground.getByRole('progressbar');
  await expect(progress).toHaveJSProperty('value', 48);
  await playground.getByRole('checkbox', { name: 'Indeterminate' }).check();
  await expect(progress).not.toHaveAttribute('value');
  await playground.getByRole('radio', { name: 'placeholder', exact: true }).check();
  await expect(playground.locator('[data-vf-loading-placeholder]')).toBeVisible();
  await expect(page.frameLocator('iframe[title*="Loading presentations"]').locator('[data-vf-loading-indicator]').first()).toBeVisible();
  await page.goto('/next/react/api/patterns/loading/');
  await expect(page.getByRole('heading', { name: 'Loading API', exact: true })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-api="loading"]')).toContainText('LoadingProgress');
});

test('React Backdrop guide reuses the shared playground and preserves an interactive underlying control', async ({ page }) => {
  await page.goto('/next/react/components/backdrop/');
  const playground = page.locator('[data-vf-docs-component-playground="Backdrop"]');
  const scrim = playground.locator('[data-vf-backdrop]');
  await expect(scrim).toBeVisible();
  await expect(scrim).toHaveCSS('pointer-events', 'none');
  await playground.getByRole('button', { name: 'View statement' }).click();
  await expect(playground.getByRole('button', { name: 'View statement' })).toBeFocused();
  await playground.getByRole('checkbox', { name: 'Hidden' }).check();
  await expect(scrim).toBeHidden();
  await page.goto('/next/react/api/components/backdrop/');
  await expect(page.getByRole('heading', { name: 'Backdrop API', exact: true })).toBeVisible();
});

test('Status Indicator and Alert use shared playground with explicit announcement and independent dismissal', async ({page}) => {
  await page.goto('/next/react/components/status-indicator/');
  const status = page.locator('[data-vf-docs-component-playground="Status Indicator"]');
  await expect(status.locator('[data-vf-status-indicator]')).toHaveText('Connected');
  await status.getByRole('combobox',{name:'Severity'}).selectOption('critical');
  await expect(status.locator('[data-vf-status-indicator]')).toHaveAttribute('data-vf-feedback-severity','critical');
  await page.goto('/next/react/components/alert/');
  const alert = page.locator('[data-vf-docs-component-playground="Alert"]');
  await alert.getByRole('combobox',{name:'Severity'}).selectOption('critical');
  await expect(alert.locator('[data-vf-alert-message]')).not.toHaveAttribute('role');
  await alert.getByRole('radio',{name:'assertive',exact:true}).check();
  await expect(alert.locator('[data-vf-alert-message]')).toHaveAttribute('role','alert');
  await alert.getByRole('checkbox',{name:'Dismissible'}).check();
  await alert.getByRole('button',{name:'Dismiss feedback'}).click();
  await expect(alert.locator('[data-vf-alert]')).toHaveCount(0);
  await expect(alert.getByRole('button',{name:'Restore message'})).toBeFocused();
});

test('React feedback modal and Toast guides use native interaction and shared playgrounds', async ({ page }) => {
  test.setTimeout(90_000);
  for (const [id, title, role, close] of [
    ['dialog', 'Dialog', 'dialog', 'Close'],
    ['alert-dialog', 'AlertDialog', 'alertdialog', 'Cancel'],
    ['drawer', 'Drawer', 'dialog', 'Close'],
  ]) {
    await page.goto('/next/react/components/' + id + '/');
    const playground = page.locator('[data-vf-docs-react-' + id + '] [data-vf-docs-component-playground]');
    const trigger = playground.getByRole('button', { name: 'Open ' + id.replace('-', ' ') });
    await trigger.click();
    const modal = playground.getByRole(role);
    await expect(modal).toBeVisible();
    expect(await modal.evaluate(element => element.matches(':modal'))).toBe(true);
    await modal.getByRole('button', { name: close, exact: true }).click();
    await expect(modal).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await page.goto('/next/react/components/toast/');
  const toast = page.locator('[data-vf-docs-component-playground="Toast"]');
  await toast.getByRole('checkbox', { name: 'Persistent' }).check();
  await toast.getByRole('button', { name: 'Show notification' }).click();
  await expect(toast.getByRole('status')).toBeVisible();
  await toast.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(toast.getByRole('status')).toHaveCount(0);
});
test('Feedback composition guides have executable examples and no fictional package API', async ({ page }) => {
  for (const id of ['banner', 'empty-state', 'inline-feedback', 'feedback-composition']) {
    await page.goto('/next/react/patterns/' + id + '/');
    const guide = page.locator('[data-vf-docs-react-' + id + ']');
    await expect(guide).toBeVisible();
    await expect(guide.locator('iframe')).toHaveCount(1);
    await expect(guide.locator('iframe').contentFrame().locator('#root')).not.toBeEmpty();
    await expect(guide.getByRole('link', { name: /public React API/ })).toHaveCount(0);
  }
});

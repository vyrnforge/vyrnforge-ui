import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
import { compileFrameworkDocumentation } from '../../../../tooling/docs/framework-documentation.mjs';

test('React pilot artifact is Product Graph-backed and SSR-rendered with public React components', () => {
  const manifestPath = 'dist/docs/next/react/site-manifest.json';
  expect(existsSync(manifestPath)).toBe(true);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const button = compileFrameworkDocumentation('react').componentCatalog.find((entry) => entry.id === 'button');
  expect(manifest.framework).toBe('react');
  expect(manifest.status).toBe('button-layout-typography-icon-image-divider-avatar-pilot');
  expect(manifest.button.sharedSourcePath).toBe(button.sharedSourcePath);
  expect(manifest.button.frameworkSourcePath).toBe(button.frameworkSourcePath);
  expect(manifest.button.publicEntrypoints).toContain('@vyrnforge/react/button');
  expect(manifest.layout).toMatchObject({ guideOnly: false, api: true,
    publicEntrypoints: ['@vyrnforge/react/layout'], cssRecipeStyle: '@vyrnforge/web/styles/layout.css' });
  expect(manifest.layout.examples).toHaveLength(7);
  expect(manifest.layout.examples.map((example) => example.id)).toContain('layout/dividers');
  expect(manifest.routes.filter((entry) => entry.view !== 'unavailable').map((entry) => entry.route)).toEqual([
    '', 'foundations/tokens/', 'foundations/themes/', 'foundations/color/', 'foundations/dark-mode/',
    'foundations/right-to-left/', 'foundations/styling/', 'components/button/', 'api/components/button/', 'components/layout/', 'api/components/layout/',
    'components/divider/', 'api/components/divider/', 
    ...['text', 'code', 'kbd'].flatMap((id) => [
      'components/' + id + '/', 'api/components/' + id + '/',
    ]),
    'components/icon/', 'api/components/icon/',
    'components/image/', 'api/components/image/',
    'components/avatar/', 'api/components/avatar/',
  ]);
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
    guideRoute: 'components/icon/', apiRoute: 'api/components/icon/',
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
  await expect(nav.getByRole('link', { name: 'Color', exact: true })).toBeVisible();
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
  await expect(page.locator('[data-vf-docs-react-results]')).toContainText('Color');
});

test('Color playground previews a complete accent family and shows live semantic CSS swatches', async ({ page }) => {
  await page.goto('/next/react/foundations/color/');
  const guide = page.locator('[data-vf-docs-react-color]');
  await expect(guide.getByRole('heading', { name: 'Color', level: 1 })).toBeVisible();
  const selector = guide.locator('[data-vf-docs-color-picker]');
  const selected = guide.locator('[data-vf-docs-color-selected]');
  const background = () => selected.getByRole('button', { name: 'Save changes' })
    .evaluate((node) => getComputedStyle(node).backgroundColor);
  const blue = await background();
  await selector.getByRole('button', { name: 'Teal' }).click();
  await expect(selected).toHaveAttribute('data-vf-docs-color-selected', 'teal');
  await expect(selector.getByRole('button', { name: 'Teal' })).toHaveAttribute('aria-pressed', 'true');
  expect(await background()).not.toBe(blue);
  await selected.getByRole('button', { name: 'Save changes' }).click();
  await expect(selected.locator('[data-vf-docs-preview-feedback]')).toHaveText('Primary preview action activated');
  await expect(guide.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(3);
  await expect(guide.locator('[data-vf-docs-color-roles] li')).toHaveCount(8);
  await expect(guide.locator('pre code').first()).toContainText('--vf-color-accent-background: #0f766e');
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
    await expect(sections, id + ' must preserve five semantic guide sections').toHaveCount(5);
    const toc = page.locator('nav.vf-docs-toc ol[data-vf-flow]');
    await expect(toc).toHaveCount(1);
    const jumpLinks = guide.locator('nav.vf-docs-example-links ul[data-vf-flow-direction="inline"][data-vf-flow-wrap="wrap"]');
    await expect(jumpLinks, id + ' example navigation must use Flow inline wrapping').toHaveCount(1);
    const related = guide.locator('ul.vf-docs-related-links[data-vf-flow][data-vf-flow-gap="sm"]');
    await expect(related).toHaveCount(1);
    const headers = guide.locator('.vf-docs-example-header[data-vf-flow-direction="inline"]');
    expect(await headers.count(), id + ' examples must use Flow headers').toBeGreaterThan(0);
    await expect(guide.locator('p[data-vf-text]').first()).toBeVisible();
    expect(await guide.locator('.vf-docs-example-header h3[data-vf-text]').count(),
      id + ' example titles must use public Text').toBeGreaterThan(0);
    expect(await guide.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    expect(await jumpLinks.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
    const standards = guide.locator('.vf-docs-standards[data-vf-flow]');
    await expect(standards).toHaveCount(1);
    const mapped = standards.locator('ul[aria-label="Mapped WCAG criteria"]');
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
    .getByText('Standards and evidence mapping', { exact: true });
  await disclosure.click();
  await expect(standards.getByRole('heading', { name: 'Accessibility evidence' })).toBeVisible();
  await expect(standards.getByRole('link', { name: /WCAG 2\.2/ })).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  await expect(standards.locator('details')).not.toHaveAttribute('open', '');
  await standards.locator('summary').click();
  await expect(standards.locator('details')).toHaveAttribute('open', '');
  await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
  await expect(page.locator('[data-vf-side-nav]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('[data-vf-docs-react-feedback]')).toHaveText('Save changes activated');
  await expect(page.frameLocator('iframe[title="Checked-in React Button example"]')
    .getByRole('button', { name: 'Save changes', exact: true })).toBeVisible();
  const source = page.getByText('View checked-in React source');
  await source.click();
  await expect(page.locator('article[data-vf-docs-react-component] pre').last()).toContainText("from '@vyrnforge/react/button'");
  await expect(page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' })).toHaveAttribute('href', '../../../native-web/components/button/');
  expect(errors).toEqual([]);
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
  await expect(results.getByRole('link', { name: 'Button API' })).toBeVisible();
  await expect(results.getByRole('link', { name: 'React overview' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search React documentation' })).toBeFocused();
  await expect(results).toBeHidden();

  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Button API' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-api="button"] [data-vf-docs-accessibility]')).toBeVisible();
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
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' }).focus();
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
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' })).toBeVisible();
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
      .getByRole('link', { name: 'Button API' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-vf-react-hydrated', 'true');
    await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' }).click();
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
  await expect(guide.getByRole('navigation', { name: 'Divider examples' }).getByRole('link')).toHaveCount(5);
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
  await layoutGuide.getByText('Standards and evidence mapping', { exact: true }).click();
  const accessibility = layoutGuide.locator('[data-vf-docs-accessibility]');
  await expect(accessibility).toContainText('Accessibility review required');
  await accessibility.locator('summary').click();
  const mappedCriteria = accessibility.getByRole('list', { name: 'Mapped WCAG criteria' });
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
    const standards = guide.getByText('Standards and evidence mapping', { exact: true });
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
    'Accessibility', 'Related components and API',
  ];
  for (const id of ['button', 'layout', 'code', 'kbd']) {
    await page.goto('/next/react/components/' + id + '/');
    const selector = id === 'button' ? '[data-vf-docs-react-component="button"]'
      : id === 'layout' ? '[data-vf-docs-react-layout]'
      : '[data-vf-docs-react-typography="' + id + '"]';
    const guide = page.locator(selector);
    await expect(guide).toHaveCount(1);
    expect(await guide.locator(':scope > section > h2').allTextContents()).toEqual(expected);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc.getByRole('link')).toHaveCount(5);
    await expect(toc.getByRole('link', { name: 'Examples' })).toBeVisible();
    await expect(guide.locator('header [data-vf-docs-accessibility]')).toHaveCount(0);
    await expect(guide.getByRole('heading', { name: /^Shared .* semantics$/ })).toHaveCount(0);
    await expect(guide.getByText('Standards and evidence mapping')).toBeVisible();
    await expect(guide.getByRole('link', { name: /public React API|React API/ })).toHaveAttribute(
      'href', /api\/components\//);
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(nav.getByText('API Reference', { exact: true })).toBeVisible();
    // API links remain routed and searchable, but are not embedded in the
    // Components, Typography or Layout & Structure navigation groups.
    await expect(nav.getByRole('link', { name: 'Button API' })).toBeVisible();
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
    'Get started', 'Examples', 'Usage guidelines', 'Accessibility', 'Related components and API',
  ]);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(5);
  await expect(guide.getByText('Standards and evidence mapping')).toBeVisible();
  await expect(guide.getByRole('navigation', { name: 'Icon examples' }).getByRole('link')).toHaveCount(8);

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
    await expect(guide.getByRole('heading', { name: 'Accessibility', level: 2 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(5);
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
  await expect(cards).toHaveCount(5);
  await expect(guide.getByRole('navigation', { name: 'Button examples' }).getByRole('link')).toHaveCount(5);
  for (const id of ['basic', 'variants', 'sizes', 'states', 'forms']) {
    const card = guide.locator('[data-vf-docs-react-button-example="button/' + id + '"]');
    await expect(card).toHaveCount(1);
    await expect(card.locator('iframe')).toHaveAttribute('src', /examples\/button/);
    await card.locator('iframe').scrollIntoViewIfNeeded();
    await expect(card.locator('iframe').contentFrame().locator('#root button').first()).toBeVisible();
    await card.locator('summary').click();
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
    'Get started', 'Examples', 'Usage guidelines', 'Accessibility',
    'Related components and API',
  ]);
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link')).toHaveCount(5);
  await expect(toc.getByRole('link', { name: 'Usage guidelines' }))
    .toHaveAttribute('href', '#react-typography-guidelines');
  await expect(guide.getByRole('heading', { name: 'When to use' })).toHaveCount(1);
  await expect(guide.getByRole('heading', { name: 'When not to use' })).toHaveCount(1);
  await expect(guide.getByRole('heading', { name: 'Shared Text semantics' })).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'React Text integration' })).toHaveCount(0);
  await expect(guide.locator('header [data-vf-docs-accessibility]')).toHaveCount(0);
  const startCode = guide.locator('section[aria-labelledby="react-typography-setup"] pre code');
  await expect(startCode).toContainText("import { Text } from '@vyrnforge/react/text'");
  await expect(startCode).toContainText('<Text as="h2" variant="heading-md">');
  await expect(guide.getByText('`' + '`' + '`tsx')).toHaveCount(0);
  await expect(guide.getByRole('heading', { name: 'Choosing a semantic host' })).toBeVisible();
  const standardDisclosure = guide.getByText('Standards and evidence mapping', { exact: true });
  await standardDisclosure.click();
  await expect(guide.getByRole('heading', { name: 'Accessibility evidence' })).toBeVisible();
  await expect(guide.getByRole('link', { name: /WCAG 2\.2/ })).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  await standardDisclosure.click();
  const gallery = guide.locator('[data-vf-docs-react-usage-gallery="text"]');
  const cards = gallery.locator('[data-vf-docs-react-typography-example]');
  await expect(cards).toHaveCount(3);
  await expect(gallery.getByRole('navigation', { name: 'Text examples' }).getByRole('link')).toHaveCount(3);
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
  await expect(gallery.getByRole('link', { name: 'Visual type scale' })).toHaveAttribute(
    'href', '#react-typography-text-type-scale');
  await gallery.getByRole('link', { name: 'Visual type scale' }).click();
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

test('React Avatar guide shows initials, native photo, failed-image fallback and API', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('/next/react/components/avatar/');
  const guide = page.locator('[data-vf-docs-react-avatar]');
  await expect(guide.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
  await expect(guide.getByRole('navigation', { name: 'Avatar examples' }).getByRole('link')).toHaveCount(10);
  await expect(guide.getByRole('heading', { name: 'Image and initials' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Sizes and appearance' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Appearances and fallback' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Grouped avatars and totals' })).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Group spacing', exact: true })).toBeVisible();
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
    'Get started', 'Examples', 'Usage guidelines', 'Accessibility', 'Related components and API',
  ]);
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(5);
  await expect(guide.getByRole('navigation', { name: 'Image examples' }).getByRole('link')).toHaveCount(4);
  await expect(guide.getByText('Standards and evidence mapping')).toBeVisible();

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

import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
import { build } from 'esbuild';
import ts from 'typescript';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeConfiguration, defaultsFor } from '../../playground-config.mjs';
import { buttonPlayground, checkboxPlayground, radioPlayground, avatarPlayground, badgePlayground, chipPlayground, togglePlayground, dividerPlayground, listPlayground, loadingPlayground, backdropPlayground, inputPlayground, textareaPlayground, textFieldPlayground } from '../../react-playground-adapters.mjs';

test('Button playground keeps configuration, interaction and generated usage synchronized', async ({ page }) => {
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  const preview = playground.getByRole('region', { name: 'Button preview' });
  const button = preview.getByRole('button', { name: 'Save changes' });
  const code = playground.getByRole('region', { name: 'Generated React usage' });
  await playground.getByRole('radio', { name: 'secondary', exact: true }).check();
  await playground.getByRole('radio', { name: 'lg', exact: true }).check();
  await expect(button).toHaveAttribute('data-vf-variant', 'secondary');
  await expect(button).toHaveAttribute('data-vf-size', 'lg');
  await expect(code).toContainText('variant="secondary"');
  await button.focus();
  await button.press('Space');
  await expect(preview.getByRole('status')).toHaveText('Activations: 1');
  await playground.getByRole('button', { name: 'Busy and disabled' }).click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await playground.getByRole('button', { name: 'Reset playground' }).click();
  await expect(button).toBeEnabled();
  await expect(code).not.toContainText(/<Button[^>]*\bvariant=/);
  await expect(preview.getByRole('status')).toBeEmpty();
});

test('Checkbox and Radio playground previews update configuration and source', async ({ page }) => {
  await page.goto('/next/react/components/checkbox/');
  const checkbox = page.locator('[data-vf-docs-component-playground="Checkbox"]');
  const preview = checkbox.getByRole('region', { name: 'Checkbox preview' });
  await checkbox.getByRole('radio', { name: 'sm', exact: true }).check();
  await expect(preview.getByRole('checkbox')).toHaveAttribute('data-vf-size', 'sm');
  await expect(checkbox.getByRole('region', { name: 'Generated React usage' })).toContainText('size="sm"');
  await checkbox.getByRole('radio', { name: 'lg', exact: true }).check();
  await expect(preview.getByRole('checkbox')).toHaveCSS('width', '28px');
  await checkbox.getByRole('radio', { name: 'mixed', exact: true }).check();
  await expect(preview.getByRole('checkbox')).toHaveJSProperty('indeterminate', true);
  await preview.getByRole('checkbox').click();
  await expect(checkbox.getByRole('radio', { name: 'checked', exact: true })).toBeChecked();
  await expect(checkbox.getByRole('region', { name: 'Generated React usage' })).toContainText('defaultChecked');

  await page.goto('/next/react/components/radio/');
  const radio = page.locator('[data-vf-docs-component-playground="Radio"]');
  const radioPreview = radio.getByRole('region', { name: 'Radio preview' });
  await radioPreview.getByRole('radio', { name: 'Standard' }).focus();
  await radioPreview.getByRole('radio', { name: 'Standard' }).press('ArrowRight');
  await expect(radioPreview.getByRole('radio', { name: 'Express' })).toBeChecked();
  await expect(radio.getByRole('region', { name: 'Generated React usage' })).toContainText('<Radio name="delivery" value="express" defaultChecked');
});

test('Playground preserves source and reflows at narrow widths with clipboard denied', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: () => Promise.reject(new Error('denied')),
    } });
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  await expect(playground.getByRole('button', { name: 'Copy code' })).toBeEnabled();
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-dark.png') });
  await playground.getByRole('button', { name: 'Copy code' }).click();
  await expect(playground.getByRole('region', { name: 'Generated React usage' }).locator('pre')).toBeFocused();
  await expect(playground.getByText('Source selected. Use your device copy command.')).toBeVisible();
  await expect(playground).toBeVisible();
  expect(await page.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-copy-fallback.png') });
});

test('Playground desktop and accessibility adaptations', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  await expect(playground.getByRole('radio', { name: 'secondary' })).toBeEnabled();
  await playground.screenshot({ path: testInfo.outputPath('playground-desktop-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await playground.screenshot({ path: testInfo.outputPath('playground-desktop-dark.png') });
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => {
    return await window.axe.run('[data-vf-docs-component-playground="Button"]', {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    });
  });
  expect(results.violations).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.dataset.vfDensity = 'compact'; });
  await playground.getByRole('radio', { name: 'ghost' }).check();
  await expect(playground.getByRole('region', { name: 'Button preview' }).getByRole('button'))
    .toHaveAttribute('data-vf-variant', 'ghost');
  await playground.screenshot({ path: testInfo.outputPath('playground-rtl-forced-colors.png') });
});

test('Avatar and Badge conditionally expose valid controls and generate actual public usage', async ({ page }) => {
  await page.goto('/next/react/components/avatar/');
  const avatar = page.locator('[data-vf-docs-component-playground="Avatar"]');
  await avatar.getByRole('radio', { name: 'icon', exact: true }).check();
  await expect(avatar.getByRole('textbox', { name: 'Custom initials' })).toBeDisabled();
  await expect(avatar.getByRole('region', { name: 'Avatar preview' }).locator('[data-vf-avatar]'))
    .toHaveAttribute('data-vf-avatar-appearance', 'icon');
  await expect(avatar.getByRole('region', { name: 'Generated React usage' })).toContainText('icon={<Icon icon={userIcon} />}');
  await page.goto('/next/react/components/badge/');
  const badge = page.locator('[data-vf-docs-component-playground="Badge"]');
  await badge.getByRole('spinbutton', { name: 'Count', exact: true }).fill('127');
  const preview = badge.getByRole('region', { name: 'Badge preview' });
  await expect(preview.locator('[data-vf-badge-indicator]')).toHaveText('99+');
  await expect(preview.getByRole('button', { name: 'Inbox, 127 unread messages' })).toBeVisible();
  await badge.getByRole('radio', { name: 'dot', exact: true }).check();
  await expect(badge.getByRole('spinbutton', { name: 'Count', exact: true })).toBeDisabled();
  await expect(badge.getByRole('region', { name: 'Generated React usage' })).not.toContainText('badgeContent');
});

test('Chip guide uses the shared playground, with valid source and removal focus', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/chip/');
  const playground = page.locator('[data-vf-docs-component-playground="Chip"]');
  const preview = playground.getByRole('region', { name: 'Chip preview' });
  await playground.getByRole('radio', { name: 'selectable' }).check();
  await playground.getByRole('checkbox', { name: 'Deletable' }).check();
  await playground.getByRole('checkbox', { name: 'Custom delete icon' }).check();
  await preview.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(playground.getByRole('checkbox', { name: 'Selected' })).toBeChecked();
  await expect(playground.getByRole('region', { name: 'Generated React usage' })).toContainText('defaultSelected');
  await preview.getByRole('button', { name: 'Remove Engineering' }).click();
  await expect(preview.getByRole('button', { name: 'Restore' })).toBeFocused();
  await playground.getByRole('button', { name: 'Reset playground' }).click();
  await expect(preview.locator('[data-vf-chip]')).toBeVisible();
  await expect(playground.getByRole('checkbox', { name: 'Custom delete icon' })).toBeDisabled();
  await playground.screenshot({ path: testInfo.outputPath('chip-shared-playground-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await playground.screenshot({ path: testInfo.outputPath('chip-shared-playground-mobile.png') });
});

test('Generated playground examples typecheck and bundle against installed public entrypoints', async () => {
  test.setTimeout(90_000);
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const scenarios = [
    [buttonPlayground, {}], [buttonPlayground, { variant: 'secondary', size: 'lg', loading: true, disabled: true, label: '<Save>{x}' }],
    [checkboxPlayground, { selection: 'mixed', required: true }], [checkboxPlayground, { presentation: 'standalone' }], [checkboxPlayground, { presentation: 'icon label' }], [checkboxPlayground, { presentation: 'label and description', selection: 'mixed' }], [radioPlayground, { selection: 'express' }], [radioPlayground, { size: 'lg', selection: 'none', orientation: 'horizontal', invalid: true, required: true }], [radioPlayground, { presentation: 'label and description', size: 'sm' }], [radioPlayground, { presentation: 'icon label' }],
    [avatarPlayground, { appearance: 'icon', decorative: true, size: 'lg', shape: 'square' }],
    [avatarPlayground, { initials: 'VF' }], [badgePlayground, { variant: 'dot', tone: 'danger' }],
    [badgePlayground, { count: 127, max: 50, horizontal: 'start', showZero: true }],
    [chipPlayground, {}], [chipPlayground, { mode: 'action', artwork: 'avatar', size: 'sm' }],
    [chipPlayground, { mode: 'selectable', selected: true, artwork: 'icon', removable: true, customRemove: true }],
    [chipPlayground, { mode: 'link', artwork: 'trailing', removable: true, wrap: true }],
    [buttonPlayground, { artwork: 'icon only' }], [togglePlayground, { iconOnly: true, pressed: true }],
    [dividerPlayground, { orientation: 'vertical', textDirection: 'bottom-to-top', textAlign: 'end' }],
    [listPlayground, { as: 'ol', variant: 'divided', marker: 'auto', gutter: 'lg', dividerInset: 'gutter' }],
    [loadingPlayground, {}], [loadingPlayground, { presentation: 'progress', value: 72 }],
    [loadingPlayground, { presentation: 'placeholder', shape: 'circle' }], [loadingPlayground, { presentation: 'custom' }],
    [backdropPlayground, {}], [backdropPlayground, { hidden: true, opacity: 0.5 }],
    [inputPlayground, { type: 'email', required: true }], [textareaPlayground, { rows: '5', invalid: true }],
    [textFieldPlayground, {}], [textFieldPlayground, { multiline: true, autosize: true, fieldSize: 'lg', error: 'Try again' }],
    [textFieldPlayground, { leadingIcon: true, prefix: '$', variant: 'filled', fullWidth: true }],
    [textFieldPlayground, { variant: 'underlined', labelPlacement: 'floating' }],
    [textFieldPlayground, { variant: 'outlined', labelPlacement: 'outside' }],
  ];
  const generated = new Map(scenarios.map(([adapter, patch], index) => [
    path.join(root, 'apps/docs', 'generated-playground-' + index + '.tsx'),
    adapter.source(normalizeConfiguration(adapter.fields, { ...defaultsFor(adapter.fields), ...patch })),
  ]));
  const options = { noEmit: true, strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, esModuleInterop: true };
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host);
  const exists = host.fileExists.bind(host);
  const get = host.getSourceFile.bind(host);
  host.fileExists = name => generated.has(name) || exists(name);
  host.readFile = name => generated.get(name) ?? read(name);
  host.getSourceFile = (name, version, ...args) => generated.has(name)
    ? ts.createSourceFile(name, generated.get(name), version, true, ts.ScriptKind.TSX)
    : get(name, version, ...args);
  const program = ts.createProgram([...generated.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  expect(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);
  // Prove the displayed imports alone resolve browser wrappers and extract canonical component CSS.
  for (const [name, source] of generated) {
    expect(source).not.toContain('@vyrnforge/web/styles');
    const output = await build({ stdin: { contents: source, sourcefile: name, resolveDir: root, loader: 'tsx' },
      bundle: true, write: false, metafile: true, platform: 'browser', format: 'esm', jsx: 'automatic',
      outdir: path.join(root, 'dist', 'playground-source-check'), logLevel: 'silent' });
    expect(output.outputFiles.some(file => file.path.endsWith('.js'))).toBe(true);
    const css = output.outputFiles.find(file => file.path.endsWith('.css'));
    expect(css?.text).toBeTruthy();
    const componentImports = [...source.matchAll(/from '@vyrnforge\/react\/([a-z-]+)'/g)].map(match => match[1]);
    expect(componentImports.length).toBeGreaterThan(0);
    for (const component of componentImports) {
      expect(Object.keys(output.metafile.inputs).some(input => input.endsWith('/components/' + component + '/browser.js'))).toBe(true);
      expect(Object.keys(output.metafile.inputs).some(input => input.endsWith('/components/' + component + '/' + component + '.css'))).toBe(true);
    }
    expect(css.text).not.toMatch(/@layer\s+vyrnforge\.reset\s*\{/);
  }
});

test('Chip shared playground covers old link, artwork, custom removal, wrapping and reset scenarios', async ({ page }) => {
  await page.goto('/next/react/components/chip/');
  const playground = page.locator('[data-vf-docs-component-playground="Chip"]');
  const preview = playground.getByRole('region', { name: 'Chip preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  await playground.getByRole('textbox', { name: 'Label' }).fill('Frontend');
  await playground.getByRole('radio', { name: 'link', exact: true }).check();
  await playground.getByRole('radio', { name: 'outlined', exact: true }).check();
  await playground.getByRole('combobox', { name: 'Tone' }).selectOption('success');
  await expect(preview.locator('[data-vf-chip]')).toHaveAttribute('data-vf-chip-tone', 'success');
  await playground.getByRole('combobox', { name: 'Tone' }).selectOption('danger');
  await playground.getByRole('radio', { name: 'lg', exact: true }).check();
  await playground.getByRole('radio', { name: 'avatar', exact: true }).check();
  await playground.getByRole('checkbox', { name: 'Deletable' }).check();
  await playground.getByRole('checkbox', { name: 'Custom delete icon' }).check();
  await playground.getByRole('checkbox', { name: 'Multiline' }).check();
  const chip = preview.locator('[data-vf-chip]');
  await expect(chip).toHaveAttribute('data-vf-chip-tone', 'danger');
  await expect(chip).toHaveAttribute('data-vf-chip-variant', 'outlined');
  await expect(chip).toHaveAttribute('data-vf-chip-size', 'lg');
  await expect(chip).toHaveAttribute('data-vf-chip-wrap', '');
  await expect(chip.locator('[data-vf-avatar]')).toBeVisible();
  await expect(chip.locator('[data-vf-chip-remove] [data-vf-icon]')).toBeVisible();
  await expect(source).toContainText('href="#chip-destination"');
  await expect(source).toContainText('removeIcon={<Icon icon={trashIcon}');
  await playground.getByRole('checkbox', { name: 'Disabled' }).check();
  await expect(preview.getByRole('link', { name: 'Frontend' })).toHaveAttribute('aria-disabled', 'true');
  await playground.getByRole('button', { name: 'Reset playground' }).click();
  await expect(playground.getByRole('textbox', { name: 'Label' })).toHaveValue('Engineering');
  await expect(source).not.toContainText('onRemove=');
});
test('ToggleButton, Divider and List guides share the playground and public properties', async ({ page }) => {
  await page.goto('/next/react/components/toggle-button/');
  const toggle = page.locator('[data-vf-docs-component-playground="ToggleButton"]');
  const togglePreview = toggle.getByRole('region', { name: 'ToggleButton preview' });
  await toggle.getByRole('checkbox', { name: 'Icon only' }).check();
  await togglePreview.getByRole('button', { name: 'Bookmark article' }).click();
  await expect(toggle.getByRole('checkbox', { name: 'Pressed' })).toBeChecked();
  await expect(togglePreview.getByRole('button', { name: 'Bookmark article' })).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle.getByRole('region', { name: 'Generated React usage' })).toContainText('useState(true)');
  await page.goto('/next/react/components/divider/');
  const divider = page.locator('[data-vf-docs-component-playground="Divider"]');
  await divider.getByRole('radio', { name: 'vertical', exact: true }).check();
  await divider.getByRole('radio', { name: 'bottom-to-top', exact: true }).check();
  const line = divider.getByRole('region', { name: 'Divider preview' }).locator('[data-vf-divider]');
  await expect(line).toHaveAttribute('data-vf-divider-text-direction', 'bottom-to-top');
  await divider.getByRole('textbox', { name: 'Label' }).fill('');
  await expect(line).toHaveAttribute('aria-hidden', 'true');
  await expect(divider.getByRole('radio', { name: 'bottom-to-top' })).toBeDisabled();
  await page.goto('/next/react/components/list/');
  const list = page.locator('[data-vf-docs-component-playground="List"]');
  await list.getByRole('radio', { name: 'ol', exact: true }).check();
  await list.getByRole('radio', { name: 'divided', exact: true }).check();
  await list.getByRole('combobox', { name: 'Gutter' }).selectOption('lg');
  const listPreview = list.getByRole('region', { name: 'List preview' }).getByRole('list');
  await expect(listPreview).toHaveAttribute('data-vf-list-variant', 'divided');
  await expect(listPreview).toHaveAttribute('data-vf-list-gutter', 'lg');
  await expect(listPreview.locator('li')).toHaveCount(3);
  await expect(list.getByRole('region', { name: 'Generated React usage' })).toContainText('as="ol"');
});

test('Playground source is component-first, without preview-only scaffolding', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/button/');
  const button = page.locator('[data-vf-docs-component-playground="Button"]');
  const code = button.getByRole('region', { name: 'Generated React usage' });
  await expect(code).toHaveText("import { Button } from '@vyrnforge/react/button'; <Button type=\"button\">Save changes</Button>");
  await expect(code).not.toContainText(/Flow|Text|useState|Activations/);
  await button.getByRole('radio', { name: 'secondary' }).check();
  await button.getByRole('radio', { name: 'lg' }).check();
  await expect(code).toContainText('<Button type="button" variant="secondary" size="lg">Save changes</Button>');
  await button.getByRole('radio', { name: 'icon only' }).check();
  await expect(code).toContainText('iconOnly');
  await expect(code).toContainText('aria-label="Save changes"');
  await expect(code).toContainText("import { bookmarkIcon } from '@vyrnforge/icons/bookmark';");
  await button.getByRole('button', { name: 'Reset playground' }).click();
  await expect(code).not.toContainText('bookmarkIcon');

  await page.goto('/next/react/components/chip/');
  const chip = page.locator('[data-vf-docs-component-playground="Chip"]');
  const source = chip.getByRole('region', { name: 'Generated React usage' });
  await expect(source).toHaveText("import { Chip } from '@vyrnforge/react/chip'; <Chip>Engineering</Chip>");
  await chip.getByRole('radio', { name: 'selectable' }).check();
  await chip.getByRole('checkbox', { name: 'Selected' }).check();
  await chip.getByRole('checkbox', { name: 'Deletable' }).check();
  await expect(source).toContainText('defaultSelected');
  await expect(source).toContainText('onRemove={onRemove}');
  await expect(source).not.toContainText(/@vyrnforge\/react\/(?:layout|text)|Restore|Live preview|useEffect/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await chip.screenshot({ path: testInfo.outputPath('chip-configured-desktop-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await chip.screenshot({ path: testInfo.outputPath('chip-configured-desktop-dark.png') });
  await page.setViewportSize({ width: 320, height: 800 });
  await chip.screenshot({ path: testInfo.outputPath('chip-configured-mobile-dark.png') });
  expect(await page.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
});

test('Checkbox presentations preserve naming and label activation', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/checkbox/');
  const playground = page.locator('[data-vf-docs-component-playground="Checkbox"]');
  const preview = playground.getByRole('region', { name: 'Checkbox preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  const control = preview.getByRole('checkbox', { name: 'Include a gift receipt', exact: true });
  const presentation = async (value) => {
    const select = playground.getByRole('combobox', { name: 'Presentation' });
    if (await select.count()) await select.selectOption(value);
    else await playground.getByRole('radio', { name: value, exact: true }).check();
  };
  await presentation('standalone');
  await expect(control).toHaveAttribute('aria-label', 'Include a gift receipt');
  await expect(source).toContainText('aria-label=');
  await presentation('icon label');
  await expect(preview.locator('[data-vf-icon]')).toBeVisible();
  await preview.getByText('Include a gift receipt', { exact: true }).click();
  await expect(control).toBeChecked();
  await expect(source).toContainText('<Icon icon={tagIcon}');
  await expect(source).toContainText('<Text>Include a gift receipt</Text>');
  await expect(preview.locator('[data-vf-text]').filter({ hasText: 'Include a gift receipt' })).toBeVisible();
  await presentation('label and description');
  await expect(control).toHaveAccessibleDescription('A separate receipt without prices.');
  await preview.getByText('A separate receipt without prices.', { exact: true }).click();
  await expect(control).not.toBeChecked();
  await control.focus();
  await control.press('Space');
  await expect(control).toBeChecked();
  await expect(source).toContainText('aria-describedby={descriptionId}');
  await expect(preview.locator('span[data-vf-flow][data-vf-flow-gap="xs"]')).toHaveCSS('display', 'flex');
  await expect(source).not.toContainText('display: "grid"');
  await playground.screenshot({ path: testInfo.outputPath('checkbox-composed-label.png') });
});

test('TextField playground uses native public components and focused import-only source', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/text-field/');
  const playground = page.locator('[data-vf-docs-component-playground="TextField"]');
  const preview = playground.getByRole('region', { name: 'TextField preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  await expect(preview.getByRole('textbox', { name: 'Display name' })).toBeVisible();
  await playground.getByRole('button', { name: 'Invalid', exact: true }).click();
  await expect(preview.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await expect(source).toContainText('error="Choose a different display name."');
  await playground.getByRole('checkbox', { name: 'Multiline', exact: true }).check();
  await expect(preview.locator('textarea[data-vf-textarea]')).toBeVisible();
  await expect(source).toContainText('multiline');
  await expect(source).not.toContainText(/styles\/|useState|<Flow/);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.vfTheme = theme; }, theme);
      await playground.screenshot({ path: testInfo.outputPath('text-field-playground-' + width + '-' + theme + '.png') });
    }
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await playground.screenshot({ path: testInfo.outputPath('text-field-playground-rtl-forced.png') });
  expect(await page.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
});

test('TextField playground switches the real public component between visibly distinct variants', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/next/react/components/text-field/');
  const playground = page.locator('[data-vf-docs-component-playground="TextField"]');
  const preview = playground.getByRole('region', { name: 'TextField preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  const root = preview.locator('[data-vf-text-field]');
  const shell = root.locator('[data-vf-text-field-control]');
  const editor = preview.getByRole('textbox', { name: 'Display name' });
  for (const theme of ['light', 'dark']) {
    await page.locator('#vf-react-theme').selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-vf-theme', theme);
    await playground.getByRole('radio', { name: 'filled', exact: true }).check();
    await expect(root).toHaveAttribute('data-vf-text-field-variant', 'filled');
    await expect(source).toContainText('variant="filled"');
    await expect(shell).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(shell).not.toHaveCSS('border-top-left-radius', '0px');
    await expect(editor).toHaveCSS('padding-inline-start', '12px');
    await editor.fill('Ada');
    await editor.blur();
    await preview.screenshot({ path: testInfo.outputPath('text-field-playground-filled-' + theme + '.png') });
    await playground.getByRole('radio', { name: 'underlined', exact: true }).check();
    await expect(root).toHaveAttribute('data-vf-text-field-variant', 'underlined');
    await expect(source).toContainText('variant="underlined"');
    await expect(shell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(shell).toHaveCSS('border-top-left-radius', '0px');
    await expect(editor).toHaveCSS('padding-inline-start', '4px');
    await expect(editor).toHaveValue('Ada');
    await preview.screenshot({ path: testInfo.outputPath('text-field-playground-underlined-' + theme + '.png') });
    await expect(source).toContainText('@vyrnforge/react/text-field');
    await expect(source).not.toContainText(/styles\//);
  }
});


test('Radio playground uses centered shared artwork and composed public label source', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/next/react/components/radio/');
  const playground = page.locator('[data-vf-docs-component-playground="Radio"]');
  const preview = playground.getByRole('region', { name: 'Radio preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  const standard = preview.getByRole('radio', { name: 'Standard', exact: true });
  await expect(standard).toBeChecked();
  await expect(standard).toHaveCSS('align-items', 'center');
  await expect(standard).toHaveCSS('justify-items', 'center');
  const dimensions = await standard.evaluate(element => ({ target: element.getBoundingClientRect().width,
    dot: parseFloat(getComputedStyle(element, '::after').width) }));
  expect(dimensions.dot).toBeCloseTo(dimensions.target / 2, 1);
  await expect(source).toContainText('<Flow as="label"');
  await expect(source).toContainText('<Text>Standard</Text>');
  await preview.getByText('Express', { exact: true }).click();
  await expect(preview.getByRole('radio', { name: 'Express', exact: true })).toBeChecked();
  await playground.getByRole('radio', { name: 'sm', exact: true }).check();
  await expect(standard).toHaveAttribute('data-vf-size', 'sm');
  await expect(standard).toHaveCSS('width', '24px');
  await expect(source).toContainText('size="sm"');
  await playground.getByRole('radio', { name: 'lg', exact: true }).check();
  await expect(standard).toHaveCSS('width', '28px');
  await playground.getByRole('radio', { name: 'none', exact: true }).check();
  await expect(preview.getByRole('radio', { name: 'Express', exact: true })).not.toBeChecked();
  await playground.getByRole('radio', { name: 'label and description', exact: true }).check();
  await expect(standard).toHaveAccessibleDescription('Arrives in 3–5 days.');
  await playground.getByRole('checkbox', { name: 'Invalid', exact: true }).check();
  await expect(standard).toHaveAttribute('aria-invalid', 'true');
  await playground.getByRole('radio', { name: 'horizontal', exact: true }).check();
  await expect(source).toContainText('direction="inline"');
  await playground.screenshot({ path: testInfo.outputPath('radio-centered-playground.png') });
});


for (const name of ['Input', 'Textarea']) {
  test(name + ' playground preserves native editing across distinct appearances', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/next/react/components/' + name.toLowerCase() + '/');
    const playground = page.locator('[data-vf-docs-component-playground="' + name + '"]');
    const preview = playground.getByRole('region', { name: name + ' preview' });
    const source = playground.getByRole('region', { name: 'Generated React usage' });
    const editor = preview.getByRole('textbox');
    await editor.fill('Native value');
    await playground.getByRole('radio', { name: 'filled', exact: true }).check();
    await expect(editor).toHaveAttribute('data-vf-editor-variant', 'filled');
    await expect(editor).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await editor.fill('');
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((el, value) => { el.dataset.vfTheme = value; }, theme);
      const contrast = await editor.evaluate(el => {
        const style = getComputedStyle(el);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const luminance = color => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3)
            .map(c => c / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
            .reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index], 0);
        };
        const a = luminance(style.backgroundColor);
        const b = luminance(getComputedStyle(el, '::placeholder').color);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      await preview.screenshot({ path: testInfo.outputPath(name.toLowerCase() + '-filled-' + theme + '.png') });
    }
    await editor.fill('Native value');
    await playground.getByRole('radio', { name: 'underlined', exact: true }).check();
    await expect(editor).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await playground.getByRole('radio', { name: 'unstyled', exact: true }).check();
    await expect(editor).toHaveCSS('border-top-width', '0px');
    await expect(editor).toHaveCSS('padding-left', '0px');
    await expect(editor).toHaveValue('Native value');
    await expect(source).toContainText('variant="unstyled"');
    await expect(source).toContainText('@vyrnforge/react/' + name.toLowerCase());
    await expect(source).not.toContainText(/styles\//);
    if (name === 'Textarea') {
      await playground.getByRole('checkbox', { name: 'Autosize', exact: true }).check();
      await expect(editor).toHaveAttribute('data-vf-textarea-autosize', '');
      if (await editor.evaluate(() => CSS.supports('field-sizing', 'content'))) {
        await editor.fill('Short');
        const short = await editor.evaluate(el => el.clientHeight);
        const shortWidth = await editor.evaluate(el => el.getBoundingClientRect().width);
        expect(shortWidth).toBeGreaterThan(100);
        await editor.fill(Array(14).fill('A line').join('\n'));
        await expect.poll(() => editor.evaluate(el => el.clientHeight)).toBeGreaterThan(short);
        expect(await editor.evaluate(el => el.getBoundingClientRect().width)).toBeCloseTo(shortWidth, 0);
        expect(await editor.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
        await editor.fill('Short');
        await expect.poll(() => editor.evaluate(el => el.clientHeight)).toBe(short);
      }
    }
    await playground.getByRole('radio', { name: 'outlined', exact: true }).check();
    await playground.screenshot({ path: testInfo.outputPath(name.toLowerCase() + '-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('html').evaluate(el => el.setAttribute('dir', 'rtl'));
    await page.emulateMedia({ forcedColors: 'active' });
    await editor.focus();
    await playground.screenshot({ path: testInfo.outputPath(name.toLowerCase() + '-mobile-rtl-forced-colors.png') });
  });
}


test('TextField autosize alone selects Textarea and emits concise matching usage', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/text-field/');
  const playground = page.locator('[data-vf-docs-component-playground="TextField"]');
  const preview = playground.getByRole('region', { name: 'TextField preview' });
  const source = playground.getByRole('region', { name: 'Generated React usage' });
  await expect(preview.locator('input[data-vf-input]')).toBeVisible();
  await preview.getByRole('textbox').fill('Keep this');
  await playground.getByRole('checkbox', { name: 'Autosize', exact: true }).check();
  const editor = preview.locator('textarea[data-vf-textarea]');
  await expect(editor).toHaveValue('Keep this');
  await expect(editor).toHaveAttribute('rows', '1');
  await expect(playground.getByRole('checkbox', { name: 'Multiline', exact: true })).not.toBeChecked();
  await expect(source).toContainText('autosize');
  await expect(source).toContainText('minRows={1}');
  await expect(source).not.toContainText(/multiline|rows=|styles\/|useState/);
  await editor.fill(Array(10).fill('A line').join('\n'));
  for (const theme of ['light', 'dark']) {
    await page.locator('#vf-react-theme').selectOption(theme);
    await preview.screenshot({ path: testInfo.outputPath('auto-field-' + theme + '.png') });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.locator('html').evaluate(el => { el.dir = 'rtl'; });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await preview.screenshot({ path: testInfo.outputPath('auto-field-mobile-rtl-forced.png') });
  expect(await page.locator('html').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
});

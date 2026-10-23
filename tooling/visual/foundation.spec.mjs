import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const readCss = async (path) => (await readFile(new URL(path, import.meta.url), 'utf8')).replace(/^@import .*;$/gm, '');
const tokensCss = await readCss('../../packages/web/src/styles/tokens.css');
const buttonCss = await readCss('../../packages/web/src/components/button/button.css');
const checkboxCss = await readCss('../../packages/web/src/components/checkbox/checkbox.css');
const colorInputCss = await readCss('../../packages/web/src/components/color-input/color-input.css');
const fileInputCss = await readCss('../../packages/web/src/components/file-input/file-input.css');
const inputCss = await readCss('../../packages/web/src/components/input/input.css');
const nativeSelectCss = await readCss('../../packages/web/src/components/native-select/native-select.css');
const radioCss = await readCss('../../packages/web/src/components/radio/radio.css');
const sliderCss = await readCss('../../packages/web/src/components/slider/slider.css');
const switchCss = await readCss('../../packages/web/src/components/switch/switch.css');
const temporalInputCss = await readCss('../../packages/web/src/components/temporal-input/temporal-input.css');
const surfaceCss = await readCss('../../packages/web/src/components/surface/surface.css');
const elementalCss = await readCss('../../packages/web/src/components/elemental-primitives/elemental-primitives.css');
const baseline = JSON.parse(await readFile(new URL('./foundation-baseline.json', import.meta.url), 'utf8'));

const fixtureCss = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }
#fixture {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  inline-size: 440px;
  block-size: 220px;
  padding: 24px;
  background: #ffffff;
}
.theme {
  display: grid;
  grid-template-columns: repeat(2, 48px);
  grid-template-rows: repeat(3, 48px);
  gap: var(--vf-space-sm);
  align-content: center;
  justify-content: center;
  border: 1px solid var(--vf-color-border);
  border-radius: var(--vf-radius-surface);
  background: var(--vf-color-surface);
}
.swatch { inline-size: 48px; block-size: 48px; border-radius: var(--vf-control-radius); }
.accent { background: var(--vf-color-accent-background); }
.surface { background: var(--vf-color-surface-hover); border: 2px solid var(--vf-color-border); }
.text { background: var(--vf-color-text); }
.muted { background: var(--vf-color-text-muted); }
.focus { background: var(--vf-color-focus-ring); }
.disabled { background: var(--vf-color-disabled-background); border: 2px solid var(--vf-color-disabled-border); }
`;

const presentationFixtureCss = `
* { box-sizing: border-box; }
html, body { margin: 0; background: #e4e4e7; font-family: var(--vf-font-family-sans); }
#presentation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  inline-size: 900px;
  padding: 20px;
}
.presentation-theme {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 20px;
  background: var(--vf-color-surface-subtle);
  color: var(--vf-color-text);
  border: 1px solid var(--vf-color-border);
  border-radius: var(--vf-radius-surface);
}
.presentation-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.presentation-control-row { display: grid; grid-template-columns: repeat(6, minmax(0, auto)); gap: 12px; align-items: center; justify-content: start; }
.presentation-control-row input { flex: none; }
.presentation-field, .presentation-slider, .presentation-specialized { inline-size: 100%; }
.presentation-specialized-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; }
.presentation-card { padding: 16px; }
.presentation-code { display: inline-block; }
.presentation-caption { margin: 0; color: var(--vf-color-text-muted); font-size: var(--vf-font-size-xs); font-weight: var(--vf-font-weight-semibold); letter-spacing: var(--vf-letter-spacing-wide); text-transform: uppercase; }
`;

test('foundation design language matches the approved visual baseline', async ({ page }, testInfo) => {
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Foundation visual fixture</title><style>${tokensCss}\n${fixtureCss}</style></head><body><main id="fixture"><section class="theme" data-vf-theme="light" aria-label="Light theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section><section class="theme" data-vf-theme="dark" aria-label="Dark theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section></main></body></html>`);
  const image = await page.locator('#fixture').screenshot({ path: testInfo.outputPath('foundation-visual.png'), animations: 'disabled' });
  const actual = createHash('sha256').update(image).digest('hex');
  testInfo.annotations.push({ type: 'visual-sha256', description: actual });
  console.log(`FOUNDATION_VISUAL_SHA256=${actual}`);
  expect(actual, `Visual baseline changed. Inspect ${testInfo.outputPath('foundation-visual.png')} before updating tooling/visual/foundation-baseline.json.`).toBe(baseline.sha256);
});

test('Layer 0 through Layer 2 use the restrained default presentation contract', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 940, height: 1020 });
  const css = [tokensCss, buttonCss, checkboxCss, colorInputCss, fileInputCss, inputCss, nativeSelectCss, radioCss, sliderCss, switchCss, temporalInputCss, surfaceCss, elementalCss, presentationFixtureCss].join('\n');
  const theme = (name) => `<section class="presentation-theme" data-vf-theme="${name}" aria-label="${name} presentation">
    <div class="presentation-row">
      <button data-vf-button>Primary</button>
      <button data-vf-button data-vf-variant="secondary">Secondary</button>
      <button data-vf-button data-vf-variant="ghost">Ghost</button>
    </div>
    <input class="presentation-field" data-vf-input aria-label="Example field" placeholder="Example field">
    <p class="presentation-caption">Choice and value controls</p>
    <div class="presentation-control-row">
      <input data-vf-checkbox type="checkbox" aria-label="Unchecked checkbox">
      <input data-vf-checkbox type="checkbox" aria-label="Checked checkbox" checked>
      <input data-vf-radio type="radio" aria-label="Unchecked radio">
      <input data-vf-radio type="radio" aria-label="Checked radio" checked>
      <input data-vf-switch role="switch" type="checkbox" aria-label="Unchecked switch">
      <input data-vf-switch role="switch" type="checkbox" aria-label="Checked switch" checked>
    </div>
    <input class="presentation-slider" data-vf-slider type="range" aria-label="Example slider" min="0" max="100" value="62">
    <p class="presentation-caption">Specialized native controls</p>
    <select class="presentation-specialized" data-vf-native-select aria-label="Example select"><option>Primary option</option></select>
    <input class="presentation-specialized" data-vf-temporal-input type="date" aria-label="Example date" value="2026-10-23">
    <input class="presentation-specialized" data-vf-file-input type="file" aria-label="Example file">
    <div class="presentation-specialized-grid">
      <input data-vf-color-input type="color" aria-label="Example color" value="#245edb">
      <input data-vf-color-input type="color" aria-label="Disabled color" value="#71717a" disabled>
    </div>
    <p class="presentation-caption">Disabled states</p>
    <div class="presentation-control-row">
      <input data-vf-checkbox type="checkbox" aria-label="Disabled checkbox" checked disabled>
      <input data-vf-radio type="radio" aria-label="Disabled radio" checked disabled>
      <input data-vf-switch role="switch" type="checkbox" aria-label="Disabled switch" checked disabled>
    </div>
    <input class="presentation-slider" data-vf-slider type="range" aria-label="Disabled slider" min="0" max="100" value="62" disabled>
    <div class="presentation-row">
      <code class="presentation-code" data-vf-code>npm install @vyrnforge/web</code>
      <kbd data-vf-kbd>⌘K</kbd>
    </div>
    <article class="presentation-card" data-vf-surface>Surface presentation</article>
  </section>`;
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>VyrnForge L0-L2 presentation</title><style>${css}</style></head><body><main id="presentation">${theme('light')}${theme('dark')}</main></body></html>`);

  const light = page.locator('[data-vf-theme="light"]');
  const primary = light.locator('[data-vf-button]').first();
  const secondary = light.locator('[data-vf-button][data-vf-variant="secondary"]');
  const input = light.locator('[data-vf-input]');
  const checkbox = light.locator('[data-vf-checkbox]:checked').first();
  const radio = light.locator('[data-vf-radio]:checked').first();
  const switchControl = light.locator('[data-vf-switch]:checked').first();
  const slider = light.locator('[data-vf-slider]:not(:disabled)').first();
  const nativeSelect = light.locator('[data-vf-native-select]');
  const temporalInput = light.locator('[data-vf-temporal-input]');
  const fileInput = light.locator('[data-vf-file-input]');
  const colorInput = light.locator('[data-vf-color-input]:not(:disabled)');
  const disabledColorInput = light.locator('[data-vf-color-input]:disabled');
  const surface = light.locator('[data-vf-surface]');

  await expect(primary).toHaveCSS('background-color', 'rgb(36, 94, 219)');
  await expect(primary).toHaveCSS('border-radius', '6px');
  await expect(primary).toHaveCSS('box-shadow', 'none');
  await expect(secondary).toHaveCSS('border-color', 'rgb(161, 161, 170)');
  await expect(input).toHaveCSS('min-height', '40px');
  await expect(input).toHaveCSS('border-radius', '6px');
  await expect(input).toHaveCSS('box-shadow', 'none');
  await expect(checkbox).toHaveCSS('appearance', 'none');
  await expect(checkbox).toHaveCSS('background-color', 'rgb(36, 94, 219)');
  await expect(checkbox).toHaveCSS('border-radius', '4px');
  await expect(radio).toHaveCSS('appearance', 'none');
  await expect(radio).toHaveCSS('background-color', 'rgb(36, 94, 219)');
  await expect(switchControl).toHaveCSS('background-color', 'rgb(36, 94, 219)');
  await expect(switchControl).toHaveCSS('box-shadow', 'none');
  expect(await switchControl.evaluate((element) => getComputedStyle(element, '::before').boxShadow)).toBe('none');
  await expect(slider).toHaveCSS('appearance', 'none');
  await expect(slider).toHaveCSS('height', '40px');
  await expect(nativeSelect).toHaveCSS('min-height', '40px');
  await expect(nativeSelect).toHaveCSS('border-radius', '6px');
  await expect(temporalInput).toHaveCSS('min-height', '40px');
  await expect(temporalInput).toHaveCSS('border-radius', '6px');
  await expect(fileInput).toHaveCSS('min-height', '40px');
  await expect(fileInput).toHaveCSS('border-radius', '6px');
  await expect(colorInput).toHaveCSS('height', '40px');
  await expect(colorInput).toHaveCSS('border-radius', '6px');
  await expect(disabledColorInput).toHaveCSS('background-color', 'rgb(244, 244, 245)');
  await expect(disabledColorInput).toHaveCSS('border-color', 'rgb(228, 228, 231)');
  await expect(surface).toHaveCSS('border-radius', '8px');
  await expect(surface).toHaveCSS('box-shadow', 'none');

  await input.focus();
  await expect(input).toHaveCSS('outline-width', '2px');
  await expect(input).toHaveCSS('border-color', 'rgb(36, 94, 219)');
  await checkbox.focus();
  await expect(checkbox).toHaveCSS('outline-width', '2px');
  await radio.focus();
  await expect(radio).toHaveCSS('outline-width', '2px');
  await switchControl.focus();
  await expect(switchControl).toHaveCSS('outline-width', '2px');
  await slider.focus();
  await expect(slider).toHaveCSS('outline-style', 'solid');
  await nativeSelect.focus();
  await expect(nativeSelect).toHaveCSS('outline-width', '2px');
  await temporalInput.focus();
  await expect(temporalInput).toHaveCSS('outline-width', '2px');
  await fileInput.focus();
  await expect(fileInput).toHaveCSS('outline-width', '2px');
  await colorInput.focus();
  await expect(colorInput).toHaveCSS('outline-width', '2px');

  const image = await page.locator('#presentation').screenshot({ path: testInfo.outputPath('l0-l2-presentation.png'), animations: 'disabled' });
  expect(image.byteLength).toBeGreaterThan(10_000);
  testInfo.annotations.push({ type: 'presentation-evidence', description: createHash('sha256').update(image).digest('hex') });
});

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const readCss = async (path) => (await readFile(new URL(path, import.meta.url), 'utf8')).replace(/^@import .*;$/gm, '');
const tokensCss = await readCss('../../packages/web/src/styles/tokens.css');
const buttonCss = await readCss('../../packages/web/src/components/button/button.css');
const inputCss = await readCss('../../packages/web/src/components/input/input.css');
const switchCss = await readCss('../../packages/web/src/components/switch/switch.css');
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
  box-shadow: var(--vf-shadow-md);
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
html, body { margin: 0; background: #e2e8f0; font-family: var(--vf-font-family-sans); }
#presentation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  inline-size: 700px;
  padding: 20px;
}
.presentation-theme {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 20px;
  background: var(--vf-color-surface-subtle);
  color: var(--vf-color-text);
  border-radius: calc(var(--vf-radius-surface) + 0.25rem);
}
.presentation-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.presentation-field { inline-size: 100%; }
.presentation-card { padding: 16px; }
.presentation-code { display: inline-block; }
`;

test('foundation design language matches the approved visual baseline', async ({ page }, testInfo) => {
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Foundation visual fixture</title><style>${tokensCss}\n${fixtureCss}</style></head><body><main id="fixture"><section class="theme" data-vf-theme="light" aria-label="Light theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section><section class="theme" data-vf-theme="dark" aria-label="Dark theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section></main></body></html>`);
  const image = await page.locator('#fixture').screenshot({ path: testInfo.outputPath('foundation-visual.png'), animations: 'disabled' });
  const actual = createHash('sha256').update(image).digest('hex');
  testInfo.annotations.push({ type: 'visual-sha256', description: actual });
  console.log(`FOUNDATION_VISUAL_SHA256=${actual}`);
  expect(actual, `Visual baseline changed. Inspect ${testInfo.outputPath('foundation-visual.png')} before updating tooling/visual/foundation-baseline.json.`).toBe(baseline.sha256);
});

test('Layer 0 through Layer 2 share one coherent presentation system', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 740, height: 520 });
  const css = [tokensCss, buttonCss, inputCss, switchCss, surfaceCss, elementalCss, presentationFixtureCss].join('\n');
  const theme = (name) => `<section class="presentation-theme" data-vf-theme="${name}" aria-label="${name} presentation">
    <div class="presentation-row">
      <button data-vf-button>Primary</button>
      <button data-vf-button data-vf-variant="secondary">Secondary</button>
      <button data-vf-button data-vf-variant="ghost">Ghost</button>
    </div>
    <input class="presentation-field" data-vf-input aria-label="Example field" placeholder="Example field">
    <div class="presentation-row">
      <input data-vf-switch role="switch" type="checkbox" aria-label="Example switch" checked>
      <code class="presentation-code" data-vf-code>npm install @vyrnforge/web</code>
      <kbd data-vf-kbd>⌘K</kbd>
    </div>
    <article class="presentation-card" data-vf-surface>Surface presentation</article>
  </section>`;
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>VyrnForge L0-L2 presentation</title><style>${css}</style></head><body><main id="presentation">${theme('light')}${theme('dark')}</main></body></html>`);

  const primary = page.locator('[data-vf-theme="light"] [data-vf-button]').first();
  const input = page.locator('[data-vf-theme="light"] [data-vf-input]');
  const surface = page.locator('[data-vf-theme="light"] [data-vf-surface]');
  const switchControl = page.locator('[data-vf-theme="light"] [data-vf-switch]');
  await expect(primary).toHaveCSS('background-color', 'rgb(79, 70, 229)');
  await expect(primary).toHaveCSS('border-radius', '10px');
  await expect(input).toHaveCSS('min-height', '40px');
  await expect(input).toHaveCSS('border-radius', '10px');
  await expect(surface).toHaveCSS('border-radius', '12px');
  await expect(switchControl).toHaveCSS('background-color', 'rgb(79, 70, 229)');

  await input.focus();
  await expect(input).toHaveCSS('outline-width', '2px');

  const image = await page.locator('#presentation').screenshot({ path: testInfo.outputPath('l0-l2-presentation.png'), animations: 'disabled' });
  expect(image.byteLength).toBeGreaterThan(5_000);
  testInfo.annotations.push({ type: 'presentation-evidence', description: createHash('sha256').update(image).digest('hex') });
});

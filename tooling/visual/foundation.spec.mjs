import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const tokensCss = await readFile(new URL('../../packages/web/src/styles/tokens.css', import.meta.url), 'utf8');
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

test('foundation design language matches the approved visual baseline', async ({ page }, testInfo) => {
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Foundation visual fixture</title><style>${tokensCss}\n${fixtureCss}</style></head><body><main id="fixture"><section class="theme" data-vf-theme="light" aria-label="Light theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section><section class="theme" data-vf-theme="dark" aria-label="Dark theme"><span class="swatch accent"></span><span class="swatch surface"></span><span class="swatch text"></span><span class="swatch muted"></span><span class="swatch focus"></span><span class="swatch disabled"></span></section></main></body></html>`);
  const image = await page.locator('#fixture').screenshot({ path: testInfo.outputPath('foundation-visual.png'), animations: 'disabled' });
  const actual = createHash('sha256').update(image).digest('hex');
  testInfo.annotations.push({ type: 'visual-sha256', description: actual });
  if (baseline.sha256 === 'BOOTSTRAP') console.log(`FOUNDATION_VISUAL_SHA256=${actual}`);
  expect(actual, `Visual baseline changed. Inspect ${testInfo.outputPath('foundation-visual.png')} before updating tooling/visual/foundation-baseline.json.`).toBe(baseline.sha256);
});

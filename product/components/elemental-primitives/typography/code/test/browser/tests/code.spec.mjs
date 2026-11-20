import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Code uses the identical native Web markup and visual contract in every implemented port', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`/components/code/${port}.html`);
  const inline = page.locator('#inline');
  const block = page.locator('#block');
  await expect(inline).toHaveJSProperty('tagName', 'CODE');
  await expect(inline).toHaveAttribute('data-vf-code', '');
  await expect(block).toHaveJSProperty('tagName', 'PRE');
  await expect(block).toHaveAttribute('data-vf-code-block', '');
  await expect(block.locator('code')).toHaveCount(1);
  await expect(inline).toHaveCSS('font-family', /mono/i);
  await expect(inline).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(block).toHaveCSS('overflow-x', 'auto');
  if (port === 'react') {
    await expect(page.locator('#inline')).toHaveAttribute('title', 'Run tests');
    await expect(block).toHaveAttribute('aria-label', 'Run Vitest');
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
  if (testInfo.project.name === 'chromium') await page.screenshot({
    path: testInfo.outputPath(`code-${port}-light.png`), fullPage: false,
  });
});

test('Code survives 320px reflow, RTL, dark, and forced colors without losing text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto(`/components/code/${port}.html`);
  await page.locator('html').evaluate(el => { el.dir = 'rtl'; el.dataset.vfTheme = 'dark'; el.style.fontSize = '200%'; });
  await expect(page.locator('#inline')).toContainText('pnpm test');
  await expect(page.locator('#block code')).toContainText('pnpm exec vitest run');
  const bounds = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#block')).toHaveCSS('border-top-style', 'solid');
});

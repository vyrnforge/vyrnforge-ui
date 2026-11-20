import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Kbd preserves native key semantics and Web presentation on each implemented port', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`/components/kbd/${port}.html`);
  const kbd = page.locator('#kbd');
  await expect(kbd).toHaveJSProperty('tagName', 'KBD');
  await expect(kbd).toHaveAttribute('data-vf-kbd', '');
  await expect(kbd).toHaveCSS('display', 'inline-block');
  await expect(kbd).toHaveCSS('font-family', /mono/i);
  await expect(kbd).toHaveCSS('border-bottom-width', '2px');
  if (port === 'react') await expect(kbd).toHaveAttribute('title', 'Enter key');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
  if (testInfo.project.name === 'chromium') await page.screenshot({
    path: testInfo.outputPath(`kbd-${port}-light.png`), fullPage: false,
  });
});

test('Kbd remains readable in RTL, 200% text scaling and forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(`/components/kbd/${port}.html`);
  await page.locator('html').evaluate(el => { el.dir = 'rtl'; el.style.fontSize = '200%'; el.dataset.vfTheme = 'dark'; });
  await expect(page.locator('#kbd')).toHaveText('Enter');
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#kbd')).toHaveCSS('border-top-style', 'solid');
});

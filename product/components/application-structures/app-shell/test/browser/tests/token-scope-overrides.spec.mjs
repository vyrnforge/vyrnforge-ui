import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test.describe('STD-03 nested theme and consumer token overrides', () => {
  test.skip(port !== 'react', 'Representative token-scope evidence is intentionally bounded to the React public-entrypoint consumer.');

  test('inherits theme and spacing while keeping consumer overrides local', async ({ page }, testInfo) => {
    await page.goto('/components/app-shell/token-scope-overrides-react.html');

    const root = page.getByRole('main');
    const rootAction = page.getByRole('button', { name: 'Root action' });
    const darkScope = page.getByRole('region', { name: 'Nested dark scope' });
    const darkAction = page.getByRole('button', { name: 'Dark action' });
    const consumerAccent = page.getByRole('button', { name: 'Consumer accent action' });
    const spacingScope = page.getByRole('region', { name: 'Consumer spacing override' });
    const brandScope = page.getByRole('region', { name: 'Consumer brand scope' });
    const brandAction = page.getByRole('button', { name: 'Brand action' });

    await expect(rootAction).toHaveCSS('background-color', 'rgb(36, 94, 219)');
    await expect(darkAction).toHaveCSS('background-color', 'rgb(141, 180, 255)');
    await expect(consumerAccent).toHaveCSS('background-color', 'rgb(185, 28, 28)');
    await expect(rootAction).toHaveCSS('background-color', 'rgb(36, 94, 219)');
    await expect(brandAction).toHaveCSS('background-color', 'rgb(15, 118, 110)');

    await expect(root.locator(':scope > [data-vf-stack]')).toHaveCSS('gap', '16px');
    await expect(darkScope.locator('[data-vf-stack]')).toHaveCSS('gap', '16px');
    await expect(spacingScope.locator('[data-vf-stack]')).toHaveCSS('gap', '32px');

    expect(await darkScope.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-space-md').trim())).toBe('1rem');
    expect(await brandScope.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-color-surface').trim())).toBe('#f0fdfa');
    expect(await brandScope.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-color-text').trim())).toBe('#134e4a');

    const consumerCss = await page.evaluate(() => {
      const rules = [];
      for (const sheet of document.styleSheets) {
        for (const rule of Array.from(sheet.cssRules ?? [])) {
          if (rule.cssText.includes('.consumer-')) rules.push(rule.cssText);
        }
      }
      return rules.join('\n');
    });
    expect(consumerCss).not.toContain('!important');
    expect(consumerCss).not.toContain('--_vf-');
    expect(consumerCss).not.toContain('[data-vf-button]');

    const image = await root.screenshot({ path: testInfo.outputPath('token-scopes.png'), animations: 'disabled' });
    expect(image.byteLength).toBeGreaterThan(6_000);
  });

  test('keeps system appearance handling independent from inherited density', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/components/app-shell/token-scope-overrides-react.html');

    const systemScope = page.getByRole('region', { name: 'System appearance scope' });
    const systemAction = page.getByRole('button', { name: 'System action' });
    const rootAction = page.getByRole('button', { name: 'Root action' });

    await expect(rootAction).toHaveCSS('background-color', 'rgb(36, 94, 219)');
    await expect(systemAction).toHaveCSS('background-color', 'rgb(141, 180, 255)');
    await expect(systemAction).toHaveCSS('min-height', '40px');

    await systemScope.evaluate((element) => element.setAttribute('data-vf-density', 'compact'));
    await expect(systemAction).toHaveCSS('min-height', '32px');
    await expect(systemAction).toHaveCSS('background-color', 'rgb(141, 180, 255)');

    await systemScope.evaluate((element) => element.setAttribute('data-vf-theme', 'light'));
    await expect(systemAction).toHaveCSS('min-height', '32px');
    await expect(systemAction).toHaveCSS('background-color', 'rgb(36, 94, 219)');
  });
});
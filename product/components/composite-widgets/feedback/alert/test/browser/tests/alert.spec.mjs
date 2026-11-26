import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
test('alert preserves visible meaning and shared semantic paint', async ({ page }) => {
  await page.goto('/components/alert/' + port + '.html');
  await expect(page.locator('#static [data-vf-alert-message]')).not.toHaveAttribute('role');
  await expect(page.getByRole('status')).toHaveText('Saved');
  await page.getByRole('button', { name: 'Details' }).focus();
  await expect(page.getByRole('button', { name: 'Details' })).toBeFocused();
  const items = [
    ['#static', 'danger'],
    ['#dynamic', 'success'],
  ];
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.locator('html').evaluate((el, theme) => {
      el.dataset.vfTheme = theme;
      el.dir = 'rtl';
    }, theme);
    for (const [selector, tone] of items) {
      const el = page.locator(selector);
      await expect(el).toBeVisible();
      const expected = await el.evaluate((node, tone) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--vf-color-' + tone + '-foreground)';
        node.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }, tone);
      await expect(el).toHaveCSS('color', expected);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ forcedColors: 'active', colorScheme: 'dark' });
  await expect(page.locator(items[0][0])).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
});

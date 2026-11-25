import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
const url = '/components/chip/' + port + '.html';

test('Chip has independent native actions, readable labels and sequential focus', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('#static')).toHaveText('Engineering');
  await expect(page.locator('#static button')).toHaveCount(0);
  const action = page.getByRole('button', { name: 'Open' });
  const filter = page.getByRole('button', { name: 'React', exact: true });
  const remove = page.getByRole('button', { name: 'Remove React' });
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#filter button button')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  for (const control of [action, filter, remove]) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
    const bounds = await control.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(24);
    expect(bounds.height).toBeGreaterThanOrEqual(24);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('Chip preserves logical order, wrapping, themes and motion preference', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(url);
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((node, value) => {
      node.dataset.vfTheme = value;
      node.dir = 'rtl';
      node.style.fontSize = '200%';
    }, theme);
    const action = await page.getByRole('button', { name: 'React', exact: true }).boundingBox();
    const remove = await page.getByRole('button', { name: 'Remove React' }).boundingBox();
    expect(remove.x).toBeLessThan(action.x);
    await expect(page.locator('#long')).toContainText('available to assistive technology');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page.locator('#filter [data-vf-chip-selection]')).toBeVisible();
  await expect(page.locator('#filter')).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: test.info().outputPath('chip-rtl-forced-colors.png'), fullPage: true });
});

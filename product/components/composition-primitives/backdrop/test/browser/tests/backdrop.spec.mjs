import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
test('local scrim shares native modal paint and does not intercept pointer or focus', async ({ page }) => {
  await page.goto('/components/backdrop/' + port + '.html');
  const scrim = page.locator('#scrim');
  await expect(scrim).toHaveAttribute('aria-hidden', 'true');
  await expect(scrim).toHaveCSS('pointer-events', 'none');
  await expect(scrim).toHaveCSS('position', 'absolute');
  await expect(scrim).toHaveCSS('border-radius', '8px');
  expect(await scrim.boundingBox()).toEqual(await page.locator('#region').boundingBox());
  await page.getByRole('button', { name: 'Underlying action' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-activated', 'true');
  await expect(page.getByRole('button', { name: 'Underlying action' })).toBeFocused();
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, theme) => { el.dataset.vfTheme = theme; }, theme);
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const paint = await page.locator('#dialog').evaluate(el => getComputedStyle(el, '::backdrop').backgroundColor);
    await expect(scrim).toHaveCSS('background-color', paint);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(scrim).toHaveCSS('opacity', '0.5');
  await expect(page.getByRole('status')).toBeVisible();
  await scrim.evaluate(el => { el.hidden = true; });
  await expect(scrim).toBeHidden();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

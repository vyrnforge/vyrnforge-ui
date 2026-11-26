import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('TextField keeps native labels, editing, descriptions, reset, and focus', async ({ page }, testInfo) => {
  await page.goto('/components/text-field/' + port + '.html');
  const email = page.getByRole('textbox', { name: 'Email', exact: true });
  const notes = page.getByRole('textbox', { name: 'Notes', exact: true });
  await expect(email).toHaveAccessibleDescription(
    'External instruction. Use your work address. Choose another address.',
  );
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(notes).toHaveJSProperty('tagName', 'TEXTAREA');
  await email.fill('updated@example.com');
  await notes.fill('Changed notes');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(email).toHaveValue('original@example.com');
  await expect(notes).toHaveValue('Original notes');
  await email.focus();
  await expect(email).toBeFocused();
  const data = await page.locator('form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
  expect(data.email).toBe('original@example.com');
  expect(data.notes).toBe('Original notes');
  if (port === 'react') {
    expect(data.readonly).toBe('kept');
    expect(data.disabled).toBeUndefined();
    const control = page.getByRole('textbox', { name: 'Controlled' });
    await control.fill('abcd');
    await control.evaluate((el) => el.setSelectionRange(2, 2));
    await control.press('X');
    await expect(control).toHaveValue('abXcd');
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(control).toBeFocused();
    await expect(control).toHaveValue('');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(control).toHaveValue('controlled');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('output')).toHaveText('original@example.com');
    await page.locator('html').evaluate((el) => {
      el.dataset.vfTheme = 'field-test';
    });
    await expect(page.locator('[data-vf-text-field-label]').first()).toHaveCSS('font-size', '18px');
    await expect(page.locator('[data-vf-text-field-control]').first()).toHaveCSS('border-radius', '12px');
  }
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((el, theme) => {
        el.dataset.vfTheme = theme;
        el.dir = 'rtl';
      }, theme);
      await expect(email).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath('text-field-' + port + '-' + width + '-' + theme + '.png'),
        fullPage: true,
      });
    }
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await email.focus();
  await page.screenshot({ path: testInfo.outputPath('text-field-' + port + '-rtl-forced-colors.png'), fullPage: true });
});

test('floating label follows native focus, value and reset without replacing the accessible name', async ({
  page,
}, testInfo) => {
  await page.goto('/components/text-field/' + port + '.html');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const editor = page.getByRole('textbox', { name: 'Floating email', exact: true });
  const field = page.locator('[data-vf-text-field]').filter({ has: editor });
  const label = field.locator('label');
  const legend = field.locator('legend');
  await expect(editor).toHaveAccessibleName('Floating email');
  const resting = await label.evaluate((node) => node.getBoundingClientRect().top);
  await expect(legend).toHaveCSS('max-inline-size', '0px');
  await expect.poll(() => editor.evaluate((el) => getComputedStyle(el, '::placeholder').opacity)).toBe('0');
  await editor.focus();
  await expect.poll(() => editor.evaluate((el) => getComputedStyle(el, '::placeholder').opacity)).toBe('1');
  await expect.poll(() => label.evaluate((node) => node.getBoundingClientRect().top)).toBeLessThan(resting);
  await expect(legend).not.toHaveCSS('max-inline-size', '0px');
  await expect(field.locator('fieldset')).toHaveCSS('border-top-width', '2px');
  await editor.fill('ada@example.com');
  await editor.blur();
  await expect(legend).not.toHaveCSS('max-inline-size', '0px');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(editor).toHaveValue('');
  await expect(legend).toHaveCSS('max-inline-size', '0px');
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((el, theme) => {
        el.dataset.vfTheme = theme;
        el.dir = 'rtl';
      }, theme);
      await editor.focus();
      await page.screenshot({
        path: testInfo.outputPath('floating-field-' + port + '-' + width + '-' + theme + '.png'),
        fullPage: true,
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await page.screenshot({ path: testInfo.outputPath('floating-field-' + port + '-forced-colors.png'), fullPage: true });
});

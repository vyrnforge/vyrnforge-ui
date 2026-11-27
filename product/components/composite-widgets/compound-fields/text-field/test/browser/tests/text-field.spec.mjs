import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('TextField keeps native labels, editing, descriptions, reset, and focus', async ({ page }, testInfo) => {
  await page.goto('/components/text-field/' + port + '.html');
  await page.emulateMedia({ reducedMotion: 'reduce' });
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

test('filled and underlined variants have distinct surfaces and insets', async ({ page }, testInfo) => {
  await page.goto('/components/text-field/' + port + '.html');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const filled = page.getByRole('textbox', { name: 'Compare filled' });
  const underlined = page.getByRole('textbox', { name: 'Compare underlined' });
  const shell = (editor) => page.locator('[data-vf-text-field-control]').filter({ has: editor });
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, theme) => {
      el.dataset.vfTheme = theme;
    }, theme);
    await expect(shell(underlined)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const paint = await shell(filled).evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(paint).not.toBe('rgba(0, 0, 0, 0)');
    const separation = await shell(filled).evaluate((node) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const rgb = (color) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      const field = rgb(getComputedStyle(node).backgroundColor);
      const surface = rgb(getComputedStyle(document.body).backgroundColor);
      return Math.max(...field.slice(0, 3).map((channel, i) => Math.abs(channel - surface[i])));
    });
    expect(separation).toBeGreaterThanOrEqual(24);
    await expect(filled).toHaveCSS('padding-inline-start', '12px');
    await expect(underlined).toHaveCSS('padding-inline-start', '4px');
    await expect(shell(underlined)).toHaveCSS('border-top-left-radius', '0px');
    await expect(shell(filled)).not.toHaveCSS('border-top-left-radius', '0px');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath('text-field-variant-distinction-' + port + '-' + theme + '.png'),
      fullPage: true,
    });
  }
});

test('autosize alone keeps the same native editor, selection and form behavior', async ({ page }) => {
  test.skip(port !== 'react', 'React convenience API');
  await page.goto('/components/text-field/react.html');
  const editor = page.getByRole('textbox', { name: 'Auto message' });
  await expect(editor).toHaveJSProperty('tagName', 'TEXTAREA');
  await expect(editor).toHaveAttribute('rows', '1');
  await editor.evaluate((el) => {
    el.dataset.testIdentity = 'original';
  });
  await editor.fill('abc');
  const short = await editor.evaluate((el) => el.clientHeight);
  await editor.evaluate((el) => el.setSelectionRange(1, 1));
  await editor.press('Enter');
  await expect(editor).toHaveValue('a\nbc');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveAttribute('data-test-identity', 'original');
  await editor.fill(Array(12).fill('A line').join('\n'));
  if (await editor.evaluate((el) => CSS.supports('field-sizing', 'content'))) {
    await expect.poll(() => editor.evaluate((el) => el.clientHeight)).toBeGreaterThan(short);
    expect(await editor.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  }
  expect(await editor.evaluate((el) => new FormData(el.form).get('message'))).toContain('A line');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(editor).toHaveValue('Original message');
  await expect(editor).toHaveAttribute('data-test-identity', 'original');
});

test('standalone and composed editors share their outside-label visual language', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'React primitive and composed comparisons');
  await page.goto('/components/text-field/react.html');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, value) => {
      el.dataset.vfTheme = value;
    }, theme);
    for (const variant of ['outlined', 'filled', 'underlined']) {
      for (const kind of ['input', 'textarea']) {
        const standalone = page.getByRole('textbox', { name: 'Standalone ' + kind + ' ' + variant });
        const composed = page.getByRole('textbox', { name: 'Composed ' + kind + ' ' + variant });
        const shell = page.locator('[data-vf-text-field-control]').filter({ has: composed });
        const typography = ['font-family', 'font-size', 'line-height', 'padding-inline-start', 'padding-block-start'];
        const chrome = ['background-color', 'border-top-left-radius', 'border-bottom-width', 'border-bottom-color'];
        for (const property of typography) {
          const expected = await standalone.evaluate((el, key) => getComputedStyle(el).getPropertyValue(key), property);
          await expect(composed).toHaveCSS(property, expected);
        }
        for (const property of chrome) {
          const expected = await standalone.evaluate((el, key) => getComputedStyle(el).getPropertyValue(key), property);
          await expect(shell).toHaveCSS(property, expected);
        }
        if (kind === 'input' || (await standalone.evaluate((el) => CSS.supports('field-sizing', 'content')))) {
          const a = await standalone.evaluate((el) => el.getBoundingClientRect().height);
          const b = await shell.evaluate((el) => el.getBoundingClientRect().height);
          expect(Math.abs(a - b)).toBeLessThanOrEqual(2);
        }
      }
    }
    await page.screenshot({ path: testInfo.outputPath('editor-parity-' + theme + '.png'), fullPage: true });
  }
});

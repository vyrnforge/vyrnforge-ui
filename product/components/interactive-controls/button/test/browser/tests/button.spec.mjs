import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Button real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('native activation, disabled, loading, forms, focus, accessibility, theme, direction, and media states', async ({ page, browserName }) => {
    await page.goto('/components/button/web.html');

    const small = page.getByRole('button', { name: 'Primary small' });
    const medium = page.getByRole('button', { name: 'Secondary medium' });
    const large = page.getByRole('button', { name: 'Ghost large' });
    await expect(small).toHaveCSS('box-sizing', 'border-box');
    await expect(small).toHaveCSS('height', '32px');
    await expect(medium).toHaveCSS('height', '40px');
    await expect(large).toHaveCSS('height', '48px');

    const activation = page.locator('#activation');
    await activation.click();
    await expect(page.locator('body')).toHaveAttribute('data-activations', '1');
    await activation.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toHaveAttribute('data-activations', '3');

    const disabled = page.locator('#disabled');
    await expect(disabled).toBeDisabled();
    await expect(disabled).not.toHaveAttribute('aria-disabled', 'true');
    const busy = page.locator('#busy');
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await expect(busy).toBeEnabled();
    await busy.click();
    await expect(page.locator('body')).toHaveAttribute('data-busy-activated', 'true');

    const loadingMotion = await busy.evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return {
        name: style.animationName,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
      };
    });
    expect(loadingMotion).toEqual({
      name: 'vf-loading-spin',
      duration: '0.7s',
      timing: 'linear',
    });

    await page.locator('#plain').click();
    await expect(page.locator('body')).not.toHaveAttribute('data-submitted', 'true');
    await page.locator('#submit').click();
    await expect(page.locator('body')).toHaveAttribute('data-submitted', 'true');
    expect(JSON.parse(await page.locator('body').getAttribute('data-form-data'))).toEqual([
      ['field', 'changed'],
      ['intent', 'submit'],
    ]);
    await page.locator('#external-submit').click();
    expect(JSON.parse(await page.locator('body').getAttribute('data-form-data'))).toEqual([
      ['field', 'changed'],
      ['intent', 'external'],
    ]);
    await page.locator('input[name="field"]').fill('new');
    await page.locator('#reset').click();
    await expect(page.locator('input[name="field"]')).toHaveValue('changed');

    await page.locator('body').press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    expect(await focused.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    if (browserName === 'chromium') {
      await expect(page.locator('[data-visual-matrix]')).toHaveScreenshot('button-visual-matrix.png');
      await page.screenshot({ path: test.info().outputPath('button-native-light.png'), fullPage: true });
    }

    // The public semantic token remains consumer-overrideable without !important.
    await activation.evaluate((element) => {
      element.style.setProperty('--vf-color-accent-background', 'rgb(12 34 56)');
    });
    await expect.poll(() => activation.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe('rgb(12, 34, 56)');
    await activation.evaluate((element) => {
      element.style.removeProperty('--vf-color-accent-background');
    });

    await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
    expect(await busy.evaluate((element) => getComputedStyle(element).colorScheme)).toContain('dark');
    if (browserName === 'chromium') {
      await page.screenshot({ path: test.info().outputPath('button-native-dark.png'), fullPage: true });
    }

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    expect(await busy.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await busy.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await busy.evaluate((element) => getComputedStyle(element, '::before').animationName)).toBe('none');

    await page.setViewportSize({ width: 320, height: 680 });
    const iconMatrix = await page.locator('#icon-specimens').evaluate(el => ({
      width: el.scrollWidth,
      available: el.clientWidth,
    }));
    expect(iconMatrix.width).toBeLessThanOrEqual(iconMatrix.available + 1);
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(busy).toBeVisible();
    const borderWidth = await busy.evaluate((element) => parseFloat(getComputedStyle(element).borderTopWidth));
    expect(borderWidth).toBeGreaterThan(0);
    if (browserName === 'chromium') {
      await page.screenshot({ path: test.info().outputPath('button-native-forced-colors.png'), fullPage: true });
    }
  });
});

test.describe('Button framework hydration', () => {
  for (const framework of ['react', 'angular', 'vue']) {
    test(`${framework} preserves native Button busy/disabled semantics through hydration`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(`/components/button/${framework}.html`);
      const button = page.locator(`#${framework}-button`);
      await expect(button).toHaveAttribute('data-vf-button', '');
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toBeEnabled();
      await button.click();
      await expect(page.locator('body')).toHaveAttribute('data-activated', 'true');

      const consumerBusy = page.locator(`#${framework}-consumer-busy`);
      await expect(consumerBusy).toHaveAttribute('aria-busy', 'false');
      await expect(consumerBusy).not.toHaveAttribute('data-vf-loading', '');
      await expect(consumerBusy).toBeEnabled();

      const iconOnly = page.getByRole('button', { name: 'Search' });
      await expect(iconOnly).toHaveAttribute('data-vf-icon-only', '');
      await expect(iconOnly).toHaveAttribute('type', 'button');
      const iconBounds = await iconOnly.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      expect(iconBounds).toEqual({ width: 40, height: 40 });
      await iconOnly.click();
      await expect(page.locator('body')).toHaveAttribute('data-icon-activated', 'true');

      const disabled = page.locator(`#${framework}-disabled`);
      await expect(disabled).toBeDisabled();
      await expect(disabled).not.toHaveAttribute('aria-disabled', 'true');
      await disabled.evaluate((element) => element.click());
      await expect(page.locator('body')).not.toHaveAttribute('data-disabled-activated', 'true');

      const form = page.locator(`#${framework}-form`);
      const field = form.locator('input[name="field"]');
      const submit = form.locator(`#${framework}-submit`);
      const reset = form.locator(`#${framework}-reset`);
      const plain = form.locator(`#${framework}-plain`);
      await expect(field).toHaveValue('changed');
      expect(await submit.getAttribute('type')).toBeNull(); // native default submit
      await expect(reset).toHaveAttribute('type', 'reset');
      await expect(plain).toHaveAttribute('type', 'button');
      await plain.click();
      await expect(page.locator('body')).not.toHaveAttribute('data-form-submitted', 'true');
      await field.fill('edited');
      await reset.click();
      await expect(field).toHaveValue('changed');
      await submit.click();
      await expect(page.locator('body')).toHaveAttribute('data-form-submitted', 'true');

      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);

      const results = await new AxeBuilder({ page })
        .include(`#${framework}-button`)
        .include(`#${framework}-consumer-busy`)
        .include(`#${framework}-disabled`)
        .include(`#${framework}-form`)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});


test.describe('Button Group presentation (independent commands, native grouping)', () => {
  test.skip(port !== 'web', 'Canonical native Web CSS contract');

  test('joined and vertical actions keep individual Tab stops, logical corners, focus and disabled state', async ({ page }) => {
    await page.goto('/components/button/web.html');
    await page.locator('#grouped-specimens').evaluate(el => { el.hidden = false; });
    const joined = page.getByRole('group', { name: 'Document actions' });
    const buttons = joined.getByRole('button');
    await expect(buttons).toHaveCount(3);
    await expect(joined.getByRole('button', { name: 'Archive' })).toBeDisabled();
    expect(await page.locator('#joined-a').evaluate(el =>
      getComputedStyle(el).borderStartStartRadius)).not.toBe('0px');
    await expect(page.locator('#joined-b')).toHaveCSS('border-start-start-radius', '0px');
    expect(await page.locator('#joined-b').evaluate(el =>
      getComputedStyle(el).marginInlineStart)).toBe('-1px');

    const joinedIcons = page.getByRole('group', { name: 'Quick document actions' });
    const iconButtons = joinedIcons.getByRole('button');
    await expect(iconButtons).toHaveCount(2);
    for (const icon of await iconButtons.all()) {
      await expect(icon).toHaveAttribute('data-vf-icon-only', '');
      const box = await icon.evaluate(el => el.getBoundingClientRect());
      expect({ width: box.width, height: box.height }).toEqual({ width: 40, height: 40 });
    }
    await iconButtons.first().hover();
    await expect(iconButtons.first()).toHaveCSS('z-index', '1');
    await iconButtons.last().focus();
    await expect(iconButtons.last()).toHaveCSS('z-index', '2');

    const vertical = page.getByRole('group', { name: 'Vertical actions' });
    await expect(vertical.getByRole('button')).toHaveCount(2);
    await expect(page.locator('#vertical-b')).toHaveCSS('margin-block-start', '-1px');
    await page.locator('#joined-a').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#joined-b')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#vertical-a')).toBeFocused(); // disabled Archive skipped
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    expect(await page.locator('#joined-a').evaluate(el =>
      getComputedStyle(el).borderStartStartRadius)).not.toBe('0px');
    await page.emulateMedia({ forcedColors: 'active' });
    await page.locator('#joined-b').focus();
    await expect(page.locator('#joined-b')).toHaveCSS('z-index', '2');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});


test.describe('Icon-only Button visual and native behavior', () => {
  test.skip(port !== 'web', 'Canonical Web style contract');

  test('square token-sized hit areas, named icons, disabled and busy states', async ({ page }) => {
    await page.goto('/components/button/web.html');
    await page.locator('#icon-specimens').evaluate(element => {
      element.hidden = false;
      Object.assign(element.style, {
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem',
      });
    });
    const expectedSizes = { 'icon-sm': 32, 'icon-md': 40, 'icon-lg': 48 };
    for (const [id, size] of Object.entries(expectedSizes)) {
      const button = page.locator('#' + id);
      const dimensions = await button.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { width: rect.width, height: rect.height, paddingLeft: style.paddingInlineStart,
          paddingRight: style.paddingInlineEnd };
      });
      expect(dimensions, id).toEqual({ width: size, height: size, paddingLeft: '0px', paddingRight: '0px' });
      await expect(button).toHaveAttribute('data-vf-icon-only', '');
    }
    const busy = page.getByRole('button', { name: 'Save' });
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await expect(busy).toBeEnabled();
    await expect(busy.locator('svg')).toHaveCSS('visibility', 'hidden');
    const indicator = await busy.evaluate(element => {
      const buttonRect = element.getBoundingClientRect();
      const before = getComputedStyle(element, '::before');
      return {
        position: before.position,
        visible: before.display !== 'none',
        inset: before.inset,
        size: parseFloat(before.width),
        buttonSize: buttonRect.width,
      };
    });
    expect(indicator.position).toBe('absolute');
    expect(indicator.visible).toBe(true);
    expect(indicator.size).toBeGreaterThan(0);
    expect(indicator.buttonSize).toBe(40);
    await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    await page.locator('#icon-md').focus();
    await expect(page.locator('#icon-md')).toBeFocused();
    expect(await page.locator('#icon-md').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);
    await page.locator('#icon-specimens').screenshot({
      path: test.info().outputPath('button-icon-only-light.png'),
    });
    await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
    await page.locator('#icon-specimens').screenshot({
      path: test.info().outputPath('button-icon-only-dark.png'),
    });
  });

  test('icon-only remains square under compact density, RTL, forced colors and reduced motion', async ({ page }) => {
    await page.goto('/components/button/web.html');
    await page.locator('#icon-specimens').evaluate(element => {
      element.hidden = false;
      Object.assign(element.style, {
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem',
      });
    });
    await page.evaluate(() => {
      document.documentElement.dataset.vfDensity = 'compact';
      document.documentElement.dir = 'rtl';
      document.documentElement.dataset.vfTheme = 'dark';
    });
    for (const id of ['icon-sm', 'icon-md', 'icon-lg']) {
      const dims = await page.locator('#' + id).evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      expect(dims.width, id).toBe(dims.height);
      expect(dims.width, id).toBeGreaterThanOrEqual(32);
    }
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    const busy = page.locator('#icon-busy');
    expect(await busy.evaluate(el => getComputedStyle(el, '::before').animationName)).toBe('none');
    const disabled = page.locator('#icon-disabled');
    await expect(disabled).toBeDisabled();
    await expect(page.locator('#icon-sm')).toBeVisible();
    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);
    await page.locator('#icon-specimens').screenshot({
      path: test.info().outputPath('button-icon-only-forced-colors-rtl.png'),
    });
  });
});

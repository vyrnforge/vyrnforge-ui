import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Theme Toggle real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('preserves native switch semantics while the wyvern consumes and releases the light', async ({ page }, testInfo) => {
    await page.goto('/components/theme-toggle/web.html');

    const control = page.locator('#light-theme');
    const root = control.locator('xpath=..');
    const track = root.locator('[data-vf-theme-toggle-track]');
    const breath = root.locator('[data-vf-theme-toggle-breath]');
    const dragon = root.locator('[data-vf-theme-toggle-dragon]');
    const dragonArt = dragon.locator('svg.vf-theme-toggle-dragon-art');
    const thumb = root.locator('[data-vf-theme-toggle-thumb]');
    const ember = root.locator('[data-vf-theme-toggle-ember]');

    await expect(control).toHaveAttribute('type', 'checkbox');
    await expect(control).toHaveAttribute('role', 'switch');
    await expect(control).not.toBeChecked();

    const target = await control.boundingBox();
    expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

    await expect(dragonArt).toHaveAttribute('viewBox', '0 0 116 68');
    await expect(dragonArt.locator('path')).toHaveCount(9);
    await expect(dragonArt.locator('ellipse')).toHaveCount(2);
    const dragonArtLayout = await dragonArt.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));
    expect(dragonArtLayout.width).toBeGreaterThanOrEqual(40);
    expect(dragonArtLayout.height).toBeGreaterThanOrEqual(24);

    const presentation = await root.evaluate((element) => {
      const thumbElement = element.querySelector('[data-vf-theme-toggle-thumb]');
      const breathElement = element.querySelector('[data-vf-theme-toggle-breath]');
      const dragonElement = element.querySelector('[data-vf-theme-toggle-dragon]');
      const dragonVector = dragonElement.querySelector('svg.vf-theme-toggle-dragon-art');
      const emberElement = element.querySelector('[data-vf-theme-toggle-ember]');
      const duration = getComputedStyle(thumbElement).transitionDuration
        .split(',')
        .map((value) => Number.parseFloat(value.trim()))
        .filter(Number.isFinite);
      return {
        maxThumbTransitionSeconds: Math.max(...duration),
        breathHasDetail: getComputedStyle(breathElement).backgroundImage !== 'none',
        dragonVectorPresent: Boolean(dragonVector),
        dragonVectorPathCount: dragonVector?.querySelectorAll('path').length ?? 0,
        dragonVectorEllipseCount: dragonVector?.querySelectorAll('ellipse').length ?? 0,
        emberHasDetail: getComputedStyle(emberElement).backgroundImage !== 'none',
      };
    });
    expect(presentation.maxThumbTransitionSeconds).toBeGreaterThanOrEqual(0.5);
    expect(presentation.breathHasDetail).toBe(true);
    expect(presentation.dragonVectorPresent).toBe(true);
    expect(presentation.dragonVectorPathCount).toBeGreaterThanOrEqual(9);
    expect(presentation.dragonVectorEllipseCount).toBeGreaterThanOrEqual(2);
    expect(presentation.emberHasDetail).toBe(true);

    await expect(dragon).toHaveCSS('opacity', '0.08');
    await expect(ember).toHaveCSS('opacity', '1');
    await page.screenshot({ path: testInfo.outputPath('theme-toggle-light.png'), fullPage: true });
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-light-control.png') });

    const lightTransform = await thumb.evaluate((element) => getComputedStyle(element).transform);
    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect.poll(() => ember.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');
    await expect.poll(() => breath.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');
    await page.screenshot({ path: testInfo.outputPath('theme-toggle-dark.png'), fullPage: true });
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-dark-control.png') });

    await control.focus();
    expect(await track.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    await page.keyboard.press('Space');
    await expect(control).not.toBeChecked();
    await page.waitForTimeout(280);
    const releaseFrame = await root.evaluate((element) => {
      const breathElement = element.querySelector('[data-vf-theme-toggle-breath]');
      const dragonElement = element.querySelector('[data-vf-theme-toggle-dragon]');
      const breathStyle = getComputedStyle(breathElement);
      const transform = breathStyle.transform === 'none'
        ? new DOMMatrixReadOnly()
        : new DOMMatrixReadOnly(breathStyle.transform);
      return {
        breathOpacity: Number.parseFloat(breathStyle.opacity),
        breathScaleX: Math.abs(transform.a),
        dragonOpacity: Number.parseFloat(getComputedStyle(dragonElement).opacity),
      };
    });
    expect(releaseFrame.breathOpacity).toBeGreaterThan(0.2);
    expect(releaseFrame.breathScaleX).toBeGreaterThan(0.1);
    expect(releaseFrame.dragonOpacity).toBeGreaterThan(0.35);
    await page.screenshot({ path: testInfo.outputPath('theme-toggle-release.png'), fullPage: true });
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-release-control.png') });
    await expect.poll(() => ember.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).opacity)).toBe('0.08');

    const disabled = page.locator('#disabled-theme');
    await expect(disabled).toBeDisabled();
    await disabled.evaluate((element) => element.click());
    await expect(disabled).not.toBeChecked();

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await control.uncheck();
    await control.check();
    await expect(control).toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      return new DOMMatrixReadOnly(transform).m41;
    })).toBeLessThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await ember.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(track).toBeVisible();
    await expect(thumb).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

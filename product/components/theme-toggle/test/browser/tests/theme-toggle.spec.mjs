import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Theme Toggle real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('preserves native switch semantics while one dragon geometry orbits and changes palette', async ({ page }, testInfo) => {
    await page.goto('/components/theme-toggle/web.html');

    const control = page.locator('#light-theme');
    const root = control.locator('xpath=..');
    const track = root.locator('[data-vf-theme-toggle-track]');
    const orbit = root.locator('[data-vf-theme-toggle-breath]');
    const dragon = root.locator('[data-vf-theme-toggle-dragon]');
    const dragonArt = dragon.locator('svg.vf-theme-toggle-dragon-art');
    const body = dragonArt.locator('.vf-theme-toggle-dragon-body');
    const wing = dragonArt.locator('.vf-theme-toggle-dragon-wing');
    const head = dragonArt.locator('.vf-theme-toggle-dragon-head');
    const eye = dragonArt.locator('.vf-theme-toggle-dragon-eye');
    const thumb = root.locator('[data-vf-theme-toggle-thumb]');
    const orb = root.locator('[data-vf-theme-toggle-ember]');

    await expect(control).toHaveAttribute('type', 'checkbox');
    await expect(control).toHaveAttribute('role', 'switch');
    await expect(control).not.toBeChecked();

    const target = await control.boundingBox();
    expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

    await expect(dragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
    await expect(dragonArt).toHaveAttribute('viewBox', '0 0 48 48');
    await expect(body).toHaveCount(1);
    await expect(wing).toHaveCount(1);
    await expect(head).toHaveCount(1);
    await expect(eye).toHaveCount(1);
    await expect(dragonArt.locator('path')).toHaveCount(3);
    await expect(dragonArt.locator('circle')).toHaveCount(1);

    const dragonArtLayout = await dragonArt.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      fallbackBeforeDisplay: getComputedStyle(element.parentElement, '::before').display,
      fallbackAfterDisplay: getComputedStyle(element.parentElement, '::after').display,
    }));
    expect(dragonArtLayout.width).toBeGreaterThanOrEqual(44);
    expect(dragonArtLayout.height).toBeGreaterThanOrEqual(44);
    expect(dragonArtLayout.fallbackBeforeDisplay).toBe('none');
    expect(dragonArtLayout.fallbackAfterDisplay).toBe('none');

    const light = await root.evaluate((element) => {
      const thumbElement = element.querySelector('[data-vf-theme-toggle-thumb]');
      const dragonElement = element.querySelector('[data-vf-theme-toggle-dragon]');
      const orbElement = element.querySelector('[data-vf-theme-toggle-ember]');
      const orbitElement = element.querySelector('[data-vf-theme-toggle-breath]');
      const trackElement = element.querySelector('[data-vf-theme-toggle-track]');
      const durations = getComputedStyle(thumbElement).transitionDuration
        .split(',')
        .map((value) => Number.parseFloat(value.trim()))
        .filter(Number.isFinite);

      return {
        maxThumbTransitionSeconds: Math.max(...durations),
        thumbTransform: getComputedStyle(thumbElement).transform,
        dragonTransform: getComputedStyle(dragonElement).transform,
        dragonColor: getComputedStyle(dragonElement).color,
        orbBackground: getComputedStyle(orbElement).backgroundColor,
        orbitTransform: getComputedStyle(orbitElement).transform,
        nightOpacity: Number.parseFloat(getComputedStyle(trackElement, '::after').opacity),
      };
    });

    expect(light.maxThumbTransitionSeconds).toBeGreaterThanOrEqual(0.6);
    expect(light.nightOpacity).toBeLessThan(0.1);
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-light-control.png') });

    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toBeChecked();

    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.thumbTransform);
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.dragonTransform);
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).color)).not.toBe(light.dragonColor);
    await expect.poll(() => orb.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(light.orbBackground);
    await expect.poll(() => orbit.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.orbitTransform);
    await expect.poll(() => track.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::after').opacity))).toBe(1);

    const dark = await root.evaluate((element) => {
      const thumbElement = element.querySelector('[data-vf-theme-toggle-thumb]');
      const dragonElement = element.querySelector('[data-vf-theme-toggle-dragon]');
      const thumbTransform = getComputedStyle(thumbElement).transform;
      const dragonTransform = getComputedStyle(dragonElement).transform;

      return {
        thumbTranslateX: thumbTransform === 'none' ? 0 : new DOMMatrixReadOnly(thumbTransform).m41,
        dragonTranslateX: dragonTransform === 'none' ? 0 : new DOMMatrixReadOnly(dragonTransform).m41,
      };
    });
    expect(dark.thumbTranslateX).toBeGreaterThan(0);
    expect(dark.dragonTranslateX).toBeGreaterThan(0);

    await page.waitForTimeout(650);
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-dark-control.png') });

    await control.focus();
    expect(await track.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    await page.keyboard.press('Space');
    await expect(control).not.toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).toBe(light.thumbTransform);
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).color)).toBe(light.dragonColor);

    const disabled = page.locator('#disabled-theme');
    await expect(disabled).toBeDisabled();
    await disabled.evaluate((element) => element.click());
    await expect(disabled).not.toBeChecked();

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await control.check();
    await expect(control).toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      return new DOMMatrixReadOnly(transform).m41;
    })).toBeLessThan(0);
    await expect.poll(() => dragon.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      return new DOMMatrixReadOnly(transform).m41;
    })).toBeLessThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await orb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await dragon.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(track).toBeVisible();
    await expect(thumb).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

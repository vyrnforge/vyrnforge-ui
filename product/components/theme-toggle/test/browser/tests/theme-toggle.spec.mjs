import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Theme Toggle real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('preserves native switch semantics while the dragon consumes and releases the light', async ({ page }, testInfo) => {
    await page.goto('/components/theme-toggle/web.html');

    const control = page.locator('#light-theme');
    const root = control.locator('xpath=..');
    const track = root.locator('[data-vf-theme-toggle-track]');
    const breath = root.locator('[data-vf-theme-toggle-breath]');
    const dragon = root.locator('[data-vf-theme-toggle-dragon]');
    const dragonArt = dragon.locator('svg.vf-theme-toggle-dragon-art');
    const upperJaw = dragonArt.locator('.vf-theme-toggle-dragon-upper-jaw');
    const lowerJaw = dragonArt.locator('.vf-theme-toggle-dragon-lower-jaw');
    const thumb = root.locator('[data-vf-theme-toggle-thumb]');
    const ember = root.locator('[data-vf-theme-toggle-ember]');

    await expect(control).toHaveAttribute('type', 'checkbox');
    await expect(control).toHaveAttribute('role', 'switch');
    await expect(control).not.toBeChecked();

    const target = await control.boundingBox();
    expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

    await expect(dragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
    await expect(dragonArt).toHaveAttribute('viewBox', '0 0 64 56');
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-neck')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-crest')).toHaveCount(1);
    await expect(upperJaw).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-cheek')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-brow')).toHaveCount(1);
    await expect(lowerJaw).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-fangs')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-eye')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-nostril')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-mouth-glow')).toHaveCount(1);
    await expect(dragonArt.locator('.vf-theme-toggle-dragon-scales')).toHaveCount(1);

    const dragonArtLayout = await dragonArt.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      zIndex: getComputedStyle(element).zIndex,
      fallbackBeforeDisplay: getComputedStyle(element.parentElement, '::before').display,
      fallbackAfterDisplay: getComputedStyle(element.parentElement, '::after').display,
    }));
    expect(dragonArtLayout.width).toBeGreaterThanOrEqual(60);
    expect(dragonArtLayout.height).toBeGreaterThanOrEqual(54);
    expect(Number.parseInt(dragonArtLayout.zIndex, 10)).toBeGreaterThanOrEqual(1);
    expect(dragonArtLayout.fallbackBeforeDisplay).toBe('none');
    expect(dragonArtLayout.fallbackAfterDisplay).toBe('none');

    const presentation = await root.evaluate((element) => {
      const thumbElement = element.querySelector('[data-vf-theme-toggle-thumb]');
      const breathElement = element.querySelector('[data-vf-theme-toggle-breath]');
      const dragonVector = element.querySelector('svg.vf-theme-toggle-dragon-art');
      const emberElement = element.querySelector('[data-vf-theme-toggle-ember]');
      const duration = getComputedStyle(thumbElement).transitionDuration
        .split(',')
        .map((value) => Number.parseFloat(value.trim()))
        .filter(Number.isFinite);
      return {
        maxThumbTransitionSeconds: Math.max(...duration),
        breathHasDetail: getComputedStyle(breathElement).backgroundImage !== 'none',
        crestPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-crest')),
        upperJawPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-upper-jaw')),
        lowerJawPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-lower-jaw')),
        neckPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-neck')),
        cheekPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-cheek')),
        fangPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-fangs')),
        browPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-brow')),
        eyePresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-eye')),
        nostrilPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-nostril')),
        mouthGlowPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-mouth-glow')),
        scaleDetailPresent: Boolean(dragonVector?.querySelector('.vf-theme-toggle-dragon-scales')),
        emberHasDetail: getComputedStyle(emberElement).backgroundImage !== 'none',
      };
    });
    expect(presentation.maxThumbTransitionSeconds).toBeGreaterThanOrEqual(0.5);
    expect(presentation.breathHasDetail).toBe(true);
    expect(presentation.crestPresent).toBe(true);
    expect(presentation.upperJawPresent).toBe(true);
    expect(presentation.lowerJawPresent).toBe(true);
    expect(presentation.neckPresent).toBe(true);
    expect(presentation.cheekPresent).toBe(true);
    expect(presentation.fangPresent).toBe(true);
    expect(presentation.browPresent).toBe(true);
    expect(presentation.eyePresent).toBe(true);
    expect(presentation.nostrilPresent).toBe(true);
    expect(presentation.mouthGlowPresent).toBe(true);
    expect(presentation.scaleDetailPresent).toBe(true);
    expect(presentation.emberHasDetail).toBe(true);

    expect(Number.parseFloat(await dragon.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(0.05);
    await expect(ember).toHaveCSS('opacity', '1');
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-light-control.png') });

    const lightTransform = await thumb.evaluate((element) => getComputedStyle(element).transform);
    const lightUpperJawTransform = await upperJaw.evaluate((element) => getComputedStyle(element).transform);
    const lightLowerJawTransform = await lowerJaw.evaluate((element) => getComputedStyle(element).transform);
    expect(lightUpperJawTransform).not.toBe('none');
    expect(lightLowerJawTransform).not.toBe('none');

    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toBeChecked();
    await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
    await expect.poll(() => dragon.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect.poll(() => ember.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');
    await expect.poll(() => breath.evaluate((element) => getComputedStyle(element).opacity)).toBe('0');
    await expect.poll(() => upperJaw.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
    await expect.poll(() => lowerJaw.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
    expect(Number.parseFloat(await thumb.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(0.4);
    await page.waitForTimeout(600);
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-dark-control.png') });

    await control.focus();
    expect(await track.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    await page.keyboard.press('Space');
    await expect(control).not.toBeChecked();
    await page.waitForTimeout(280);
    const releaseFrame = await root.evaluate((element) => {
      const breathElement = element.querySelector('[data-vf-theme-toggle-breath]');
      const dragonElement = element.querySelector('[data-vf-theme-toggle-dragon]');
      const upperJawElement = element.querySelector('.vf-theme-toggle-dragon-upper-jaw');
      const lowerJawElement = element.querySelector('.vf-theme-toggle-dragon-lower-jaw');
      const breathStyle = getComputedStyle(breathElement);
      const transform = breathStyle.transform === 'none'
        ? new DOMMatrixReadOnly()
        : new DOMMatrixReadOnly(breathStyle.transform);
      return {
        breathOpacity: Number.parseFloat(breathStyle.opacity),
        breathScaleX: Math.abs(transform.a),
        dragonOpacity: Number.parseFloat(getComputedStyle(dragonElement).opacity),
        upperJawTransform: getComputedStyle(upperJawElement).transform,
        lowerJawTransform: getComputedStyle(lowerJawElement).transform,
      };
    });
    expect(releaseFrame.breathOpacity).toBeGreaterThan(0.2);
    expect(releaseFrame.breathScaleX).toBeGreaterThan(0.1);
    expect(releaseFrame.dragonOpacity).toBeGreaterThan(0.25);
    expect(releaseFrame.upperJawTransform).not.toBe('none');
    expect(releaseFrame.lowerJawTransform).not.toBe('none');
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-release-control.png') });
    await expect.poll(() => ember.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect.poll(() => dragon.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeLessThan(0.05);

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
    expect(await upperJaw.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(track).toBeVisible();
    await expect(thumb).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';
const canonicalArtworkUrl = new URL('../../../web/theme-toggle-dragon-orb.svg', import.meta.url);

function normalizedPathData(source) {
  return [...source.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim());
}

test.describe('Theme Toggle real-browser contract', () => {
  test.skip(port !== 'web', 'Native Web contract evidence');

  test('uses the canonical smooth dragon asset with slide, orbit, palette, and native switch behavior', async ({ page }, testInfo) => {
    const canonicalArtwork = await readFile(canonicalArtworkUrl, 'utf8');
    const canonicalPaths = normalizedPathData(canonicalArtwork);

    await page.goto('/components/theme-toggle/web.html');

    const control = page.locator('#light-theme');
    const root = control.locator('xpath=..');
    const track = root.locator('[data-vf-theme-toggle-track]');
    const artwork = root.locator('[data-vf-theme-toggle-dragon]');
    const svg = artwork.locator('svg.vf-theme-toggle-dragon-art');
    const dragonMark = svg.locator('[data-vf-theme-toggle-dragon-mark]');
    const orb = svg.locator('[data-vf-theme-toggle-orb]');
    const silhouette = svg.locator('.vf-theme-toggle-dragon-silhouette');
    const accent = svg.locator('.vf-theme-toggle-dragon-accent');
    const eye = svg.locator('.vf-theme-toggle-dragon-eye');
    const eyeSlit = svg.locator('.vf-theme-toggle-dragon-eye-slit');
    const jawShadow = svg.locator('.vf-theme-toggle-dragon-jaw-shadow');
    const highlight = svg.locator('.vf-theme-toggle-dragon-highlight');
    const faceDetail = svg.locator('.vf-theme-toggle-dragon-face-detail');
    const bodyRidges = svg.locator('.vf-theme-toggle-dragon-body-ridges');
    const thumb = root.locator('[data-vf-theme-toggle-thumb]');

    await expect(control).toHaveAttribute('type', 'checkbox');
    await expect(control).toHaveAttribute('role', 'switch');
    await expect(control).not.toBeChecked();

    const target = await control.boundingBox();
    expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

    await expect(artwork).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
    await expect(svg).toHaveAttribute('viewBox', '0 0 650 740');
    await expect(dragonMark).toHaveCount(1);
    await expect(orb).toHaveCount(1);
    await expect(silhouette).toHaveCount(1);
    expect(await silhouette.getAttribute('d')).not.toMatch(/\bM\b[\s\S]*\bM\b/);
    await expect(accent).toHaveCount(1);
    await expect(eye).toHaveCount(1);
    await expect(eyeSlit).toHaveCount(1);
    await expect(jawShadow).toHaveCount(1);
    await expect(highlight).toHaveCount(1);
    await expect(faceDetail).toHaveCount(1);
    await expect(bodyRidges).toHaveCount(1);
    await expect(svg.locator('path')).toHaveCount(8);
    await expect(svg.locator('circle')).toHaveCount(2);
    await expect(svg.locator('ellipse')).toHaveCount(1);

    const livePaths = await svg.locator('path').evaluateAll((paths) =>
      paths.map((path) => (path.getAttribute('d') ?? '').replace(/\s+/g, ' ').trim())
    );
    expect(livePaths).toEqual(canonicalPaths);

    const eyeBox = await eye.evaluate((element) => {
      const box = element.getBBox();
      return { width: box.width, height: box.height };
    });
    expect(eyeBox.width).toBeGreaterThan(25);
    expect(eyeBox.width).toBeLessThan(45);
    expect(eyeBox.height).toBeLessThan(16);

    const layout = await svg.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      fallbackBeforeDisplay: getComputedStyle(element.parentElement, '::before').display,
      fallbackAfterDisplay: getComputedStyle(element.parentElement, '::after').display,
    }));
    expect(layout.width).toBeGreaterThanOrEqual(44);
    expect(layout.height).toBeGreaterThanOrEqual(50);
    expect(layout.fallbackBeforeDisplay).toBe('none');
    expect(layout.fallbackAfterDisplay).toBe('none');

    const light = await root.evaluate((element) => {
      const art = element.querySelector('[data-vf-theme-toggle-dragon]');
      const mark = element.querySelector('[data-vf-theme-toggle-dragon-mark]');
      const orbElement = element.querySelector('[data-vf-theme-toggle-orb]');
      const silhouetteElement = element.querySelector('.vf-theme-toggle-dragon-silhouette');
      const jawShadowElement = element.querySelector('.vf-theme-toggle-dragon-jaw-shadow');
      const highlightElement = element.querySelector('.vf-theme-toggle-dragon-highlight');
      const trackElement = element.querySelector('[data-vf-theme-toggle-track]');
      return {
        artTransform: getComputedStyle(art).transform,
        markTransform: getComputedStyle(mark).transform,
        orbTransform: getComputedStyle(orbElement).transform,
        silhouetteFill: getComputedStyle(silhouetteElement).fill,
        jawShadowFill: getComputedStyle(jawShadowElement).fill,
        highlightFill: getComputedStyle(highlightElement).fill,
        nightOpacity: Number.parseFloat(getComputedStyle(trackElement, '::after').opacity),
        artDuration: getComputedStyle(art).transitionDuration,
        markDuration: getComputedStyle(mark).transitionDuration,
      };
    });

    expect(light.nightOpacity).toBeLessThan(0.1);
    expect(light.artDuration).not.toBe('0s');
    expect(light.markDuration).not.toBe('0s');
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-light-control.png') });

    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toBeChecked();

    await page.waitForTimeout(180);
    expect(await artwork.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.artTransform);
    expect(await dragonMark.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.markTransform);
    expect(await orb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(light.orbTransform);
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-transition-control.png') });

    await expect.poll(() => silhouette.evaluate((element) => getComputedStyle(element).fill)).not.toBe(light.silhouetteFill);
    await expect.poll(() => jawShadow.evaluate((element) => getComputedStyle(element).fill)).not.toBe(light.jawShadowFill);
    await expect.poll(() => highlight.evaluate((element) => getComputedStyle(element).fill)).not.toBe(light.highlightFill);
    await expect.poll(() => track.evaluate((element) => Number.parseFloat(getComputedStyle(element, '::after').opacity))).toBe(1);

    await page.waitForTimeout(560);
    const dark = await root.evaluate((element) => {
      const art = element.querySelector('[data-vf-theme-toggle-dragon]');
      const orbElement = element.querySelector('[data-vf-theme-toggle-orb]');
      const artTransform = getComputedStyle(art).transform;
      return {
        artTranslateX: artTransform === 'none' ? 0 : new DOMMatrixReadOnly(artTransform).m41,
        orbTransform: getComputedStyle(orbElement).transform,
      };
    });
    expect(dark.artTranslateX).toBeGreaterThan(0);
    expect(dark.orbTransform).not.toBe(light.orbTransform);
    await root.screenshot({ path: testInfo.outputPath('theme-toggle-dark-control.png') });

    await control.focus();
    expect(await track.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    await page.keyboard.press('Space');
    await expect(control).not.toBeChecked();
    await expect.poll(() => artwork.evaluate((element) => getComputedStyle(element).transform)).toBe(light.artTransform);
    await expect.poll(() => silhouette.evaluate((element) => getComputedStyle(element).fill)).toBe(light.silhouetteFill);

    const disabled = page.locator('#disabled-theme');
    await expect(disabled).toBeDisabled();
    await disabled.evaluate((element) => element.click());
    await expect(disabled).not.toBeChecked();

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await control.check();
    await expect(control).toBeChecked();
    await expect.poll(() => artwork.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      return new DOMMatrixReadOnly(transform).m41;
    })).toBeLessThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await artwork.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await dragonMark.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await orb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await silhouette.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await jawShadow.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    expect(await faceDetail.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(track).toBeVisible();
    await expect(artwork).toBeHidden();
    await expect(thumb).toBeVisible();
    expect(Number.parseFloat(await thumb.evaluate((element) => getComputedStyle(element).opacity))).toBe(1);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

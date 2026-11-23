import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('popover shadow comparison provides actual-size light/dark evidence for review', async ({ page }, testInfo) => {
  test.skip(port !== 'web', 'Public Web visual acceptance evidence is reviewed on the canonical styling lane.');

  for (const viewport of [
    { width: 1280, height: 720, label: 'desktop' },
    { width: 320, height: 480, label: 'narrow-200pct-text' },
  ]) {
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/components/popover/web.html');
      await page.locator('html').evaluate(
        (element, state) => {
          element.dataset.vfTheme = state.theme;
          element.style.fontSize = state.enlarged ? '200%' : '';
        },
        { theme, enlarged: viewport.width === 320 },
      );
      await page.locator('#t').click();
      const surface = page.locator('#c');
      await expect(surface).toBeVisible();

      // Simulate ONLY the old fallback shadow, not a separate old-build screenshot.
      await surface.evaluate((element) =>
        element.style.setProperty(
          '--vf-shadow-popover',
          '0 0.5rem 1.5rem color-mix(in srgb, var(--vf-color-text) 18%, transparent)',
        ),
      );
      const legacyName = 'popover-previous-shadow-' + theme + '-' + viewport.label;
      const legacyPath = testInfo.outputPath(legacyName + '.png');
      await page.screenshot({ path: legacyPath, fullPage: false });
      await testInfo.attach(legacyName, { path: legacyPath, contentType: 'image/png' });

      await surface.evaluate((element) => element.style.removeProperty('--vf-shadow-popover'));
      const currentName = 'popover-canonical-shadow-' + theme + '-' + viewport.label;
      const currentPath = testInfo.outputPath(currentName + '.png');
      await page.screenshot({ path: currentPath, fullPage: false });
      await testInfo.attach(currentName, { path: currentPath, contentType: 'image/png' });
    }
  }
});

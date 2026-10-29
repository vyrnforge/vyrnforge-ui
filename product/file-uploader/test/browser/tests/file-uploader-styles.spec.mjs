import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public FileUploader CSS resolves the canonical focus ring in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/file-uploader/web.html');
  const dropzone = page.locator('#dropzone');
  const focusRingByTheme = {
    light: 'rgb(47, 111, 237)',
    dark: 'rgb(141, 180, 255)',
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.keyboard.press('Tab');
    await expect(dropzone).toBeFocused();
    await expect(dropzone).toHaveCSS('outline-width', '2px');
    await expect(dropzone).toHaveCSS('outline-color', focusRingByTheme[theme]);
  }
});

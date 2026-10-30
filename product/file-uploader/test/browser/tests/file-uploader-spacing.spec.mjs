import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public FileUploader CSS uses canonical medium surface rhythm and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/file-uploader/web.html');

  const root = page.locator('[data-vf-file-uploader-root]');
  const dropzone = page.locator('#dropzone');
  await expect(root).toHaveCSS('gap', '16px');
  await expect(dropzone).toHaveCSS('padding-top', '16px');
  await expect(dropzone).toHaveCSS('padding-left', '16px');

  await root.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(root).toHaveCSS('gap', '20px');
  await expect(dropzone).toHaveCSS('padding-left', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(root).toHaveCSS('gap', '20px');
  await expect(dropzone).toHaveCSS('padding-left', '20px');
});

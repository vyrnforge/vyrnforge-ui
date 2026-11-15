import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';
const cases = [
  ['tabs', '#web-tabs', '#web-tabs-tab-overview'],
  ['popover', '#c', '#action', '#t'],
  ['menu', '#web-menu', '#web-edit', '#web-trigger'],
  ['multi-select', '[data-vf-multi-select-content]', '#web-one', '[data-vf-multi-select-trigger]'],
  ['rating', '[role="radiogroup"]', 'input[type="radio"]'],
  ['number-field', '#input-root', '#input'],
  ['pagination', 'nav[aria-label="Pagination"]', 'nav[aria-label="Pagination"] [aria-current="page"]'],
  ['split-panel', '#root', '#handle'],
  ['toast', '#controlled-toast', '#controlled-close'],
];

async function capture(page, target, focus, testInfo, component) {
  for (const [label, theme, media, direction] of [
    ['light', 'light', { colorScheme: 'light', forcedColors: 'none' }, 'ltr'],
    ['dark', 'dark', { colorScheme: 'dark', forcedColors: 'none' }, 'ltr'],
    ['forced-rtl', 'light', { colorScheme: 'light', forcedColors: 'active', reducedMotion: 'reduce' }, 'rtl'],
  ]) {
    await page.emulateMedia(media);
    await page.locator('html').evaluate((el, { theme, direction }) => {
      el.setAttribute('data-vf-theme', theme);
      el.dir = direction;
      el.style.backgroundColor = 'var(--vf-color-surface)';
      el.style.color = 'var(--vf-color-text)';
    }, { theme, direction });
    await focus.focus();
    await expect(focus).toBeFocused();
    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();
    const png = await page.screenshot({ animations: 'disabled' });
    await testInfo.attach(component + '-' + label, { body: png, contentType: 'image/png' });
    if (label === 'dark') {
      const preview = await page.screenshot({ type: 'jpeg', quality: 40, animations: 'disabled' });
      console.log('VF_VISUAL_PREVIEW ' + component + ' ' + preview.toString('base64'));
    }
  }
}

for (const [component, selector, focusSelector, triggerSelector] of cases) {
  test('representative visual capture: ' + component, async ({ page }, testInfo) => {
    test.skip(port !== 'web', 'Canonical Web CSS representative.');
    await page.setViewportSize({ width: 900, height: 640 });
    await page.goto('/components/' + component + '/web.html');
    if (triggerSelector) await page.locator(triggerSelector).first().click();
    const target = page.locator(selector).first();
    const focus = page.locator(focusSelector).first();
    await capture(page, target, focus, testInfo, component);
  });
}

test('representative visual capture: real MultiSelect summary', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'Real React selection summary composition.');
  await page.setViewportSize({ width: 900, height: 640 });
  await page.goto('/components/multi-select/react.html');
  await page.waitForFunction(() => document.body.dataset.multiReady === 'true');
  const target = page.locator('#summary-example');
  const focus = target.getByRole('button', { name: 'Remove One' });
  await expect(target.locator('[data-vf-multi-select-summary]')).toHaveText('One and Three');
  await capture(page, target, focus, testInfo, 'multi-select-summary');
});

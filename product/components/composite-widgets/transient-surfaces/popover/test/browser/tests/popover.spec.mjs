import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function load(page) {
  await page.goto(`/components/popover/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.popoverReady === 'true');
}

test('Popover relationship is present in server markup and the native surface starts closed', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/popover/${port}.html`);
    await expect(page.locator('#t')).toHaveAttribute('aria-controls', 'c');
    await expect(page.locator('#c')).toBeHidden();
    await expect(page.locator('#c')).toHaveAttribute('aria-labelledby', 'popover-title');
  } finally {
    await context.close();
  }
});

test('Popover opens accessibly using native top layer and preserves authored naming', async ({ page }) => {
  await load(page);
  const trigger = page.locator('#t');
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Popover details' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'popover-title');
  expect(await dialog.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  if (port !== 'web') await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.press('Tab');
  await expect(page.locator('#action')).toBeFocused();
  await expectNoAxeViolations(page);
  await page.locator('#outside').click();
  await expect(dialog).toBeHidden();
  if (port !== 'web') await expect(page.locator('#outside')).toBeFocused();
  if (port !== 'web') await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Nested native Popover closes only the innermost surface and restores source focus', async ({ page }) => {
  await load(page);
  const trigger = page.locator('#t');
  await trigger.focus();
  await trigger.press('Enter');
  const outer = page.locator('#c');
  await expect(outer).toBeVisible();
  const nestedTrigger = page.locator('#nested-trigger');
  await nestedTrigger.focus();
  await nestedTrigger.press('Enter');
  const inner = page.locator('#nested-content');
  await expect(inner).toBeVisible();
  await expect(outer).toBeVisible();
  await page.locator('#nested-action').focus();
  await page.keyboard.press('Escape');
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();
  // Native Web demonstrates platform dismissal; the runtime ports own the additional nested focus policy.
  if (port !== 'web') await expect(nestedTrigger).toBeFocused();
  else await nestedTrigger.focus();
  await page.keyboard.press('Escape');
  await expect(outer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Controlled Popover reconciles a rejected native close request', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await load(page);
  const trigger = page.locator('#controlled-trigger');
  await trigger.focus();
  await trigger.press('Enter');
  const surface = page.locator('#controlled-content');
  await expect(surface).toBeVisible();
  await page.locator('#controlled-action').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveAttribute('data-popover-request', 'false');
  await expect(surface).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(await surface.evaluate((element) => element.matches(':popover-open'))).toBe(true);
});

test('native Popover tracks its source through scroll, resize and RTL placement', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 760 });
  await load(page);
  await page.evaluate(() => {
    document.body.style.minHeight = '1600px';
    const trigger = document.querySelector('#t');
    Object.assign(trigger.style, { position: 'absolute', top: '320px', left: '400px', width: '80px' });
  });
  await page.locator('#t').press('Enter');
  await expect(page.locator('#c')).toBeVisible();
  async function expectAlignment(rtl = false) {
    await expect
      .poll(() =>
        page.evaluate((rtl) => {
          const trigger = document.querySelector('#t').getBoundingClientRect();
          const surface = document.querySelector('#c').getBoundingClientRect();
          const inlineError = rtl ? surface.right - trigger.right : surface.left - trigger.left;
          return Math.max(Math.abs(inlineError), Math.abs(surface.top - trigger.bottom));
        }, rtl),
      )
      .toBeLessThan(2);
  }
  await expectAlignment();
  await page.evaluate(() => window.scrollTo(0, 120));
  await expectAlignment();
  await page.setViewportSize({ width: 820, height: 640 });
  await expectAlignment();
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await expectAlignment(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#c')).toBeHidden();
});

test('Popover constrains long content in a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await load(page);
  await page.evaluate(() => {
    const trigger = document.querySelector('#t');
    Object.assign(trigger.style, { position: 'fixed', top: '8px', left: '8px' });
    const content = document.querySelector('#c');
    const text = document.createElement('p');
    text.textContent = 'LongUnbrokenText'.repeat(30);
    content.append(text);
    for (let index = 0; index < 30; index += 1) {
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Additional authored content';
      content.append(paragraph);
    }
  });
  await page.locator('#t').press('Enter');
  const surface = page.locator('#c');
  await expect(surface).toBeVisible();
  await expect
    .poll(() =>
      surface.evaluate((element) => ({
        width: element.getBoundingClientRect().width <= window.innerWidth,
        contained:
          element.getBoundingClientRect().top >= 0 &&
          element.getBoundingClientRect().bottom <= window.innerHeight + 1 &&
          element.getBoundingClientRect().left >= 0 &&
          element.getBoundingClientRect().right <= window.innerWidth + 1,
        height: element.getBoundingClientRect().height <= window.innerHeight - 16,
        scrollable: element.scrollHeight > element.clientHeight,
        wraps: element.scrollWidth <= element.clientWidth + 1,
      })),
    )
    .toEqual({ width: true, contained: true, height: true, scrollable: true, wraps: true });
  await surface.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await surface.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(surface).toBeHidden();
});

test('public Popover CSS uses canonical elevation and native top-layer stacking', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/popover/web.html');
  await page.locator('#t').click();
  const surface = page.locator('#c');
  await expect(surface).toBeVisible();
  await expect(surface).toHaveCSS('z-index', 'auto');

  await surface.evaluate((element) => element.style.setProperty('--vf-shadow-md', '0 0 0 7px rgb(1 2 3)'));
  await expect(surface).toHaveCSS('box-shadow', 'rgb(1, 2, 3) 0px 0px 0px 7px');

  await surface.evaluate((element) =>
    element.style.setProperty('--vf-shadow-popover', '0 0 0 9px rgb(4 5 6)'),
  );
  await expect(surface).toHaveCSS('box-shadow', 'rgb(4, 5, 6) 0px 0px 0px 9px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(surface).toHaveCSS('box-shadow', 'none');
});

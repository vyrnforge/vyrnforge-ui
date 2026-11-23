import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function load(page) {
  await page.goto(`/components/preview-card/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.previewReady === 'true');
}

test('PreviewCard retains authored native link and content relationships', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/preview-card/${port}.html`);
    await expect(page.getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute('href', '#profile');
    await expect(page.locator('#t')).toHaveAttribute('aria-controls', 'c');
    await expect(page.locator('#c')).toHaveAttribute('aria-label', 'Profile preview');
    if (port !== 'web') await expect(page.locator('#c')).toBeHidden();
  } finally {
    await context.close();
  }
});

test('PreviewCard uses native anchored top layer and remains available across hover and focus', async ({ page }) => {
  test.skip(port === 'web', 'Runtime behavior is owned by the runtime ports.');
  await load(page);
  const trigger = page.locator('#t');
  const surface = page.locator('#c');
  await trigger.hover();
  await expect(surface).toBeVisible();
  await expect(surface).toHaveAttribute('popover', 'manual');
  expect(await surface.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  await surface.hover();
  await page.waitForTimeout(150);
  await expect(surface).toBeVisible();
  await trigger.focus();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(150);
  await expect(surface).toBeVisible();
  await trigger.press('Tab');
  await expect(page.locator('#action')).toBeFocused();
  await expect(surface).toBeVisible();
  await expectNoAxeViolations(page);
  await page.keyboard.press('Escape');
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#outside').focus();
  await trigger.focus();
  await expect(surface).toBeVisible();
  await trigger.press('Enter');
  await expect(page).toHaveURL(/#profile$/);
  await page.locator('#outside').focus();
  await expect(surface).toBeHidden();
});

test('Controlled PreviewCard requests open without overriding committed value', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await load(page);
  const trigger = page.getByRole('link', { name: 'Controlled preview' });
  await trigger.focus();
  await expect(page.locator('body')).toHaveAttribute('data-preview-request', 'true');
  await expect(page.locator('#controlled-content')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Web PreviewCard exposes authored content and canonical styles', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns static semantics and CSS, not a simulated runtime.');
  await load(page);
  const surface = page.getByRole('region', { name: 'Profile preview' });
  await expect(surface).toBeVisible();
  await expect(surface).toHaveCSS('padding-top', '14px');
  await expectNoAxeViolations(page);
});

test('PreviewCard tracks its focused source through scroll, resize, RTL and block collision', async ({ page }) => {
  test.skip(port === 'web', 'Static Web PreviewCard does not own a native popup lifecycle.');
  await page.setViewportSize({ width: 1000, height: 760 });
  await load(page);
  await page.evaluate(() => {
    document.body.style.minHeight = '1600px';
    const trigger = document.querySelector('#t');
    Object.assign(trigger.style, { position: 'absolute', top: '320px', left: '400px', width: '80px' });
  });
  const trigger = page.locator('#t');
  const surface = page.locator('#c');
  await trigger.focus();
  await expect(surface).toBeVisible();
  async function expectAlignment(rtl = false, above = false) {
    await expect
      .poll(() =>
        page.evaluate(
          ({ rtl, above }) => {
            const trigger = document.querySelector('#t').getBoundingClientRect();
            const surface = document.querySelector('#c').getBoundingClientRect();
            const inlineError = rtl ? surface.right - trigger.right : surface.left - trigger.left;
            const blockError = above ? surface.bottom - trigger.top : surface.top - trigger.bottom;
            return Math.max(Math.abs(inlineError), Math.abs(blockError));
          },
          { rtl, above },
        ),
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
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelector('#t').style.top = '610px';
  });
  await expectAlignment(true, true);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('PreviewCard stays contained with enlarged text and narrow viewport', async ({ page }) => {
  test.skip(port === 'web', 'Runtime popover geometry is owned by the runtime ports.');
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto(`/components/preview-card/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.previewReady === 'true');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
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
  const trigger = page.locator('#t');
  const surface = page.locator('#c');
  await trigger.focus();
  await expect(surface).toBeVisible();
  await expect
    .poll(() =>
      surface.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const contained =
          rect.top >= -1 && rect.bottom <= innerHeight + 1 && rect.left >= -1 && rect.right <= innerWidth + 1;
        return {
          contained,
          scrollable: element.scrollHeight > element.clientHeight,
          wraps: element.scrollWidth <= element.clientWidth + 1,
        };
      }),
    )
    .toEqual({ contained: true, scrollable: true, wraps: true });
  await surface.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await surface.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('public PreviewCard CSS uses canonical elevation without fixed stacking order', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await load(page);
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

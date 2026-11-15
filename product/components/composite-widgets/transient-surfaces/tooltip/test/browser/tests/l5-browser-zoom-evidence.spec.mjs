import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const port = process.env.VF_COMPONENT_PORT || 'react';
const extension = resolve('product/_test-support/browser-zoom-extension');
const cases = [
  ['tooltip', 'tooltipReady', '#tip', 'focus'],
  ['preview-card', 'previewReady', '#c', 'focus'],
  ['popover', 'popoverReady', '#c', 'press'],
];

for (const [component, ready, surfaceSelector, activation] of cases) {
  test('actual Chromium tab zoom: ' + component, async ({}, testInfo) => {
    test.skip(port === 'web' || testInfo.project.name !== 'chromium', 'Chromium runtime zoom evidence.');
    test.setTimeout(60000);
    const profile = await mkdtemp(join(tmpdir(), 'vf-browser-zoom-'));
    let context;
    try {
      context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        headless: true,
        viewport: null,
        deviceScaleFactor: undefined,
        screen: undefined,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
          '--window-size=1280,1000',
          '--disable-extensions-except=' + extension,
          '--load-extension=' + extension,
        ],
      });
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const page = context.pages()[0] ?? (await context.newPage());
      await page.goto('http://127.0.0.1:4173/components/' + component + '/' + port + '.html');
      await page.waitForFunction((ready) => document.body.dataset[ready] === 'true', ready);
      const zoom = async (factor) => {
        const actual = await worker.evaluate(async ({ url, factor }) => {
          const tabs = await chrome.tabs.query({});
          const tab = tabs.find((entry) => entry.url === url);
          if (!tab) throw new Error('No fixture tab at ' + url);
          await chrome.tabs.setZoom(tab.id, factor);
          return chrome.tabs.getZoom(tab.id);
        }, { url: page.url(), factor });
        expect(actual).toBe(factor);
      };
      await zoom(1);
      const base = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }));
      expect(base.width).toBeGreaterThanOrEqual(1200);
      await page.evaluate((selector) => {
        const trigger = document.querySelector('#t');
        Object.assign(trigger.style, { position: 'fixed', top: '8px', left: '8px' });
        const content = document.querySelector(selector);
        const text = document.createElement('p');
        text.textContent = 'LongUnbrokenText'.repeat(30);
        content.append(text);
        for (let index = 0; index < 20; index += 1) {
          const paragraph = document.createElement('p');
          paragraph.textContent = 'Additional authored content';
          content.append(paragraph);
        }
      }, surfaceSelector);
      const trigger = page.locator('#t');
      const surface = page.locator(surfaceSelector);
      if (activation === 'focus') await trigger.focus();
      else await trigger.press('Enter');
      await expect(surface).toBeVisible();
      await zoom(4);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBeLessThanOrEqual(330);
      const actual = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }));
      expect(actual.dpr / base.dpr).toBeCloseTo(4, 1);
      await expect.poll(() => surface.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          contained: rect.top >= -1 && rect.bottom <= innerHeight + 1 && rect.left >= -1 && rect.right <= innerWidth + 1,
          wraps: element.scrollWidth <= element.clientWidth + 1,
          scrollable: element.scrollHeight > element.clientHeight,
        };
      })).toEqual({ contained: true, wraps: true, scrollable: true });
      await surface.evaluate((element) => { element.scrollTop = element.scrollHeight; });
      expect(await surface.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await testInfo.attach(component + '-400-percent-browser-zoom', { body: await page.screenshot(), contentType: 'image/png' });
      console.log('VF_BROWSER_ZOOM ' + JSON.stringify({ component, port, base, actual, factor: 4 }));
      await page.keyboard.press('Escape');
      await expect(surface).toBeHidden();
      await expect(trigger).toBeFocused();
    } finally {
      await context?.close();
      await rm(profile, { recursive: true, force: true });
    }
  });
}

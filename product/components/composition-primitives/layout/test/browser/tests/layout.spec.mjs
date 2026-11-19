import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';
const trackCount = value => value.trim().split(/\s+/).filter(Boolean).length;

test('Flow and AutoGrid preserve native composition across application surfaces', async ({ page }, testInfo) => {
  await page.goto(`/components/layout/${port}.html`);
  const block = page.locator('#stack');
  const actions = page.locator('#actions');
  const inline = page.locator('#inline');
  const autoGrid = page.locator('#auto-grid');
  await expect(page.locator('#container')).toHaveJSProperty('tagName', 'MAIN');
  await expect(block).toHaveJSProperty('tagName', 'SECTION');
  await expect(autoGrid).toHaveJSProperty('tagName', 'SECTION');
  await expect(block).toHaveCSS('display', 'flex');
  await expect(block).toHaveCSS('flex-direction', 'column');
  await expect(block).toHaveCSS('gap', '24px');
  await expect(block).toHaveCSS('align-items', 'flex-start');
  await expect(actions).toHaveCSS('flex-direction', 'row');
  await expect(actions).toHaveCSS('flex-wrap', 'wrap');
  await expect(actions).toHaveCSS('gap', '8px');
  await expect(inline).toHaveCSS('flex-direction', 'row');
  await expect(inline).toHaveCSS('flex-wrap', 'nowrap');
  await expect(inline).toHaveCSS('align-items', 'baseline');
  await expect(autoGrid).toHaveCSS('display', 'grid');
  await expect(autoGrid).toHaveCSS('gap', '8px');
  expect(trackCount(await autoGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns))).toBe(3);
  await autoGrid.evaluate(el => { el.style.inlineSize = '19rem'; });
  expect(trackCount(await autoGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns))).toBe(2);

  const first = await page.locator('#first').boundingBox();
  const second = await page.locator('#second').boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first.y - second.y)).toBeLessThan(1);
  expect(first.x).toBeGreaterThan(second.x);
  const input = page.locator('#search');
  await input.focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#controls button')).toBeFocused();
  await expect(page.locator('#controls')).not.toHaveAttribute('role');

  for (const old of ['stack', 'inline', 'cluster', 'container', 'control-group', 'grid', 'aspect-ratio', 'field', 'fieldset', 'radio-group']) {
    await expect(page.locator(`[data-vf-${old}]`)).toHaveCount(0);
  }
  if (port === 'elements') {
    for (const tag of ['vf-stack', 'vf-inline', 'vf-cluster', 'vf-auto-grid', 'vf-container', 'vf-control-group']) {
      await expect(page.locator(tag)).toHaveCount(0);
    }
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath(`layout-flow-${port}.png`), fullPage: true });
});

test('intrinsic narrow and RTL compositions preserve reading and focus order', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`/components/layout/${port}.html`);
  const actions = page.locator('#actions');
  const grid = page.locator('#auto-grid');
  await expect(actions).toHaveCSS('flex-wrap', 'wrap');
  await expect(actions).toHaveAttribute('dir', 'rtl');
  expect(trackCount(await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns))).toBe(1);
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client);
  await page.locator('#search').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#controls button')).toBeFocused();
});

test('theme, consumer overrides, density and forced-colors do not change structural semantics', async ({ page }) => {
  await page.goto(`/components/layout/${port}.html`);
  const block = page.locator('#stack');
  await block.evaluate(el => {
    el.setAttribute('data-vf-theme', 'dark');
    el.setAttribute('data-vf-density', 'compact');
    el.style.setProperty('--vf-space-lg', '2rem');
  });
  await expect(block).toHaveCSS('gap', '32px');
  await expect(block).toHaveCSS('flex-direction', 'column');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await expect(page.locator('#search')).toBeVisible();
  await page.locator('#search').focus();
  await expect(page.locator('#search')).toBeFocused();
});

test('granular CSS loads without reset in both import orders and permits consumer overrides', async ({ page }) => {
  await page.goto(`/components/layout/${port}.html`);
  const block = page.locator('#stack');
  for (const order of [['tokens-only.css', 'layout-only.css'], ['layout-only.css', 'tokens-only.css']]) {
    await page.evaluate((files) => {
      for (const node of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) node.remove();
      for (const file of files) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.append(link);
      }
    }, order);
    await page.waitForFunction(() => document.styleSheets.length >= 2 && Array.from(document.querySelectorAll('link[rel="stylesheet"]')).every(node => node.sheet));
    await expect(block).toHaveCSS('gap', '24px');
    await expect(page.locator('#auto-grid')).toHaveCSS('display', 'grid');
    await block.evaluate(node => { node.style.setProperty('--vf-space-lg', '2.5rem'); });
    await expect(block).toHaveCSS('gap', '40px');
    await block.evaluate(node => node.style.removeProperty('--vf-space-lg'));
  }
});

test('200 percent root text scaling preserves responsive Flow and AutoGrid access at 320 CSS px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`/components/layout/${port}.html`);
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  await expect(page.locator('#auto-grid')).toHaveCSS('display', 'grid');
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.locator('#controls button')).toBeVisible();
  await expect(page.locator('#first')).toBeVisible();
});

test('default Flow and AutoGrid rhythm follows inherited density, explicit gaps stay authoritative', async ({ page }) => {
  await page.goto(`/components/layout/${port}.html`);
  await page.evaluate(() => {
    const root = document.querySelector('#container');
    const fixture = document.createElement('section');
    fixture.id = 'density-fixture';
    fixture.innerHTML = `
      <div id="default-flow" data-vf-flow><span>Label</span><span>Control</span></div>
      <div id="default-grid" data-vf-auto-grid><span>One</span><span>Two</span></div>
      <div id="explicit-flow" data-vf-flow data-vf-flow-gap="lg"><span>One</span><span>Two</span></div>
      <div id="explicit-grid" data-vf-auto-grid data-vf-auto-grid-gap="xs"><span>One</span><span>Two</span></div>
      <section data-vf-density="comfortable">
        <div id="nested-comfortable" data-vf-flow><span>One</span><span>Two</span></div>
        <section data-vf-density="compact">
          <div id="nested-compact" data-vf-flow><span>One</span><span>Two</span></div>
        </section>
      </section>`;
    root.append(fixture);
  });
  const flow = page.locator('#default-flow');
  const grid = page.locator('#default-grid');
  await expect(flow).toHaveCSS('gap', '16px');
  await expect(grid).toHaveCSS('gap', '16px');
  await expect(page.locator('#explicit-flow')).toHaveCSS('gap', '24px');
  await expect(page.locator('#explicit-grid')).toHaveCSS('gap', '4px');

  await page.locator('html').evaluate((node) => node.setAttribute('data-vf-density', 'compact'));
  await expect(flow).toHaveCSS('gap', '8px');
  await expect(grid).toHaveCSS('gap', '8px');
  await expect(page.locator('#nested-comfortable')).toHaveCSS('gap', '16px');
  await expect(page.locator('#nested-compact')).toHaveCSS('gap', '8px');
  await expect(page.locator('#explicit-flow')).toHaveCSS('gap', '24px');
  await expect(page.locator('#explicit-grid')).toHaveCSS('gap', '4px');

  await page.locator('#density-fixture').evaluate((node) => node.style.setProperty('--vf-space-sm', '0.75rem'));
  await expect(flow).toHaveCSS('gap', '12px');
  await expect(grid).toHaveCSS('gap', '12px');
  await expect(page.locator('#nested-comfortable')).toHaveCSS('gap', '16px');
  await expect(page.locator('#explicit-flow')).toHaveCSS('gap', '24px');

  await page.locator('html').evaluate((node) => node.setAttribute('data-vf-density', 'comfortable'));
  await expect(flow).toHaveCSS('gap', '16px');
  await expect(grid).toHaveCSS('gap', '16px');
  await expect(page.locator('#nested-compact')).toHaveCSS('gap', '12px');
  await expect(page.locator('#stack')).toHaveCSS('gap', '24px');
});

test('default density rhythm works without reset at 320 CSS pixels and preserves source focus order', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`/components/layout/${port}.html`);
  await page.locator('html').evaluate((node) => {
    node.setAttribute('data-vf-density', 'compact');
    node.style.fontSize = '200%';
    node.dir = 'rtl';
  });
  const actions = page.locator('#actions');
  await expect(actions).toHaveCSS('gap', '16px');
  await expect(actions).toHaveCSS('flex-wrap', 'wrap');
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.width);
  await page.locator('#search').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#controls button')).toBeFocused();
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#search')).toBeVisible();
});

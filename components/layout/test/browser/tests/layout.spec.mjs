import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Layout separates content bounds, block flow, and wrapping inline flow across ports', async ({ page }) => {
  await page.goto(`/next/layout-fixtures/${port}.html`);
  const container = page.locator('#container');
  const stack = page.locator('#stack');
  const actions = page.locator('#actions');

  if (port === 'elements') {
    await expect(container).toHaveJSProperty('tagName', 'VF-CONTAINER');
    await expect(stack).toHaveJSProperty('tagName', 'VF-STACK');
    await expect(actions).toHaveJSProperty('tagName', 'VF-CLUSTER');
    await expect(actions).toHaveAttribute('data-vf-cluster-gap', 'sm');
  } else {
    await expect(container).toHaveJSProperty('tagName', 'MAIN');
    await expect(stack).toHaveJSProperty('tagName', 'SECTION');
  }

  const containerMetrics = await container.evaluate((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { width: rect.width, left: rect.left, viewportWidth: document.documentElement.clientWidth, maxInlineSize: style.maxInlineSize, paddingInlineStart: style.paddingInlineStart, paddingInlineEnd: style.paddingInlineEnd }; });
  expect(Math.abs(containerMetrics.width - 640)).toBeLessThan(1);
  expect(Math.abs(containerMetrics.left - ((containerMetrics.viewportWidth - containerMetrics.width) / 2))).toBeLessThan(1);
  expect(containerMetrics.maxInlineSize).toBe('640px');
  expect(containerMetrics.paddingInlineStart).toBe('16px');
  expect(containerMetrics.paddingInlineEnd).toBe('16px');

  const stackStyle = await stack.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems }; });
  expect(stackStyle).toEqual({ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: '24px', alignItems: 'flex-start' });

  const clusterStyle = await actions.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent }; });
  expect(clusterStyle).toEqual({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' });

  const firstBox = await page.locator('#first').boundingBox();
  const secondBox = await page.locator('#second').boundingBox();
  const thirdBox = await page.locator('#third').boundingBox();
  expect(firstBox).not.toBeNull(); expect(secondBox).not.toBeNull(); expect(thirdBox).not.toBeNull();
  expect(firstBox.x).toBeGreaterThan(secondBox.x);
  expect(thirdBox.y).toBeGreaterThan(firstBox.y);

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
});

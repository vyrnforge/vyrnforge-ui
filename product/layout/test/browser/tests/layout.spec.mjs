import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';
const trackCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;

test('L3 composition primitives preserve spatial, form, and control relationships across ports', async ({ page }, testInfo) => {
  await page.goto(`/components/layout/${port}.html`);
  const container = page.locator('#container');
  const stack = page.locator('#stack');
  const grid = page.locator('#grid');
  const actions = page.locator('#actions');
  const inline = page.locator('#inline');
  const ratio = page.locator('#ratio');
  const field = page.locator('#field');
  const fieldset = page.locator('#fieldset');
  const inputGroup = page.locator('#input-group');
  const radioGroup = page.locator('#radio-group');

  if (port === 'elements') {
    await expect(container).toHaveJSProperty('tagName', 'VF-CONTAINER');
    await expect(stack).toHaveJSProperty('tagName', 'VF-STACK');
    await expect(grid).toHaveJSProperty('tagName', 'VF-GRID');
    await expect(actions).toHaveJSProperty('tagName', 'VF-CLUSTER');
    await expect(inline).toHaveJSProperty('tagName', 'VF-INLINE');
    await expect(ratio).toHaveJSProperty('tagName', 'VF-ASPECT-RATIO');
    await expect(field).toHaveJSProperty('tagName', 'VF-FIELD');
    await expect(fieldset).toHaveJSProperty('tagName', 'VF-FIELDSET');
    await expect(inputGroup).toHaveJSProperty('tagName', 'VF-INPUT-GROUP');
    await expect(radioGroup).toHaveJSProperty('tagName', 'VF-RADIO-GROUP');
    await expect(fieldset).toHaveAttribute('role', 'group');
    await expect(radioGroup).toHaveAttribute('role', 'radiogroup');
    await expect(radioGroup).toHaveAttribute('aria-orientation', 'horizontal');
  } else {
    await expect(container).toHaveJSProperty('tagName', 'MAIN');
    await expect(stack).toHaveJSProperty('tagName', 'SECTION');
    await expect(grid).toHaveJSProperty('tagName', 'SECTION');
    await expect(fieldset).toHaveJSProperty('tagName', 'FIELDSET');
    await expect(radioGroup).toHaveJSProperty('tagName', 'FIELDSET');
  }

  const containerMetrics = await container.evaluate((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { width: rect.width, left: rect.left, viewportWidth: document.documentElement.clientWidth, maxInlineSize: style.maxInlineSize, paddingInlineStart: style.paddingInlineStart, paddingInlineEnd: style.paddingInlineEnd }; });
  expect(Math.abs(containerMetrics.width - 640)).toBeLessThan(1);
  expect(containerMetrics.maxInlineSize).toBe('640px');
  expect(containerMetrics.paddingInlineStart).toBe('16px');
  expect(containerMetrics.paddingInlineEnd).toBe('16px');

  const stackStyle = await stack.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems }; });
  expect(stackStyle).toEqual({ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: '24px', alignItems: 'flex-start' });

  const gridStyle = await grid.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, gap: style.gap, minItemSize: style.getPropertyValue('--vf-grid-min-item-size').trim(), columns: style.gridTemplateColumns }; });
  expect(gridStyle.display).toBe('grid');
  expect(gridStyle.gap).toBe('8px');
  expect(gridStyle.minItemSize).toBe('9rem');
  expect(trackCount(gridStyle.columns)).toBe(3);
  await grid.evaluate((element) => { element.style.inlineSize = '19rem'; });
  expect(trackCount(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns))).toBe(2);

  const clusterStyle = await actions.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent }; });
  expect(clusterStyle).toEqual({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' });

  const inlineStyle = await inline.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent }; });
  expect(inlineStyle).toEqual({ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '8px', alignItems: 'baseline', justifyContent: 'space-between' });

  const ratioBox = await ratio.boundingBox();
  expect(ratioBox).not.toBeNull();
  expect(Math.abs(ratioBox.width - 160)).toBeLessThan(1);
  expect(Math.abs(ratioBox.height - 90)).toBeLessThan(1);

  const fieldStyle = await field.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, gap: style.gap }; });
  expect(fieldStyle).toEqual({ display: 'grid', gap: '4px' });
  await expect(page.locator('label[for="email"]')).toHaveText('Email');
  await expect(page.locator('#email')).toHaveAttribute('aria-describedby', 'email-help');

  const fieldsetStyle = await fieldset.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, gap: style.gap }; });
  expect(fieldsetStyle).toEqual({ display: 'grid', gap: '8px' });
  if (port !== 'elements') await expect(fieldset.locator('legend')).toHaveText('Profile');

  expect(await inputGroup.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
  await expect(inputGroup.locator('input')).toHaveAttribute('aria-label', 'Search query');

  const radioStyle = await radioGroup.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexWrap: style.flexWrap, gap: style.gap }; });
  expect(radioStyle).toEqual({ display: 'flex', flexWrap: 'wrap', gap: '8px' });
  const radios = radioGroup.locator('input[type="radio"]');
  await expect(radios).toHaveCount(2);
  await expect(radios.nth(0)).toHaveAttribute('name', 'plan');
  await expect(radios.nth(1)).toHaveAttribute('name', 'plan');
  await radios.nth(1).check();
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(0)).not.toBeChecked();

  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.screenshot({ path: testInfo.outputPath(`l3-composition-${port}.png`), fullPage: true });
});

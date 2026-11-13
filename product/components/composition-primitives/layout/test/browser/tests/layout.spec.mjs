import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';
const trackCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;

test('L3 composition primitives preserve the six structural responsibilities across application surfaces', async ({ page }, testInfo) => {
  await page.goto(`/components/layout/${port}.html`);
  const container = page.locator('#container');
  const stack = page.locator('#stack');
  const autoGrid = page.locator('#auto-grid');
  const actions = page.locator('#actions');
  const inline = page.locator('#inline');
  const controlGroup = page.locator('#control-group');

  await expect(container).toHaveJSProperty('tagName', 'MAIN');
  await expect(stack).toHaveJSProperty('tagName', 'SECTION');
  await expect(autoGrid).toHaveJSProperty('tagName', 'SECTION');
  await expect(actions).toHaveJSProperty('tagName', 'DIV');
  await expect(inline).toHaveJSProperty('tagName', 'DIV');
  await expect(controlGroup).toHaveJSProperty('tagName', 'DIV');

  if (port === 'elements') {
    for (const tag of ['vf-stack', 'vf-inline', 'vf-cluster', 'vf-auto-grid', 'vf-container', 'vf-control-group']) {
      await expect(page.locator(tag)).toHaveCount(0);
    }
  }

  const containerMetrics = await container.evaluate((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { width: rect.width, maxInlineSize: style.maxInlineSize, paddingInlineStart: style.paddingInlineStart, paddingInlineEnd: style.paddingInlineEnd }; });
  expect(Math.abs(containerMetrics.width - 640)).toBeLessThan(1);
  expect(containerMetrics.maxInlineSize).toBe('640px');
  expect(containerMetrics.paddingInlineStart).toBe('16px');
  expect(containerMetrics.paddingInlineEnd).toBe('16px');

  const stackStyle = await stack.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems }; });
  expect(stackStyle).toEqual({ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: '24px', alignItems: 'flex-start' });

  const autoGridStyle = await autoGrid.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, gap: style.gap, minItemSize: style.getPropertyValue('--vf-auto-grid-min-item-size').trim(), columns: style.gridTemplateColumns }; });
  expect(autoGridStyle.display).toBe('grid');
  expect(autoGridStyle.gap).toBe('8px');
  expect(autoGridStyle.minItemSize).toBe('9rem');
  expect(trackCount(autoGridStyle.columns)).toBe(3);
  await autoGrid.evaluate((element) => { element.style.inlineSize = '19rem'; });
  expect(trackCount(await autoGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns))).toBe(2);

  const clusterStyle = await actions.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent }; });
  expect(clusterStyle).toEqual({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' });
  const firstAction = await page.locator('#first').boundingBox();
  const secondAction = await page.locator('#second').boundingBox();
  expect(firstAction).not.toBeNull();
  expect(secondAction).not.toBeNull();
  expect(Math.abs(firstAction.y - secondAction.y)).toBeLessThan(1);
  expect(firstAction.x).toBeGreaterThan(secondAction.x);

  const inlineStyle = await inline.evaluate((element) => { const style = getComputedStyle(element); return { display: style.display, flexDirection: style.flexDirection, flexWrap: style.flexWrap, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent }; });
  expect(inlineStyle).toEqual({ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '8px', alignItems: 'baseline', justifyContent: 'space-between' });

  await expect(controlGroup).toHaveAttribute('data-vf-control-group-orientation', 'horizontal');
  await expect(controlGroup).not.toHaveAttribute('role');
  expect(await controlGroup.evaluate((element) => getComputedStyle(element).display)).toBe('flex');
  expect(await controlGroup.evaluate((element) => getComputedStyle(element).flexDirection)).toBe('row');
  const groupedInput = controlGroup.locator('input');
  const groupedButton = controlGroup.locator('button');
  await expect(groupedInput).toHaveAttribute('aria-label', 'Search query');
  await groupedInput.focus();
  await page.keyboard.press('Tab');
  await expect(groupedButton).toBeFocused();
  await groupedInput.evaluate((element) => { element.disabled = true; });
  await expect(groupedInput).toBeDisabled();
  await expect(groupedButton).toBeEnabled();
  await groupedInput.evaluate((element) => { element.disabled = false; });
  expect(await groupedInput.evaluate((element) => getComputedStyle(element).borderInlineEndWidth)).not.toBe('0px');
  expect(await groupedButton.evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).toBe('0px');

  await controlGroup.evaluate((element) => element.setAttribute('dir', 'rtl'));
  expect(await groupedButton.evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).toBe('0px');
  expect(await groupedButton.evaluate((element) => getComputedStyle(element).borderInlineEndWidth)).not.toBe('0px');
  await controlGroup.evaluate((element) => element.removeAttribute('dir'));

  await controlGroup.evaluate((element) => element.setAttribute('data-vf-control-group-orientation', 'vertical'));
  expect(await controlGroup.evaluate((element) => getComputedStyle(element).flexDirection)).toBe('column');
  expect(await groupedButton.evaluate((element) => getComputedStyle(element).borderBlockStartWidth)).toBe('0px');
  expect(await groupedButton.evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).not.toBe('0px');

  await page.evaluate(() => {
    const group = document.createElement('div');
    group.id = 'button-only-group';
    group.setAttribute('data-vf-control-group', '');
    group.setAttribute('data-vf-control-group-orientation', 'horizontal');
    group.innerHTML = '<button type="button">Previous</button><button type="button">Next</button>';
    document.body.append(group);
  });
  const buttonOnlyGroup = page.locator('#button-only-group');
  await expect(buttonOnlyGroup.locator('button')).toHaveCount(2);
  await expect(buttonOnlyGroup).not.toHaveAttribute('role');
  expect(await buttonOnlyGroup.locator('button').nth(1).evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).toBe('0px');

  for (const retiredHook of ['data-vf-grid', 'data-vf-aspect-ratio', 'data-vf-field', 'data-vf-fieldset', 'data-vf-radio-group']) {
    await expect(page.locator(`[${retiredHook}]`)).toHaveCount(0);
  }

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath(`l3-composition-${port}.png`), fullPage: true });
});

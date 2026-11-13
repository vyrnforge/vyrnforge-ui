export default {
  id: 'switch', exportName: 'Switch', angularName: 'VfSwitchDirective',
  markup: '<label for="control">Enabled</label><input id="control" name="enabled" type="checkbox" role="switch" data-vf-switch>',
  angular: '<label for="control">Enabled</label><input id="control" name="enabled" vfSwitch>', props: { name: 'enabled' }, reducedMotion: true,
  semantics: { tag: 'INPUT', type: 'checkbox', role: 'switch' },
  async assertBrowser({ page, control, expect }) {
    const box = await control.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    await control.click();
    expect(await control.isChecked()).toBe(true);
    expect(await page.locator('#form').evaluate((form) => new FormData(form).get('enabled'))).not.toBeNull();
    await page.locator('html').evaluate((html) => { html.dir = 'rtl'; });
    await expect.poll(() => control.evaluate((element) => new DOMMatrix(getComputedStyle(element, '::before').transform).m41)).toBeLessThan(0);

    await page.emulateMedia({ forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    const enabledChecked = await control.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      forcedColorAdjust: getComputedStyle(element).forcedColorAdjust,
    }));
    expect(enabledChecked.forcedColorAdjust).toBe('none');
    await control.evaluate((element) => { element.disabled = true; });
    await expect(control).toBeDisabled();
    expect(await control.isChecked()).toBe(true);
    const disabledChecked = await control.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      border: getComputedStyle(element).borderTopColor,
      borderWidth: parseFloat(getComputedStyle(element).borderTopWidth),
      thumb: getComputedStyle(element, '::before').backgroundColor,
    }));
    expect(disabledChecked.background).not.toBe(enabledChecked.background);
    expect(disabledChecked.borderWidth).toBeGreaterThan(0);
    expect(disabledChecked.thumb).not.toBe('rgba(0, 0, 0, 0)');
  },
};

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
    const enabledChecked = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      const thumbStyle = getComputedStyle(element, '::before');
      // WebKit may match forced-colors without exposing forced-color-adjust.
      // Compare actual rendered system colors rather than making a CSSOM
      // property binding a requirement for native Switch accessibility.
      const reference = document.createElement('span');
      reference.style.backgroundColor = 'Highlight';
      reference.style.color = 'HighlightText';
      document.body.append(reference);
      const referenceStyle = getComputedStyle(reference);
      const result = {
        background: style.backgroundColor,
        thumb: thumbStyle.backgroundColor,
        systemHighlight: referenceStyle.backgroundColor,
        systemHighlightText: referenceStyle.color,
        supportsForcedColorAdjust: CSS.supports('forced-color-adjust', 'none'),
        forcedColorAdjust: style.getPropertyValue('forced-color-adjust').trim(),
      };
      reference.remove();
      return result;
    });
    if (enabledChecked.supportsForcedColorAdjust) {
      expect(enabledChecked.forcedColorAdjust).toBe('none');
    }
    expect(enabledChecked.background).toBe(enabledChecked.systemHighlight);
    expect(enabledChecked.thumb).toBe(enabledChecked.systemHighlightText);
    await control.evaluate((element) => { element.disabled = true; });
    await expect(control).toBeDisabled();
    expect(await control.isChecked()).toBe(true);
    await expect.poll(() => control.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(enabledChecked.background);
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

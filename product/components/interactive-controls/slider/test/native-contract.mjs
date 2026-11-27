const marks = [{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }];
export default {
  id: 'slider', exportName: 'Slider', angularName: 'VfSliderDirective', hook: 'data-vf-slider', hydrate: true,
  markup: '<label for="control">Value</label><span data-vf-slider-presentation><input id="control" name="control" type="range" data-vf-slider value="50" min="0" max="100" step="5"></span>',
  webConnector: 'connectSlider', webConnectorOptions: { marks, tooltip: { display: 'always', arrow: true } },
  angular: '<label for="control">Value</label><span data-vf-slider-presentation><input id="control" name="control" vfSlider value="50" min="0" max="100" step="5" [marks]="[{value: 0, label: \'0\'}, {value: 50, label: \'50\'}, {value: 100, label: \'100\'}]" [tooltip]="{display: \'always\', arrow: true}"></span>',
  props: { name: 'control', defaultValue: 50, min: 0, max: 100, step: 5, marks, tooltip: { display: 'always', arrow: true } }, semantics: { tag: 'INPUT', type: 'range' },
  async assertBrowser({ page, control, expect }) {
    await expect(control).toHaveAttribute('data-vf-slider-enhanced', '');
    await control.focus();
    const host = control.locator('..');
    const bubble = host.locator('[data-vf-slider-value]');
    await expect(bubble).toHaveText('50');
    await expect(host.locator('[data-vf-slider-mark]')).toHaveCount(3);
    await control.press('ArrowRight');
    await expect(control).toHaveJSProperty('value', '55');
    await expect(bubble).toHaveText('55');
    await expect.poll(() => control.evaluate(element => element.style.getPropertyValue('--_vf-slider-progress'))).toBe('0.55');
    await control.press('Home');
    await expect(control).toHaveJSProperty('value', '0');
    await control.press('End');
    await expect(control).toHaveJSProperty('value', '100');
    await expect(bubble).toHaveText('100');
    expect(await control.evaluate(element => new FormData(element.form).get('control'))).toBe('100');
    await control.evaluate(element => element.form.reset());
    await expect(control).toHaveJSProperty('value', '50');
    await expect(bubble).toHaveText('50');
    await control.evaluate(element => { element.value = '25'; element.dispatchEvent(new Event('input', { bubbles: true })); });
    await expect(bubble).toHaveText('25');
    const isFirefox = await control.evaluate(() => navigator.userAgent.includes('Firefox/'));
    if (isFirefox) {
      const geometry = await control.evaluate(element => {
        const thumb = getComputedStyle(element, '::-moz-range-thumb');
        const track = getComputedStyle(element, '::-moz-range-track');
        return { thumbWidth: parseFloat(thumb.width), thumbHeight: parseFloat(thumb.height), trackHeight: parseFloat(track.height) };
      });
      expect(geometry.thumbWidth).toBeGreaterThanOrEqual(18);
      expect(geometry.thumbHeight).toBeGreaterThanOrEqual(18);
      expect(geometry.trackHeight).toBeGreaterThanOrEqual(6);
    }
    await control.evaluate(element => { element.disabled = true; });
    await expect(control).toBeDisabled();
    expect(await control.evaluate(element => new FormData(element.form).has('control'))).toBe(false);
    await control.evaluate(element => { element.disabled = false; });
  },
};

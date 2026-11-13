export default {
  id: 'slider', exportName: 'Slider', angularName: 'VfSliderDirective', hook: 'data-vf-slider',
  markup: '<label for="control">Value</label><input id="control" name="control" type="range" data-vf-slider value="50" min="0" max="100">',
  angular: '<label for="control">Value</label><input id="control" name="control" vfSlider value="50" min="0" max="100">',
  props: { name: 'control', defaultValue: 50, min: 0, max: 100 }, semantics: { tag: 'INPUT', type: 'range' },
  async assertBrowser({ control, expect }) {
    const before = Number(await control.inputValue());
    await control.press('ArrowRight');
    expect(Number(await control.inputValue())).toBeGreaterThan(before);
    const isFirefox = await control.evaluate(() => navigator.userAgent.includes('Firefox/'));
    if (isFirefox) {
      const geometry = await control.evaluate((element) => {
        const thumb = getComputedStyle(element, '::-moz-range-thumb');
        const track = getComputedStyle(element, '::-moz-range-track');
        return {
          thumbWidth: parseFloat(thumb.width),
          thumbHeight: parseFloat(thumb.height),
          trackHeight: parseFloat(track.height),
        };
      });
      expect(geometry.thumbWidth).toBeGreaterThanOrEqual(18);
      expect(geometry.thumbHeight).toBeGreaterThanOrEqual(18);
      expect(geometry.trackHeight).toBeGreaterThanOrEqual(6);
    }
  },
};

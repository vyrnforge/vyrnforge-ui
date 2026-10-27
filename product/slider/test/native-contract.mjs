export default {
  id: 'slider', exportName: 'Slider', angularName: 'VfSliderDirective', hook: 'data-vf-slider',
  markup: '<label for="control">Value</label><input id="control" name="control" type="range" data-vf-slider value="50" min="0" max="100">',
  angular: '<label for="control">Value</label><input id="control" name="control" vfSlider value="50" min="0" max="100">',
  props: { name: 'control', defaultValue: 50, min: 0, max: 100 }, semantics: { tag: 'INPUT', type: 'range' },
  async assertBrowser({ control, expect }) { const before = Number(await control.inputValue()); await control.press('ArrowRight'); expect(Number(await control.inputValue())).toBeGreaterThan(before); },
};

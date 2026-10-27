export default {
  id: 'number-input', exportName: 'NumberInput', angularName: 'VfNumberInputDirective', hook: 'data-vf-number-input',
  markup: '<label for="control">Number</label><input id="control" name="control" type="number" data-vf-number-input value="42" min="0" max="100">',
  angular: '<label for="control">Number</label><input id="control" name="control" vfNumberInput value="42" min="0" max="100">',
  props: { name: 'control', defaultValue: 42, min: 0, max: 100 }, semantics: { tag: 'INPUT', type: 'number' },
  async assertBrowser({ page, control, expect }) { await control.fill('7'); expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('7'); },
};

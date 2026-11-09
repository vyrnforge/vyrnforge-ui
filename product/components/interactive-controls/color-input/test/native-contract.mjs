export default {
  id: 'color-input', exportName: 'ColorInput', angularName: 'VfColorInputDirective', hook: 'data-vf-color-input',
  markup: '<label for="control">Color</label><input id="control" name="color" type="color" data-vf-color-input value="#2563eb">',
  angular: '<label for="control">Color</label><input id="control" name="color" vfColorInput value="#2563eb">', props: { name: 'color', defaultValue: '#2563eb' }, semantics: { tag: 'INPUT', type: 'color' },
  async assertBrowser({ control, expect }) { await expect(control).toHaveValue('#2563eb'); },
};

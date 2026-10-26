export default {
  id: 'native-select', exportName: 'NativeSelect', angularName: 'VfNativeSelectDirective', hook: 'data-vf-native-select',
  markup: '<label for="control">Option</label><select id="control" name="control" data-vf-native-select><option value="one">One</option><option value="two" selected>Two</option></select>',
  angular: '<label for="control">Option</label><select id="control" name="control" vfNativeSelect><option value="one">One</option><option value="two" selected>Two</option></select>',
  props: { name: 'control', defaultValue: 'two' }, select: true, semantics: { tag: 'SELECT' },
  async assertBrowser({ page, control, expect }) { await expect(control).toHaveValue('two'); await control.selectOption('one'); expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('one'); },
};

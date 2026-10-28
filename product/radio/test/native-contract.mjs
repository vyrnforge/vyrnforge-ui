export default {
  id: 'radio', exportName: 'Radio', angularName: 'VfRadioDirective',
  markup: '<label for="control">Choice</label><input id="control" name="choice" value="one" type="radio" data-vf-radio checked>',
  angular: '<label for="control">Choice</label><input id="control" name="choice" value="one" vfRadio checked>',
  props: { name: 'choice', value: 'one', defaultChecked: true }, semantics: { tag: 'INPUT', type: 'radio' },
  async assertBrowser({ page, control, expect }) { expect(await control.isChecked()).toBe(true); expect(await page.locator('#form').evaluate((form) => new FormData(form).get('choice'))).toBe('one'); },
};

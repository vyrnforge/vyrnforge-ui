export default {
  id: 'switch', exportName: 'Switch', angularName: 'VfSwitchDirective', hook: 'data-vf-switch',
  markup: '<label for="control">Enabled</label><input id="control" name="enabled" type="checkbox" role="switch" data-vf-switch>',
  angular: '<label for="control">Enabled</label><input id="control" name="enabled" vfSwitch>', props: { name: 'enabled' }, reducedMotion: true,
  semantics: { tag: 'INPUT', type: 'checkbox', role: 'switch' },
  async assertBrowser({ page, control, expect }) { await control.click(); expect(await control.isChecked()).toBe(true); expect(await page.locator('#form').evaluate((form) => new FormData(form).get('enabled'))).not.toBeNull(); },
};

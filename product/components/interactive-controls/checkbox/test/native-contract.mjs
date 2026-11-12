export default {
  id: 'checkbox', exportName: 'Checkbox', angularName: 'VfCheckboxDirective',
  markup: '<label for="control">Choice</label><input id="control" name="control" type="checkbox" data-vf-checkbox>',
  angular: '<label for="control">Choice</label><input id="control" name="control" vfCheckbox [indeterminate]="true">',
  props: { name: 'control', indeterminate: true }, hydrate: true, webInlineScript: 'document.querySelector("#control").indeterminate=true;', semantics: { tag: 'INPUT', type: 'checkbox' },
  async assertBrowser({ control, expect }) {
    expect(await control.evaluate((element) => element.indeterminate)).toBe(true);
    await expect(control).not.toHaveAttribute('data-vf-indeterminate');
    const box = await control.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    await control.click();
    expect(await control.evaluate((element) => element.checked)).toBe(true);
  },
};

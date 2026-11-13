export default {
  id: 'native-select', exportName: 'NativeSelect', angularName: 'VfNativeSelectDirective',
  markup: '<label for="control">Option</label><select id="control" name="control" required data-vf-native-select><option value="one">One</option><option value="two" selected>Two</option></select>',
  angular: '<label for="control">Option</label><select id="control" name="control" vfNativeSelect required><option value="one">One</option><option value="two" selected>Two</option></select>',
  props: { name: 'control', defaultValue: 'two', required: true }, select: true, semantics: { tag: 'SELECT' },
  async assertBrowser({ page, control, expect }) {
    await expect(control).toHaveValue('two');
    await control.blur();
    await expect.poll(() => control.evaluate((element) => getComputedStyle(element).borderColor)).toBe('rgb(113, 113, 122)');
    const normalBoundary = await control.evaluate((element) => getComputedStyle(element).borderColor);
    await control.evaluate((element) => { element.value = ''; });
    expect(await control.evaluate((element) => element.matches(':invalid'))).toBe(true);
    expect(await control.evaluate((element) => element.matches(':user-invalid'))).toBe(false);
    expect(await control.evaluate((element) => getComputedStyle(element).borderColor)).toBe(normalBoundary);

    await page.locator('#form').evaluate((form) => form.requestSubmit());
    expect(await control.evaluate((element) => element.matches(':user-invalid'))).toBe(true);
    await expect.poll(() => control.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe(normalBoundary);

    await control.selectOption('one');
    expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('one');
  },
};

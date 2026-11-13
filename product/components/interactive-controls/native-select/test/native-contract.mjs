export default {
  id: 'native-select', exportName: 'NativeSelect', angularName: 'VfNativeSelectDirective',
  markup: '<label for="control">Option</label><select id="control" name="control" required data-vf-native-select><option value="one">One</option><option value="two" selected>Two</option></select>',
  angular: '<label for="control">Option</label><select id="control" name="control" vfNativeSelect required><option value="one">One</option><option value="two" selected>Two</option></select>',
  props: { name: 'control', defaultValue: 'two', required: true }, select: true, semantics: { tag: 'SELECT' },
  async assertBrowser({ page, control, expect }) {
    await expect(control).toHaveValue('two');
    const normalBoundary = await control.evaluate((element) => getComputedStyle(element).borderColor);
    await control.evaluate((element) => { element.value = ''; });
    expect(await control.evaluate((element) => element.matches(':invalid'))).toBe(true);
    expect(await control.evaluate((element) => element.matches(':user-invalid'))).toBe(false);
    expect(await control.evaluate((element) => getComputedStyle(element).borderColor)).toBe(normalBoundary);

    await control.evaluate((element) => {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Choose';
      element.prepend(empty);
      element.value = 'two';
    });
    await control.focus();
    await control.press('Home');
    await control.press('Tab');
    await expect(control).toHaveValue('');
    expect(await control.evaluate((element) => element.matches(':user-invalid'))).toBe(true);
    expect(await control.evaluate((element) => getComputedStyle(element).borderColor)).not.toBe(normalBoundary);

    await control.selectOption('one');
    expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('one');
  },
};

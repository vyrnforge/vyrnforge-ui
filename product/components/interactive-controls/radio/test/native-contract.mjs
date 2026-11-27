export default {
  id: 'radio', exportName: 'Radio', angularName: 'VfRadioDirective',
  markup: '<label for="control">Choice</label><input id="control" name="choice" value="one" type="radio" data-vf-radio data-vf-size="sm" checked>',
  angular: '<label for="control">Choice</label><input id="control" name="choice" value="one" vfRadio size="sm" checked>',
  props: { name: 'choice', value: 'one', defaultChecked: true, size: 'sm' }, semantics: { tag: 'INPUT', type: 'radio' },
  reducedMotion: true,
  async assertBrowser({ page, control, expect }) {
    expect(await control.isChecked()).toBe(true);
    const danger = await control.evaluate((element) => {
      const sample = document.createElement('span');
      sample.style.color = 'var(--vf-color-danger-border)';
      element.parentElement.append(sample);
      const color = getComputedStyle(sample).color;
      sample.remove();
      element.setAttribute('aria-invalid', 'true');
      return color;
    });
    await expect(control).toHaveAttribute('data-vf-size', 'sm');
    await expect.poll(() => control.evaluate(element => getComputedStyle(element, '::before').borderTopColor)).toBe(danger);
    await control.evaluate((element) => element.removeAttribute('aria-invalid'));
    const box = await control.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    expect(await page.locator('#form').evaluate((form) => new FormData(form).get('choice'))).toBe('one');
  },
};

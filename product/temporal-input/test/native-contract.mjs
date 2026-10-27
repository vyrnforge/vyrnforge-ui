export default {
  id: 'temporal-input', exportName: 'TemporalInput', angularName: 'VfTemporalInputDirective', hook: 'data-vf-temporal-input',
  markup: '<label for="control">Date</label><input id="control" name="date" type="date" data-vf-temporal-input value="2026-01-21">',
  angular: '<label for="control">Date</label><input id="control" name="date" vfTemporalInput type="date" value="2026-01-21">', props: { name: 'date', type: 'date', defaultValue: '2026-01-21' }, semantics: { tag: 'INPUT', type: 'date' },
  async assertBrowser({ control, expect }) { await expect(control).toHaveValue('2026-01-21'); },
};

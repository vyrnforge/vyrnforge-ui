export default {
  id: 'toggle-button', exportName: 'ToggleButton', angularName: 'VfToggleButtonDirective', hook: 'data-vf-toggle-button',
  markup: '<button id="control" type="button" data-vf-button data-vf-toggle-button aria-pressed="false">Toggle</button>',
  angular: '<button id="control" vfToggleButton>Toggle</button>', props: { defaultPressed: false }, content: 'Toggle', label: false,
  hydrate: true, webConnector: 'connectToggleButton', styleDependencies: ['button'], reducedMotion: true, semantics: { tag: 'BUTTON' },
  async assertBrowser({ control, expect }) { await expect(control).toHaveAttribute('aria-pressed', 'false'); await control.click(); await expect(control).toHaveAttribute('aria-pressed', 'true'); },
};

export default {
  id: 'link', exportName: 'Link', angularName: 'VfLinkDirective', hook: 'data-vf-link',
  markup: '<a id="control" data-vf-link href="#target">Example link</a><div id="target">Target</div>',
  angular: '<a id="control" vfLink href="#target">Example link</a><div id="target">Target</div>',
  props: { href: '#target' }, content: 'Example link', label: false, semantics: { tag: 'A' },
  async assertBrowser({ control, expect }) { await expect(control).toHaveAttribute('href', '#target'); },
};

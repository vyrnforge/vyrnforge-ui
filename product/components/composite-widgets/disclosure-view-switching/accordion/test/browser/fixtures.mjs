const web = `
<details open id="root"><summary id="first">First section</summary><div id="first-panel">First content
  <details><summary>Inner section</summary><div>Inner content</div></details>
</div></details>
<details><summary id="third">Third section</summary><div>Third content</div></details>`;

export const browserFixture = {
  component: 'accordion',
  title: 'Accordion fixture',
  heading: 'Accordion browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    angular: { story: 'createAngularStory', selector: 'vf-accordion-test' },
    vue: { story: 'createVueStory' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel } =
    await import('@vyrnforge/react/accordion');
  const item = (value, label, content, { disabled = false, region = false } = {}) =>
    h(AccordionItem, { value, disabled },
      h(AccordionHeader, { level: 2 }, h(AccordionTrigger, null, label)),
      h(AccordionPanel, { region }, content),
    );
  const inner = h(AccordionRoot, { id: 'inner', defaultValue: 'inner', collapsible: true },
    item('inner', 'Inner section', 'Inner content'),
  );
  const root = (id, options, ...items) =>
    h(AccordionRoot, { id, ...options, onValueChange: (value) => {
      if (client) document.getElementById(id).dataset.requested = JSON.stringify(value);
    } }, ...items);
  return h(Fragment, null,
    root('root', { defaultValue: 'a/b', collapsible: true },
      item('a/b', 'First section', ['First content', inner], { region: true }),
      item('disabled', 'Disabled section', 'Disabled content', { disabled: true }),
      item('a_2Fb', 'Third section', 'Third content'),
    ),
    root('locked', { defaultValue: 'a' }, item('a', 'Locked first', 'Locked first content'), item('b', 'Locked second', 'Locked second content')),
    root('controlled', { value: 'a', collapsible: true }, item('a', 'Controlled first', 'Controlled first content'), item('b', 'Controlled second', 'Controlled second content')),
    root('multiple', { type: 'multiple', defaultValue: ['a,b'] }, item('a,b', 'Comma item', 'Comma content'), item('c', 'Other item', 'Other content')),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel } =
    await import('@vyrnforge/vue/accordion');
  const item = (value, label, content, { disabled = false, region = false } = {}) =>
    h(AccordionItem, { value, disabled }, () => [
      h(AccordionHeader, { level: 2 }, () => h(AccordionTrigger, null, () => label)),
      h(AccordionPanel, { region }, () => content),
    ]);
  const root = (id, options, ...items) =>
    h(AccordionRoot, { id, ...options, 'onUpdate:modelValue': (value) => {
      if (client) document.getElementById(id).dataset.requested = JSON.stringify(value);
    } }, () => items);
  return createSSRApp({
    render: () => h('div', [
      root('root', { defaultValue: 'a/b', collapsible: true },
        item('a/b', 'First section', ['First content', root('inner', { defaultValue: 'inner', collapsible: true }, item('inner', 'Inner section', 'Inner content'))], { region: true }),
        item('disabled', 'Disabled section', 'Disabled content', { disabled: true }),
        item('a_2Fb', 'Third section', 'Third content'),
      ),
      root('locked', { defaultValue: 'a' }, item('a', 'Locked first', 'Locked first content'), item('b', 'Locked second', 'Locked second content')),
      root('controlled', { modelValue: 'a', collapsible: true }, item('a', 'Controlled first', 'Controlled first content'), item('b', 'Controlled second', 'Controlled second content')),
      root('multiple', { type: 'multiple', defaultValue: ['a,b'] }, item('a,b', 'Comma item', 'Comma content'), item('c', 'Other item', 'Other content')),
    ]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfAccordionRootDirective, VfAccordionItemDirective, VfAccordionHeaderDirective, VfAccordionTriggerDirective, VfAccordionPanelDirective } =
    await import('@vyrnforge/angular/accordion');
  class AccordionTestApp {
    changed(id, value) {
      if (client) document.getElementById(id).dataset.requested = JSON.stringify(value);
    }
  }
  Component({
    selector: 'vf-accordion-test',
    standalone: true,
    imports: [VfAccordionRootDirective, VfAccordionItemDirective, VfAccordionHeaderDirective, VfAccordionTriggerDirective, VfAccordionPanelDirective],
    template: `<main><h1>Accordion browser fixture</h1>
      <div vfAccordionRoot id="root" defaultValue="a/b" collapsible (valueChange)="changed('root', $event)">
        <div vfAccordionItem="a/b"><h2 vfAccordionHeader><button vfAccordionTrigger>First section</button></h2>
          <div vfAccordionPanel region>First content
            <div vfAccordionRoot id="inner" defaultValue="inner" collapsible>
              <div vfAccordionItem="inner"><h2 vfAccordionHeader><button vfAccordionTrigger>Inner section</button></h2><div vfAccordionPanel>Inner content</div></div>
            </div>
          </div>
        </div>
        <div vfAccordionItem="disabled" disabled><h2 vfAccordionHeader><button vfAccordionTrigger>Disabled section</button></h2><div vfAccordionPanel>Disabled content</div></div>
        <div vfAccordionItem="a_2Fb"><h2 vfAccordionHeader><button vfAccordionTrigger>Third section</button></h2><div vfAccordionPanel>Third content</div></div>
      </div>
      <div vfAccordionRoot id="locked" defaultValue="a" (valueChange)="changed('locked', $event)">
        <div vfAccordionItem="a"><h2 vfAccordionHeader><button vfAccordionTrigger>Locked first</button></h2><div vfAccordionPanel>Locked first content</div></div>
        <div vfAccordionItem="b"><h2 vfAccordionHeader><button vfAccordionTrigger>Locked second</button></h2><div vfAccordionPanel>Locked second content</div></div>
      </div>
      <div vfAccordionRoot id="controlled" value="a" collapsible (valueChange)="changed('controlled', $event)">
        <div vfAccordionItem="a"><h2 vfAccordionHeader><button vfAccordionTrigger>Controlled first</button></h2><div vfAccordionPanel>Controlled first content</div></div>
        <div vfAccordionItem="b"><h2 vfAccordionHeader><button vfAccordionTrigger>Controlled second</button></h2><div vfAccordionPanel>Controlled second content</div></div>
      </div>
      <div vfAccordionRoot id="multiple" type="multiple" [defaultValue]="['a,b']" (valueChange)="changed('multiple', $event)">
        <div vfAccordionItem="a,b"><h2 vfAccordionHeader><button vfAccordionTrigger>Comma item</button></h2><div vfAccordionPanel>Comma content</div></div>
        <div vfAccordionItem="c"><h2 vfAccordionHeader><button vfAccordionTrigger>Other item</button></h2><div vfAccordionPanel>Other content</div></div>
      </div>
    </main>`,
  })(AccordionTestApp);
  return AccordionTestApp;
}

function token(value) {
  return encodeURIComponent(value).replaceAll('_', '_5F').replaceAll('%', '_');
}

function elementItem(root, value, label, content, { expanded = false, disabled = false, region = false, locked = false } = {}) {
  const trigger = `${root}-trigger-${token(value)}`;
  const panel = `${root}-panel-${token(value)}`;
  return `<div data-vf-accordion-item data-vf-value="${value}" ${disabled ? 'disabled data-vf-disabled' : ''} ${expanded ? 'data-vf-open' : ''}>
    <h2 data-vf-accordion-header><button data-vf-accordion-trigger id="${trigger}" aria-controls="${panel}" aria-expanded="${expanded}" ${disabled ? 'disabled' : ''} ${locked ? 'aria-disabled="true"' : ''}>${label}</button></h2>
    <div data-vf-accordion-panel id="${panel}" ${region ? `role="region" aria-labelledby="${trigger}"` : ''} ${expanded ? 'data-vf-open' : 'hidden'}>${content}</div>
  </div>`;
}

export async function createElementsStory({ client }) {
  const inner = `<vf-accordion id="inner" data-vf-accordion-root value="inner" collapsible>${elementItem('inner', 'inner', 'Inner section', 'Inner content', { expanded: true })}</vf-accordion>`;
  return {
    body: `<vf-accordion id="root" data-vf-accordion-root value="a/b" collapsible>
      ${elementItem('root', 'a/b', 'First section', 'First content' + inner, { expanded: true, region: true })}
      ${elementItem('root', 'disabled', 'Disabled section', 'Disabled content', { disabled: true })}
      ${elementItem('root', 'a_2Fb', 'Third section', 'Third content')}
    </vf-accordion>
    <vf-accordion id="locked" data-vf-accordion-root value="a">
      ${elementItem('locked', 'a', 'Locked first', 'Locked first content', { expanded: true, locked: true })}
      ${elementItem('locked', 'b', 'Locked second', 'Locked second content')}
    </vf-accordion>
    <vf-accordion id="multiple" data-vf-accordion-root type="multiple" value='["a,b"]'>
      ${elementItem('multiple', 'a,b', 'Comma item', 'Comma content', { expanded: true })}
      ${elementItem('multiple', 'c', 'Other item', 'Other content')}
    </vf-accordion>`,
    activate: client ? async () => {
      const { defineAccordionElement } = await import('@vyrnforge/elements/accordion');
      defineAccordionElement();
      for (const id of ['root', 'locked', 'multiple']) {
        const root = document.getElementById(id);
        root.addEventListener('vf-value-change', (event) => {
          if (event.target === root) root.dataset.requested = JSON.stringify(event.detail.value);
        });
      }
    } : undefined,
  };
}

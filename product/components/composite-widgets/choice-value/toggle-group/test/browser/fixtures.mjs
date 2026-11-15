const web = `<div role="group" aria-label="Formatting" id="group" data-vf-toggle-group-root>
  <button type="button" id="bold" data-vf-toggle-group-item data-vf-value="bold" aria-pressed="true">Bold</button>
  <button type="button" data-vf-toggle-group-item data-vf-value="italic" aria-pressed="false">Italic</button>
</div>`;

export const browserFixture = {
  component: 'toggle-group',
  title: 'Toggle group fixture',
  heading: 'Toggle group browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-toggle-group-test' },
    elements: { story: 'createElementsStory' },
  },
};

function record(id, value) {
  document.getElementById(id).dataset.requested = JSON.stringify(value);
}

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { ToggleGroupRoot, ToggleGroupItem } = await import('@vyrnforge/react/toggle-group');
  const item = (value, text, disabled = false) => h(ToggleGroupItem, { value, disabled }, text);
  const group = (id, options, children) =>
    h(
      ToggleGroupRoot,
      {
        id,
        'aria-label': id,
        ...options,
        onValueChange: (value) => {
          if (client) record(id, value);
        },
      },
      ...children,
    );
  const nested = group('nested', { defaultValue: 'inside' }, [
    item('inside', 'Inner choice'),
    item('other', 'Other inner choice'),
  ]);
  return h(
    Fragment,
    null,
    group('group', { defaultValue: 'bold' }, [
      item('bold', 'Bold'),
      item('italic', 'Italic'),
      item('disabled', 'Disabled', true),
      nested,
    ]),
    group('multiple', { type: 'multiple', defaultValue: ['a,b'] }, [
      item('a,b', 'Comma item'),
      item('c', 'Other item'),
    ]),
    group('controlled', { value: 'bold' }, [item('bold', 'Bold'), item('italic', 'Italic')]),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { ToggleGroupRoot, ToggleGroupItem } = await import('@vyrnforge/vue/toggle-group');
  const item = (value, text, disabled = false) => h(ToggleGroupItem, { value, disabled }, () => text);
  const group = (id, options, children) =>
    h(
      ToggleGroupRoot,
      {
        id,
        'aria-label': id,
        ...options,
        'onUpdate:value': (value) => {
          if (client) record(id, value);
        },
      },
      () => children,
    );
  return createSSRApp({
    render: () =>
      h('div', [
        group('group', { defaultValue: 'bold' }, [
          item('bold', 'Bold'),
          item('italic', 'Italic'),
          item('disabled', 'Disabled', true),
          group('nested', { defaultValue: 'inside' }, [
            item('inside', 'Inner choice'),
            item('other', 'Other inner choice'),
          ]),
        ]),
        group('multiple', { type: 'multiple', defaultValue: ['a,b'] }, [
          item('a,b', 'Comma item'),
          item('c', 'Other item'),
        ]),
        group('controlled', { value: 'bold' }, [item('bold', 'Bold'), item('italic', 'Italic')]),
      ]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfToggleGroupRootDirective, VfToggleGroupItemDirective } = await import('@vyrnforge/angular/toggle-group');
  class ToggleGroupTestApp {
    changed(id, value) {
      if (client) record(id, value);
    }
  }
  Component({
    selector: 'vf-toggle-group-test',
    standalone: true,
    imports: [VfToggleGroupRootDirective, VfToggleGroupItemDirective],
    template: `<main><h1>Toggle group browser fixture</h1>
      <div vfToggleGroupRoot id="group" aria-label="Formatting" defaultValue="bold" (valueChange)="changed('group',$event)">
        <button vfToggleGroupItem="bold">Bold</button><button vfToggleGroupItem="italic">Italic</button><button vfToggleGroupItem="disabled" disabled>Disabled</button>
        <div vfToggleGroupRoot id="nested" aria-label="Nested" defaultValue="inside" (valueChange)="changed('nested',$event)">
          <button vfToggleGroupItem="inside">Inner choice</button><button vfToggleGroupItem="other">Other inner choice</button>
        </div>
      </div>
      <div vfToggleGroupRoot id="multiple" aria-label="Multiple" type="multiple" [defaultValue]="['a,b']" (valueChange)="changed('multiple',$event)">
        <button vfToggleGroupItem="a,b">Comma item</button><button vfToggleGroupItem="c">Other item</button>
      </div>
      <div vfToggleGroupRoot id="controlled" aria-label="Controlled" value="bold" (valueChange)="changed('controlled',$event)">
        <button vfToggleGroupItem="bold">Bold</button><button vfToggleGroupItem="italic">Italic</button>
      </div>
    </main>`,
  })(ToggleGroupTestApp);
  return ToggleGroupTestApp;
}

export async function createElementsStory({ client }) {
  const item = (value, text, pressed = false, disabled = false) =>
    `<button type="button" data-vf-toggle-group-item data-vf-value="${value}" aria-pressed="${pressed}" data-vf-state="${pressed ? 'on' : 'off'}" ${disabled ? 'disabled' : ''}>${text}</button>`;
  const group = (id, attrs, children) =>
    `<vf-toggle-group id="${id}" data-vf-toggle-group-root role="group" aria-label="${id}" ${attrs}>${children.join('')}</vf-toggle-group>`;
  return {
    body:
      group('group', 'default-value="bold"', [
        item('bold', 'Bold', true),
        item('italic', 'Italic'),
        item('disabled', 'Disabled', false, true),
        group('nested', 'default-value="inside"', [
          item('inside', 'Inner choice', true),
          item('other', 'Other inner choice'),
        ]),
      ]) +
      group('multiple', 'type="multiple" default-value=\'["a,b"]\'', [
        item('a,b', 'Comma item', true),
        item('c', 'Other item'),
      ]) +
      group('controlled', 'value="bold"', [item('bold', 'Bold', true), item('italic', 'Italic')]),
    activate: client
      ? async () => {
          const { defineToggleGroupElement } = await import('@vyrnforge/elements/toggle-group');
          defineToggleGroupElement();
          for (const id of ['group', 'nested', 'multiple', 'controlled']) {
            const root = document.getElementById(id);
            root.addEventListener('vf-value-change', (event) => {
              if (event.target === root) record(id, event.detail.value);
            });
          }
        }
      : undefined,
  };
}

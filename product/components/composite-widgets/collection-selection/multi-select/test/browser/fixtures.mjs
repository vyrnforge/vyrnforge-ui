const labels = ['One', 'Disabled', 'Three', 'Banana'];
const values = ['one', 'disabled', 'three', 'banana'];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button" style="position: fixed; right: 16px; bottom: 16px">After</button>';
const label = '<div id="multi-select-label">Choose items</div>';
function options(port) {
  return labels
    .map(
      (label, index) =>
        `<button id="${port}-${values[index]}" type="button" role="option" tabindex="-1" aria-selected="${index === 0}" data-vf-multi-select-option data-vf-value="${values[index]}"${index === 1 ? ' disabled aria-disabled="true"' : ''}>${label}</button>`,
    )
    .join('');
}
function changed(values) {
  document.body.dataset.values = values.join(',');
}
function ready() {
  document.body.dataset.multiReady = 'true';
}
function request(values) {
  document.body.dataset.multiRequest = values.join(',');
}
const web = `${before}${label}<button id="trigger" type="button" aria-haspopup="listbox" aria-controls="list" popovertarget="list" data-vf-multi-select-trigger>Choose</button><div id="list" role="listbox" aria-multiselectable="true" tabindex="-1" aria-labelledby="multi-select-label" popover="auto" data-vf-multi-select-content>${options('web')}</div>${after}`;

export const browserFixture = {
  component: 'multi-select',
  title: 'MultiSelect browser fixture',
  heading: 'MultiSelect browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-multi-select-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect } = await import('react');
  const { MultiSelectRoot, MultiSelectTrigger, MultiSelectContent, MultiSelectOption } =
    await import('@vyrnforge/react/multi-select');
  function App() {
    useEffect(ready, []);
    const option = (prefix, index) =>
      h(
        MultiSelectOption,
        { key: values[index], id: `${prefix}-${values[index]}`, value: values[index], disabled: index === 1 },
        labels[index],
      );
    return h(
      Fragment,
      null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h('div', { id: 'multi-select-label' }, 'Choose items'),
      h(
        MultiSelectRoot,
        { defaultValue: ['one'], onValueChange: changed },
        h(MultiSelectTrigger, { id: 'obsolete-trigger', 'aria-controls': 'obsolete-list' }, 'Choose'),
        h(
          MultiSelectContent,
          { id: 'obsolete-list', 'aria-labelledby': 'multi-select-label' },
          ...labels.map((_, index) => option('react', index)),
        ),
      ),
      h(
        MultiSelectRoot,
        { id: 'controlled', value: ['one'], onValueChange: request },
        h(
          MultiSelectTrigger,
          { tabIndex: -1 },
          'Controlled items',
        ),
        h(
          MultiSelectContent,
          { 'aria-label': 'Controlled options' },
          option('controlled', 0),
          option('controlled', 2),
        ),
      ),
      h(
        'button',
        { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
        'After',
      ),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { MultiSelectRoot, MultiSelectTrigger, MultiSelectContent, MultiSelectOption } =
    await import('@vyrnforge/vue/multi-select');
  return createSSRApp({
    setup() {
      onMounted(ready);
      const option = (prefix, index) =>
        h(
          MultiSelectOption,
          { key: values[index], id: `${prefix}-${values[index]}`, value: values[index], disabled: index === 1 },
          () => labels[index],
        );
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h('div', { id: 'multi-select-label' }, 'Choose items'),
          h(MultiSelectRoot, { defaultValue: ['one'], 'onUpdate:value': changed }, () => [
            h(MultiSelectTrigger, { id: 'obsolete-trigger', 'aria-controls': 'obsolete-list' }, () => 'Choose'),
            h(MultiSelectContent, { id: 'obsolete-list', 'aria-labelledby': 'multi-select-label' }, () =>
              labels.map((_, index) => option('vue', index)),
            ),
          ]),
          h(MultiSelectRoot, { id: 'controlled', value: ['one'], 'onUpdate:value': request }, () => [
            h(
              MultiSelectTrigger,
              { tabindex: -1 },
              () => 'Controlled items',
            ),
            h(MultiSelectContent, { 'aria-label': 'Controlled options' }, () => [
              option('controlled', 0),
              option('controlled', 2),
            ]),
          ]),
          h(
            'button',
            { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
            'After',
          ),
        ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const {
    VfMultiSelectRootDirective,
    VfMultiSelectTriggerDirective,
    VfMultiSelectContentDirective,
    VfMultiSelectOptionDirective,
  } = await import('@vyrnforge/angular/multi-select');
  class MultiSelectTestApp {
    values = ['one'];
    constructor() {
      afterNextRender(ready);
    }
    changed = changed;
    request = request;
  }
  const angularOptions = (prefix, indexes) =>
    indexes
      .map(
        (index) =>
          `<button vfMultiSelectOption="${values[index]}" id="${prefix}-${values[index]}" [disabled]="${index === 1}">${labels[index]}</button>`,
      )
      .join('');
  Component({
    selector: 'vf-multi-select-test',
    standalone: true,
    imports: [
      VfMultiSelectRootDirective,
      VfMultiSelectTriggerDirective,
      VfMultiSelectContentDirective,
      VfMultiSelectOptionDirective,
    ],
    template: `<main><h1>MultiSelect browser fixture</h1>${before}${label}<div vfMultiSelectRoot [defaultValue]="values" (valueChange)="changed($event)"><button vfMultiSelectTrigger>Choose</button><div vfMultiSelectContent aria-labelledby="multi-select-label">${angularOptions('angular', [0, 1, 2, 3])}</div></div><div vfMultiSelectRoot id="controlled" [value]="values" (valueChange)="request($event)"><button vfMultiSelectTrigger tabindex="-1">Controlled items</button><div vfMultiSelectContent aria-label="Controlled options">${angularOptions('controlled', [0, 2])}</div></div>${after}</main>`,
  })(MultiSelectTestApp);
  return MultiSelectTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}${label}<vf-multi-select id="elements-multi-select"><button id="trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="obsolete-list" data-vf-multi-select-trigger>Choose</button><div id="list" role="listbox" aria-multiselectable="true" tabindex="-1" aria-labelledby="multi-select-label" data-vf-multi-select-content hidden>${options('elements')}</div></vf-multi-select>${after}`,
    activate: client
      ? async () => {
          const { defineMultiSelectElement } = await import('@vyrnforge/elements/multi-select');
          defineMultiSelectElement();
          ready();
        }
      : undefined,
  };
}

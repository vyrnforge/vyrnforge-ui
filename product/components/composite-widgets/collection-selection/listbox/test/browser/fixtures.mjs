const single = [
  { key: 'one', value: 'one', label: 'One' },
  { key: 'disabled', value: 'disabled', label: 'Disabled', disabled: true },
  { key: 'three', value: 'three', label: 'Three' },
  { key: 'banana', value: 'banana', label: 'Banana' },
];
const multiple = [single[0], single[2]];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button">After</button>';
function options(prefix, rows, enhanced = false) {
  return rows
    .map(
      (row) =>
        `<div id="${prefix}-${row.key}" ${enhanced ? '' : 'role="option" tabindex="' + (row.disabled ? -1 : 0) + '"'} data-vf-listbox-option value="${row.value}" data-vf-text-value="${row.label}" aria-selected="${row.key === 'one'}"${row.disabled ? ' aria-disabled="true"' : ''}>${row.label}</div>`,
    )
    .join('');
}
function ready() {
  document.body.dataset.listboxReady = 'true';
}
function rejected(value) {
  document.body.dataset.listboxRequest = Array.isArray(value) ? value.join(',') : value;
  document.body.dataset.listboxCount = String(Number(document.body.dataset.listboxCount ?? 0) + 1);
}
const web = `${before}<div id="web-list" role="listbox" aria-label="Choose an item" data-vf-listbox-root>${options('web', single)}</div><div id="web-multi" role="listbox" aria-label="Choose several" aria-multiselectable="true" data-vf-listbox-root>${options('web-multi', multiple)}</div>${after}`;

export const browserFixture = {
  component: 'listbox',
  title: 'Listbox browser fixture',
  heading: 'Listbox browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-listbox-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect } = await import('react');
  const { ListboxRoot, ListboxOption } = await import('@vyrnforge/react/listbox');
  function App() {
    useEffect(ready, []);
    const rows = (prefix, options) =>
      options.map((row) =>
        h(
          ListboxOption,
          { key: row.key, id: `${prefix}-${row.key}`, value: row.value, textValue: row.label, disabled: row.disabled },
          row.label,
        ),
      );
    return h(
      Fragment,
      null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h(
        ListboxRoot,
        { id: 'react-list', 'aria-label': 'Choose an item', defaultValue: 'one' },
        ...rows('react', single),
      ),
      h(
        ListboxRoot,
        { id: 'react-multi', 'aria-label': 'Choose several', selectionMode: 'multiple', defaultValue: ['one'] },
        ...rows('react-multi', multiple),
      ),
      h(
        ListboxRoot,
        { id: 'controlled', 'aria-label': 'Controlled items', value: 'one', onValueChange: rejected },
        ...rows('controlled', multiple),
      ),
      h(ListboxRoot, { id: 'empty', 'aria-label': 'Empty items' }),
      h('button', { id: 'after', type: 'button' }, 'After'),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { ListboxRoot, ListboxOption } = await import('@vyrnforge/vue/listbox');
  return createSSRApp({
    setup() {
      onMounted(ready);
      const rows = (prefix, options) =>
        options.map((row) =>
          h(
            ListboxOption,
            {
              key: row.key,
              id: `${prefix}-${row.key}`,
              value: row.value,
              textValue: row.label,
              disabled: row.disabled,
            },
            () => row.label,
          ),
        );
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h(ListboxRoot, { id: 'vue-list', 'aria-label': 'Choose an item', defaultValue: 'one' }, () =>
            rows('vue', single),
          ),
          h(
            ListboxRoot,
            { id: 'vue-multi', 'aria-label': 'Choose several', selectionMode: 'multiple', defaultValue: ['one'] },
            () => rows('vue-multi', multiple),
          ),
          h(
            ListboxRoot,
            { id: 'controlled', 'aria-label': 'Controlled items', value: 'one', 'onUpdate:value': rejected },
            () => rows('controlled', multiple),
          ),
          h(ListboxRoot, { id: 'empty', 'aria-label': 'Empty items' }),
          h('button', { id: 'after', type: 'button' }, 'After'),
        ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const { VfListboxRootDirective, VfListboxOptionDirective } = await import('@vyrnforge/angular/listbox');
  class ListboxTestApp {
    constructor() {
      afterNextRender(ready);
    }
    rejected = rejected;
  }
  const rows = (prefix, options) =>
    options
      .map(
        (row) =>
          `<div vfListboxOption="${row.value}" id="${prefix}-${row.key}" textValue="${row.label}" [disabled]="${!!row.disabled}">${row.label}</div>`,
      )
      .join('');
  Component({
    selector: 'vf-listbox-test',
    standalone: true,
    imports: [VfListboxRootDirective, VfListboxOptionDirective],
    template: `<main><h1>Listbox browser fixture</h1>${before}<div vfListboxRoot id="angular-list" aria-label="Choose an item" defaultValue="one">${rows('angular', single)}</div><div vfListboxRoot id="angular-multi" aria-label="Choose several" selectionMode="multiple" defaultValue="one">${rows('angular-multi', multiple)}</div><div vfListboxRoot id="controlled" aria-label="Controlled items" value="one" (valueChange)="rejected($event)">${rows('controlled', multiple)}</div><div vfListboxRoot id="empty" aria-label="Empty items"></div>${after}</main>`,
  })(ListboxTestApp);
  return ListboxTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}<vf-listbox id="elements-list" aria-label="Choose an item">${options('elements', single, true)}</vf-listbox><vf-listbox id="elements-multi" aria-label="Choose several" selection-mode="multiple">${options('elements-multi', multiple, true)}</vf-listbox><vf-listbox id="empty" aria-label="Empty items"></vf-listbox>${after}`,
    activate: client
      ? async () => {
          const { defineListboxElement } = await import('@vyrnforge/elements/listbox');
          defineListboxElement();
          ready();
        }
      : undefined,
  };
}

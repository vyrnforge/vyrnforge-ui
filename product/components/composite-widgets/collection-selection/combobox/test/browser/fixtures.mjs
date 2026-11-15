const items = [
  { key: 'react', value: 'React', label: 'React' },
  { key: 'angular', value: 'Angular', label: 'Angular', disabled: true },
  { key: 'vue', value: 'Vue', label: 'Vue' },
  { key: 'svelte', value: 'Svelte', label: 'Svelte' },
];
const cities = [
  { key: 'istanbul', value: 'city-istanbul', label: 'İstanbul' },
  { key: 'isparta', value: 'city-isparta', label: 'Isparta' },
];
const controlledItems = [
  { key: 'react', value: 'react-key', label: 'React' },
  { key: 'vue', value: 'vue-key', label: 'Vue' },
];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button" style="position: fixed; right: 16px; bottom: 16px">After</button>';
function options(prefix, rows) {
  return rows
    .map(
      (row) =>
        `<button id="${prefix}-${row.key}" type="button" role="option" tabindex="-1" aria-selected="false" data-vf-combobox-option data-value="${row.value}" data-vf-text-value="${row.label}"${row.disabled ? ' disabled aria-disabled="true"' : ''}>${row.label}</button>`,
    )
    .join('');
}
function ready() {
  document.body.dataset.comboReady = 'true';
}
function changed(value) {
  document.body.dataset.comboValue = value;
}
const web = `${before}<input id="web-input" aria-label="Framework" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="web-listbox" data-vf-combobox-input><div id="web-listbox" role="listbox" aria-labelledby="web-input" data-vf-combobox-content popover="auto">${options('web', items)}</div>${after}`;

export const browserFixture = {
  component: 'combobox',
  title: 'Combobox browser fixture',
  heading: 'Combobox browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-combobox-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect, useState } = await import('react');
  const { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxOption } = await import('@vyrnforge/react/combobox');
  function App() {
    const [controlledValue, setControlledValue] = useState('react-key');
    const [controlledQuery, setControlledQuery] = useState('React');
    const [accept, setAccept] = useState(false);
    useEffect(ready, []);
    const combo = (prefix, rows, label, locale) =>
      h(
        ComboboxRoot,
        { id: locale ? `${prefix}-root` : undefined, locale, onValueChange: changed },
        h(ComboboxInput, {
          'aria-label': label,
          ...(locale ? { id: `${prefix}-obsolete-input`, 'aria-controls': `${prefix}-obsolete-listbox` } : {}),
        }),
        h(
          ComboboxContent,
          { 'aria-label': label + ' options', ...(locale ? { id: `${prefix}-obsolete-listbox` } : {}) },
          ...rows.map((row) =>
            h(
              ComboboxOption,
              {
                key: row.key,
                id: `${prefix}-${row.key}`,
                value: row.value,
                textValue: row.label,
                disabled: row.disabled,
              },
              row.label,
            ),
          ),
        ),
      );
    return h(
      Fragment,
      null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h(
        'fieldset',
        { id: 'combo-fieldset' },
        h('legend', null, 'Framework selection'),
        combo('react', items, 'Framework'),
      ),
      combo('react-locale', cities, 'Turkish city', 'tr'),
      h(
        'button',
        { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
        'After',
      ),
      h('button', { id: 'accept-selection', type: 'button', onClick: () => setAccept(true) }, 'Accept selection'),
      h(
        'button',
        { id: 'external-selection', type: 'button', onClick: () => setControlledValue('react-key') },
        'External selection',
      ),
      h(
        ComboboxRoot,
        {
          id: 'controlled-combo',
          value: controlledValue,
          query: controlledQuery,
          onValueChange(next) {
            document.body.dataset.controlledValue = next;
            if (accept) setControlledValue(next);
          },
          onQueryChange(next) {
            document.body.dataset.controlledQuery = next;
            if (next !== 'blocked') setControlledQuery(next);
          },
        },
        h(ComboboxInput, { 'aria-label': 'Controlled framework', name: 'query' }),
        h(
          ComboboxContent,
          { 'aria-label': 'Controlled framework options' },
          ...controlledItems.map((row) =>
            h(
              ComboboxOption,
              { key: row.key, id: 'controlled-' + row.key, value: row.value, textValue: row.label },
              row.label,
            ),
          ),
        ),
      ),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxOption } = await import('@vyrnforge/vue/combobox');
  return createSSRApp({
    setup() {
      const controlledValue = ref('react-key');
      const controlledQuery = ref('React');
      const accept = ref(false);
      onMounted(ready);
      const combo = (prefix, rows, label, locale) =>
        h(ComboboxRoot, { id: locale ? `${prefix}-root` : undefined, locale, 'onUpdate:value': changed }, () => [
          h(ComboboxInput, {
            'aria-label': label,
            ...(locale ? { id: `${prefix}-obsolete-input`, 'aria-controls': `${prefix}-obsolete-listbox` } : {}),
          }),
          h(
            ComboboxContent,
            { 'aria-label': label + ' options', ...(locale ? { id: `${prefix}-obsolete-listbox` } : {}) },
            () =>
              rows.map((row) =>
                h(
                  ComboboxOption,
                  {
                    key: row.key,
                    id: `${prefix}-${row.key}`,
                    value: row.value,
                    textValue: row.label,
                    disabled: row.disabled,
                  },
                  () => row.label,
                ),
              ),
          ),
        ]);
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h('fieldset', { id: 'combo-fieldset' }, [
            h('legend', 'Framework selection'),
            combo('vue', items, 'Framework'),
          ]),
          combo('vue-locale', cities, 'Turkish city', 'tr'),
          h(
            'button',
            { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
            'After',
          ),
          h(
            'button',
            { id: 'accept-selection', type: 'button', onClick: () => (accept.value = true) },
            'Accept selection',
          ),
          h(
            'button',
            { id: 'external-selection', type: 'button', onClick: () => (controlledValue.value = 'react-key') },
            'External selection',
          ),
          h(
            ComboboxRoot,
            {
              id: 'controlled-combo',
              value: controlledValue.value,
              query: controlledQuery.value,
              'onUpdate:value': (next) => {
                document.body.dataset.controlledValue = next;
                if (accept.value) controlledValue.value = next;
              },
              'onUpdate:query': (next) => {
                document.body.dataset.controlledQuery = next;
                if (next !== 'blocked') controlledQuery.value = next;
              },
            },
            () => [
              h(ComboboxInput, { 'aria-label': 'Controlled framework', name: 'query' }),
              h(ComboboxContent, { 'aria-label': 'Controlled framework options' }, () =>
                controlledItems.map((row) =>
                  h(
                    ComboboxOption,
                    { key: row.key, id: 'controlled-' + row.key, value: row.value, textValue: row.label },
                    () => row.label,
                  ),
                ),
              ),
            ],
          ),
        ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfComboboxRootDirective, VfComboboxInputDirective, VfComboboxContentDirective, VfComboboxOptionDirective } =
    await import('@vyrnforge/angular/combobox');
  class ComboboxTestApp {
    controlledValue = signal('react-key');
    controlledQuery = signal('React');
    accept = false;
    valueRequested(next) {
      document.body.dataset.controlledValue = next;
      if (this.accept) this.controlledValue.set(next);
    }
    queryRequested(next) {
      document.body.dataset.controlledQuery = next;
      if (next !== 'blocked') this.controlledQuery.set(next);
    }
    constructor() {
      afterNextRender(ready);
    }
    changed = changed;
  }
  function combo(prefix, rows, label, locale = '') {
    return `<div vfComboboxRoot${locale ? ' id="' + prefix + '-root" locale="' + locale + '"' : ''} (valueChange)="changed($event)"><input vfComboboxInput aria-label="${label}"><div vfComboboxContent aria-label="${label} options">${rows.map((row) => `<button vfComboboxOption="${row.value}" id="${prefix}-${row.key}" textValue="${row.label}" [disabled]="${!!row.disabled}">${row.label}</button>`).join('')}</div></div>`;
  }
  Component({
    selector: 'vf-combobox-test',
    standalone: true,
    imports: [VfComboboxRootDirective, VfComboboxInputDirective, VfComboboxContentDirective, VfComboboxOptionDirective],
    template: `<main><h1>Combobox browser fixture</h1>${before}<fieldset id="combo-fieldset"><legend>Framework selection</legend>${combo('angular', items, 'Framework')}</fieldset>${combo('angular-locale', cities, 'Turkish city', 'tr')}${after}<button id="accept-selection" type="button" (click)="accept = true">Accept selection</button><button id="external-selection" type="button" (click)="controlledValue.set('react-key')">External selection</button><div vfComboboxRoot id="controlled-combo" [value]="controlledValue()" [query]="controlledQuery()" (valueChange)="valueRequested($event)" (queryChange)="queryRequested($event)"><input vfComboboxInput aria-label="Controlled framework" name="query"><div vfComboboxContent aria-label="Controlled framework options">${controlledItems.map((row) => `<button vfComboboxOption="${row.value}" id="controlled-${row.key}" textValue="${row.label}">${row.label}</button>`).join('')}</div></div></main>`,
  })(ComboboxTestApp);
  return ComboboxTestApp;
}

export async function createElementsStory({ client }) {
  function combo(prefix, rows, label, locale = '') {
    return `<vf-combobox${locale ? ' id="' + prefix + '-root" locale="' + locale + '"' : ''}><input id="${prefix}${locale ? '-root' : ''}-input" aria-label="${label}" data-vf-combobox-input><div id="${prefix}${locale ? '-root' : ''}-listbox" aria-label="${label} options" data-vf-combobox-content hidden>${options(prefix, rows)}</div></vf-combobox>`;
  }
  return {
    body: `${before}<fieldset id="combo-fieldset"><legend>Framework selection</legend>${combo('elements', items, 'Framework')}</fieldset>${combo('elements-locale', cities, 'Turkish city', 'tr')}${after}`,
    activate: client
      ? async () => {
          const { defineComboboxElement } = await import('@vyrnforge/elements/combobox');
          defineComboboxElement();
          ready();
        }
      : undefined,
  };
}

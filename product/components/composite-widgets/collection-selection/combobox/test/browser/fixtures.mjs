const items = [
  { key: 'react', value: 'React', label: 'React' },
  { key: 'angular', value: 'Angular', label: 'Angular', disabled: true },
  { key: 'vue', value: 'Vue', label: 'Vue' },
  { key: 'svelte', value: 'Svelte', label: 'Svelte' },
];
const cities = [
  { key: 'istanbul', value: 'İstanbul', label: 'İstanbul' },
  { key: 'isparta', value: 'Isparta', label: 'Isparta' },
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
  const { createElement: h, Fragment, useEffect } = await import('react');
  const { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxOption } = await import('@vyrnforge/react/combobox');
  function App() {
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
      combo('react', items, 'Framework'),
      combo('react-locale', cities, 'Turkish city', 'tr'),
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
  const { ComboboxRoot, ComboboxInput, ComboboxContent, ComboboxOption } = await import('@vyrnforge/vue/combobox');
  return createSSRApp({
    setup() {
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
          combo('vue', items, 'Framework'),
          combo('vue-locale', cities, 'Turkish city', 'tr'),
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
  const { VfComboboxRootDirective, VfComboboxInputDirective, VfComboboxContentDirective, VfComboboxOptionDirective } =
    await import('@vyrnforge/angular/combobox');
  class ComboboxTestApp {
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
    template: `<main><h1>Combobox browser fixture</h1>${before}${combo('angular', items, 'Framework')}${combo('angular-locale', cities, 'Turkish city', 'tr')}${after}</main>`,
  })(ComboboxTestApp);
  return ComboboxTestApp;
}

export async function createElementsStory({ client }) {
  function combo(prefix, rows, label, locale = '') {
    return `<vf-combobox${locale ? ' id="' + prefix + '-root" locale="' + locale + '"' : ''}><input id="${prefix}${locale ? '-root' : ''}-input" aria-label="${label}" data-vf-combobox-input><div id="${prefix}${locale ? '-root' : ''}-listbox" aria-label="${label} options" data-vf-combobox-content hidden>${options(prefix, rows)}</div></vf-combobox>`;
  }
  return {
    body: `${before}${combo('elements', items, 'Framework')}${combo('elements-locale', cities, 'Turkish city', 'tr')}${after}`,
    activate: client
      ? async () => {
          const { defineComboboxElement } = await import('@vyrnforge/elements/combobox');
          defineComboboxElement();
          ready();
        }
      : undefined,
  };
}

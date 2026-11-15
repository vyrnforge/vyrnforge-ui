const labels = ['One', 'Disabled', 'Three', 'Banana'];
const values = ['one', 'disabled', 'three', 'banana'];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button" style="position: fixed; right: 16px; bottom: 16px">After</button>';
const label = '<div id="select-label">Choose an option</div>';
function options(port) {
  return labels
    .map(
      (label, index) =>
        `<button id="${port}-${values[index]}" type="button" role="option" tabindex="-1" aria-selected="${index === 0}" data-vf-select-option data-vf-value="${values[index]}"${index === 1 ? ' disabled aria-disabled="true"' : ''}>${label}</button>`,
    )
    .join('');
}
function valueChanged(value) {
  document.body.dataset.value = value;
}
function ready() {
  document.body.dataset.selectReady = 'true';
}
function request(value) {
  document.body.dataset.selectRequest = value;
}
function openRequest(value) {
  document.body.dataset.openRequest = String(value);
}
const web = `${before}${label}<button id="trigger" type="button" aria-haspopup="listbox" aria-controls="list" popovertarget="list" data-vf-select-trigger>Choose</button><div id="list" role="listbox" tabindex="-1" aria-labelledby="select-label" popover="auto" data-vf-select-content>${options('web')}</div><form id="native-form"><label for="native-select">Native selection</label><select id="native-select" name="choice"><option value="one">One</option><option value="three">Three</option></select><button type="reset">Reset</button></form>${after}`;

export const browserFixture = {
  component: 'select',
  title: 'Select browser fixture',
  heading: 'Select browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-select-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect, useState } = await import('react');
  const { SelectRoot, SelectTrigger, SelectContent, SelectOption } = await import('@vyrnforge/react/select');
  function App() {
    const [open, setOpen] = useState(false);
    useEffect(ready, []);
    const option = (prefix, index) =>
      h(
        SelectOption,
        { key: values[index], id: `${prefix}-${values[index]}`, value: values[index], disabled: index === 1 },
        labels[index],
      );
    return h(
      Fragment,
      null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h('div', { id: 'select-label' }, 'Choose an option'),
      h(
        SelectRoot,
        { defaultValue: 'one', onValueChange: valueChanged },
        h(SelectTrigger, { id: 'trigger', 'aria-controls': 'list' }, 'Choose'),
        h(
          SelectContent,
          { id: 'list', 'aria-labelledby': 'select-label' },
          ...labels.map((_, index) => option('react', index)),
        ),
      ),
      h(
        SelectRoot,
        {
          value: 'one',
          open,
          onValueChange: request,
          onOpenChange(next) {
            openRequest(next);
            if (next) setOpen(true);
          },
        },
        h(
          SelectTrigger,
          { id: 'controlled-trigger', tabIndex: -1, 'aria-controls': 'controlled-list' },
          'Controlled selection',
        ),
        h(
          SelectContent,
          { id: 'controlled-list', 'aria-label': 'Controlled options' },
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
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { SelectRoot, SelectTrigger, SelectContent, SelectOption } = await import('@vyrnforge/vue/select');
  return createSSRApp({
    setup() {
      const open = ref(false);
      onMounted(ready);
      const option = (prefix, index) =>
        h(
          SelectOption,
          { key: values[index], id: `${prefix}-${values[index]}`, value: values[index], disabled: index === 1 },
          () => labels[index],
        );
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h('div', { id: 'select-label' }, 'Choose an option'),
          h(SelectRoot, { defaultValue: 'one', 'onUpdate:value': valueChanged }, () => [
            h(SelectTrigger, { id: 'trigger', 'aria-controls': 'list' }, () => 'Choose'),
            h(SelectContent, { id: 'list', 'aria-labelledby': 'select-label' }, () =>
              labels.map((_, index) => option('vue', index)),
            ),
          ]),
          h(
            SelectRoot,
            {
              value: 'one',
              open: open.value,
              'onUpdate:value': request,
              'onUpdate:open': (next) => {
                openRequest(next);
                if (next) open.value = true;
              },
            },
            () => [
              h(
                SelectTrigger,
                { id: 'controlled-trigger', tabindex: -1, 'aria-controls': 'controlled-list' },
                () => 'Controlled selection',
              ),
              h(SelectContent, { id: 'controlled-list', 'aria-label': 'Controlled options' }, () => [
                option('controlled', 0),
                option('controlled', 2),
              ]),
            ],
          ),
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
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfSelectRootDirective, VfSelectTriggerDirective, VfSelectContentDirective, VfSelectOptionDirective } =
    await import('@vyrnforge/angular/select');
  class SelectTestApp {
    controlled = signal(false);
    constructor() {
      afterNextRender(ready);
    }
    valueChanged = valueChanged;
    request = request;
    openRequest(next) {
      openRequest(next);
      if (next) this.controlled.set(true);
    }
  }
  const angularOptions = (prefix, indexes) =>
    indexes
      .map(
        (index) =>
          `<button vfSelectOption="${values[index]}" id="${prefix}-${values[index]}" [disabled]="${index === 1}">${labels[index]}</button>`,
      )
      .join('');
  Component({
    selector: 'vf-select-test',
    standalone: true,
    imports: [VfSelectRootDirective, VfSelectTriggerDirective, VfSelectContentDirective, VfSelectOptionDirective],
    template: `<main><h1>Select browser fixture</h1>${before}${label}<div vfSelectRoot defaultValue="one" (valueChange)="valueChanged($event)"><button vfSelectTrigger id="trigger" aria-controls="list">Choose</button><div vfSelectContent id="list" aria-labelledby="select-label">${angularOptions('angular', [0, 1, 2, 3])}</div></div><div vfSelectRoot value="one" [open]="controlled()" (valueChange)="request($event)" (openChange)="openRequest($event)"><button vfSelectTrigger id="controlled-trigger" tabindex="-1" aria-controls="controlled-list">Controlled selection</button><div vfSelectContent id="controlled-list" aria-label="Controlled options">${angularOptions('controlled', [0, 2])}</div></div>${after}</main>`,
  })(SelectTestApp);
  return SelectTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}${label}<vf-select id="elements-select" value="one"><button id="trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="list" data-vf-select-trigger>Choose</button><div id="list" role="listbox" tabindex="-1" aria-labelledby="select-label" data-vf-select-content hidden>${options('elements')}</div></vf-select>${after}`,
    activate: client
      ? async () => {
          const { defineSelectElement } = await import('@vyrnforge/elements/select');
          defineSelectElement();
          ready();
        }
      : undefined,
  };
}

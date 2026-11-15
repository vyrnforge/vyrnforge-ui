const labels = ['One', 'Disabled', 'Three', 'Banana'];
const values = ['one', 'disabled', 'three', 'banana'];
const formOptions = [{ value: '', label: 'Choose an option' }].concat([
  { value: 'one', label: 'One' },
  { value: 'three', label: 'Three' },
]);
const formButton = { type: 'submit', form: 'selection-form' };
const formMarkup =
  '<form id="selection-form"><button type="submit">Submit choice</button></form><form id="controlled-form"></form>';
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
  const { SelectRoot, SelectTrigger, SelectContent, SelectOption, SelectFormControl } =
    await import('@vyrnforge/react/select');
  function App() {
    const [formDisabled, setFormDisabled] = useState(false);
    const [open, setOpen] = useState(false);
    useEffect(ready, []);
    const option = (prefix, index) =>
      h(
        SelectOption,
        {
          key: values[index],
          id: `${prefix}-${values[index]}`,
          value: values[index],
          disabled: index === 1,
          ...(prefix === 'form' ? formButton : {}),
        },
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
        h(SelectTrigger, { id: 'obsolete-trigger', 'aria-controls': 'obsolete-list' }, 'Choose'),
        h(
          SelectContent,
          { id: 'obsolete-list', 'aria-labelledby': 'select-label' },
          ...labels.map((_, index) => option('react', index)),
        ),
      ),
      h(
        SelectRoot,
        {
          id: 'controlled',
          value: 'one',
          open,
          onValueChange: request,
          onOpenChange(next) {
            openRequest(next);
            if (next) setOpen(true);
          },
        },
        h(SelectTrigger, { tabIndex: -1 }, 'Controlled selection'),
        h(SelectContent, { 'aria-label': 'Controlled options' }, option('controlled', 0), option('controlled', 2)),
        h(SelectFormControl, { name: 'choice', form: 'controlled-form', options: formOptions }),
      ),
      h(
        'button',
        { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
        'After',
      ),
      h('form', { id: 'selection-form' }, h('button', { type: 'submit' }, 'Submit choice')),
      h('form', { id: 'controlled-form' }),
      h(
        'div',
        { id: 'form-example' },
        h(
          SelectRoot,
          { id: 'form-choice', defaultValue: '', disabled: formDisabled },
          h(SelectTrigger, { ...formButton, 'aria-describedby': 'form-hint' }, 'Form choice'),
          h(SelectContent, { 'aria-label': 'Form options' }, option('form', 0), option('form', 2)),
          h(SelectFormControl, { name: 'choice', form: 'selection-form', required: true, options: formOptions }),
        ),
        h('p', { id: 'form-hint' }, 'Choose at least one option.'),
        h(
          'button',
          { id: 'form-disable', type: 'button', onClick: () => setFormDisabled((value) => !value) },
          'Toggle disabled',
        ),
      ),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { SelectRoot, SelectTrigger, SelectContent, SelectOption, SelectFormControl } =
    await import('@vyrnforge/vue/select');
  return createSSRApp({
    setup() {
      const formDisabled = ref(false);
      const open = ref(false);
      onMounted(ready);
      const option = (prefix, index) =>
        h(
          SelectOption,
          {
            key: values[index],
            id: `${prefix}-${values[index]}`,
            value: values[index],
            disabled: index === 1,
            ...(prefix === 'form' ? formButton : {}),
          },
          () => labels[index],
        );
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h('div', { id: 'select-label' }, 'Choose an option'),
          h(SelectRoot, { defaultValue: 'one', 'onUpdate:value': valueChanged }, () => [
            h(SelectTrigger, { id: 'obsolete-trigger', 'aria-controls': 'obsolete-list' }, () => 'Choose'),
            h(SelectContent, { id: 'obsolete-list', 'aria-labelledby': 'select-label' }, () =>
              labels.map((_, index) => option('vue', index)),
            ),
          ]),
          h(
            SelectRoot,
            {
              id: 'controlled',
              value: 'one',
              open: open.value,
              'onUpdate:value': request,
              'onUpdate:open': (next) => {
                openRequest(next);
                if (next) open.value = true;
              },
            },
            () => [
              h(SelectTrigger, { tabindex: -1 }, () => 'Controlled selection'),
              h(SelectContent, { 'aria-label': 'Controlled options' }, () => [
                option('controlled', 0),
                option('controlled', 2),
              ]),
              h(SelectFormControl, { name: 'choice', form: 'controlled-form', options: formOptions }),
            ],
          ),
          h(
            'button',
            { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } },
            'After',
          ),
          h('form', { id: 'selection-form' }, [h('button', { type: 'submit' }, 'Submit choice')]),
          h('form', { id: 'controlled-form' }),
          h('div', { id: 'form-example' }, [
            h(SelectRoot, { id: 'form-choice', defaultValue: '', disabled: formDisabled.value }, () => [
              h(SelectTrigger, { ...formButton, 'aria-describedby': 'form-hint' }, () => 'Form choice'),
              h(SelectContent, { 'aria-label': 'Form options' }, () => [option('form', 0), option('form', 2)]),
              h(SelectFormControl, { name: 'choice', form: 'selection-form', required: true, options: formOptions }),
            ]),
            h('p', { id: 'form-hint' }, 'Choose at least one option.'),
            h(
              'button',
              { id: 'form-disable', type: 'button', onClick: () => (formDisabled.value = !formDisabled.value) },
              'Toggle disabled',
            ),
          ]),
        ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const {
    VfSelectRootDirective,
    VfSelectTriggerDirective,
    VfSelectContentDirective,
    VfSelectOptionDirective,
    VfSelectFormControlComponent,
  } = await import('@vyrnforge/angular/select');
  class SelectTestApp {
    formDisabled = false;
    formOptions = formOptions;
    emptyValues = [];
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
          `<button vfSelectOption="${values[index]}" id="${prefix}-${values[index]}"${prefix === 'form' ? ' type="submit" form="selection-form"' : ''} [disabled]="${index === 1}">${labels[index]}</button>`,
      )
      .join('');
  Component({
    selector: 'vf-select-test',
    standalone: true,
    imports: [
      VfSelectRootDirective,
      VfSelectTriggerDirective,
      VfSelectContentDirective,
      VfSelectOptionDirective,
      VfSelectFormControlComponent,
    ],
    template: `<main><h1>Select browser fixture</h1>${before}${label}<div vfSelectRoot defaultValue="one" (valueChange)="valueChanged($event)"><button vfSelectTrigger>Choose</button><div vfSelectContent aria-labelledby="select-label">${angularOptions('angular', [0, 1, 2, 3])}</div></div><div vfSelectRoot id="controlled" value="one" [open]="controlled()" (valueChange)="request($event)" (openChange)="openRequest($event)"><button vfSelectTrigger tabindex="-1">Controlled selection</button><div vfSelectContent aria-label="Controlled options">${angularOptions('controlled', [0, 2])}</div><vf-select-form-control name="choice" form="controlled-form" [options]="formOptions"></vf-select-form-control></div>${after}${formMarkup}<div id="form-example"><div vfSelectRoot id="form-choice" [disabled]="formDisabled" defaultValue=""><button vfSelectTrigger type="submit" form="selection-form" aria-describedby="form-hint">Form choice</button><div vfSelectContent aria-label="Form options">${angularOptions('form', [0, 2])}</div><vf-select-form-control name="choice" form="selection-form" required [options]="formOptions"></vf-select-form-control></div><p id="form-hint">Choose at least one option.</p><button id="form-disable" type="button" (click)="formDisabled = !formDisabled">Toggle disabled</button></div></main>`,
  })(SelectTestApp);
  return SelectTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}${label}<vf-select id="elements-select" value="one"><button id="trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="obsolete-list" data-vf-select-trigger>Choose</button><div id="list" role="listbox" tabindex="-1" aria-labelledby="select-label" data-vf-select-content hidden>${options('elements')}</div></vf-select>${after}${formMarkup}<div id="form-example"><vf-select id="form-choice"><button id="form-choice-trigger" type="submit" form="selection-form" aria-describedby="form-hint" data-vf-select-trigger>Form choice</button><div id="form-choice-listbox" role="listbox" aria-label="Form options" data-vf-select-content hidden><button id="form-one" type="submit" form="selection-form" role="option" data-vf-select-option data-vf-value="one" aria-selected="false">One</button><button id="form-three" type="submit" form="selection-form" role="option" data-vf-select-option data-vf-value="three" aria-selected="false">Three</button></div><select hidden name="choice" form="selection-form" required data-vf-select-form-control><option value="">Choose an option</option><option value="one">One</option><option value="three">Three</option></select><span data-vf-select-form-error></span></vf-select><p id="form-hint">Choose at least one option.</p><button id="form-disable" type="button">Toggle disabled</button></div>`,
    activate: client
      ? async () => {
          const { defineSelectElement } = await import('@vyrnforge/elements/select');
          defineSelectElement();
          document
            .querySelector('#form-disable')
            .addEventListener('click', () => document.querySelector('#form-choice').toggleAttribute('disabled'));
          ready();
        }
      : undefined,
  };
}

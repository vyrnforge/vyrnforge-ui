const field = (tag, id, value, label, inputAttrs = '') =>
  `<${tag} data-vf-number-field-root id="${id}-root"><button id="${id === 'input' ? 'dec' : id + '-dec'}" type="button" aria-label="Decrease ${label}" data-vf-number-field-decrement>−</button><input id="${id}" type="number" aria-label="${label}" name="${id}" min="0" max="10" step="1" value="${value}" data-vf-number-field-input ${inputAttrs}><button id="${id === 'input' ? 'inc' : id + '-inc'}" type="button" aria-label="Increase ${label}" data-vf-number-field-increment>+</button></${tag}>`;
const baseline = field('div', 'input', 2, 'Quantity');
const elementsMarkup = field('vf-number-field', 'input', 2, 'Quantity').replace(
  '</vf-number-field>',
  `${field('vf-number-field', 'nested', 4, 'Nested quantity')}</vf-number-field>`,
);
export const browserFixture = {
  component: 'number-field',
  title: 'Number field browser fixture',
  heading: 'Number field browser fixture',
  ports: {
    web: {
      body: `<form id="number-form">${baseline}</form>`,
      script:
        "document.querySelector('#inc').onclick=()=>document.querySelector('#input').stepUp();document.querySelector('#dec').onclick=()=>document.querySelector('#input').stepDown();",
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-number-field-test' },
    elements: { story: 'createElementsStory' },
  },
};
function record(key, value) {
  document.body.dataset[key] = String(value);
  document.body.dataset[key + 'Count'] = String(Number(document.body.dataset[key + 'Count'] ?? 0) + 1);
}
export async function createReactStory({ client }) {
  const { createElement: h, useEffect, useState } = await import('react');
  const { NumberField, NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } =
    await import('@vyrnforge/react/number-field');
  function App() {
    const [controlled, setControlled] = useState(2);
    const [accepted, setAccepted] = useState(-2.5);
    useEffect(() => {
      document.body.dataset.numberFieldReady = 'true';
    }, []);
    const field = (id, label, options, inputOptions = {}) =>
      h(
        NumberFieldRoot,
        { key: id, ...options },
        h(NumberFieldDecrement, { id: id === 'input' ? 'dec' : id + '-dec', 'aria-label': 'Decrease ' + label }, '−'),
        h(NumberFieldInput, { id, name: id, 'aria-label': label, ...inputOptions }),
        h(NumberFieldIncrement, { id: id === 'input' ? 'inc' : id + '-inc', 'aria-label': 'Increase ' + label }, '+'),
      );
    const report = (key) => (value) => {
      if (client) record(key, value);
    };
    return h(
      'form',
      { id: 'number-form' },
      field(
        'input',
        'Quantity',
        { defaultValue: 2, min: 0, max: 10, step: 1, onValueChange: report('quantity') },
        { required: true },
      ),
      field('controlled', 'Controlled quantity', {
        value: controlled,
        min: 0,
        max: 10,
        onValueChange: report('controlledRequest'),
      }),
      field('fractional', 'Fractional quantity', {
        defaultValue: 0.1,
        min: 0.1,
        max: 0.7,
        step: 0.2,
        onValueChange: report('fractional'),
      }),
      field('readonly', 'Read-only quantity', { defaultValue: 2, readOnly: true }),
      field('disabled', 'Disabled quantity', { defaultValue: 2, disabled: true }),
      field('any', 'Any quantity', { defaultValue: null, step: 'any', onValueChange: report('anyValue') }),
      h(NumberField, { id: 'nf-order', name: 'order', label: 'Order quantity', description: 'Number of items', defaultValue: 1, min: 0, max: 100, stepControls: 'horizontal', incrementLabel: 'Add order item', decrementLabel: 'Remove order item', fullWidth: true, onValueChange: report('order') }),
      h(NumberField, { id: 'nf-accepted', name: 'accepted', label: 'Accepted adjustment', value: accepted, onValueChange: setAccepted, min: -10, max: 10, step: 0.1, stepControls: 'stacked', incrementLabel: 'Increase adjustment', decrementLabel: 'Decrease adjustment', variant: 'filled', labelPlacement: 'floating', suffix: 'kg', fieldSize: 'sm' }),
      h(NumberField, { id: 'nf-empty', name: 'empty', label: 'Empty amount', step: 'any', stepControls: 'none', variant: 'underlined', prefix: '
      h(
        'button',
        { type: 'button', id: 'set-controlled', onClick: () => setControlled(7) },
        'Set controlled value to seven',
      ),
      h(
        'button',
        { type: 'button', id: 'clear-controlled', onClick: () => setControlled(null) },
        'Clear controlled value',
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } =
    await import('@vyrnforge/vue/number-field');
  return createSSRApp({
    setup() {
      const controlled = ref(2);
      onMounted(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
      const report = (key) => (value) => {
        if (client) record(key, value);
      };
      const field = (id, label, options, inputOptions = {}) =>
        h(NumberFieldRoot, { key: id, ...options }, () => [
          h(
            NumberFieldDecrement,
            { id: id === 'input' ? 'dec' : id + '-dec', 'aria-label': 'Decrease ' + label },
            () => '−',
          ),
          h(NumberFieldInput, { id, name: id, 'aria-label': label, ...inputOptions }),
          h(
            NumberFieldIncrement,
            { id: id === 'input' ? 'inc' : id + '-inc', 'aria-label': 'Increase ' + label },
            () => '+',
          ),
        ]);
      return () =>
        h('form', { id: 'number-form' }, [
          field(
            'input',
            'Quantity',
            { defaultValue: 2, min: 0, max: 10, step: 1, 'onUpdate:value': report('quantity') },
            { required: true },
          ),
          field('controlled', 'Controlled quantity', {
            value: controlled.value,
            min: 0,
            max: 10,
            'onUpdate:value': report('controlledRequest'),
          }),
          field('fractional', 'Fractional quantity', {
            defaultValue: 0.1,
            min: 0.1,
            max: 0.7,
            step: 0.2,
            'onUpdate:value': report('fractional'),
          }),
          field('readonly', 'Read-only quantity', { defaultValue: 2, readOnly: true }),
          field('disabled', 'Disabled quantity', { defaultValue: 2, disabled: true }),
          field('any', 'Any quantity', { defaultValue: null, step: 'any', 'onUpdate:value': report('anyValue') }),
          h(
            'button',
            {
              type: 'button',
              id: 'set-controlled',
              onClick: () => {
                controlled.value = 7;
              },
            },
            'Set controlled value to seven',
          ),
          h(
            'button',
            {
              type: 'button',
              id: 'clear-controlled',
              onClick: () => {
                controlled.value = null;
              },
            },
            'Clear controlled value',
          ),
        ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const {
    VfNumberFieldRootDirective,
    VfNumberFieldInputDirective,
    VfNumberFieldIncrementDirective,
    VfNumberFieldDecrementDirective,
  } = await import('@vyrnforge/angular/number-field');
  class NumberFieldTestApp {
    controlled = signal(2);
    constructor() {
      afterNextRender(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
    }
    changed(key, value) {
      if (client) record(key, value);
    }
  }
  const field = (id, label, options, inputOptions = '') => `<div vfNumberFieldRoot ${options}>
    <button vfNumberFieldDecrement id="${id === 'input' ? 'dec' : id + '-dec'}" aria-label="Decrease ${label}">−</button>
    <input vfNumberFieldInput id="${id}" name="${id}" aria-label="${label}" ${inputOptions}>
    <button vfNumberFieldIncrement id="${id === 'input' ? 'inc' : id + '-inc'}" aria-label="Increase ${label}">+</button>
    </div>`;
  Component({
    selector: 'vf-number-field-test',
    standalone: true,
    imports: [
      VfNumberFieldRootDirective,
      VfNumberFieldInputDirective,
      VfNumberFieldIncrementDirective,
      VfNumberFieldDecrementDirective,
    ],
    template: `<main><h1>Number field browser fixture</h1><form id="number-form">
    ${field('input', 'Quantity', '[defaultValue]="2" [min]="0" [max]="10" [step]="1" (valueChange)="changed(\'quantity\', $event)"', 'required')}
    ${field('controlled', 'Controlled quantity', '[value]="controlled()" [min]="0" [max]="10" (valueChange)="changed(\'controlledRequest\', $event)"')}
    ${field('fractional', 'Fractional quantity', '[defaultValue]="0.1" [min]="0.1" [max]="0.7" [step]="0.2" (valueChange)="changed(\'fractional\', $event)"')}
    ${field('readonly', 'Read-only quantity', '[defaultValue]="2" [readOnly]="true"')}
    ${field('disabled', 'Disabled quantity', '[defaultValue]="2" [disabled]="true"')}
    ${field('any', 'Any quantity', '[defaultValue]="null" step="any" (valueChange)="changed(\'anyValue\', $event)"')}
    <button type="button" id="set-controlled" (click)="controlled.set(7)">Set controlled value to seven</button>
    <button type="button" id="clear-controlled" (click)="controlled.set(null)">Clear controlled value</button>
    </form></main>`,
  })(NumberFieldTestApp);
  return NumberFieldTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: `<form id="number-form">${elementsMarkup}</form>`,
    activate: client
      ? async () => {
          const { defineNumberFieldElement } = await import('@vyrnforge/elements/number-field');
          defineNumberFieldElement();
          document.body.dataset.numberFieldReady = 'true';
        }
      : undefined,
  };
}
, error: 'Enter amount', required: true }),
      h(
        'button',
        { type: 'button', id: 'set-controlled', onClick: () => setControlled(7) },
        'Set controlled value to seven',
      ),
      h(
        'button',
        { type: 'button', id: 'clear-controlled', onClick: () => setControlled(null) },
        'Clear controlled value',
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } =
    await import('@vyrnforge/vue/number-field');
  return createSSRApp({
    setup() {
      const controlled = ref(2);
      onMounted(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
      const report = (key) => (value) => {
        if (client) record(key, value);
      };
      const field = (id, label, options, inputOptions = {}) =>
        h(NumberFieldRoot, { key: id, ...options }, () => [
          h(
            NumberFieldDecrement,
            { id: id === 'input' ? 'dec' : id + '-dec', 'aria-label': 'Decrease ' + label },
            () => '−',
          ),
          h(NumberFieldInput, { id, name: id, 'aria-label': label, ...inputOptions }),
          h(
            NumberFieldIncrement,
            { id: id === 'input' ? 'inc' : id + '-inc', 'aria-label': 'Increase ' + label },
            () => '+',
          ),
        ]);
      return () =>
        h('form', { id: 'number-form' }, [
          field(
            'input',
            'Quantity',
            { defaultValue: 2, min: 0, max: 10, step: 1, 'onUpdate:value': report('quantity') },
            { required: true },
          ),
          field('controlled', 'Controlled quantity', {
            value: controlled.value,
            min: 0,
            max: 10,
            'onUpdate:value': report('controlledRequest'),
          }),
          field('fractional', 'Fractional quantity', {
            defaultValue: 0.1,
            min: 0.1,
            max: 0.7,
            step: 0.2,
            'onUpdate:value': report('fractional'),
          }),
          field('readonly', 'Read-only quantity', { defaultValue: 2, readOnly: true }),
          field('disabled', 'Disabled quantity', { defaultValue: 2, disabled: true }),
          field('any', 'Any quantity', { defaultValue: null, step: 'any', 'onUpdate:value': report('anyValue') }),
          h(
            'button',
            {
              type: 'button',
              id: 'set-controlled',
              onClick: () => {
                controlled.value = 7;
              },
            },
            'Set controlled value to seven',
          ),
          h(
            'button',
            {
              type: 'button',
              id: 'clear-controlled',
              onClick: () => {
                controlled.value = null;
              },
            },
            'Clear controlled value',
          ),
        ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const {
    VfNumberFieldRootDirective,
    VfNumberFieldInputDirective,
    VfNumberFieldIncrementDirective,
    VfNumberFieldDecrementDirective,
  } = await import('@vyrnforge/angular/number-field');
  class NumberFieldTestApp {
    controlled = signal(2);
    constructor() {
      afterNextRender(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
    }
    changed(key, value) {
      if (client) record(key, value);
    }
  }
  const field = (id, label, options, inputOptions = '') => `<div vfNumberFieldRoot ${options}>
    <button vfNumberFieldDecrement id="${id === 'input' ? 'dec' : id + '-dec'}" aria-label="Decrease ${label}">−</button>
    <input vfNumberFieldInput id="${id}" name="${id}" aria-label="${label}" ${inputOptions}>
    <button vfNumberFieldIncrement id="${id === 'input' ? 'inc' : id + '-inc'}" aria-label="Increase ${label}">+</button>
    </div>`;
  Component({
    selector: 'vf-number-field-test',
    standalone: true,
    imports: [
      VfNumberFieldRootDirective,
      VfNumberFieldInputDirective,
      VfNumberFieldIncrementDirective,
      VfNumberFieldDecrementDirective,
    ],
    template: `<main><h1>Number field browser fixture</h1><form id="number-form">
    ${field('input', 'Quantity', '[defaultValue]="2" [min]="0" [max]="10" [step]="1" (valueChange)="changed(\'quantity\', $event)"', 'required')}
    ${field('controlled', 'Controlled quantity', '[value]="controlled()" [min]="0" [max]="10" (valueChange)="changed(\'controlledRequest\', $event)"')}
    ${field('fractional', 'Fractional quantity', '[defaultValue]="0.1" [min]="0.1" [max]="0.7" [step]="0.2" (valueChange)="changed(\'fractional\', $event)"')}
    ${field('readonly', 'Read-only quantity', '[defaultValue]="2" [readOnly]="true"')}
    ${field('disabled', 'Disabled quantity', '[defaultValue]="2" [disabled]="true"')}
    ${field('any', 'Any quantity', '[defaultValue]="null" step="any" (valueChange)="changed(\'anyValue\', $event)"')}
    <button type="button" id="set-controlled" (click)="controlled.set(7)">Set controlled value to seven</button>
    <button type="button" id="clear-controlled" (click)="controlled.set(null)">Clear controlled value</button>
    </form></main>`,
  })(NumberFieldTestApp);
  return NumberFieldTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: `<form id="number-form">${elementsMarkup}</form>`,
    activate: client
      ? async () => {
          const { defineNumberFieldElement } = await import('@vyrnforge/elements/number-field');
          defineNumberFieldElement();
          document.body.dataset.numberFieldReady = 'true';
        }
      : undefined,
  };
}

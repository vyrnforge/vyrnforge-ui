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
      body: baseline,
      script:
        "document.querySelector('#inc').onclick=()=>document.querySelector('#input').stepUp();document.querySelector('#dec').onclick=()=>document.querySelector('#input').stepDown();",
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-number-field-test' },
    elements: { story: 'createElementsStory' },
  },
};
export async function createReactStory() {
  const { createElement: h, useEffect } = await import('react');
  const { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } =
    await import('@vyrnforge/react/number-field');
  function App() {
    useEffect(() => {
      document.body.dataset.numberFieldReady = 'true';
    }, []);
    return h(
      NumberFieldRoot,
      { defaultValue: 2, min: 0, max: 10, step: 1 },
      h(NumberFieldDecrement, { id: 'dec', 'aria-label': 'Decrease Quantity' }, '−'),
      h(NumberFieldInput, { id: 'input', name: 'quantity', 'aria-label': 'Quantity' }),
      h(NumberFieldIncrement, { id: 'inc', 'aria-label': 'Increase Quantity' }, '+'),
    );
  }
  return h(App);
}
export async function createVueStory() {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } =
    await import('@vyrnforge/vue/number-field');
  return createSSRApp({
    setup() {
      onMounted(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
      return () =>
        h(NumberFieldRoot, { defaultValue: 2, min: 0, max: 10, step: 1 }, () => [
          h(NumberFieldDecrement, { id: 'dec', 'aria-label': 'Decrease Quantity' }, () => '−'),
          h(NumberFieldInput, { id: 'input', name: 'quantity', 'aria-label': 'Quantity', min: 0, max: 10, step: 1 }),
          h(NumberFieldIncrement, { id: 'inc', 'aria-label': 'Increase Quantity' }, () => '+'),
        ]);
    },
  });
}
export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const {
    VfNumberFieldRootDirective,
    VfNumberFieldInputDirective,
    VfNumberFieldIncrementDirective,
    VfNumberFieldDecrementDirective,
  } = await import('@vyrnforge/angular/number-field');
  class NumberFieldTestApp {
    constructor() {
      afterNextRender(() => {
        document.body.dataset.numberFieldReady = 'true';
      });
    }
  }
  Component({
    selector: 'vf-number-field-test',
    standalone: true,
    imports: [
      VfNumberFieldRootDirective,
      VfNumberFieldInputDirective,
      VfNumberFieldIncrementDirective,
      VfNumberFieldDecrementDirective,
    ],
    template: `<main><h1>Number field browser fixture</h1><div vfNumberFieldRoot [defaultValue]="2" [min]="0" [max]="10" [step]="1">
    <button vfNumberFieldDecrement id="dec" aria-label="Decrease Quantity">−</button>
    <input vfNumberFieldInput id="input" name="quantity" aria-label="Quantity" min="0" max="10" step="1">
    <button vfNumberFieldIncrement id="inc" aria-label="Increase Quantity">+</button>
    </div></main>`,
  })(NumberFieldTestApp);
  return NumberFieldTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: elementsMarkup,
    activate: client
      ? async () => {
          const { defineNumberFieldElement } = await import('@vyrnforge/elements/number-field');
          defineNumberFieldElement();
          document.body.dataset.numberFieldReady = 'true';
        }
      : undefined,
  };
}

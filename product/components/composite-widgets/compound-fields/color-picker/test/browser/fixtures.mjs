const guide = '<p id="color-guide">Enter a six-digit hex color, for example #3366ff.</p>';
const markup = (tag, id = 'root', prefix = '', value = '#3366ff', nested = '') =>
  `<${tag} id="${id}" data-vf-color-picker-root><input id="${prefix}color" type="color" name="${prefix}color" aria-label="${prefix}Choose color" value="${value}" data-vf-color-picker-input><input id="${prefix}text" type="text" aria-label="${prefix}Color value" aria-describedby="color-guide" pattern="#[0-9a-fA-F]{6}" value="${value}" data-vf-color-picker-text><span id="${prefix}swatch" data-vf-color-picker-swatch aria-hidden="true" style="background-color:${value}"></span>${nested}</${tag}>`;
const web = guide + '<form id="color-form">' + markup('div') + '</form>';
const elements = guide + '<form id="color-form">' + markup('vf-color-picker', 'root', '', '#3366ff', markup('vf-color-picker', 'nested', 'nested-', '#112233')) + '</form>';
export const browserFixture = {
  component: 'color-picker',
  title: 'Color picker browser fixture',
  heading: 'Color picker browser fixture',
  ports: {
    web: {
      body: web,
      script: "const root=document.querySelector('#root');root.addEventListener('input',event=>{const v=event.target.value;if(!/^#[0-9a-f]{6}$/i.test(v))return;const next=v.toLowerCase();root.querySelector('#color').value=next;root.querySelector('#text').value=next;root.querySelector('#swatch').style.backgroundColor=next;});",
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-color-picker-test' },
    elements: { story: 'createElementsStory' },
  },
};
function record(key, value) {
  document.body.dataset[key] = value;
  document.body.dataset[key + 'Count'] = String(Number(document.body.dataset[key + 'Count'] ?? 0) + 1);
}
export async function createReactStory({ client }) {
  const { createElement: h, useEffect, useState } = await import('react');
  const { ColorPickerRoot, ColorPickerInput, ColorPickerTextInput, ColorPickerSwatch } =
    await import('@vyrnforge/react/color-picker');
  function App() {
    const [controlled, setControlled] = useState('#112233');
    useEffect(() => { document.body.dataset.colorReady = 'true'; }, []);
    const field = (id, prefix, options, textOptions = {}) => h(
      ColorPickerRoot,
      { id, ...options },
      h(ColorPickerInput, { id: prefix + 'color', name: prefix + 'color', 'aria-label': prefix + 'Choose color' }),
      h(ColorPickerTextInput, { id: prefix + 'text', 'aria-label': prefix + 'Color value', 'aria-describedby': 'color-guide', ...textOptions }),
      h(ColorPickerSwatch, { id: prefix + 'swatch' }),
    );
    return h('div', null,
      h('p', { id: 'color-guide' }, 'Enter a six-digit hex color, for example #3366ff.'),
      h('form', { id: 'color-form' },
        field('root', '', { defaultValue: '#3366FF', onValueChange: (v) => { if (client) record('colorValue', v); } }),
        field('controlled', 'controlled-', { value: controlled, onValueChange: (v) => { if (client) record('colorRequest', v); } }),
        field('disabled', 'disabled-', { defaultValue: '#112233', disabled: true }),
        field('readonly', 'readonly-', { defaultValue: '#112233' }, { readOnly: true }),
        h('button', { id: 'set-color', type: 'button', onClick: () => setControlled('#abcdef') }, 'Set controlled color'),
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { ColorPickerRoot, ColorPickerInput, ColorPickerTextInput, ColorPickerSwatch } =
    await import('@vyrnforge/vue/color-picker');
  return createSSRApp({
    setup() {
      const controlled = ref('#112233');
      onMounted(() => { document.body.dataset.colorReady = 'true'; });
      const field = (id, prefix, options, textOptions = {}) => h(ColorPickerRoot, { id, ...options }, () => [
        h(ColorPickerInput, { id: prefix + 'color', name: prefix + 'color', 'aria-label': prefix + 'Choose color' }),
        h(ColorPickerTextInput, { id: prefix + 'text', 'aria-label': prefix + 'Color value', 'aria-describedby': 'color-guide', ...textOptions }),
        h(ColorPickerSwatch, { id: prefix + 'swatch' }),
      ]);
      return () => h('div', null, [
        h('p', { id: 'color-guide' }, 'Enter a six-digit hex color, for example #3366ff.'),
        h('form', { id: 'color-form' }, [
          field('root', '', { defaultValue: '#3366FF', 'onUpdate:value': (v) => { if (client) record('colorValue', v); } }),
          field('controlled', 'controlled-', { value: controlled.value, 'onUpdate:value': (v) => { if (client) record('colorRequest', v); } }),
          field('disabled', 'disabled-', { defaultValue: '#112233', disabled: true }),
          field('readonly', 'readonly-', { defaultValue: '#112233' }, { readOnly: true }),
          h('button', { id: 'set-color', type: 'button', onClick: () => { controlled.value = '#abcdef'; } }, 'Set controlled color'),
        ]),
      ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfColorPickerRootDirective, VfColorPickerInputDirective, VfColorPickerTextDirective, VfColorPickerSwatchDirective } =
    await import('@vyrnforge/angular/color-picker');
  class ColorPickerTestApp {
    controlled = signal('#112233');
    constructor() { afterNextRender(() => { document.body.dataset.colorReady = 'true'; }); }
    changed(key, value) { if (client) record(key, value); }
  }
  const field = (id, prefix, options, textOptions = '') => `<div vfColorPickerRoot id="${id}" ${options}>
    <input vfColorPickerInput id="${prefix}color" name="${prefix}color" aria-label="${prefix}Choose color">
    <input vfColorPickerText id="${prefix}text" aria-label="${prefix}Color value" aria-describedby="color-guide" ${textOptions}>
    <span vfColorPickerSwatch id="${prefix}swatch"></span>
    </div>`;
  Component({
    selector: 'vf-color-picker-test',
    standalone: true,
    imports: [VfColorPickerRootDirective, VfColorPickerInputDirective, VfColorPickerTextDirective, VfColorPickerSwatchDirective],
    template: `<main><h1>Color picker browser fixture</h1>${guide}<form id="color-form">
    ${field('root', '', 'defaultValue="#3366FF" (valueChange)="changed(\'colorValue\', $event)"')}
    ${field('controlled', 'controlled-', '[value]="controlled()" (valueChange)="changed(\'colorRequest\', $event)"')}
    ${field('disabled', 'disabled-', 'defaultValue="#112233" [disabled]="true"')}
    ${field('readonly', 'readonly-', 'defaultValue="#112233"', 'readonly')}
    <button id="set-color" type="button" (click)="controlled.set('#abcdef')">Set controlled color</button>
    </form></main>`,
  })(ColorPickerTestApp);
  return ColorPickerTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client
      ? async () => {
          const { defineColorPickerElement } = await import('@vyrnforge/elements/color-picker');
          defineColorPickerElement();
          document.body.dataset.colorReady = 'true';
        }
      : undefined,
  };
}

const guide = '<p id="otp-guide">Entrez le code à quatre caractères.</p>';
const fieldMarkup = (tag, id, label, attributes = '', extra = '') =>
  `<${tag} id="${id}-root" data-vf-otp-field-root ${tag === 'vf-otp-field' ? 'length="4"' : ''}><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text" data-vf-input data-vf-otp-field-input inputmode="numeric" autocomplete="one-time-code" maxlength="4" aria-describedby="otp-guide" ${attributes}>${extra}</${tag}>`;
const web = guide + '<form id="otp-form">' + fieldMarkup('div', 'code', 'Code de vérification') + '</form>';
const elements =
  guide +
  '<form id="otp-form">' +
  fieldMarkup(
    'vf-otp-field',
    'code',
    'Code de vérification',
    '',
    fieldMarkup('vf-otp-field', 'nested', 'Code secondaire'),
  ) +
  '</form>';
export const browserFixture = {
  component: 'otp-field',
  title: 'OTP field browser fixture',
  heading: 'OTP field browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-otp-test' },
    elements: { story: 'createElementsStory' },
  },
};
function record(key, value) {
  document.body.dataset[key] = value;
  document.body.dataset[key + 'Count'] = String(Number(document.body.dataset[key + 'Count'] ?? 0) + 1);
}
export async function createReactStory({ client }) {
  const { createElement: h, useEffect, useState } = await import('react');
  const { OTPFieldRoot, OTPFieldInput } = await import('@vyrnforge/react/otp-field');
  function App() {
    const [controlled, setControlled] = useState('1234');
    useEffect(() => {
      document.body.dataset.otpReady = 'true';
    }, []);
    const field = (id, label, options, inputOptions = {}) =>
      h(
        OTPFieldRoot,
        { id: id + '-root', length: 4, ...options },
        h('label', { htmlFor: id }, label),
        h(OTPFieldInput, { id, name: id, 'aria-describedby': 'otp-guide', ...inputOptions }),
      );
    return h(
      'div',
      null,
      h('p', { id: 'otp-guide' }, 'Entrez le code à quatre caractères.'),
      h(
        'form',
        { id: 'otp-form' },
        field('code', 'Code de vérification', {
          onValueChange: (v) => {
            if (client) record('otpValue', v);
          },
        }),
        field('controlled', 'Code contrôlé', {
          value: controlled,
          onValueChange: (v) => {
            if (client) record('otpRequest', v);
          },
        }),
        field('disabled', 'Code désactivé', { disabled: true }),
        field('readonly', 'Code en lecture seule', { defaultValue: '5678' }, { readOnly: true }),
        field('alpha', 'Code alphanumérique', {}, { inputMode: 'text' }),
        h('button', { id: 'set-code', type: 'button', onClick: () => setControlled('7654') }, 'Mettre à jour'),
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { OTPFieldRoot, OTPFieldInput } = await import('@vyrnforge/vue/otp-field');
  return createSSRApp({
    setup() {
      const controlled = ref('1234');
      onMounted(() => {
        document.body.dataset.otpReady = 'true';
      });
      const field = (id, label, options, inputOptions = {}) =>
        h(OTPFieldRoot, { id: id + '-root', length: 4, ...options }, () => [
          h('label', { for: id }, label),
          h(OTPFieldInput, { id, name: id, 'aria-describedby': 'otp-guide', ...inputOptions }),
        ]);
      return () =>
        h('div', null, [
          h('p', { id: 'otp-guide' }, 'Entrez le code à quatre caractères.'),
          h('form', { id: 'otp-form' }, [
            field('code', 'Code de vérification', {
              'onUpdate:value': (v) => {
                if (client) record('otpValue', v);
              },
            }),
            field('controlled', 'Code contrôlé', {
              value: controlled.value,
              'onUpdate:value': (v) => {
                if (client) record('otpRequest', v);
              },
            }),
            field('disabled', 'Code désactivé', { disabled: true }),
            field('readonly', 'Code en lecture seule', { defaultValue: '5678' }, { readonly: true }),
            field('alpha', 'Code alphanumérique', {}, { inputmode: 'text' }),
            h(
              'button',
              {
                id: 'set-code',
                type: 'button',
                onClick: () => {
                  controlled.value = '7654';
                },
              },
              'Mettre à jour',
            ),
          ]),
        ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfOtpFieldRootDirective, VfOtpFieldInputDirective } = await import('@vyrnforge/angular/otp-field');
  class OtpTestApp {
    controlled = signal('1234');
    constructor() {
      afterNextRender(() => {
        document.body.dataset.otpReady = 'true';
      });
    }
    changed(key, value) {
      if (client) record(key, value);
    }
  }
  const field = (id, label, options = '', inputOptions = '') =>
    `<div vfOtpFieldRoot id="${id}-root" [length]="4" ${options}><label for="${id}">${label}</label><input vfOtpFieldInput id="${id}" name="${id}" aria-describedby="otp-guide" ${inputOptions}></div>`;
  Component({
    selector: 'vf-otp-test',
    standalone: true,
    imports: [VfOtpFieldRootDirective, VfOtpFieldInputDirective],
    template: `<main><h1>OTP field browser fixture</h1>${guide}<form id="otp-form">
      ${field('code', 'Code de vérification', '(valueChange)="changed(\'otpValue\', $event)"')}
      ${field('controlled', 'Code contrôlé', '[value]="controlled()" (valueChange)="changed(\'otpRequest\', $event)"')}
      ${field('disabled', 'Code désactivé', '[disabled]="true"')}
      ${field('readonly', 'Code en lecture seule', 'defaultValue="5678"', 'readonly')}
      ${field('alpha', 'Code alphanumérique', '', 'inputmode="text"')}
      <button id="set-code" type="button" (click)="controlled.set('7654')">Mettre à jour</button>
    </form></main>`,
  })(OtpTestApp);
  return OtpTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client
      ? async () => {
          const { defineOtpFieldElement } = await import('@vyrnforge/elements/otp-field');
          defineOtpFieldElement();
          document.querySelector('#code-root').addEventListener('valuechange', (event) => {
            if (event.target.id === 'code-root') record('otpValue', event.detail.value);
          });
          document.body.dataset.otpReady = 'true';
        }
      : undefined,
  };
}

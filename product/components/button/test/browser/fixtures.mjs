export const browserFixture = {
  component: 'button',
  title: 'Button fixture',
  heading: 'Button contract fixture',
  ports: {
    web: {
      body: `
      <section data-visual-matrix aria-label="Button visual states">
        <button data-vf-button data-vf-variant="primary" data-vf-size="sm">Primary small</button>
        <button data-vf-button data-vf-variant="secondary" data-vf-size="md">Secondary medium</button>
        <button data-vf-button data-vf-variant="ghost" data-vf-size="lg">Ghost large</button>
        <button data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-loading aria-busy="true">Loading</button>
        <button data-vf-button data-vf-variant="primary" data-vf-size="md" disabled>Disabled</button>
      </section>
      <form id="form"><label for="field">Field</label><input id="field" name="field" value="changed"><button id="submit" data-vf-button data-vf-variant="primary" data-vf-size="md">Submit</button><button id="reset" data-vf-button data-vf-variant="secondary" data-vf-size="md" type="reset">Reset</button><button id="plain" data-vf-button data-vf-variant="ghost" data-vf-size="md" type="button">Plain</button></form>
      <button id="activation" data-vf-button data-vf-variant="primary" data-vf-size="md">Activate</button>
      <button id="busy" data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-loading aria-busy="true">Busy action</button>
      <button id="disabled" data-vf-button data-vf-variant="primary" data-vf-size="md" disabled>Disabled action</button>`,
      script: `let activations=0;document.querySelector('#activation').addEventListener('click',()=>document.body.dataset.activations=String(++activations));document.querySelector('#busy').addEventListener('click',()=>document.body.dataset.busyActivated='true');document.querySelector('#form').addEventListener('submit',event=>{event.preventDefault();document.body.dataset.submitted='true'});`,
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-button-test' },
  },
};

export async function createReactStory({ client }) {
  const { createElement } = await import('react');
  const { Button } = await import('@vyrnforge/react/button');
  return createElement(
    'div',
    null,
    createElement(
      Button,
      {
        loading: true,
        'aria-busy': 'false',
        id: 'react-button',
        onClick: client ? () => { document.body.dataset.activated = 'true'; } : undefined,
      },
      'React action',
    ),
    createElement(Button, { 'aria-busy': 'false', id: 'react-consumer-busy' }, 'React status'),
    createElement(
      Button,
      {
        disabled: true,
        id: 'react-disabled',
        onClick: client ? () => { document.body.dataset.disabledActivated = 'true'; } : undefined,
      },
      'React disabled',
    ),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { Button } = await import('@vyrnforge/vue/button');
  return createSSRApp({
    render: () => h('div', null, [
      h(
        Button,
        {
          loading: true,
          'aria-busy': 'false',
          id: 'vue-button',
          onClick: client ? () => { document.body.dataset.activated = 'true'; } : () => undefined,
        },
        () => 'Vue action',
      ),
      h(Button, { 'aria-busy': 'false', id: 'vue-consumer-busy' }, () => 'Vue status'),
      h(
        Button,
        {
          disabled: true,
          id: 'vue-disabled',
          onClick: client ? () => { document.body.dataset.disabledActivated = 'true'; } : () => undefined,
        },
        () => 'Vue disabled',
      ),
    ]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfButtonDirective } = await import('@vyrnforge/angular/button');

  class ButtonTestApp {
    activated() {
      if (client) document.body.dataset.activated = 'true';
    }

    disabledActivated() {
      if (client) document.body.dataset.disabledActivated = 'true';
    }
  }

  Component({
    selector: 'vf-button-test',
    standalone: true,
    imports: [VfButtonDirective],
    template: '<button vfButton loading aria-busy="false" id="angular-button" (click)="activated()">Angular action</button><button vfButton aria-busy="false" id="angular-consumer-busy">Angular status</button><button vfButton disabled id="angular-disabled" (click)="disabledActivated()">Angular disabled</button>',
  })(ButtonTestApp);

  return ButtonTestApp;
}

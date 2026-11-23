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
      <div id="grouped-specimens" hidden>
      <div id="joined-actions" role="group" aria-label="Document actions" data-vf-button-group>
        <button type="button" id="joined-a" data-vf-button data-vf-variant="secondary">Edit</button>
        <button type="button" id="joined-b" data-vf-button data-vf-variant="secondary">Duplicate</button>
        <button type="button" id="joined-c" data-vf-button data-vf-variant="secondary" disabled>Archive</button>
      </div>
      <div id="vertical-actions" role="group" aria-label="Vertical actions" data-vf-button-group data-vf-button-group-orientation="vertical">
        <button type="button" id="vertical-a" data-vf-button data-vf-variant="secondary">First</button>
        <button type="button" id="vertical-b" data-vf-button data-vf-variant="secondary">Second</button>
      </div>
      </div>
      <div id="icon-specimens" hidden style="display:flex;flex-wrap:wrap;align-items:center;gap:1rem;padding:1rem">
        <button type="button" data-vf-button data-vf-icon-only data-vf-variant="ghost" data-vf-size="sm" id="icon-sm" aria-label="Search"><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6"/></svg></button>
        <button type="button" data-vf-button data-vf-icon-only data-vf-variant="secondary" data-vf-size="md" id="icon-md" aria-label="Bookmark"><svg width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6"/></svg></button>
        <button type="button" data-vf-button data-vf-icon-only data-vf-variant="primary" data-vf-size="lg" id="icon-lg" aria-label="Share"><svg width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg></button>
        <button type="button" data-vf-button data-vf-icon-only data-vf-variant="secondary" data-vf-size="md" data-vf-loading aria-busy="true" id="icon-busy" aria-label="Save"><svg width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6"/></svg></button>
        <button type="button" data-vf-button data-vf-icon-only data-vf-variant="secondary" data-vf-size="md" disabled id="icon-disabled" aria-label="Unavailable"><svg width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6"/></svg></button>
      </div>
      <form id="form"><label for="field">Field</label><input id="field" name="field" value="changed"><button id="submit" data-vf-button data-vf-variant="primary" data-vf-size="md" name="intent" value="submit">Submit</button><button id="reset" data-vf-button data-vf-variant="secondary" data-vf-size="md" type="reset">Reset</button><button id="plain" data-vf-button data-vf-variant="ghost" data-vf-size="md" type="button">Plain</button></form>
      <button id="external-submit" data-vf-button form="form" type="submit" name="intent" value="external">External submit</button>
      <button id="activation" data-vf-button data-vf-variant="primary" data-vf-size="md">Activate</button>
      <button id="busy" data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-loading aria-busy="true">Busy action</button>
      <button id="disabled" data-vf-button data-vf-variant="primary" data-vf-size="md" disabled>Disabled action</button>`,
      script: `let activations=0;document.querySelector('#activation').addEventListener('click',()=>document.body.dataset.activations=String(++activations));document.querySelector('#busy').addEventListener('click',()=>document.body.dataset.busyActivated='true');document.querySelector('#form').addEventListener('submit',event=>{event.preventDefault();document.body.dataset.submitted='true';document.body.dataset.formData=JSON.stringify([...new FormData(event.currentTarget,event.submitter).entries()])});`,
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
    createElement(Button, {
      id: 'react-icon-only', iconOnly: true, type: 'button', variant: 'ghost', size: 'md',
      'aria-label': 'Search',
      onClick: client ? () => { document.body.dataset.iconActivated = 'true'; } : undefined,
    }, createElement('svg', { viewBox: '0 0 24 24', width: '20', height: '20', 'aria-hidden': true })),
    createElement(
      'form',
      {
        id: 'react-form',
        onSubmit: client ? (event) => {
          event.preventDefault();
          document.body.dataset.formSubmitted = 'true';
        } : undefined,
      },
      createElement('label', { htmlFor: 'react-field' }, 'Field'),
      createElement('input', { id: 'react-field', name: 'field', defaultValue: 'changed' }),
      createElement(Button, { id: 'react-submit' }, 'Submit'),
      createElement(Button, { id: 'react-reset', type: 'reset' }, 'Reset'),
      createElement(Button, { id: 'react-plain', type: 'button' }, 'Plain'),
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
      h(Button, {
        id: 'vue-icon-only', iconOnly: true, type: 'button', variant: 'ghost', size: 'md',
        'aria-label': 'Search',
        onClick: client ? () => { document.body.dataset.iconActivated = 'true'; } : () => undefined,
      }, () => h('svg', { viewBox: '0 0 24 24', width: '20', height: '20', 'aria-hidden': true })),
      h('form', {
        id: 'vue-form',
        onSubmit: (event) => {
          event.preventDefault();
          if (client) document.body.dataset.formSubmitted = 'true';
        },
      }, [
        h('label', { for: 'vue-field' }, 'Field'),
        h('input', { id: 'vue-field', name: 'field', value: 'changed' }),
        h(Button, { id: 'vue-submit' }, () => 'Submit'),
        h(Button, { id: 'vue-reset', type: 'reset' }, () => 'Reset'),
        h(Button, { id: 'vue-plain', type: 'button' }, () => 'Plain'),
      ]),
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

    iconActivated() {
      if (client) document.body.dataset.iconActivated = 'true';
    }

    formSubmitted(event) {
      event.preventDefault();
      if (client) document.body.dataset.formSubmitted = 'true';
    }
  }

  Component({
    selector: 'vf-button-test',
    standalone: true,
    imports: [VfButtonDirective],
    template: '<button vfButton loading aria-busy="false" id="angular-button" (click)="activated()">Angular action</button><button vfButton aria-busy="false" id="angular-consumer-busy">Angular status</button><button vfButton disabled id="angular-disabled" (click)="disabledActivated()">Angular disabled</button><button vfButton iconOnly variant="ghost" type="button" id="angular-icon-only" aria-label="Search" (click)="iconActivated()"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"></svg></button><form id="angular-form" (submit)="formSubmitted($event)"><label for="angular-field">Field</label><input id="angular-field" name="field" value="changed"><button vfButton id="angular-submit">Submit</button><button vfButton type="reset" id="angular-reset">Reset</button><button vfButton type="button" id="angular-plain">Plain</button></form>',
  })(ButtonTestApp);

  return ButtonTestApp;
}

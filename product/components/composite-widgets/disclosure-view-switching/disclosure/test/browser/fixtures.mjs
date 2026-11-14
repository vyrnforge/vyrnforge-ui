const web = `
<details id="root">
  <summary id="trigger">Details</summary>
  <div id="root-panel">
    Content
    <details id="inner"><summary id="inner-trigger">Inner details</summary><div id="inner-panel">Inner content</div></details>
  </div>
</details>
<details id="initial" open><summary id="initial-trigger">Initially open</summary><div id="initial-panel">Initial content</div></details>`;

export const browserFixture = {
  component: 'disclosure',
  title: 'Disclosure fixture',
  heading: 'Disclosure browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    angular: { story: 'createAngularStory', selector: 'vf-disclosure-test' },
    vue: { story: 'createVueStory' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { DisclosureRoot, DisclosureTrigger, DisclosurePanel } = await import('@vyrnforge/react/disclosure');
  const disclosure = (id, label, content, options = {}, triggerProps = {}) =>
    h(
      DisclosureRoot,
      { id, ...options },
      h(DisclosureTrigger, { id: id === 'root' ? 'trigger' : `${id}-trigger`, ...triggerProps }, label),
      h(DisclosurePanel, null, content),
    );
  return h(
    Fragment,
    null,
    disclosure('root', 'Details', ['Content', disclosure('inner', 'Inner details', 'Inner content')], {
      panelId: 'authored-panel',
    }),
    disclosure('initial', 'Initially open', 'Initial content', { defaultOpen: true }),
    disclosure('disabled', 'Disabled', 'Disabled content', {}, { disabled: true }),
    disclosure('controlled', 'Controlled', 'Controlled content', {
      open: false,
      onOpenChange: (open) => {
        if (client) document.getElementById('controlled').dataset.requestedOpen = String(open);
      },
    }),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { DisclosureRoot, DisclosureTrigger, DisclosurePanel } = await import('@vyrnforge/vue/disclosure');
  const disclosure = (id, label, content, options = {}, triggerProps = {}) =>
    h(DisclosureRoot, { id, ...options }, () => [
      h(DisclosureTrigger, { id: id === 'root' ? 'trigger' : `${id}-trigger`, ...triggerProps }, () => label),
      h(DisclosurePanel, null, () => content),
    ]);
  return createSSRApp({
    render: () =>
      h('div', [
        disclosure('root', 'Details', ['Content', disclosure('inner', 'Inner details', 'Inner content')], {
      panelId: 'authored-panel',
    }),
        disclosure('initial', 'Initially open', 'Initial content', { defaultOpen: true }),
        disclosure('disabled', 'Disabled', 'Disabled content', {}, { disabled: true }),
        disclosure('controlled', 'Controlled', 'Controlled content', {
          modelValue: false,
          'onUpdate:modelValue': (open) => {
            if (client) document.getElementById('controlled').dataset.requestedOpen = String(open);
          },
        }),
      ]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfDisclosureRootDirective, VfDisclosureTriggerDirective, VfDisclosurePanelDirective } =
    await import('@vyrnforge/angular/disclosure');

  class DisclosureTestApp {
    changed(open) {
      if (client) document.getElementById('controlled').dataset.requestedOpen = String(open);
    }
  }

  Component({
    selector: 'vf-disclosure-test',
    standalone: true,
    imports: [VfDisclosureRootDirective, VfDisclosureTriggerDirective, VfDisclosurePanelDirective],
    template: `<main><h1>Disclosure browser fixture</h1>
      <div vfDisclosureRoot id="root" panelId="authored-panel">
        <button vfDisclosureTrigger id="trigger">Details</button>
        <div vfDisclosurePanel>Content
          <div vfDisclosureRoot id="inner">
            <button vfDisclosureTrigger id="inner-trigger">Inner details</button>
            <div vfDisclosurePanel>Inner content</div>
          </div>
        </div>
      </div>
      <div vfDisclosureRoot id="initial" [defaultOpen]="true">
        <button vfDisclosureTrigger id="initial-trigger">Initially open</button>
        <div vfDisclosurePanel>Initial content</div>
      </div>
      <div vfDisclosureRoot id="disabled">
        <button vfDisclosureTrigger id="disabled-trigger" disabled>Disabled</button>
        <div vfDisclosurePanel>Disabled content</div>
      </div>
      <div vfDisclosureRoot id="controlled" [open]="false" (openChange)="changed($event)">
        <button vfDisclosureTrigger id="controlled-trigger">Controlled</button>
        <div vfDisclosurePanel>Controlled content</div>
      </div>
    </main>`,
  })(DisclosureTestApp);

  return DisclosureTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `<vf-disclosure id="root" data-vf-disclosure-root>
      <button id="trigger" data-vf-disclosure-trigger aria-expanded="false" aria-controls="authored-panel">Details</button>
      <div id="authored-panel" data-vf-disclosure-panel hidden>Content
        <vf-disclosure id="inner" data-vf-disclosure-root>
          <button id="inner-trigger" data-vf-disclosure-trigger type="button" aria-expanded="false" aria-controls="inner-panel">Inner details</button>
          <div id="inner-panel" data-vf-disclosure-panel hidden>Inner content</div>
        </vf-disclosure>
      </div>
    </vf-disclosure>
    <vf-disclosure id="initial" data-vf-disclosure-root open>
      <button id="initial-trigger" data-vf-disclosure-trigger type="button" aria-expanded="true" aria-controls="initial-panel">Initially open</button>
      <div id="initial-panel" data-vf-disclosure-panel>Initial content</div>
    </vf-disclosure>
    <vf-disclosure id="disabled" data-vf-disclosure-root disabled>
      <button id="disabled-trigger" data-vf-disclosure-trigger type="button" disabled aria-expanded="false" aria-controls="disabled-panel">Disabled</button>
      <div id="disabled-panel" data-vf-disclosure-panel hidden>Disabled content</div>
    </vf-disclosure>`,
    activate: client
      ? async () => {
          const { defineDisclosureElement } = await import('@vyrnforge/elements/disclosure');
          defineDisclosureElement();
        }
      : undefined,
  };
}

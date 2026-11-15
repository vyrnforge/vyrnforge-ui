const labels = ['Open', 'Blueberry disabled', 'Rename', 'Banana'];
const ids = ['open', 'disabled', 'rename', 'banana'];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button" style="position: fixed; right: 16px; bottom: 16px">After</button>';
const target = '<div id="target" tabindex="0" data-vf-context-menu-trigger>Context target</div>';
function items(port) {
  return labels.map((label, index) => `<button id="${port}-${ids[index]}" type="button" role="menuitem" tabindex="-1" data-vf-context-menu-item${index === 1 ? ' aria-disabled="true"' : ''}>${label}</button>`).join('');
}
function selected(id) { document.body.dataset.selected = id; }
function ready() { document.body.dataset.contextReady = 'true'; }
const web = `${before}${target}<div id="menu" role="menu" aria-label="Context commands" tabindex="-1" data-vf-context-menu-content popover="auto">${items('web')}</div>${after}`;

export const browserFixture = {
  component: 'context-menu',
  title: 'Context menu fixture',
  heading: 'Context menu browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-context-menu-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect, useState } = await import('react');
  const { ContextMenuRoot, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } = await import('@vyrnforge/react/context-menu');
  function App() {
    const [open, setOpen] = useState(false);
    useEffect(ready, []);
    return h(Fragment, null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h(ContextMenuRoot, null,
        h(ContextMenuTrigger, { id: 'target', 'aria-controls': 'menu' }, 'Context target'),
        h(ContextMenuContent, { id: 'menu', 'aria-label': 'Context commands' }, ...labels.map((label, index) => h(ContextMenuItem, {
          key: ids[index], id: `react-${ids[index]}`, disabled: index === 1,
          onSelect: () => selected(`react-${ids[index]}`),
        }, label))),
      ),
      h(ContextMenuRoot, { open, onOpenChange(next) { document.body.dataset.contextRequest = String(next); if (next) setOpen(true); } },
        h(ContextMenuTrigger, { id: 'controlled-target', tabIndex: -1 }, 'Controlled context'),
        h(ContextMenuContent, { id: 'controlled-menu', 'aria-label': 'Controlled commands' },
          h(ContextMenuItem, { id: 'controlled-item' }, 'Action'),
        ),
      ),
      h('button', { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } }, 'After'),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { ContextMenuRoot, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } = await import('@vyrnforge/vue/context-menu');
  return createSSRApp({
    setup() {
      const open = ref(false);
      onMounted(ready);
      return () => h('div', [
        h('button', { id: 'before', type: 'button' }, 'Before'),
        h(ContextMenuRoot, {}, () => [
          h(ContextMenuTrigger, { id: 'target', 'aria-controls': 'menu' }, () => 'Context target'),
          h(ContextMenuContent, { id: 'menu', 'aria-label': 'Context commands' }, () => labels.map((label, index) => h(ContextMenuItem, {
            key: ids[index], id: `vue-${ids[index]}`, disabled: index === 1,
            onSelect: () => selected(`vue-${ids[index]}`),
          }, () => label))),
        ]),
        h(ContextMenuRoot, { open: open.value, 'onUpdate:open': (next) => { document.body.dataset.contextRequest = String(next); if (next) open.value = true; } }, () => [
          h(ContextMenuTrigger, { id: 'controlled-target', tabindex: -1 }, () => 'Controlled context'),
          h(ContextMenuContent, { id: 'controlled-menu', 'aria-label': 'Controlled commands' }, () => h(ContextMenuItem, { id: 'controlled-item' }, () => 'Action')),
        ]),
        h('button', { id: 'after', type: 'button', style: { position: 'fixed', right: '16px', bottom: '16px' } }, 'After'),
      ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfContextMenuRootDirective, VfContextMenuTriggerDirective, VfContextMenuContentDirective, VfContextMenuItemDirective } = await import('@vyrnforge/angular/context-menu');
  class ContextMenuTestApp {
    controlled = signal(false);
    constructor() { afterNextRender(ready); }
    selected = selected;
    request(next) { document.body.dataset.contextRequest = String(next); if (next) this.controlled.set(true); }
  }
  Component({
    selector: 'vf-context-menu-test',
    standalone: true,
    imports: [VfContextMenuRootDirective, VfContextMenuTriggerDirective, VfContextMenuContentDirective, VfContextMenuItemDirective],
    template: `<main><h1>Context menu browser fixture</h1>${before}<div vfContextMenuRoot><div vfContextMenuTrigger id="target" tabindex="0" aria-controls="menu">Context target</div><div vfContextMenuContent id="menu" aria-label="Context commands">${labels.map((label, index) => `<button vfContextMenuItem id="angular-${ids[index]}" [disabled]="${index === 1}" (selected)="selected('angular-${ids[index]}')">${label}</button>`).join('')}</div></div><div vfContextMenuRoot [open]="controlled()" (openChange)="request($event)"><div vfContextMenuTrigger id="controlled-target" tabindex="-1">Controlled context</div><div vfContextMenuContent id="controlled-menu" aria-label="Controlled commands"><button vfContextMenuItem id="controlled-item">Action</button></div></div>${after}</main>`,
  })(ContextMenuTestApp);
  return ContextMenuTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}<vf-context-menu>${target}<div id="menu" aria-label="Context commands" data-vf-context-menu-content hidden>${items('elements')}</div></vf-context-menu>${after}`,
    activate: client ? async () => {
      const { defineContextMenuElement } = await import('@vyrnforge/elements/context-menu');
      defineContextMenuElement();
      for (const item of document.querySelectorAll('[data-vf-context-menu-item]')) {
        item.addEventListener('click', (event) => {
          if (!event.defaultPrevented && item.getAttribute('aria-disabled') !== 'true') selected(item.id);
        });
      }
      ready();
    } : undefined,
  };
}

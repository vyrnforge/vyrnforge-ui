const labels = ['Edit', 'Locked', 'Duplicate', 'Archive'];
const ids = ['edit', 'locked', 'duplicate', 'archive'];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button" style="position: fixed; right: 16px; bottom: 16px">After</button>';

function nativeItems(port, enhanced = false) {
  return labels
    .map(
      (label, index) =>
        `<button id="${port}-${ids[index]}" type="button" ${enhanced ? '' : 'role="menuitem" tabindex="-1"'} data-vf-menu-item${index === 1 ? ' aria-disabled="true"' : ''}>${label}</button>`,
    )
    .join('');
}
const web = `${before}<button id="web-trigger" type="button" data-vf-menu-trigger aria-haspopup="menu" aria-controls="web-menu" popovertarget="web-menu">Actions</button><div id="web-menu" role="menu" tabindex="-1" aria-label="Actions" data-vf-menu-content data-vf-placement="bottom-start" popover="auto">${nativeItems('web')}</div>${after}`;
const elements = `${before}<vf-menu><button id="elements-trigger" type="button" data-vf-menu-trigger aria-haspopup="menu" aria-expanded="false">Actions</button><div id="elements-menu" data-vf-menu-content aria-label="Actions" hidden>${nativeItems('elements', true)}</div></vf-menu>${after}`;

export const browserFixture = {
  component: 'menu',
  title: 'Menu browser fixture',
  heading: 'Menu browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-menu-test' },
    elements: { story: 'createElementsStory' },
  },
};
function selected(id) {
  document.body.dataset.selected = id;
}
function disabledClicked(id) {
  document.body.dataset.disabledClicked = id;
}
function ready() {
  document.body.dataset.menuReady = 'true';
}

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect, useState } = await import('react');
  const { MenuRoot, MenuTrigger, MenuContent, MenuItem } = await import('@vyrnforge/react/menu');
  function App() {
    const [open, setOpen] = useState(false);
    useEffect(ready, []);
    return h(
      Fragment,
      null,
      h('button', { id: 'before', type: 'button' }, 'Before'),
      h(
        MenuRoot,
        null,
        h(MenuTrigger, { id: 'react-trigger', 'aria-controls': 'react-menu' }, 'Actions'),
        h(
          MenuContent,
          { id: 'react-menu', 'aria-label': 'Actions' },
          ...labels.map((label, index) =>
            h(
              MenuItem,
              {
                key: ids[index],
                id: `react-${ids[index]}`,
                disabled: index === 1,
                onClick: index === 1 ? () => disabledClicked('react-locked') : undefined,
                onSelect: () => selected(`react-${ids[index]}`),
              },
              label,
            ),
          ),
        ),
      ),
      h(
        MenuRoot,
        {
          open,
          onOpenChange(next) {
            document.body.dataset.menuRequest = String(next);
            if (next) setOpen(true);
          },
        },
        h(MenuTrigger, { id: 'controlled-trigger', 'aria-controls': 'controlled-menu' }, 'Controlled'),
        h(
          MenuContent,
          { id: 'controlled-menu', 'aria-label': 'Controlled actions' },
          h(MenuItem, { id: 'controlled-item' }, 'Action'),
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
  const { MenuRoot, MenuTrigger, MenuContent, MenuItem } = await import('@vyrnforge/vue/menu');
  return createSSRApp({
    setup() {
      const open = ref(false);
      onMounted(ready);
      return () =>
        h('div', [
          h('button', { id: 'before', type: 'button' }, 'Before'),
          h(MenuRoot, {}, () => [
            h(MenuTrigger, { id: 'vue-trigger', 'aria-controls': 'vue-menu' }, () => 'Actions'),
            h(MenuContent, { id: 'vue-menu', 'aria-label': 'Actions' }, () =>
              labels.map((label, index) =>
                h(
                  MenuItem,
                  {
                    key: ids[index],
                    id: `vue-${ids[index]}`,
                    disabled: index === 1,
                    onClick: index === 1 ? () => disabledClicked('vue-locked') : undefined,
                    onSelect: () => selected(`vue-${ids[index]}`),
                  },
                  () => label,
                ),
              ),
            ),
          ]),
          h(
            MenuRoot,
            {
              open: open.value,
              'onUpdate:open': (next) => {
                document.body.dataset.menuRequest = String(next);
                if (next) open.value = true;
              },
            },
            () => [
              h(MenuTrigger, { id: 'controlled-trigger', 'aria-controls': 'controlled-menu' }, () => 'Controlled'),
              h(MenuContent, { id: 'controlled-menu', 'aria-label': 'Controlled actions' }, () =>
                h(MenuItem, { id: 'controlled-item' }, () => 'Action'),
              ),
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
  const { VfMenuRootDirective, VfMenuTriggerDirective, VfMenuContentDirective, VfMenuItemDirective } =
    await import('@vyrnforge/angular/menu');
  class MenuTestApp {
    controlled = signal(false);
    constructor() {
      afterNextRender(ready);
    }
    selected = selected;
    request(next) {
      document.body.dataset.menuRequest = String(next);
      if (next) this.controlled.set(true);
    }
  }
  Component({
    selector: 'vf-menu-test',
    standalone: true,
    imports: [VfMenuRootDirective, VfMenuTriggerDirective, VfMenuContentDirective, VfMenuItemDirective],
    template: `<main><h1>Menu browser fixture</h1>${before}<div vfMenuRoot><button vfMenuTrigger id="angular-trigger" aria-controls="angular-menu">Actions</button><div vfMenuContent id="angular-menu" aria-label="Actions">${labels.map((label, index) => `<button vfMenuItem id="angular-${ids[index]}" [disabled]="${index === 1}" (selected)="selected('angular-${ids[index]}')">${label}</button>`).join('')}</div></div><div vfMenuRoot [open]="controlled()" (openChange)="request($event)"><button vfMenuTrigger id="controlled-trigger" aria-controls="controlled-menu">Controlled</button><div vfMenuContent id="controlled-menu" aria-label="Controlled actions"><button vfMenuItem id="controlled-item">Action</button></div></div>${after}</main>`,
  })(MenuTestApp);
  return MenuTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client
      ? async () => {
          const { defineMenuElement } = await import('@vyrnforge/elements/menu');
          defineMenuElement();
          document.querySelector('vf-menu').addEventListener('vf-select', (event) => selected(event.detail.item.id));
          ready();
        }
      : undefined,
  };
}

const entries = [
  { id: 'file', label: 'File', disabled: false },
  { id: 'unavailable', label: 'Unavailable', disabled: true },
  { id: 'edit', label: 'Edit', disabled: false },
  { id: 'view', label: 'View', disabled: false },
];

const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button">After</button>';
const name = 'Application commands';

function nativeTrigger({ id, label, disabled }) {
  return `<button id="${id}" type="button" role="menuitem" data-vf-menubar-trigger aria-haspopup="menu" aria-expanded="false"${disabled ? ' disabled' : ''}>${label}</button>`;
}

export const browserFixture = {
  component: 'menubar',
  title: 'Menubar fixture',
  heading: 'Menubar browser fixture',
  ports: {
    web: {
      body: `${before}<div role="menubar" id="bar" aria-label="${name}" data-vf-menubar-root>${entries.map(nativeTrigger).join('')}</div>${after}`,
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-menubar-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment } = await import('react');
  const { MenubarRoot, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } =
    await import('@vyrnforge/react/menubar');
  const { MenuRoot, MenuTrigger, MenuContent, MenuItem } = await import('@vyrnforge/react/menu');
  return h(
    Fragment,
    null,
    h('button', { id: 'before', type: 'button' }, 'Before'),
    h(
      MenubarRoot,
      { id: 'bar', 'aria-label': name },
      ...entries.map(({ id, label, disabled }) =>
        h(
          MenubarMenu,
          { key: id },
          h(MenubarTrigger, { id, disabled }, label),
          h(
            MenubarContent,
            { id: id + '-menu', 'aria-label': label },
            h(MenubarItem, { id: id + '-command' }, 'Command'),
            id === 'file'
              ? h(
                  MenuRoot,
                  null,
                  h(MenuTrigger, { id: 'submenu-trigger', 'aria-controls': 'submenu' }, 'Export'),
                  h(
                    MenuContent,
                    { id: 'submenu', 'aria-label': 'Export' },
                    h(MenuItem, { id: 'submenu-command' }, 'PDF'),
                  ),
                )
              : null,
          ),
        ),
      ),
    ),
    h('button', { id: 'after', type: 'button' }, 'After'),
  );
}

export async function createVueStory() {
  const { createSSRApp, h } = await import('vue');
  const { MenubarRoot, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } =
    await import('@vyrnforge/vue/menubar');
  const { MenuRoot, MenuTrigger, MenuContent, MenuItem } = await import('@vyrnforge/vue/menu');
  return createSSRApp({
    render: () =>
      h('div', [
        h('button', { id: 'before', type: 'button' }, 'Before'),
        h(MenubarRoot, { id: 'bar', 'aria-label': name }, () =>
          entries.map(({ id, label, disabled }) =>
            h(MenubarMenu, { key: id }, () => [
              h(MenubarTrigger, { id, disabled }, () => label),
              h(MenubarContent, { id: id + '-menu', 'aria-label': label }, () => [
                h(MenubarItem, { id: id + '-command' }, () => 'Command'),
                id === 'file'
                  ? h(MenuRoot, {}, () => [
                      h(MenuTrigger, { id: 'submenu-trigger', 'aria-controls': 'submenu' }, () => 'Export'),
                      h(MenuContent, { id: 'submenu', 'aria-label': 'Export' }, () =>
                        h(MenuItem, { id: 'submenu-command' }, () => 'PDF'),
                      ),
                    ])
                  : null,
              ]),
            ]),
          ),
        ),
        h('button', { id: 'after', type: 'button' }, 'After'),
      ]),
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfMenubarRootDirective,
    VfMenubarMenuDirective,
    VfMenubarTriggerDirective,
    VfMenubarContentDirective,
    VfMenubarItemDirective,
  } = await import('@vyrnforge/angular/menubar');
  const { VfMenuTriggerDirective } = await import('@vyrnforge/angular/menu');
  const template = `<main><h1>Menubar browser fixture</h1>${before}<div vfMenubarRoot id="bar" aria-label="${name}">${entries
    .map(
      ({ id, label, disabled }) =>
        `<div vfMenuRoot role="none"><button vfMenubarTrigger vfMenuTrigger id="${id}"${disabled ? ' disabled' : ''}>${label}</button><div vfMenuContent id="${id}-menu" aria-label="${label}"><button vfMenuItem id="${id}-command">Command</button>${id === 'file' ? '<div vfMenuRoot role="none"><button vfMenuTrigger id="submenu-trigger" aria-controls="submenu">Export</button><div vfMenuContent id="submenu" aria-label="Export"><button vfMenuItem id="submenu-command">PDF</button></div></div>' : ''}</div></div>`,
    )
    .join('')}</div>${after}</main>`;
  class MenubarTestApp {}
  Component({
    selector: 'vf-menubar-test',
    standalone: true,
    imports: [
      VfMenubarRootDirective,
      VfMenubarMenuDirective,
      VfMenubarTriggerDirective,
      VfMenubarContentDirective,
      VfMenubarItemDirective,
      VfMenuTriggerDirective,
    ],
    template,
  })(MenubarTestApp);
  return MenubarTestApp;
}

export async function createElementsStory({ client }) {
  const body = `${before}<vf-menubar id="bar" aria-label="${name}">${entries
    .map(
      (entry) =>
        `<vf-menu role="none">${nativeTrigger(entry).replace('data-vf-menubar-trigger', 'data-vf-menubar-trigger data-vf-menu-trigger')}<div data-vf-menu-content id="${entry.id}-menu" aria-label="${entry.label}" hidden><button data-vf-menu-item id="${entry.id}-command" type="button">Command</button>${entry.id === 'file' ? '<vf-menu role="none"><button data-vf-menu-trigger id="submenu-trigger" aria-controls="submenu" type="button">Export</button><div data-vf-menu-content id="submenu" aria-label="Export" hidden><button data-vf-menu-item id="submenu-command" type="button">PDF</button></div></vf-menu>' : ''}</div></vf-menu>`,
    )
    .join('')}</vf-menubar>${after}`;
  return {
    body,
    activate: client
      ? async () => {
          const { defineMenubarElement } = await import('@vyrnforge/elements/menubar');
          const { defineMenuElement } = await import('@vyrnforge/elements/menu');
          defineMenuElement();
          defineMenubarElement();
        }
      : undefined,
  };
}

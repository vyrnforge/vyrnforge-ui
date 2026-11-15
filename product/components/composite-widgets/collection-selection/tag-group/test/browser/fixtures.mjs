const entries = [
  { id: 'tag', button: 'remove', label: 'Design' },
  { id: 'tag-build', button: 'remove-build', label: 'Build' },
  { id: 'tag-ship', button: 'remove-ship', label: 'Ship' },
];
const outside = '<button id="outside" type="button">Outside action</button>';
const nativeItems = entries
  .map(
    ({ id, button, label }) =>
      `<div data-vf-tag-group-item role="listitem" id="${id}">${label} <button type="button" data-vf-tag-group-remove aria-label="Remove ${label}" id="${button}">×</button></div>`,
  )
  .join('');

function acceptRemoval() {
  if (document.body.dataset.rejectRemoval === 'true') return false;
  if (document.body.dataset.outsideFocus === 'true') document.querySelector('#outside').focus();
  return true;
}

export const browserFixture = {
  component: 'tag-group',
  title: 'TagGroup fixture',
  heading: 'TagGroup browser fixture',
  ports: {
    web: { body: `<div id="root" data-vf-tag-group-root role="list" aria-label="Selected tags" tabindex="-1">${nativeItems}</div>${outside}` },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-tag-group-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, useState, Fragment } = await import('react');
  const { TagGroupRoot, TagGroupItem, TagGroupRemove } = await import('@vyrnforge/react/tag-group');
  function App() {
    const [items, setItems] = useState(entries);
    return h(
      Fragment,
      null,
      h(
        TagGroupRoot,
        { id: 'root', 'aria-label': 'Selected tags' },
        items.map(({ id, button, label }) =>
          h(
            TagGroupItem,
            { key: id, id },
            label,
            h(
              TagGroupRemove,
              {
                id: button,
                'aria-label': `Remove ${label}`,
                onClick: () => {
                  if (acceptRemoval()) setItems((current) => current.filter((item) => item.id !== id));
                },
              },
              '×',
            ),
          ),
        ),
      ),
      h('button', { id: 'outside', type: 'button' }, 'Outside action'),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, ref } = await import('vue');
  const { TagGroupRoot, TagGroupItem, TagGroupRemove } = await import('@vyrnforge/vue/tag-group');
  return createSSRApp({
    setup() {
      const items = ref(entries);
      return () =>
        h('div', [
          h(TagGroupRoot, { id: 'root', 'aria-label': 'Selected tags' }, () =>
            items.value.map(({ id, button, label }) =>
              h(TagGroupItem, { key: id, id }, () => [
                label,
                h(
                  TagGroupRemove,
                  {
                    id: button,
                    'aria-label': `Remove ${label}`,
                    onClick: () => {
                      if (acceptRemoval()) items.value = items.value.filter((item) => item.id !== id);
                    },
                  },
                  () => '×',
                ),
              ]),
            ),
          ),
          h('button', { id: 'outside', type: 'button' }, 'Outside action'),
        ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, signal } = await import('@angular/core');
  const { VfTagGroupRootDirective, VfTagGroupItemDirective, VfTagGroupRemoveDirective } =
    await import('@vyrnforge/angular/tag-group');
  class TagGroupTestApp {
    items = signal(entries);
    remove(id) {
      if (acceptRemoval()) this.items.update((current) => current.filter((item) => item.id !== id));
    }
  }
  Component({
    selector: 'vf-tag-group-test',
    standalone: true,
    imports: [VfTagGroupRootDirective, VfTagGroupItemDirective, VfTagGroupRemoveDirective],
    template: `<main><h1>TagGroup browser fixture</h1><div id="root" vfTagGroupRoot aria-label="Selected tags">@for (item of items(); track item.id) {<div vfTagGroupItem [id]="item.id">{{item.label}} <button vfTagGroupRemove [id]="item.button" [aria-label]="'Remove ' + item.label" (click)="remove(item.id)">×</button></div>}</div>${outside}</main>`,
  })(TagGroupTestApp);
  return TagGroupTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `<vf-tag-group id="root" aria-label="Selected tags">${nativeItems}</vf-tag-group>${outside}`,
    activate: client
      ? async () => {
          const { defineTagGroupElement } = await import('@vyrnforge/elements/tag-group');
          defineTagGroupElement();
          const root = document.querySelector('#root');
          root.addEventListener('click', (event) => {
            const button = event.target.closest('[data-vf-tag-group-remove]');
            if (button && acceptRemoval()) button.closest('[data-vf-tag-group-item]').remove();
          });
          document.body.dataset.tagReady = 'true';
        }
      : undefined,
  };
}

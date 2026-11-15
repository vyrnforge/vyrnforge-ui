const action = '<button id="action" type="button" data-vf-split-button-action>Save</button>';
const trigger = '<button id="trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More save options" data-vf-split-button-trigger>More</button>';
const content = '<div id="menu" role="menu" aria-label="Save options" data-vf-split-button-content hidden><button id="copy" type="button" role="menuitem">Save as copy</button><button id="archive" type="button" role="menuitem">Save and archive</button></div>';
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button">After</button>';

function primary() {
  document.body.dataset.primaryCount = String(Number(document.body.dataset.primaryCount ?? 0) + 1);
}

function selected() {
  document.body.dataset.selectedCount = String(Number(document.body.dataset.selectedCount ?? 0) + 1);
}

export const browserFixture = {
  component: 'split-button',
  title: 'SplitButton fixture',
  heading: 'SplitButton browser fixture',
  ports: {
    web: { body: `${before}<div data-vf-split-button-root>${action}${trigger}${content}</div>${after}` },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-split-button-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment } = await import('react');
  const { SplitButtonRoot, SplitButtonAction, SplitButtonTrigger, SplitButtonContent, SplitButtonItem } =
    await import('@vyrnforge/react/split-button');
  return h(
    Fragment,
    null,
    h('button', { id: 'before', type: 'button' }, 'Before'),
    h(
      SplitButtonRoot,
      null,
      h(SplitButtonAction, { id: 'action', onClick: primary }, 'Save'),
      h(SplitButtonTrigger, { id: 'trigger', 'aria-label': 'More save options' }, 'More'),
      h(
        SplitButtonContent,
        { id: 'menu', 'aria-label': 'Save options' },
        h(SplitButtonItem, { id: 'copy', onSelect: selected }, 'Save as copy'),
        h(SplitButtonItem, { id: 'archive', onSelect: selected }, 'Save and archive'),
      ),
    ),
    h('button', { id: 'after', type: 'button' }, 'After'),
  );
}

export async function createVueStory() {
  const { createSSRApp, h } = await import('vue');
  const { SplitButtonRoot, SplitButtonAction, SplitButtonTrigger, SplitButtonContent, SplitButtonItem } =
    await import('@vyrnforge/vue/split-button');
  return createSSRApp({
    render: () =>
      h('div', [
        h('button', { id: 'before', type: 'button' }, 'Before'),
        h(SplitButtonRoot, {}, () => [
          h(SplitButtonAction, { id: 'action', onClick: primary }, () => 'Save'),
          h(SplitButtonTrigger, { id: 'trigger', 'aria-label': 'More save options' }, () => 'More'),
          h(SplitButtonContent, { id: 'menu', 'aria-label': 'Save options' }, () => [
            h(SplitButtonItem, { id: 'copy', onSelect: selected }, () => 'Save as copy'),
            h(SplitButtonItem, { id: 'archive', onSelect: selected }, () => 'Save and archive'),
          ]),
        ]),
        h('button', { id: 'after', type: 'button' }, 'After'),
      ]),
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfSplitButtonRootDirective,
    VfSplitButtonActionDirective,
    VfSplitButtonTriggerDirective,
    VfSplitButtonContentDirective,
    VfSplitButtonItemDirective,
  } = await import('@vyrnforge/angular/split-button');
  class SplitButtonTestApp {
    primary = primary;
    selected = selected;
  }
  Component({
    selector: 'vf-split-button-test',
    standalone: true,
    imports: [
      VfSplitButtonRootDirective,
      VfSplitButtonActionDirective,
      VfSplitButtonTriggerDirective,
      VfSplitButtonContentDirective,
      VfSplitButtonItemDirective,
    ],
    template: `${before}<div vfMenuRoot data-vf-split-button-root><button id="action" vfSplitButtonAction (click)="primary()">Save</button><button id="trigger" vfMenuTrigger data-vf-split-button-trigger aria-label="More save options">More</button><div id="menu" vfMenuContent aria-label="Save options"><button id="copy" vfMenuItem (selected)="selected()">Save as copy</button><button id="archive" vfMenuItem (selected)="selected()">Save and archive</button></div></div>${after}`,
  })(SplitButtonTestApp);
  return SplitButtonTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `${before}<vf-split-button id="owner">${action}${trigger}${content}</vf-split-button>${after}`,
    activate: client
      ? async () => {
          const { defineSplitButtonElement } = await import('@vyrnforge/elements/split-button');
          defineSplitButtonElement();
          document.querySelector('#action').addEventListener('click', primary);
          document.querySelector('#owner').addEventListener('vf-select', selected);
          document.body.dataset.splitReady = 'true';
        }
      : undefined,
  };
}

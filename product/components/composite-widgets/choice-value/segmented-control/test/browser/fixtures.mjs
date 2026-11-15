const choices = [
  ['list', 'List'],
  ['disabled', 'Disabled'],
  ['grid', 'Grid'],
  ['details', 'Details'],
];
const item = (name, value, label, selected) =>
  `<label data-vf-segmented-control-item><input type="radio" name="${name}" value="${value}" ${selected === value ? 'checked' : ''} ${value === 'disabled' ? 'disabled' : ''}>${label}</label>`;
const group = (tag, label, name, selected) =>
  `<${tag} role="radiogroup" aria-label="${label}" data-vf-segmented-control-root>${choices.map(([v, l]) => item(name, v, l, selected)).join('')}</${tag}>`;
const markup = (tag) =>
  `<form id="form"><button id="before" type="button">Before</button>${group(tag, 'View', 'view', 'list')}${group(tag, 'Other view', 'other', 'grid')}${group(tag, 'Empty view', 'empty', '')}<button id="after" type="button">After</button></form>`;
export const browserFixture = {
  component: 'segmented-control',
  title: 'SegmentedControl fixture',
  heading: 'SegmentedControl browser fixture',
  ports: {
    web: { body: markup('div') },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-segmented-control-test' },
    elements: { story: 'createElementsStory' },
  },
};
export async function createReactStory({ client }) {
  const { createElement: h, useEffect } = await import('react');
  const { SegmentedControlRoot, SegmentedControlItem } = await import('@vyrnforge/react/segmented-control');
  function App() {
    useEffect(() => {
      document.body.dataset.segmentedReady = 'true';
    }, []);
    const g = (label, options) =>
      h(
        SegmentedControlRoot,
        { 'aria-label': label, ...options },
        ...choices.map(([v, l]) => h(SegmentedControlItem, { key: v, value: v, disabled: v === 'disabled' }, l)),
      );
    return h(
      'form',
      { id: 'form' },
      h('button', { type: 'button', id: 'before' }, 'Before'),
      g('View', { name: 'view', defaultValue: 'list' }),
      g('Other view', { defaultValue: 'grid' }),
      g('Empty view', {}),
      g('Controlled view', {
        value: 'list',
        onValueChange: (v) => {
          if (client) document.body.dataset.requested = v;
        },
      }),
      h('button', { type: 'button', id: 'after' }, 'After'),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { SegmentedControlRoot, SegmentedControlItem } = await import('@vyrnforge/vue/segmented-control');
  return createSSRApp({
    setup() {
      onMounted(() => {
        document.body.dataset.segmentedReady = 'true';
      });
      const g = (label, options) =>
        h(SegmentedControlRoot, { 'aria-label': label, ...options }, () =>
          choices.map(([v, l]) => h(SegmentedControlItem, { key: v, value: v, disabled: v === 'disabled' }, () => l)),
        );
      return () =>
        h('form', { id: 'form' }, [
          h('button', { type: 'button', id: 'before' }, 'Before'),
          g('View', { name: 'view', defaultValue: 'list' }),
          g('Other view', { defaultValue: 'grid' }),
          g('Empty view', {}),
          g('Controlled view', {
            value: 'list',
            'onUpdate:value': (v) => {
              if (client) document.body.dataset.requested = v;
            },
          }),
          h('button', { type: 'button', id: 'after' }, 'After'),
        ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const { VfSegmentedControlRootDirective, VfSegmentedControlItemDirective } =
    await import('@vyrnforge/angular/segmented-control');
  class SegmentedTestApp {
    constructor() {
      afterNextRender(() => {
        document.body.dataset.segmentedReady = 'true';
      });
    }
    changed(v) {
      if (client) document.body.dataset.requested = v;
    }
  }
  const items = choices
    .map(
      ([v, l]) =>
        `<label data-vf-segmented-control-item><input type="radio" vfSegmentedControlItem="${v}" ${v === 'disabled' ? '[disabled]="true"' : ''}>${l}</label>`,
    )
    .join('');
  Component({
    selector: 'vf-segmented-control-test',
    standalone: true,
    imports: [VfSegmentedControlRootDirective, VfSegmentedControlItemDirective],
    template: `<main><h1>SegmentedControl fixture</h1><form id="form"><button id="before" type="button">Before</button><div vfSegmentedControlRoot name="view" aria-label="View" defaultValue="list">${items}</div><div vfSegmentedControlRoot name="other" aria-label="Other view" defaultValue="grid">${items}</div><div vfSegmentedControlRoot name="empty" aria-label="Empty view">${items}</div><div vfSegmentedControlRoot name="controlled" aria-label="Controlled view" value="list" (valueChange)="changed($event)">${items}</div><button id="after" type="button">After</button></form></main>`,
  })(SegmentedTestApp);
  return SegmentedTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: markup('vf-segmented-control'),
    activate: client
      ? async () => {
          const { defineSegmentedControlElement } = await import('@vyrnforge/elements/segmented-control');
          defineSegmentedControlElement();
          document.body.dataset.segmentedReady = 'true';
        }
      : undefined,
  };
}

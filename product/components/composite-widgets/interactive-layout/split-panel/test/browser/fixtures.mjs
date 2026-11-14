const web = `<div id="root" data-vf-split-panel-root style="--vf-split-size: 40%">
  <section id="primary" data-vf-split-panel-pane>Primary</section>
  <div id="handle" data-vf-split-panel-handle role="separator" tabindex="0" aria-label="Primary" aria-controls="primary" aria-orientation="vertical" aria-valuemin="20" aria-valuemax="80" aria-valuenow="40"></div>
  <section data-vf-split-panel-pane>Secondary</section>
</div>`;

export const browserFixture = {
  component: 'split-panel',
  title: 'Split panel fixture',
  heading: 'Split panel browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    angular: { story: 'createAngularStory', selector: 'vf-split-panel-test' },
    vue: { story: 'createVueStory' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { SplitPanelRoot, SplitPanelPane, SplitPanelResizeHandle } = await import('@vyrnforge/react/split-panel');
  const panel = (id, options) =>
    h(
      SplitPanelRoot,
      {
        id,
        min: 20,
        max: 80,
        ...options,
        onSizeChange: (size) => {
          if (client) document.getElementById(id).dataset.requestedSize = String(size);
        },
      },
      h(SplitPanelPane, { id: id + '-primary' }, 'Primary'),
      h(SplitPanelResizeHandle, { id: id === 'root' ? 'handle' : id + '-handle', 'aria-label': 'Primary', 'aria-controls': id + '-primary' }),
      h(SplitPanelPane, null, 'Secondary'),
    );
  return h(Fragment, null, panel('root', { defaultSize: 40 }), panel('controlled', { size: 60 }));
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { SplitPanelRoot, SplitPanelPane, SplitPanelResizeHandle } = await import('@vyrnforge/vue/split-panel');
  const panel = (id, options) =>
    h(SplitPanelRoot, {
      id, min: 20, max: 80, ...options,
      'onUpdate:size': (size) => {
        if (client) document.getElementById(id).dataset.requestedSize = String(size);
      },
    }, () => [
      h(SplitPanelPane, { id: id + '-primary' }, () => 'Primary'),
      h(SplitPanelResizeHandle, { id: id === 'root' ? 'handle' : id + '-handle', 'aria-label': 'Primary', 'aria-controls': id + '-primary' }),
      h(SplitPanelPane, null, () => 'Secondary'),
    ]);
  return createSSRApp({ render: () => h('div', [panel('root', { defaultSize: 40 }), panel('controlled', { size: 60 })]) });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfSplitPanelRootDirective, VfSplitPanelPaneDirective, VfSplitPanelResizeHandleDirective } =
    await import('@vyrnforge/angular/split-panel');
  class SplitPanelTestApp {
    changed(id, size) {
      if (client) document.getElementById(id).dataset.requestedSize = String(size);
    }
  }
  Component({
    selector: 'vf-split-panel-test',
    standalone: true,
    imports: [VfSplitPanelRootDirective, VfSplitPanelPaneDirective, VfSplitPanelResizeHandleDirective],
    template: `<main><h1>Split panel browser fixture</h1>
      <div vfSplitPanelRoot id="root" [defaultSize]="40" [min]="20" [max]="80" (sizeChange)="changed('root', $event)">
        <div vfSplitPanelPane id="root-primary">Primary</div>
        <div vfSplitPanelResizeHandle id="handle" aria-label="Primary" aria-controls="root-primary"></div>
        <div vfSplitPanelPane>Secondary</div>
      </div>
      <div vfSplitPanelRoot id="controlled" [size]="60" [min]="20" [max]="80" (sizeChange)="changed('controlled', $event)">
        <div vfSplitPanelPane id="controlled-primary">Primary</div>
        <div vfSplitPanelResizeHandle id="controlled-handle" aria-label="Primary" aria-controls="controlled-primary"></div>
        <div vfSplitPanelPane>Secondary</div>
      </div>
    </main>`,
  })(SplitPanelTestApp);
  return SplitPanelTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `<vf-split-panel id="root" data-vf-split-panel-root size="40" min="20" max="80" style="--vf-split-size: 40%">
      <div id="root-primary" data-vf-split-panel-pane>Primary</div>
      <div id="handle" data-vf-split-panel-handle role="separator" tabindex="0" aria-label="Primary" aria-controls="root-primary" aria-orientation="vertical" aria-valuemin="20" aria-valuemax="80" aria-valuenow="40"></div>
      <div data-vf-split-panel-pane>Secondary</div>
    </vf-split-panel>`,
    activate: client
      ? async () => {
          const { defineSplitPanelElement } = await import('@vyrnforge/elements/split-panel');
          defineSplitPanelElement();
          document.getElementById('root').addEventListener('vf-size-change', (event) => {
            document.getElementById('root').dataset.requestedSize = String(event.detail.size);
          });
        }
      : undefined,
  };
}

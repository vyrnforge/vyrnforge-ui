const web = `<a id="t" href="#profile" aria-controls="c" aria-expanded="true" data-vf-preview-card-trigger>Profile</a>
<div id="c" role="region" aria-label="Profile preview" data-vf-preview-card-content><p>Profile preview</p><button id="action">Save preview</button></div>`;
const elements = `<vf-preview-card id="preview" placement="bottom-start">
<a id="t" href="#profile" aria-controls="c" aria-expanded="false" data-vf-preview-card-trigger>Profile</a>
<div id="c" role="region" aria-label="Profile preview" data-vf-preview-card-content hidden><p>Profile preview</p><button id="action">Save preview</button></div>
</vf-preview-card>
<button id="outside">Outside</button>`;

export const browserFixture = {
  component: 'preview-card',
  title: 'Preview card browser fixture',
  heading: 'Preview card browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-preview-card-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect } = await import('react');
  const { PreviewCardRoot, PreviewCardTrigger, PreviewCardContent } = await import('@vyrnforge/react/preview-card');
  function Ready() {
    useEffect(() => { document.body.dataset.previewReady = 'true'; }, []);
    return null;
  }
  return h(Fragment, null,
    h(Ready),
    h(PreviewCardRoot, { contentId: 'c' },
      h(PreviewCardTrigger, null, h('a', { id: 't', href: '#profile' }, 'Profile')),
      h(PreviewCardContent, { role: 'region', 'aria-label': 'Profile preview' },
        h('p', null, 'Profile preview'),
        h('button', { id: 'action' }, 'Save preview'),
      ),
    ),
    h(PreviewCardRoot, { contentId: 'controlled-content', open: false, onOpenChange: (next) => {
      document.body.dataset.previewRequest = String(next);
    } },
      h(PreviewCardTrigger, null, h('a', { href: '#controlled' }, 'Controlled preview')),
      h(PreviewCardContent, { role: 'region', 'aria-label': 'Controlled details' }, 'Controlled details'),
    ),
    h('button', { id: 'outside' }, 'Outside'),
  );
}

export async function createVueStory() {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { PreviewCardRoot, PreviewCardTrigger, PreviewCardContent } = await import('@vyrnforge/vue/preview-card');
  return createSSRApp({
    setup() {
      onMounted(() => { document.body.dataset.previewReady = 'true'; });
      return () => h('div', [
        h(PreviewCardRoot, { contentId: 'c' }, () => [
          h(PreviewCardTrigger, null, () => h('a', { id: 't', href: '#profile' }, 'Profile')),
          h(PreviewCardContent, { role: 'region', 'aria-label': 'Profile preview' }, () => [
            h('p', null, 'Profile preview'), h('button', { id: 'action' }, 'Save preview'),
          ]),
        ]),
        h(PreviewCardRoot, { contentId: 'controlled-content', modelValue: false, 'onUpdate:modelValue': (next) => {
          document.body.dataset.previewRequest = String(next);
        } }, () => [
          h(PreviewCardTrigger, null, () => h('a', { href: '#controlled' }, 'Controlled preview')),
          h(PreviewCardContent, { role: 'region', 'aria-label': 'Controlled details' }, () => 'Controlled details'),
        ]),
        h('button', { id: 'outside' }, 'Outside'),
      ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const { VfPreviewCardRootDirective, VfPreviewCardTriggerDirective, VfPreviewCardContentDirective } = await import('@vyrnforge/angular/preview-card');
  class PreviewCardTestApp {
    constructor() { afterNextRender(() => { document.body.dataset.previewReady = 'true'; }); }
    request(next) { document.body.dataset.previewRequest = String(next); }
  }
  Component({
    selector: 'vf-preview-card-test',
    standalone: true,
    imports: [VfPreviewCardRootDirective, VfPreviewCardTriggerDirective, VfPreviewCardContentDirective],
    template: `<main><h1>Preview card browser fixture</h1>
      <div vfPreviewCardRoot id="preview" contentId="c">
        <a id="t" vfPreviewCardTrigger href="#profile">Profile</a>
        <div vfPreviewCardContent role="region" aria-label="Profile preview"><p>Profile preview</p><button id="action">Save preview</button></div>
      </div>
      <div vfPreviewCardRoot id="controlled" contentId="controlled-content" [open]="false" (openChange)="request($event)">
        <a vfPreviewCardTrigger href="#controlled">Controlled preview</a>
        <div vfPreviewCardContent role="region" aria-label="Controlled details">Controlled details</div>
      </div>
      <button id="outside">Outside</button>
    </main>`,
  })(PreviewCardTestApp);
  return PreviewCardTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client ? async () => {
      const { definePreviewCardElement } = await import('@vyrnforge/elements/preview-card');
      definePreviewCardElement();
      document.body.dataset.previewReady = 'true';
    } : undefined,
  };
}

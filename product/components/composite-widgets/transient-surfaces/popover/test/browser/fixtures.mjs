const web = `<button id="t" type="button" data-vf-popover-trigger popovertarget="c" aria-controls="c" aria-haspopup="dialog">Open</button>
<div id="c" role="dialog" aria-labelledby="popover-title" popover="auto" data-vf-popover-content data-vf-placement="bottom-start">
  <h2 id="popover-title">Popover details</h2>
  <button id="action">Inside action</button>
  <button id="nested-trigger" type="button" data-vf-popover-trigger popovertarget="nested-content" aria-controls="nested-content" aria-haspopup="dialog">More</button>
  <div id="nested-content" role="dialog" aria-label="Nested details" popover="auto" data-vf-popover-content data-vf-placement="bottom-start">
    <button id="nested-action">Nested action</button>
  </div>
</div>
<button id="outside">Outside</button>`;

const elements = `<vf-popover id="outer" placement="bottom-start">
  <button id="t" type="button" data-vf-popover-trigger aria-controls="c" aria-expanded="false" aria-haspopup="dialog">Open</button>
  <div id="c" role="dialog" aria-labelledby="popover-title" data-vf-popover-content hidden>
    <h2 id="popover-title">Popover details</h2>
    <button id="action">Inside action</button>
    <vf-popover id="nested">
      <button id="nested-trigger" type="button" data-vf-popover-trigger aria-controls="nested-content" aria-expanded="false" aria-haspopup="dialog">More</button>
      <div id="nested-content" role="dialog" aria-label="Nested details" data-vf-popover-content hidden>
        <button id="nested-action">Nested action</button>
      </div>
    </vf-popover>
  </div>
</vf-popover>
<button id="outside">Outside</button>`;

export const browserFixture = {
  component: 'popover',
  title: 'Popover browser fixture',
  heading: 'Popover browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-popover-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment, useEffect, useState } = await import('react');
  const { PopoverRoot, PopoverTrigger, PopoverContent } = await import('@vyrnforge/react/popover');
  function App() {
    const [controlled, setControlled] = useState(false);
    useEffect(() => { document.body.dataset.popoverReady = 'true'; }, []);
    return h(
      Fragment,
      null,
      h(
        PopoverRoot,
        { contentId: 'c' },
        h(PopoverTrigger, { id: 't' }, 'Open'),
        h(
          PopoverContent,
          { 'aria-labelledby': 'popover-title' },
          h('h2', { id: 'popover-title' }, 'Popover details'),
          h('button', { id: 'action' }, 'Inside action'),
          h(
            PopoverRoot,
            { contentId: 'nested-content' },
            h(PopoverTrigger, { id: 'nested-trigger' }, 'More'),
            h(PopoverContent, { 'aria-label': 'Nested details' }, h('button', { id: 'nested-action' }, 'Nested action')),
          ),
        ),
      ),
      h(
        PopoverRoot,
        { contentId: 'controlled-content', open: controlled, onOpenChange: (next) => {
          document.body.dataset.popoverRequest = String(next);
          if (next) setControlled(true);
        } },
        h(PopoverTrigger, { id: 'controlled-trigger' }, 'Controlled'),
        h(PopoverContent, { 'aria-label': 'Controlled details' }, h('button', { id: 'controlled-action' }, 'Controlled action')),
      ),
      h('button', { id: 'outside' }, 'Outside'),
    );
  }
  return h(App);
}

export async function createVueStory() {
  const { createSSRApp, h, ref, onMounted } = await import('vue');
  const { PopoverRoot, PopoverTrigger, PopoverContent } = await import('@vyrnforge/vue/popover');
  return createSSRApp({
    setup() {
      const controlled = ref(false);
      onMounted(() => { document.body.dataset.popoverReady = 'true'; });
      return () => h('div', [
        h(PopoverRoot, { contentId: 'c' }, () => [
          h(PopoverTrigger, { id: 't' }, () => 'Open'),
          h(PopoverContent, { 'aria-labelledby': 'popover-title' }, () => [
            h('h2', { id: 'popover-title' }, 'Popover details'),
            h('button', { id: 'action' }, 'Inside action'),
            h(PopoverRoot, { contentId: 'nested-content' }, () => [
              h(PopoverTrigger, { id: 'nested-trigger' }, () => 'More'),
              h(PopoverContent, { 'aria-label': 'Nested details' }, () => h('button', { id: 'nested-action' }, 'Nested action')),
            ]),
          ]),
        ]),
        h(PopoverRoot, { contentId: 'controlled-content', modelValue: controlled.value, 'onUpdate:modelValue': (next) => {
          document.body.dataset.popoverRequest = String(next);
          if (next) controlled.value = true;
        } }, () => [
          h(PopoverTrigger, { id: 'controlled-trigger' }, () => 'Controlled'),
          h(PopoverContent, { 'aria-label': 'Controlled details' }, () => h('button', { id: 'controlled-action' }, 'Controlled action')),
        ]),
        h('button', { id: 'outside' }, 'Outside'),
      ]);
    },
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfPopoverRootDirective, VfPopoverTriggerDirective, VfPopoverContentDirective } = await import('@vyrnforge/angular/popover');
  class PopoverTestApp {
    controlled = signal(false);
    constructor() { afterNextRender(() => { document.body.dataset.popoverReady = 'true'; }); }
    request(next) {
      document.body.dataset.popoverRequest = String(next);
      if (next) this.controlled.set(true);
    }
  }
  Component({
    selector: 'vf-popover-test',
    standalone: true,
    imports: [VfPopoverRootDirective, VfPopoverTriggerDirective, VfPopoverContentDirective],
    template: `<main><h1>Popover browser fixture</h1>
      <div vfPopoverRoot id="outer" contentId="c">
        <button id="t" vfPopoverTrigger>Open</button>
        <div vfPopoverContent aria-labelledby="popover-title">
          <h2 id="popover-title">Popover details</h2>
          <button id="action">Inside action</button>
          <div vfPopoverRoot id="nested" contentId="nested-content">
            <button id="nested-trigger" vfPopoverTrigger>More</button>
            <div vfPopoverContent aria-label="Nested details"><button id="nested-action">Nested action</button></div>
          </div>
        </div>
      </div>
      <div vfPopoverRoot id="controlled" contentId="controlled-content" [open]="controlled()" (openChange)="request($event)">
        <button id="controlled-trigger" vfPopoverTrigger>Controlled</button>
        <div vfPopoverContent aria-label="Controlled details"><button id="controlled-action">Controlled action</button></div>
      </div>
      <button id="outside">Outside</button></main>`,
  })(PopoverTestApp);
  return PopoverTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client ? async () => {
      const { definePopoverElement } = await import('@vyrnforge/elements/popover');
      definePopoverElement();
      document.body.dataset.popoverReady = 'true';
    } : undefined,
  };
}

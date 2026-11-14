const web = '<button id="t" aria-describedby="tip">Info</button><div id="tip" role="tooltip" data-vf-tooltip-content>More information</div>';

const elements = `<p id="additional">Additional context</p>
<vf-tooltip id="first" open-delay="0" close-delay="100" placement="bottom">
  <button id="t" data-vf-tooltip-trigger aria-describedby="additional tip">Info</button>
  <div id="tip" role="tooltip" data-vf-tooltip-content hidden>More information</div>
</vf-tooltip>
<vf-tooltip id="second" open-delay="0">
  <button data-vf-tooltip-trigger aria-describedby="second-tip">Second</button>
  <div id="second-tip" role="tooltip" data-vf-tooltip-content hidden>Second description</div>
</vf-tooltip>
<button id="outside">Outside</button>`;

export const browserFixture = {
  component: 'tooltip',
  title: 'Tooltip browser fixture',
  heading: 'Tooltip browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-tooltip-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment } = await import('react');
  const { TooltipRoot, TooltipTrigger, TooltipContent } = await import('@vyrnforge/react/tooltip');
  return h(
    Fragment,
    null,
    h('p', { id: 'additional' }, 'Additional context'),
    h(
      TooltipRoot,
      { contentId: 'tip', openDelay: 0, closeDelay: 100, placement: 'bottom' },
      h(TooltipTrigger, null, h('button', { id: 't', 'aria-describedby': 'additional' }, 'Info')),
      h(TooltipContent, null, 'More information'),
    ),
    h(
      TooltipRoot,
      { openDelay: 0 },
      h(TooltipTrigger, null, h('button', null, 'Second')),
      h(TooltipContent, null, 'Second description'),
    ),
    h('button', { id: 'outside' }, 'Outside'),
  );
}

export async function createVueStory() {
  const { createSSRApp, h } = await import('vue');
  const { TooltipRoot, TooltipTrigger, TooltipContent } = await import('@vyrnforge/vue/tooltip');
  return createSSRApp({
    render: () => h('div', [
      h('p', { id: 'additional' }, 'Additional context'),
      h(TooltipRoot, { contentId: 'tip', openDelay: 0, closeDelay: 100, placement: 'bottom' }, () => [
        h(TooltipTrigger, null, () => h('button', { id: 't', 'aria-describedby': 'additional' }, 'Info')),
        h(TooltipContent, null, () => 'More information'),
      ]),
      h(TooltipRoot, { openDelay: 0 }, () => [
        h(TooltipTrigger, null, () => h('button', null, 'Second')),
        h(TooltipContent, null, () => 'Second description'),
      ]),
      h('button', { id: 'outside' }, 'Outside'),
    ]),
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfTooltipRootDirective,
    VfTooltipTriggerDirective,
    VfTooltipContentDirective,
  } = await import('@vyrnforge/angular/tooltip');
  class TooltipTestApp {}
  Component({
    selector: 'vf-tooltip-test',
    standalone: true,
    imports: [VfTooltipRootDirective, VfTooltipTriggerDirective, VfTooltipContentDirective],
    template: `<main><h1>Tooltip browser fixture</h1>
      <p id="additional">Additional context</p>
      <div vfTooltipRoot id="first" contentId="tip" [openDelay]="0" [closeDelay]="100" placement="bottom">
        <button id="t" vfTooltipTrigger aria-describedby="additional">Info</button>
        <div vfTooltipContent>More information</div>
      </div>
      <div vfTooltipRoot id="second" [openDelay]="0">
        <button vfTooltipTrigger>Second</button>
        <div vfTooltipContent>Second description</div>
      </div>
      <button id="outside">Outside</button>
    </main>`,
  })(TooltipTestApp);
  return TooltipTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: elements,
    activate: client
      ? async () => {
          const { defineTooltipElement } = await import('@vyrnforge/elements/tooltip');
          defineTooltipElement();
        }
      : undefined,
  };
}

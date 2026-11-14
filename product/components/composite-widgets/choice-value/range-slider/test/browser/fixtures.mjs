const web = `<form id="range-form">
  <div id="root" data-vf-range-slider-root>
    <input type="range" data-vf-range-slider-start name="lower" min="-10" max="80" step="5" value="20" aria-label="Minimum price">
    <input type="range" data-vf-range-slider-end name="upper" min="20" max="100" step="5" value="80" aria-label="Maximum price">
  </div>
</form>`;

export const browserFixture = {
  component: 'range-slider',
  title: 'Range slider fixture',
  heading: 'Range slider browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-range-slider-test' },
    elements: { story: 'createElementsStory' },
  },
};

function record(id, value) {
  document.getElementById(id).dataset.requested = JSON.stringify(value);
}

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { RangeSliderRoot } = await import('@vyrnforge/react/range-slider');
  const range = (id, options) => h(RangeSliderRoot, {
    id,
    min: -10,
    max: 100,
    step: 5,
    startLabel: 'Minimum price',
    endLabel: 'Maximum price',
    startName: 'lower',
    endName: 'upper',
    ...options,
    onValueChange: (value) => {
      if (client) record(id, value);
    },
  });
  return h(Fragment, null,
    h('form', { id: 'range-form' }, range('root', { defaultValue: [20, 80] })),
    range('controlled', { value: [30, 70] }),
    h('form', { id: 'disabled-form' }, range('disabled', { defaultValue: [20, 80], disabled: true })),
    range('fractional', { min: 0.1, max: 1, step: 0.2, defaultValue: [0.35, 0.95] }),
  );
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
  const { RangeSliderRoot } = await import('@vyrnforge/vue/range-slider');
  const range = (id, options) => h(RangeSliderRoot, {
    id,
    min: -10,
    max: 100,
    step: 5,
    startLabel: 'Minimum price',
    endLabel: 'Maximum price',
    startName: 'lower',
    endName: 'upper',
    ...options,
    'onUpdate:value': (value) => {
      if (client) record(id, value);
    },
  });
  return createSSRApp({ render: () => h('div', [
    h('form', { id: 'range-form' }, [range('root', { defaultValue: [20, 80] })]),
    range('controlled', { value: [30, 70] }),
    h('form', { id: 'disabled-form' }, [range('disabled', { defaultValue: [20, 80], disabled: true })]),
    range('fractional', { min: 0.1, max: 1, step: 0.2, defaultValue: [0.35, 0.95] }),
  ]) });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const { VfRangeSliderRootDirective, VfRangeSliderStartDirective, VfRangeSliderEndDirective } =
    await import('@vyrnforge/angular/range-slider');

  const parts = '<input vfRangeSliderStart aria-label="Minimum price" name="lower"><input vfRangeSliderEnd aria-label="Maximum price" name="upper">';
  class RangeSliderTestApp {
    changed(id, value) {
      if (client) record(id, value);
    }
  }
  Component({
    selector: 'vf-range-slider-test',
    standalone: true,
    imports: [VfRangeSliderRootDirective, VfRangeSliderStartDirective, VfRangeSliderEndDirective],
    template: `<main><h1>Range slider browser fixture</h1>
      <form id="range-form"><div vfRangeSliderRoot id="root" [min]="-10" [max]="100" [step]="5" [defaultValue]="[20,80]" (valueChange)="changed('root',$event)">${parts}</div></form>
      <div vfRangeSliderRoot id="controlled" [min]="-10" [max]="100" [step]="5" [value]="[30,70]" (valueChange)="changed('controlled',$event)">${parts}</div>
      <form id="disabled-form"><div vfRangeSliderRoot id="disabled" [min]="-10" [max]="100" [step]="5" [defaultValue]="[20,80]" disabled>${parts}</div></form>
      <div vfRangeSliderRoot id="fractional" [min]="0.1" [max]="1" [step]="0.2" [defaultValue]="[0.35,0.95]" (valueChange)="changed('fractional',$event)">${parts}</div>
    </main>`,
  })(RangeSliderTestApp);
  return RangeSliderTestApp;
}

export async function createElementsStory({ client }) {
  const range = (id, min, max, step, lower, upper, attributes = '') => `<vf-range-slider id="${id}" data-vf-range-slider-root min="${min}" max="${max}" step="${step}" ${attributes}>
    <input type="range" data-vf-range-slider-start name="lower" aria-label="Minimum price" min="${min}" max="${upper}" step="${step}" value="${lower}" ${id === 'disabled' ? 'disabled' : ''}>
    <input type="range" data-vf-range-slider-end name="upper" aria-label="Maximum price" min="${lower}" max="${max}" step="${step}" value="${upper}" ${id === 'disabled' ? 'disabled' : ''}>
  </vf-range-slider>`;
  return {
    body: `<form id="range-form">${range('root', -10, 100, 5, 20, 80, 'default-value="[20,80]"')}</form>
      ${range('controlled', -10, 100, 5, 30, 70, 'value="[30,70]"')}
      <form id="disabled-form">${range('disabled', -10, 100, 5, 20, 80, 'disabled')}</form>
      ${range('fractional', 0.1, 1, 0.2, 0.3, 0.9, 'default-value="[0.35,0.95]"')}`,
    activate: client ? async () => {
      const { defineRangeSliderElement } = await import('@vyrnforge/elements/range-slider');
      defineRangeSliderElement();
      for (const id of ['root', 'controlled', 'fractional']) {
        document.getElementById(id).addEventListener('vf-value-change', (event) => record(id, event.detail.value));
      }
    } : undefined,
  };
}

const item = (name, value, checked = false, disabled = false) =>
  `<label data-vf-rating-item><input type="radio" name="${name}" value="${value}" aria-label="Score ${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span aria-hidden="true" data-vf-rating-glyph></span></label>`;
const group = (tag, id, name, selected) =>
  `<${tag} data-vf-rating-root role="radiogroup" id="${id}" aria-label="${id}">${[1, 2, 3].map((v) => item(name, v, v === selected, v === 3)).join('')}</${tag}>`;
const markup = (tag) =>
  `<form id="form">${group(tag, 'First rating', 'first', 1)}${group(tag, 'Second rating', 'second', 2)}</form>`;
export const browserFixture = {
  component: 'rating',
  title: 'Rating fixture',
  heading: 'Rating browser fixture',
  ports: {
    web: { body: markup('div') },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-rating-test' },
    elements: { story: 'createElementsStory' },
  },
};
export async function createReactStory({ client }) {
  const { createElement: h, useEffect } = await import('react');
  const { RatingRoot, RatingItem } = await import('@vyrnforge/react/rating');
  function App() {
    useEffect(() => {
      document.body.dataset.ratingReady = 'true';
    }, []);
    const group = (label, options) =>
      h(
        RatingRoot,
        { 'aria-label': label, ...options },
        ...[1, 2, 3].map((v) => h(RatingItem, { key: v, value: v, label: `Score ${v}`, disabled: v === 3 })),
      );
    return h(
      'form',
      { id: 'form' },
      group('First rating', { defaultValue: 1 }),
      group('Second rating', { defaultValue: 2 }),
      group('Controlled rating', {
        value: 1,
        onValueChange: (v) => {
          if (client) document.body.dataset.requested = String(v);
        },
      }),
      h(RatingRoot, {
        'aria-label': 'Generated rating',
        name: 'score',
        defaultValue: 2,
        max: 3,
        getItemLabel: (v) => `Localized score ${v}`,
      }),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, onMounted } = await import('vue');
  const { RatingRoot, RatingItem } = await import('@vyrnforge/vue/rating');
  return createSSRApp({
    setup() {
      onMounted(() => {
        document.body.dataset.ratingReady = 'true';
      });
      const group = (label, options) =>
        h(RatingRoot, { 'aria-label': label, ...options }, () =>
          [1, 2, 3].map((v) => h(RatingItem, { key: v, value: v, label: `Score ${v}`, disabled: v === 3 })),
        );
      return () =>
        h('form', { id: 'form' }, [
          group('First rating', { defaultValue: 1 }),
          group('Second rating', { defaultValue: 2 }),
          group('Controlled rating', {
            value: 1,
            'onUpdate:value': (v) => {
              if (client) document.body.dataset.requested = String(v);
            },
          }),
          h(RatingRoot, {
            'aria-label': 'Generated rating',
            name: 'score',
            defaultValue: 2,
            max: 3,
            getItemLabel: (v) => `Localized score ${v}`,
          }),
        ]);
    },
  });
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, afterNextRender } = await import('@angular/core');
  const { VfRatingRootDirective, VfRatingItemDirective } = await import('@vyrnforge/angular/rating');
  class RatingTestApp {
    constructor() {
      afterNextRender(() => {
        document.body.dataset.ratingReady = 'true';
      });
    }
    changed(v) {
      if (client) document.body.dataset.requested = String(v);
    }
  }
  const items = [1, 2, 3]
    .map(
      (v) =>
        `<label data-vf-rating-item><input type="radio" [vfRatingItem]="${v}" aria-label="Score ${v}" ${v === 3 ? 'disabled' : ''}><span aria-hidden="true" data-vf-rating-glyph></span></label>`,
    )
    .join('');
  Component({
    selector: 'vf-rating-test',
    standalone: true,
    imports: [VfRatingRootDirective, VfRatingItemDirective],
    template: `<main><h1>Rating fixture</h1><form id="form">
    <div vfRatingRoot name="first" aria-label="First rating" [defaultValue]="1">${items}</div>
    <div vfRatingRoot name="second" aria-label="Second rating" [defaultValue]="2">${items}</div>
    <div vfRatingRoot name="controlled" aria-label="Controlled rating" [value]="1" (valueChange)="changed($event)">${items}</div>
    </form></main>`,
  })(RatingTestApp);
  return RatingTestApp;
}
export async function createElementsStory({ client }) {
  return {
    body: markup('vf-rating'),
    activate: client
      ? async () => {
          const { defineRatingElement } = await import('@vyrnforge/elements/rating');
          defineRatingElement();
          document.body.dataset.ratingReady = 'true';
        }
      : undefined,
  };
}

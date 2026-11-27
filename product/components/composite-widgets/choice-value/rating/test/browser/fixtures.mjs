const item = (name, value, checked = false, disabled = false) =>
  `<label data-vf-rating-item><input type="radio" name="${name}" value="${value}" aria-label="Score ${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span aria-hidden="true" data-vf-rating-glyph></span></label>`;
const group = (tag, id, name, selected) =>
  `<${tag} data-vf-rating-root role="radiogroup" id="${id}" aria-label="${id}">${[1, 2, 3].map((v) => item(name, v, v === selected, v === 3)).join('')}</${tag}>`;
const markup = (tag) =>
  `<form id="form">${group(tag, 'First rating', 'first', 1)}${group(tag, 'Second rating', 'second', 2)}${group(tag, 'Empty rating', 'empty', 0)}</form>`;
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
  const { createElement: h, useEffect, useState } = await import('react');
  const { Rating, RatingRoot, RatingItem } = await import('@vyrnforge/react/rating');
  function App() {
    const [controlled, setControlled] = useState(1);
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
      group('First rating', {
        defaultValue: 1,
        onValueChange: () => {
          if (client)
            document.body.dataset.ratingRequests = String(Number(document.body.dataset.ratingRequests ?? 0) + 1);
        },
      }),
      group('Second rating', { defaultValue: 2 }),
      group('Empty rating', { defaultValue: 0 }),
      group('Controlled rating', {
        value: controlled,
        onValueChange: (v) => {
          if (client) document.body.dataset.requested = String(v);
        },
      }),
      h('button', { type: 'button', id: 'set-controlled', onClick: () => setControlled(2) }, 'Set controlled rating'),
      h(Rating, { 'aria-label': 'Fractional rating', name: 'fraction', defaultValue: 3.5, precision: 0.5, clearable: true, clearLabel: 'Clear fractional rating' }),
      h(Rating, { 'aria-label': 'Required rating', name: 'required-rating', required: true }),
      h(Rating, { 'aria-label': 'Average 4.7 out of 5', value: 4.7, readOnly: true }),
      h(Rating, { 'aria-label': 'Disabled rating', value: 2, disabled: true }),
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
  const { createSSRApp, h, onMounted, ref } = await import('vue');
  const { RatingRoot, RatingItem } = await import('@vyrnforge/vue/rating');
  return createSSRApp({
    setup() {
      const controlled = ref(1);
      onMounted(() => {
        document.body.dataset.ratingReady = 'true';
      });
      const group = (label, options) =>
        h(RatingRoot, { 'aria-label': label, ...options }, () =>
          [1, 2, 3].map((v) => h(RatingItem, { key: v, value: v, label: `Score ${v}`, disabled: v === 3 })),
        );
      return () =>
        h('form', { id: 'form' }, [
          group('First rating', {
            defaultValue: 1,
            'onUpdate:value': () => {
              if (client)
                document.body.dataset.ratingRequests = String(Number(document.body.dataset.ratingRequests ?? 0) + 1);
            },
          }),
          group('Second rating', { defaultValue: 2 }),
          group('Empty rating', { defaultValue: 0 }),
          group('Controlled rating', {
            value: controlled.value,
            'onUpdate:value': (v) => {
              if (client) document.body.dataset.requested = String(v);
            },
          }),
          h(
            'button',
            { type: 'button', id: 'set-controlled', onClick: () => (controlled.value = 2) },
            'Set controlled rating',
          ),
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
  const { Component, afterNextRender, signal } = await import('@angular/core');
  const { VfRatingRootDirective, VfRatingItemDirective } = await import('@vyrnforge/angular/rating');
  class RatingTestApp {
    controlled = signal(1);
    ratingChanged() {
      if (client) document.body.dataset.ratingRequests = String(Number(document.body.dataset.ratingRequests ?? 0) + 1);
    }
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
    <div vfRatingRoot name="first" aria-label="First rating" [defaultValue]="1" (valueChange)="ratingChanged()">${items}</div>
    <div vfRatingRoot name="second" aria-label="Second rating" [defaultValue]="2">${items}</div>
    <div vfRatingRoot name="empty" aria-label="Empty rating" [defaultValue]="0">${items}</div>
    <div vfRatingRoot name="controlled" aria-label="Controlled rating" [value]="controlled()" (valueChange)="changed($event)">${items}</div>
    <button id="set-controlled" type="button" (click)="controlled.set(2)">Set controlled rating</button>
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

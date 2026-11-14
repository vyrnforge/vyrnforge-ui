const web = `
<section id="root" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Featured items">
  <button id="prev" data-vf-carousel-previous type="button" aria-disabled="true">Previous</button>
  <div data-vf-carousel-viewport>
    <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="1 of 2">First slide</div>
    <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="2 of 2" hidden>Second slide</div>
  </div>
  <button id="next" data-vf-carousel-next type="button">Next</button>
</section>`;

export const browserFixture = {
  component: 'carousel',
  title: 'Carousel fixture',
  heading: 'Carousel browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    angular: { story: 'createAngularStory', selector: 'vf-carousel-test' },
    vue: { story: 'createVueStory' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const { createElement: h, Fragment } = await import('react');
  const { CarouselRoot, CarouselViewport, CarouselSlide, CarouselPrevious, CarouselNext } =
    await import('@vyrnforge/react/carousel');
  const carousel = (id, options) =>
    h(
      CarouselRoot,
      {
        id,
        'aria-label': id === 'root' ? 'Featured items' : 'Controlled items',
        ...options,
        onIndexChange: (index) => {
          if (client) document.getElementById(id).dataset.requestedIndex = String(index);
        },
      },
      h(CarouselPrevious, { id: id === 'root' ? 'prev' : 'controlled-prev' }, 'Previous'),
      h(
        CarouselViewport,
        null,
        h(CarouselSlide, { 'aria-label': '1 of 2' }, 'First slide'),
        h(CarouselSlide, { 'aria-label': '2 of 2' }, 'Second slide'),
      ),
      h(CarouselNext, { id: id === 'root' ? 'next' : 'controlled-next' }, 'Next'),
    );
  function WrappedViewport({ position, label, children }) {
    return h('div', null, h(CarouselViewport, null, h(CarouselSlide, { position, 'aria-label': label }, children)));
  }
  const composed = h(CarouselRoot, { id: 'composed', 'aria-label': 'Composed items', defaultIndex: 1 },
    h(CarouselViewport, null, h(CarouselSlide, { 'aria-label': '1 of 2' }, 'Composed first')),
    h(Fragment, null, h(CarouselViewport, null, h(CarouselSlide, { 'aria-label': '2 of 2' }, 'Composed second'))),
    h(CarouselPrevious, { id: 'composed-prev' }, 'Previous'),
    h(CarouselNext, { id: 'composed-next' }, 'Next'),
  );
  const wrapped = h(CarouselRoot, { id: 'wrapped', 'aria-label': 'Wrapped items', slideCount: 2, defaultIndex: 1 },
    h(WrappedViewport, { position: 0, label: '1 of 2' }, 'Wrapped first'),
    h(WrappedViewport, { position: 1, label: '2 of 2' }, 'Wrapped second'),
    h(CarouselPrevious, { id: 'wrapped-prev' }, 'Previous'),
    h(CarouselNext, { id: 'wrapped-next' }, 'Next'),
  );
  return h(Fragment, null, carousel('root', { defaultIndex: 0 }), carousel('controlled', { index: 1 }), composed, wrapped);
}

export async function createVueStory({ client }) {
  const { createSSRApp, defineComponent, Fragment, h } = await import('vue');
  const { CarouselRoot, CarouselViewport, CarouselSlide, CarouselPrevious, CarouselNext } =
    await import('@vyrnforge/vue/carousel');
  const carousel = (id, options) =>
    h(
      CarouselRoot,
      {
        id,
        'aria-label': id === 'root' ? 'Featured items' : 'Controlled items',
        ...options,
        'onUpdate:index': (index) => {
          if (client) document.getElementById(id).dataset.requestedIndex = String(index);
        },
      },
      () => [
        h(CarouselPrevious, { id: id === 'root' ? 'prev' : 'controlled-prev' }, () => 'Previous'),
        h(CarouselViewport, null, () => [
          h(CarouselSlide, { 'aria-label': '1 of 2' }, () => 'First slide'),
          h(CarouselSlide, { 'aria-label': '2 of 2' }, () => 'Second slide'),
        ]),
        h(CarouselNext, { id: id === 'root' ? 'next' : 'controlled-next' }, () => 'Next'),
      ],
    );
  const WrappedViewport = defineComponent({
    props: { position: Number, label: String },
    setup(props, { slots }) {
      return () => h('div', null, [h(CarouselViewport, null, () => [
        h(CarouselSlide, { position: props.position, 'aria-label': props.label }, slots.default),
      ])]);
    },
  });
  const composed = () => h(CarouselRoot, { id: 'composed', 'aria-label': 'Composed items', defaultIndex: 1 }, () => [
    h(CarouselViewport, null, () => h(CarouselSlide, { 'aria-label': '1 of 2' }, () => 'Composed first')),
    h(Fragment, null, [h(CarouselViewport, null, () => h(CarouselSlide, { 'aria-label': '2 of 2' }, () => 'Composed second'))]),
    h(CarouselPrevious, { id: 'composed-prev' }, () => 'Previous'),
    h(CarouselNext, { id: 'composed-next' }, () => 'Next'),
  ]);
  const wrapped = () => h(CarouselRoot, { id: 'wrapped', 'aria-label': 'Wrapped items', slideCount: 2, defaultIndex: 1 }, () => [
    h(WrappedViewport, { position: 0, label: '1 of 2' }, () => 'Wrapped first'),
    h(WrappedViewport, { position: 1, label: '2 of 2' }, () => 'Wrapped second'),
    h(CarouselPrevious, { id: 'wrapped-prev' }, () => 'Previous'),
    h(CarouselNext, { id: 'wrapped-next' }, () => 'Next'),
  ]);
  return createSSRApp({
    render: () => h('div', [carousel('root', { defaultIndex: 0 }), carousel('controlled', { index: 1 }), composed(), wrapped()]),
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfCarouselRootDirective,
    VfCarouselViewportDirective,
    VfCarouselSlideDirective,
    VfCarouselPreviousDirective,
    VfCarouselNextDirective,
  } = await import('@vyrnforge/angular/carousel');

  class CarouselTestApp {
    changed(id, index) {
      if (client) document.getElementById(id).dataset.requestedIndex = String(index);
    }
  }

  Component({
    selector: 'vf-carousel-test',
    standalone: true,
    imports: [
      VfCarouselRootDirective,
      VfCarouselViewportDirective,
      VfCarouselSlideDirective,
      VfCarouselPreviousDirective,
      VfCarouselNextDirective,
    ],
    template: `<main><h1>Carousel browser fixture</h1>
      <section vfCarouselRoot id="root" aria-label="Featured items" (indexChange)="changed('root', $event)">
        <button vfCarouselPrevious id="prev">Previous</button>
        <div vfCarouselViewport>
          <div vfCarouselSlide aria-label="1 of 2">First slide</div>
          <div vfCarouselSlide aria-label="2 of 2">Second slide</div>
        </div>
        <button vfCarouselNext id="next">Next</button>
      </section>
      <section vfCarouselRoot id="controlled" aria-label="Controlled items" [index]="1" (indexChange)="changed('controlled', $event)">
        <button vfCarouselPrevious id="controlled-prev">Previous</button>
        <div vfCarouselViewport>
          <div vfCarouselSlide aria-label="1 of 2">First slide</div>
          <div vfCarouselSlide aria-label="2 of 2">Second slide</div>
        </div>
        <button vfCarouselNext id="controlled-next">Next</button>
      </section>
      <section vfCarouselRoot id="composed" aria-label="Composed items" [defaultIndex]="1">
        <div vfCarouselViewport><div vfCarouselSlide aria-label="1 of 2">Composed first</div></div>
        <div vfCarouselViewport><div vfCarouselSlide aria-label="2 of 2">Composed second</div></div>
        <button vfCarouselPrevious id="composed-prev">Previous</button>
        <button vfCarouselNext id="composed-next">Next</button>
      </section>
      <section vfCarouselRoot id="wrapped" aria-label="Wrapped items" [defaultIndex]="1">
        <div><div vfCarouselViewport><div vfCarouselSlide aria-label="1 of 2">Wrapped first</div></div></div>
        <div><div vfCarouselViewport><div vfCarouselSlide aria-label="2 of 2">Wrapped second</div></div></div>
        <button vfCarouselPrevious id="wrapped-prev">Previous</button>
        <button vfCarouselNext id="wrapped-next">Next</button>
      </section></main>`,
  })(CarouselTestApp);

  return CarouselTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: `<vf-carousel id="root" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Featured items">
      <button id="prev" data-vf-carousel-previous type="button" aria-disabled="true">Previous</button>
      <div data-vf-carousel-viewport>
        <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="1 of 2">First slide</div>
        <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="2 of 2" hidden>Second slide</div>
      </div>
      <button id="next" data-vf-carousel-next type="button">Next</button>
    </vf-carousel>
    <vf-carousel id="controlled" index="1" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Controlled items">
      <button id="controlled-prev" data-vf-carousel-previous type="button">Previous</button>
      <div data-vf-carousel-viewport>
        <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="1 of 2" hidden>First slide</div>
        <div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="2 of 2">Second slide</div>
      </div>
      <button id="controlled-next" data-vf-carousel-next type="button" aria-disabled="true">Next</button>
    </vf-carousel>
    <vf-carousel id="composed" default-index="1" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Composed items">
      <div data-vf-carousel-viewport><div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="1 of 2" hidden>Composed first</div></div>
      <div data-vf-carousel-viewport><div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="2 of 2">Composed second</div></div>
      <button id="composed-prev" data-vf-carousel-previous type="button">Previous</button>
      <button id="composed-next" data-vf-carousel-next type="button" aria-disabled="true">Next</button>
    </vf-carousel>
    <vf-carousel id="wrapped" default-index="1" data-vf-carousel-root role="region" aria-roledescription="carousel" aria-label="Wrapped items">
      <div><div data-vf-carousel-viewport><div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="1 of 2" hidden>Wrapped first</div></div></div>
      <div><div data-vf-carousel-viewport><div data-vf-carousel-slide role="group" aria-roledescription="slide" aria-label="2 of 2">Wrapped second</div></div></div>
      <button id="wrapped-prev" data-vf-carousel-previous type="button">Previous</button>
      <button id="wrapped-next" data-vf-carousel-next type="button" aria-disabled="true">Next</button>
    </vf-carousel>`,
    activate: client
      ? async () => {
          const { defineCarouselElement } = await import('@vyrnforge/elements/carousel');
          defineCarouselElement();
          for (const id of ['root', 'controlled']) {
            const element = document.getElementById(id);
            element.addEventListener('vf-index-change', (event) => {
              element.dataset.requestedIndex = String(event.detail.index);
            });
          }
        }
      : undefined,
  };
}

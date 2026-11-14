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
  return h(Fragment, null, carousel('root', { defaultIndex: 0 }), carousel('controlled', { index: 1 }));
}

export async function createVueStory({ client }) {
  const { createSSRApp, h } = await import('vue');
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
  return createSSRApp({
    render: () => h('div', [carousel('root', { defaultIndex: 0 }), carousel('controlled', { index: 1 })]),
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

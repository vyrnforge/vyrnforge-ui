const web = `<nav id="pagination" aria-label="Pagination" data-vf-pagination-root>
  <a data-vf-pagination-previous href="#page1">Previous</a>
  <a data-vf-pagination-item href="#page2" aria-current="page">2</a>
  <a data-vf-pagination-next href="#page3">Next</a>
</nav>
<nav id="boundary" aria-label="First page navigation" data-vf-pagination-root>
  <a data-vf-pagination-previous>No previous page</a>
  <a data-vf-pagination-item href="#page1" aria-current="page">1</a>
  <a data-vf-pagination-next href="#page2">Next</a>
</nav>`;

export const browserFixture = {
  component: 'pagination',
  title: 'Pagination browser fixture',
  heading: 'Pagination browser fixture',
  ports: {
    web: { body: web },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-pagination-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory() {
  const { createElement: h, Fragment } = await import('react');
  const { PaginationRoot, PaginationPrevious, PaginationItem, PaginationNext } =
    await import('@vyrnforge/react/pagination');
  return h(
    Fragment,
    null,
    h(
      PaginationRoot,
      { id: 'pagination', 'aria-label': 'Pagination' },
      h(PaginationPrevious, { href: '#page1' }, 'Previous'),
      h(PaginationItem, { href: '#page2', current: true }, '2'),
      h(PaginationNext, { href: '#page3' }, 'Next'),
    ),
    h(
      PaginationRoot,
      { id: 'boundary', 'aria-label': 'First page navigation' },
      h(PaginationPrevious, null, 'No previous page'),
      h(PaginationItem, { href: '#page1', current: true }, '1'),
      h(PaginationNext, { href: '#page2' }, 'Next'),
    ),
  );
}

export async function createVueStory() {
  const { createSSRApp, h } = await import('vue');
  const { PaginationRoot, PaginationPrevious, PaginationItem, PaginationNext } =
    await import('@vyrnforge/vue/pagination');
  return createSSRApp({
    render: () =>
      h('div', [
        h(PaginationRoot, { id: 'pagination', 'aria-label': 'Pagination' }, () => [
          h(PaginationPrevious, { href: '#page1' }, () => 'Previous'),
          h(PaginationItem, { href: '#page2', current: true }, () => '2'),
          h(PaginationNext, { href: '#page3' }, () => 'Next'),
        ]),
        h(PaginationRoot, { id: 'boundary', 'aria-label': 'First page navigation' }, () => [
          h(PaginationPrevious, null, () => 'No previous page'),
          h(PaginationItem, { href: '#page1', current: true }, () => '1'),
          h(PaginationNext, { href: '#page2' }, () => 'Next'),
        ]),
      ]),
  });
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component } = await import('@angular/core');
  const {
    VfPaginationRootDirective,
    VfPaginationPreviousDirective,
    VfPaginationItemDirective,
    VfPaginationNextDirective,
  } = await import('@vyrnforge/angular/pagination');
  class PaginationTestApp {}
  Component({
    selector: 'vf-pagination-test',
    standalone: true,
    imports: [
      VfPaginationRootDirective,
      VfPaginationPreviousDirective,
      VfPaginationItemDirective,
      VfPaginationNextDirective,
    ],
    template: `<main><h1>Pagination browser fixture</h1>
      <nav vfPaginationRoot id="pagination" aria-label="Pagination">
        <a vfPaginationPrevious href="#page1">Previous</a>
        <a vfPaginationItem href="#page2" [current]="true">2</a>
        <a vfPaginationNext href="#page3">Next</a>
      </nav>
      <nav vfPaginationRoot id="boundary" aria-label="First page navigation">
        <a vfPaginationPrevious>No previous page</a>
        <a vfPaginationItem href="#page1" [current]="true">1</a>
        <a vfPaginationNext href="#page2">Next</a>
      </nav>
    </main>`,
  })(PaginationTestApp);
  return PaginationTestApp;
}

export async function createElementsStory({ client }) {
  return {
    body: web.replaceAll('<nav ', '<vf-pagination role="navigation" ').replaceAll('</nav>', '</vf-pagination>'),
    activate: client
      ? async () => {
          const { definePaginationElement } = await import('@vyrnforge/elements/pagination');
          definePaginationElement();
        }
      : undefined,
  };
}

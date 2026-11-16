const values = ['step', 'page', 'location', 'false', 'date', 'time', 'true', null];
const cases = values.flatMap(value => [undefined, false, true].map(current => ({
  id: `peer-${value ?? 'absent'}-${current ?? 'omitted'}`,
  value,
  current,
})));
const nativeCases = cases.filter(entry => entry.current === undefined);
const nativeLinks = nativeCases.map(({ id, value }) =>
  `<a data-vf-side-nav-link id="${id}" href="#peer-destination"${value === null ? '' : ` aria-current="${value}"`}>${id}</a>`
).join('');
const nativePrimary = '<section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>Workspace</h2><ul data-vf-side-nav-list><li data-vf-side-nav-item><a data-vf-side-nav-link aria-current="page" href="./">Home</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link href="./projects">Projects</a></li></ul></section>';
const nativeMatrix = `<section aria-label="Independent link cases">${nativeLinks}</section><div id="peer-destination">Destination</div>`;

export const browserFixture = {
  component: 'side-nav',
  title: 'Side nav browser fixture',
  heading: 'Side nav browser fixture',
  ports: {
    web: { body: `<nav data-vf-side-nav aria-label="Primary">${nativePrimary}</nav>${nativeMatrix}` },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-side-nav-test' },
    elements: { story: 'createElementsStory' },
  },
};

function peerProps({ id, value, current }) {
  return { id, href: '#peer-destination', ...(value === null ? {} : { 'aria-current': value }), ...(current === undefined ? {} : { current }) };
}

export async function createReactStory() {
  const { createElement: h } = await import('react');
  const { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } = await import('@vyrnforge/react/side-nav');
  return h('div', null,
    h(SideNav, { 'aria-label': 'Primary' },
      h(SideNavGroup, null, h(SideNavGroupLabel, null, 'Workspace'),
        h(SideNavList, null,
          h(SideNavItem, null, h(SideNavLink, { current: true, href: './' }, 'Home')),
          h(SideNavItem, null, h(SideNavLink, { href: './projects' }, 'Projects'))))),
    h('section', { 'aria-label': 'Independent link cases' },
      ...cases.map(entry => h(SideNavLink, { ...peerProps(entry), key: entry.id }, entry.id))),
    h('div', { id: 'peer-destination' }, 'Destination'),
  );
}

export async function createVueStory() {
  const { createSSRApp, h } = await import('vue');
  const { SideNav, SideNavGroup, SideNavGroupLabel, SideNavList, SideNavItem, SideNavLink } = await import('@vyrnforge/vue/side-nav');
  return createSSRApp({
    render: () => h('div', null, [
      h(SideNav, { 'aria-label': 'Primary' }, () => h(SideNavGroup, null, () => [
        h(SideNavGroupLabel, null, () => 'Workspace'),
        h(SideNavList, null, () => [
          h(SideNavItem, null, () => h(SideNavLink, { current: true, href: './' }, () => 'Home')),
          h(SideNavItem, null, () => h(SideNavLink, { href: './projects' }, () => 'Projects')),
        ]),
      ])),
      h('section', { 'aria-label': 'Independent link cases' },
        cases.map(entry => h(SideNavLink, { ...peerProps(entry), key: entry.id }, () => entry.id))),
      h('div', { id: 'peer-destination' }, 'Destination'),
    ]),
  });
}

export async function createElementsStory({ client }) {
  return {
    body: `<vf-side-nav aria-label="Primary">${nativePrimary}</vf-side-nav>${nativeMatrix}`,
    activate: client ? async () => {
      const { defineSideNavElement } = await import('@vyrnforge/elements/side-nav');
      defineSideNavElement();
    } : undefined,
  };
}

export async function createAngularStory() {
  await import('@angular/compiler');
  const { Component, signal } = await import('@angular/core');
  const { VfSideNavDirective, VfSideNavGroupDirective, VfSideNavGroupLabelDirective, VfSideNavListDirective, VfSideNavItemDirective, VfSideNavLinkDirective } = await import('@vyrnforge/angular/side-nav');
  class App {
    authored = signal('step');
    override = signal(false);
  }
  Component({
    selector: 'vf-side-nav-test',
    standalone: true,
    imports: [VfSideNavDirective, VfSideNavGroupDirective, VfSideNavGroupLabelDirective, VfSideNavListDirective, VfSideNavItemDirective, VfSideNavLinkDirective],
    template: `
      <main><h1>Side nav browser fixture</h1>
      <nav vfSideNav aria-label="Primary">
        <section vfSideNavGroup>
          <h2 vfSideNavGroupLabel>Workspace</h2>
          <ul vfSideNavList>
            <li vfSideNavItem><a vfSideNavLink [vfSideNavCurrent]="true" href="./">Home</a></li>
            <li vfSideNavItem><a vfSideNavLink href="./projects">Projects</a></li>
          </ul>
        </section>
      </nav>
      <nav vfSideNav aria-label="Regression links">
        <ul vfSideNavList>
          <li vfSideNavItem><a vfSideNavLink aria-current="step" href="#destination" id="static-step">Static step</a></li>
          <li vfSideNavItem><a vfSideNavLink aria-current="page" [vfSideNavCurrent]="false" href="#destination" id="static-page">Static page</a></li>
          <li vfSideNavItem><a vfSideNavLink aria-current="location" [vfSideNavCurrent]="false" href="#destination" id="static-location">Static location</a></li>
          <li vfSideNavItem><a vfSideNavLink aria-current="false" href="#destination" id="static-false">Static false</a></li>
          <li vfSideNavItem><a vfSideNavLink href="#destination" id="static-absent">Static absent</a></li>
          <li vfSideNavItem><a vfSideNavLink aria-current="step" [vfSideNavCurrent]="override()" href="#destination" id="static-toggle">Static toggle</a></li>
          <li vfSideNavItem><a vfSideNavLink [aria-current]="authored()" [vfSideNavCurrent]="override()" href="#destination" id="bound">Bound link</a></li>
        </ul>
      </nav>
      <button (click)="override.set(!override())">Toggle override</button>
      <button (click)="authored.set('location')">Author location</button>
      <button (click)="authored.set('page')">Author page</button>
      <button (click)="authored.set('step')">Author step</button>
      <button (click)="authored.set('false')">Author false</button>
      <button (click)="authored.set(null)">Remove authored</button>
      <button (click)="authored.set(undefined)">Unset authored</button>
      <button (click)="authored.set('location'); override.set(false)">Set location and clear override</button>
      <a data-vf-side-nav-link [attr.aria-current]="authored()" href="#destination" id="native-bound">Native bound</a>
      <div id="destination">Destination</div></main>`,
  })(App);
  return App;
}

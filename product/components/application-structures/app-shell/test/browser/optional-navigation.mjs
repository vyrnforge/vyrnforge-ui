// Real public AppShell entrypoints; no source aliases or emulated adapters.
// The state driver belongs to the test consumer, not the library.
const initial = { navigation: 'absent', footer: false };
const root = () => document.getElementById('root');

function mountDom(elements) {
  const region = (part, tag, content = '') => {
    const name = elements ? 'vf-app-shell' + (part ? '-' + part : '') : tag;
    const node = document.createElement(name);
    if (!elements) node.setAttribute('data-vf-app-shell' + (part ? '-' + part : ''), '');
    node.innerHTML = content;
    return node;
  };
  const shell = region('', 'div');
  const header = region('header', 'header', 'Header');
  const body = region('body', 'div');
  const main = region('main', 'main', '<h1>Workspace</h1><button type="button">Main action</button>');
  body.append(main);
  shell.append(header, body);
  root().append(shell);
  let navigation, footer;
  window.vfSetShellState = (state) => {
    if (state.navigation === 'absent') {
      navigation?.remove();
      navigation = undefined;
    } else {
      if (!navigation) {
        navigation = region('navigation', 'aside', '<nav aria-label="Primary"><a href="#workspace">Home</a></nav>');
        body.prepend(navigation);
      }
      navigation.hidden = state.navigation === 'hidden';
    }
    if (state.footer && !footer) {
      footer = region('footer', 'footer', 'Footer');
      shell.append(footer);
    } else if (!state.footer) {
      footer?.remove();
      footer = undefined;
    }
  };
}

export function mountWeb() {
  mountDom(false);
}

export async function mountElements() {
  const { defineAppShellElements, VfAppShellElement } = await import('@vyrnforge/elements/app-shell');
  defineAppShellElements();
  mountDom(true);
  if (!(root().firstElementChild instanceof VfAppShellElement)) throw new Error('AppShell was not upgraded');
}

export async function mountReact() {
  const { createElement: h } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { flushSync } = await import('react-dom');
  const { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } = await import('@vyrnforge/react/app-shell');
  const app = createRoot(root());
  const render = (state) => flushSync(() => app.render(
    h(AppShell, null,
      h(AppShellHeader, null, 'Header'),
      h(AppShellBody, null,
        state.navigation === 'absent' ? null : h(AppShellNavigation, { hidden: state.navigation === 'hidden' },
          h('nav', { 'aria-label': 'Primary' }, h('a', { href: '#workspace' }, 'Home'))),
        h(AppShellMain, null, h('h1', null, 'Workspace'), h('button', { type: 'button' }, 'Main action'))),
      state.footer ? h(AppShellFooter, null, 'Footer') : null)
  ));
  render(initial);
  window.vfSetShellState = render;
}

export async function mountVue() {
  const { createApp, h, ref, nextTick } = await import('vue');
  const { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } = await import('@vyrnforge/vue/app-shell');
  const state = ref(initial);
  createApp({
    render: () => h(AppShell, null, () => [
      h(AppShellHeader, null, () => 'Header'),
      h(AppShellBody, null, () => [
        state.value.navigation === 'absent' ? null : h(AppShellNavigation, { hidden: state.value.navigation === 'hidden' },
          () => h('nav', { 'aria-label': 'Primary' }, [h('a', { href: '#workspace' }, 'Home')])),
        h(AppShellMain, null, () => [h('h1', null, 'Workspace'), h('button', { type: 'button' }, 'Main action')]),
      ]),
      state.value.footer ? h(AppShellFooter, null, () => 'Footer') : null,
    ]),
  }).mount(root());
  window.vfSetShellState = async (next) => { state.value = next; await nextTick(); };
}

export async function mountAngular() {
  await import('@angular/compiler');
  const { Component, signal, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { VfAppShellDirective, VfAppShellHeaderDirective, VfAppShellBodyDirective, VfAppShellNavigationDirective, VfAppShellMainDirective, VfAppShellFooterDirective } = await import('@vyrnforge/angular/app-shell');
  class ShellTest {
    state = signal(initial);
  }
  Component({
    selector: 'vf-optional-shell-test',
    standalone: true,
    imports: [VfAppShellDirective, VfAppShellHeaderDirective, VfAppShellBodyDirective, VfAppShellNavigationDirective, VfAppShellMainDirective, VfAppShellFooterDirective],
    template: `<div vfAppShell>
      <header vfAppShellHeader>Header</header>
      <div vfAppShellBody>
        @if (state().navigation !== 'absent') {
          <aside vfAppShellNavigation [attr.hidden]="state().navigation === 'hidden' ? '' : null">
            <nav aria-label="Primary"><a href="#workspace">Home</a></nav>
          </aside>
        }
        <main vfAppShellMain><h1>Workspace</h1><button type="button">Main action</button></main>
      </div>
      @if (state().footer) { <footer vfAppShellFooter>Footer</footer> }
    </div>`,
  })(ShellTest);
  const app = await bootstrapApplication(ShellTest, { providers: [provideZonelessChangeDetection()] });
  window.vfSetShellState = (state) => {
    app.components[0].instance.state.set(state);
    app.tick();
  };
}

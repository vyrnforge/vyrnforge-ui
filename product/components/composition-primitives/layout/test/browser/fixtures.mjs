import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'layout',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/layout');
    await mkdir(outDir, { recursive: true });
    const tokens = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const layout = (await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8'))
      .replace(/^@import\s+["'][^"']+["'];\s*$/gm, '');
    const foundation = (await readFile(path.join(root, 'packages/web/dist/styles/foundation.css'), 'utf8'))
      .replace(/^@import\s+["'][^"']+["'];\s*$/gm, '');
    const stripImports = css => css.replace(/^@import\s+["'][^"']+["'];\s*$/gm, '');
    const input = (await readFile(path.join(root, 'packages/web/dist/styles/form-controls.css'), 'utf8')) + '\n' + stripImports(await readFile(path.join(root, 'packages/web/dist/components/input/input.css'), 'utf8'));
    const text = stripImports(await readFile(path.join(root, 'packages/web/dist/components/text/text.css'), 'utf8'));
    const typography = stripImports(await readFile(path.join(root, 'packages/web/dist/styles/internal/typography-roles.css'), 'utf8'));
    const fixtureCss = `
      html { font-size: 16px; }
      body { margin: 0; padding: 24px; --vf-auto-grid-min-item-size: 9rem; font-family: sans-serif; }
      #container { box-sizing: border-box; max-inline-size: 40rem; margin-inline: auto; inline-size: 100%; padding-inline: var(--vf-space-md); }
      #actions { inline-size: min(100%, 13rem); }
      #auto-grid { inline-size: min(100%, 31rem); }
      #inline { inline-size: min(100%, 20rem); }
      #controls { inline-size: min(100%, 20rem); }
      #controls > input { min-inline-size: 0; flex: 1 1 auto; }
      button { min-inline-size: 6rem; }
    `;
    await writeFile(path.join(outDir, 'layout.css'), `${tokens}\n${foundation}\n${layout}\n${fixtureCss}`);
    await writeFile(path.join(outDir, 'tokens-only.css'), tokens);
    await writeFile(path.join(outDir, 'layout-only.css'), `${layout}\n${fixtureCss}`);
    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./layout.css"><title>Layout CSS recipe fixture</title></head><body>${body}</body></html>`;
    const cards = ['A', 'B', 'C', 'D'];
    const native = `<main id="container"><section id="stack" data-vf-flow data-vf-flow-gap="lg" data-vf-flow-align="start" aria-labelledby="heading">
      <h1 id="heading">Layout CSS fixture</h1>
      <section id="auto-grid" data-vf-auto-grid data-vf-auto-grid-gap="sm">${cards.map((label, i) => `<article id="card-${String.fromCharCode(97 + i)}">${label}</article>`).join('')}</section>
      <div id="actions" dir="rtl" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="sm" data-vf-flow-align="center" data-vf-flow-justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div>
      <div id="inline" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="sm" data-vf-flow-align="baseline" data-vf-flow-justify="space-between"><span>Alpha</span><strong>Beta</strong></div>
      <div id="controls" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="xs"><input id="search" aria-label="Search query"><button type="button">Search</button></div>
      </section></main>`;
    if (port === 'web' || port === 'elements') {
      await writeFile(path.join(outDir, `${port}.html`), page(native));
    }
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Flow, AutoGrid } = await import('@vyrnforge/react/layout');
      const markup = renderToString(h('main', { id: 'container' },
        h(Flow, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' },
          h('h1', { id: 'heading' }, 'Layout CSS fixture'),
          h(AutoGrid, { as: 'section', id: 'auto-grid', gap: 'sm' },
            ...cards.map((label, i) => h('article', { id: `card-${String.fromCharCode(97 + i)}`, key: label }, label))),
          h(Flow, { id: 'actions', dir: 'rtl', direction: 'inline', wrap: 'wrap', gap: 'sm',
              align: 'center', justify: 'space-between' },
            ...['First', 'Second', 'Third'].map(label =>
              h('button', { id: label.toLowerCase(), type: 'button', key: label }, label))),
          h(Flow, { id: 'inline', direction: 'inline', gap: 'sm', align: 'baseline', justify: 'space-between' },
            h('span', null, 'Alpha'), h('strong', null, 'Beta')),
          h(Flow, { id: 'controls', direction: 'inline', gap: 'xs' },
            h('input', { id: 'search', 'aria-label': 'Search query' }),
            h('button', { type: 'button' }, 'Search'))
        )));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
      // The default-first example is tested as a real public React composition,
      // without assigning gap, width, padding, margin or control-size props.
      const { Input } = await import('@vyrnforge/react/input');
      const { Text } = await import('@vyrnforge/react/text');
      const formMarkup = renderToString(h('main', { id: 'container' },
        h('h1', null, 'Default-first React form'),
        h('form', { id: 'form-example' },
          h(Flow, { id: 'react-flow-block' },
            h('label', { htmlFor: 'layout-react-email' }, 'Contact email'),
            h(Input, { id: 'layout-react-email', name: 'email', type: 'email', 'aria-describedby': 'layout-react-email-help' }),
            h(Text, { as: 'p', id: 'layout-react-email-help' }, 'Used for account notifications.')))));
      await writeFile(path.join(outDir, 'react-form.css'), `${tokens}\n${typography}\n${foundation}\n${layout}\n${input}\n${text}\n${fixtureCss}\nbody { background: var(--vf-color-surface); color: var(--vf-color-text); }`);
      await writeFile(path.join(outDir, 'react-form.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./react-form.css"><title>Default-first React form</title></head><body>' + formMarkup + '</body></html>');
    }
    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const app = createSSRApp({ render: () => h('main', { id: 'container' }, [
        h('section', { id: 'stack', 'data-vf-flow': '', 'data-vf-flow-gap': 'lg', 'data-vf-flow-align': 'start', 'aria-labelledby': 'heading' }, [
          h('h1', { id: 'heading' }, 'Layout CSS fixture'),
          h('section', { id: 'auto-grid', 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': 'sm' }, cards.map((label, i) => h('article', { id: `card-${String.fromCharCode(97+i)}` }, label))),
          h('div', { id: 'actions', dir: 'rtl', 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'sm', 'data-vf-flow-align': 'center', 'data-vf-flow-justify': 'space-between' }, ['First','Second','Third'].map(s => h('button', { id: s.toLowerCase(), type: 'button' }, s))),
          h('div', { id: 'inline', 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-gap': 'sm', 'data-vf-flow-align': 'baseline', 'data-vf-flow-justify': 'space-between' }, [h('span','Alpha'), h('strong','Beta')]),
          h('div', { id: 'controls', 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-gap': 'xs' }, [h('input', { id: 'search', 'aria-label': 'Search query' }), h('button', { type: 'button' }, 'Search')]),
        ]),
      ]) });
      await writeFile(path.join(outDir, 'vue.html'), page(await renderToString(app)));
    }
    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      class App {}
      Component({ selector: 'vf-layout-test', standalone: true, imports: [], template: native })(App);
      const markup = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>Layout CSS fixture</title><link rel="stylesheet" href="./layout.css"></head><body><vf-layout-test></vf-layout-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), markup);
    }
  },
};

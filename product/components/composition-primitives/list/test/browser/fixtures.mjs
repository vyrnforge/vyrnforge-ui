import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'list',
  prepare: async ({ port }) => {
    if (port !== 'web' && port !== 'react') return;
    const base = process.cwd();
    const out = path.join(base, 'dist/browser-fixtures/components/list');
    await mkdir(out, { recursive: true });
    const css = [];
    for (const file of [
      'packages/web/dist/styles/tokens.css',
      'packages/web/dist/styles/foundation.css',
      'packages/web/dist/components/list/list.css',
    ]) {
      css.push((await readFile(path.join(base, file), 'utf8'))
        .replace(/^@import\s+["'][^"']+["'];\s*$/gm, ''));
    }
    css.push('body {padding:1rem;font-family:sans-serif; margin:0;}');
    css.push('.list-specimen{max-inline-size:24rem;}');
    css.push('.list-test-scroller{max-block-size:8rem;overflow-y:auto;max-inline-size:24rem;}');
    await writeFile(path.join(out, 'list.css'), css.join('\n'));

    const row = (name, suffix) =>
      '<li data-vf-list-item><div data-vf-list-item-layout>' +
      '<div data-vf-list-item-leading><span aria-hidden="true">' + suffix + '</span></div>' +
      '<div data-vf-list-item-content><strong>' + name + '</strong>' +
      '<p>Long localized description that must wrap at narrow widths</p></div>' +
      '<div data-vf-list-item-trailing><button type="button" aria-label="View ' + name + '">View</button></div>' +
      '</div></li>';
    const web = '<main><h1>List specimens</h1><ul class="list-specimen" id="people" role="list"' +
      ' aria-label="People" data-vf-list data-vf-list-variant="divided" data-vf-list-size="md"' +
      ' data-vf-list-spacing="none" data-vf-list-marker="none">' +
      row('Alex Chen', 'AC') + row('Maria García', 'MG') + '</ul>' +
      '<ol id="steps" role="list" aria-label="Release steps" start="3" data-vf-list' +
      ' data-vf-list-variant="plain" data-vf-list-size="sm" data-vf-list-spacing="none"' +
      ' data-vf-list-marker="auto"><li data-vf-list-item><div data-vf-list-item-layout>' +
      '<div data-vf-list-item-content>Build</div></div></li></ol>';

    let body = web + '<section id="extra" aria-label="Grouped list specimens" tabindex="0" class="list-test-scroller">' +
      '<h2 id="group-a" data-vf-list-subheader data-vf-list-subheader-sticky>Group A</h2>' +
      '<ul id="nested-parent" role="list" aria-labelledby="group-a" data-vf-list data-vf-list-variant="divided" data-vf-list-divider-inset="gutter" data-vf-list-gutter="none" data-vf-list-size="md" data-vf-list-spacing="none" data-vf-list-marker="none" data-vf-list-indent="none">' +
      '<li data-vf-list-item><div data-vf-list-item-layout><div data-vf-list-item-content>Root' +
      '<ul role="list" aria-label="Nested children" data-vf-list data-vf-list-indent="lg" data-vf-list-gutter="sm" data-vf-list-variant="plain" data-vf-list-size="sm" data-vf-list-spacing="none" data-vf-list-marker="auto">' +
      '<li data-vf-list-item><div data-vf-list-item-layout><div data-vf-list-item-content>Nested A</div></div></li>' +
      '</ul></div></div></li><li data-vf-list-item><div data-vf-list-item-layout><div data-vf-list-item-content>Root B</div></div></li></ul>' +
      '<h2 id="group-b" data-vf-list-subheader data-vf-list-subheader-sticky>Group B</h2>' +
      '<ul role="list" aria-labelledby="group-b" data-vf-list><li data-vf-list-item>Final</li></ul>' +
      '</section></main>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToStaticMarkup } = await import('react-dom/server');
      const { List, ListItem } = await import('@vyrnforge/react/list');
      const item = (name, suffix) => h(ListItem, {
        key: name, leading: h('span', { 'aria-hidden': true }, suffix),
        trailing: h('button', { type: 'button', 'aria-label': 'View ' + name }, 'View'),
      }, h('strong', null, name),
      h('p', null, 'Long localized description that must wrap at narrow widths'));
      body = renderToStaticMarkup(h('main', null,
        h('h1', null, 'List specimens'),
        h(List, { id: 'people', className: 'list-specimen', 'aria-label': 'People',
          variant: 'divided' }, item('Alex Chen', 'AC'), item('Maria García', 'MG')),
        h(List, { as: 'ol', id: 'steps', start: 3, marker: 'auto',
          size: 'sm', 'aria-label': 'Release steps' },
        h(ListItem, null, 'Build')),
        h('section', { id: 'extra', className: 'list-test-scroller',
          'aria-label': 'Grouped list specimens', tabIndex: 0 },
          h('h2', { id: 'group-a', 'data-vf-list-subheader': '',
            'data-vf-list-subheader-sticky': '' }, 'Group A'),
          h(List, { id: 'nested-parent', 'aria-labelledby': 'group-a',
            variant: 'divided', dividerInset: 'gutter', gutter: 'none' },
            h(ListItem, null, 'Root', h(List, { 'aria-label': 'Nested children',
              indent: 'lg', gutter: 'sm', size: 'sm', marker: 'auto' },
              h(ListItem, null, 'Nested A'))), h(ListItem, null, 'Root B')),
          h('h2', { id: 'group-b', 'data-vf-list-subheader': '',
            'data-vf-list-subheader-sticky': '' }, 'Group B'),
          h(List, { 'aria-labelledby': 'group-b' }, h(ListItem, null, 'Final')))));
    }
    await writeFile(path.join(out, port + '.html'),
      '<!doctype html><html lang="en" data-vf-density="comfortable"><head>' +
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width">' +
      '<title>VyrnForge List fixture</title>' +
      '<link rel="stylesheet" href="./list.css"></head><body>' + body + '</body></html>');
  },
};

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'chip',
  prepare: async ({ port }) => {
    if (port !== 'web' && port !== 'react') return;
    const root = process.cwd();
    const target = path.join(root, 'dist/browser-fixtures/components/chip');
    await mkdir(target, { recursive: true });
    const paths = ['styles/tokens.css', 'components/button/button.css', 'components/toggle-button/toggle-button.css', 'components/link/link.css', 'components/chip/chip.css'];
    const css = await Promise.all(paths.map(async file => (await readFile(path.join(root, 'packages/web/dist', file), 'utf8')).replace(/^@import\s+["'][^"']+["'];\s*$/gm, '')));
    await writeFile(path.join(target, 'chip.css'), css.join('\n') + '\nbody{background:var(--vf-color-surface);color:var(--vf-color-text)}main{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;padding:1rem;min-inline-size:0;box-sizing:border-box}h1{flex-basis:100%}#long{max-inline-size:100%}');
    const label = value => '<span data-vf-chip-label>' + value + '</span>';
    const close = '<button type="button" data-vf-button data-vf-chip-remove aria-label="Remove React"><span aria-hidden="true">×</span></button>';
    const long = 'A long descriptive category that must remain available to assistive technology';
    let body = '<main><h1>Chip specimens</h1>' +
      '<span id="static" data-vf-chip data-vf-chip-size="sm"><span data-vf-chip-primary>' + label('Engineering') + '</span></span>' +
      '<span id="action" data-vf-chip><button type="button" data-vf-button data-vf-chip-primary>' + label('Open') + '</button></span>' +
      '<span id="filter" data-vf-chip data-vf-chip-tone="accent" data-vf-chip-variant="outlined"><button type="button" data-vf-button data-vf-chip-primary aria-pressed="true"><span data-vf-chip-selection aria-hidden="true">✓</span>' + label('React') + '</button>' + close + '</span>' +
      '<span id="disabled" data-vf-chip data-vf-chip-disabled><button type="button" data-vf-button data-vf-chip-primary disabled>' + label('Unavailable') + '</button></span>' +
      '<span id="long" data-vf-chip data-vf-chip-wrap data-vf-chip-size="lg"><span data-vf-chip-primary>' + label(long) + '</span></span>' +
      '<span id="link" data-vf-chip><a data-vf-chip-primary data-vf-link href="#long">' + label('Documentation') + '</a></span>' +
      '<span id="disabled-link" data-vf-chip data-vf-chip-disabled><a data-vf-chip-primary data-vf-link role="link" aria-disabled="true">' + label('Disabled link') + '</a></span></main>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Chip } = await import('@vyrnforge/react/chip');
      body = renderToString(h('main', null, h('h1', null, 'Chip specimens'),
        h(Chip, { id: 'static', size: 'sm' }, 'Engineering'),
        h(Chip, { id: 'action', onClick() {} }, 'Open'),
        h(Chip, { id: 'filter', tone: 'accent', variant: 'outlined', selectable: true, selected: true, onRemove() {}, removeLabel: 'Remove React' }, 'React'),
        h(Chip, { id: 'disabled', disabled: true, onClick() {} }, 'Unavailable'),
        h(Chip, { id: 'long', size: 'lg', wrap: true }, long),
        h(Chip, { id: 'link', href: '#long' }, 'Documentation'),
        h(Chip, { id: 'disabled-link', href: '#long', disabled: true }, 'Disabled link')));
    }
    await writeFile(path.join(target, port + '.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Chip fixture</title><link rel="stylesheet" href="./chip.css"></head><body>' + body + '</body></html>');
  },
};

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'badge',
  prepare: async ({ port }) => {
    if (port !== 'web' && port !== 'react') return;
    const root = process.cwd();
    const target = path.join(root, 'dist/browser-fixtures/components/badge');
    await mkdir(target, { recursive: true });
    const tokens = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const badge = (await readFile(path.join(root, 'packages/web/dist/components/badge/badge.css'), 'utf8'))
      .replace(/^@import\s+["'][^"']+["'];\s*$/gm, '');
    await writeFile(path.join(target, 'badge.css'), tokens + '\n' + badge +
      '\nmain{display:flex;flex-wrap:wrap;align-items:center;gap:var(--vf-space-xs);min-inline-size:0}' +
      '\nmain>h1{flex-basis:100%;overflow-wrap:anywhere;min-inline-size:0}');
    const web = [
      '<span id="text" data-vf-badge data-vf-badge-appearance="text" data-vf-badge-tone="neutral" data-vf-badge-size="md" data-vf-badge-shape="pill" data-vf-badge-variant="subtle">Draft</span>',
      '<span id="accent" data-vf-badge data-vf-badge-appearance="text" data-vf-badge-tone="accent" data-vf-badge-size="sm" data-vf-badge-shape="rounded" data-vf-badge-variant="subtle">New</span>',
      '<span id="danger" data-vf-badge data-vf-badge-appearance="text" data-vf-badge-tone="danger" data-vf-badge-size="md" data-vf-badge-shape="pill" data-vf-badge-variant="outline">Blocked</span>',
      '<span id="count" data-vf-badge data-vf-badge-appearance="text" data-vf-badge-tone="neutral" data-vf-badge-size="md" data-vf-badge-shape="pill" data-vf-badge-variant="subtle">0</span>',
      '<span id="named-dot" data-vf-badge data-vf-badge-appearance="dot" data-vf-badge-tone="accent" data-vf-badge-size="md" data-vf-badge-shape="pill" data-vf-badge-variant="subtle" role="img" aria-label="Sync in progress"></span>',
      '<span id="decorative-dot" data-vf-badge data-vf-badge-appearance="dot" data-vf-badge-tone="neutral" data-vf-badge-size="md" data-vf-badge-shape="pill" data-vf-badge-variant="subtle" aria-hidden="true"></span><span>Available</span>',
    ].join('\n');
    let body = '<main><h1>Badge presentation</h1>' + web + '</main>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Badge } = await import('@vyrnforge/react/badge');
      body = renderToString(h('main', null,
        h('h1', null, 'Badge presentation'),
        h(Badge, { id: 'text' }, 'Draft'),
        h(Badge, { id: 'accent', tone: 'accent', size: 'sm', shape: 'rounded' }, 'New'),
        h(Badge, { id: 'danger', tone: 'danger', variant: 'outline' }, 'Blocked'),
        h(Badge, { id: 'count' }, 0),
        h(Badge, { id: 'named-dot', appearance: 'dot', tone: 'accent', label: 'Sync in progress' }),
        h(Badge, { id: 'decorative-dot', appearance: 'dot', decorative: true }),
        h('span', null, 'Available')));
    }
    await writeFile(path.join(target, port + '.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width"><title>Badge fixture</title>' +
      '<link rel="stylesheet" href="./badge.css"></head><body>' + body + '</body></html>');
  },
};

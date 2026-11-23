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
      '\nmain{display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;padding:1rem;min-inline-size:0;box-sizing:border-box}' +
      '\nmain>h1{flex-basis:100%;overflow-wrap:anywhere;min-inline-size:0}' +
      '\nmain button{max-inline-size:100%;overflow-wrap:anywhere;white-space:normal}' +
      '\nmain .circle{display:grid;place-items:center;border:1px solid currentColor;border-radius:50%;inline-size:3rem;block-size:3rem}' +
      '\n#wrapped-label [data-vf-badge-indicator]{max-inline-size:calc(var(--vf-space-3xl) + var(--vf-space-md))}');
    const specimen = (id, options, child, value, visible = true) => {
      const attributes = [
        'id="' + id + '"', 'data-vf-badge',
        'data-vf-badge-variant="' + (options.variant || 'standard') + '"',
        'data-vf-badge-tone="' + (options.tone || 'neutral') + '"',
        'data-vf-badge-size="' + (options.size || 'md') + '"',
        'data-vf-badge-overlap="' + (options.overlap || 'rectangular') + '"',
        'data-vf-badge-vertical="' + (options.vertical || 'top') + '"',
        'data-vf-badge-horizontal="' + (options.horizontal || 'end') + '"',
      ].join(' ');
      return '<span ' + attributes + '>' + child +
        '<span data-vf-badge-indicator aria-hidden="true"' + (visible ? '' : ' hidden') +
        '>' + (value || '') + '</span></span>';
    };
    let body = '<main><h1>Badge indicators</h1>' + [
      specimen('size-sm', { size: 'sm' },
        '<button aria-label="Small, seven updates">Small</button>', '7'),
      specimen('size-lg', { size: 'lg' },
        '<button aria-label="Large, 42 updates">Large</button>', '42'),
      specimen('dot-sm', { variant: 'dot', size: 'sm' },
        '<button aria-label="Small dot, active">Small dot</button>', ''),
      specimen('dot-lg', { variant: 'dot', size: 'lg' },
        '<button aria-label="Large dot, active">Large dot</button>', ''),
      specimen('count', { tone: 'accent' },
        '<button aria-label="Inbox, 4 unread messages">Inbox</button>', '4'),
      specimen('max', { tone: 'danger' },
        '<button aria-label="Mail, 120 unread messages">Mail</button>', '99+'),
      specimen('dot', { variant: 'dot', tone: 'danger' },
        '<button aria-label="Notifications, new items">Notifications</button>', ''),
      specimen('zero', {}, '<button aria-label="Empty inbox">Empty</button>', '0', false),
      specimen('show-zero', {}, '<button aria-label="Zero items">Zero</button>', '0'),
      specimen('invisible', {}, '<button aria-label="Hidden, seven unread">Hidden</button>', '7', false),
      specimen('start', { horizontal: 'start' },
        '<button aria-label="Start, one update">Start</button>', '1'),
      specimen('end-bottom', { vertical: 'bottom', horizontal: 'end' },
        '<button aria-label="End, two updates">End</button>', '2'),
      specimen('circle', { variant: 'dot', overlap: 'circular', tone: 'accent' },
        '<span class="circle" role="img" aria-label="Profile, active">AB</span>', ''),
      specimen('new-label', {},
        '<button aria-label="Files, new upload">Files</button>', 'NEW'),
      specimen('wrapped-label', { tone: 'accent' },
        '<button aria-label="Review, pending review">Review</button>', 'PENDING REVIEW'),
    ].join('\n') + '</main>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Badge } = await import('@vyrnforge/react/badge');
      const button = (label, text) => h('button', { 'aria-label': label }, text);
      body = renderToString(h('main', null,
        h('h1', null, 'Badge indicators'),
        h(Badge, { id: 'size-sm', badgeContent: 7, size: 'sm' },
          button('Small, seven updates', 'Small')),
        h(Badge, { id: 'size-lg', badgeContent: 42, size: 'lg' },
          button('Large, 42 updates', 'Large')),
        h(Badge, { id: 'dot-sm', variant: 'dot', size: 'sm' },
          button('Small dot, active', 'Small dot')),
        h(Badge, { id: 'dot-lg', variant: 'dot', size: 'lg' },
          button('Large dot, active', 'Large dot')),
        h(Badge, { id: 'count', badgeContent: 4, tone: 'accent' },
          button('Inbox, 4 unread messages', 'Inbox')),
        h(Badge, { id: 'max', badgeContent: 120, tone: 'danger' },
          button('Mail, 120 unread messages', 'Mail')),
        h(Badge, { id: 'dot', variant: 'dot', tone: 'danger' },
          button('Notifications, new items', 'Notifications')),
        h(Badge, { id: 'zero', badgeContent: 0 },
          button('Empty inbox', 'Empty')),
        h(Badge, { id: 'show-zero', badgeContent: 0, showZero: true },
          button('Zero items', 'Zero')),
        h(Badge, { id: 'invisible', badgeContent: 7, invisible: true },
          button('Hidden, seven unread', 'Hidden')),
        h(Badge, { id: 'start', badgeContent: 1,
          anchorOrigin: { vertical: 'top', horizontal: 'start' } },
          button('Start, one update', 'Start')),
        h(Badge, { id: 'end-bottom', badgeContent: 2,
          anchorOrigin: { vertical: 'bottom', horizontal: 'end' } },
          button('End, two updates', 'End')),
        h(Badge, { id: 'circle', variant: 'dot', overlap: 'circular', tone: 'accent' },
          h('span', { className: 'circle', role: 'img', 'aria-label': 'Profile, active' }, 'AB')),
        h(Badge, { id: 'new-label', badgeContent: 'NEW' },
          button('Files, new upload', 'Files')),
        h(Badge, { id: 'wrapped-label', badgeContent: 'PENDING REVIEW', tone: 'accent' },
          button('Review, pending review', 'Review'))));
    }
    await writeFile(path.join(target, port + '.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width"><title>Badge fixture</title>' +
      '<link rel="stylesheet" href="./badge.css"></head><body>' + body + '</body></html>');
  },
};

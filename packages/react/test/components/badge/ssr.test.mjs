import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '@vyrnforge/react/badge';
import { Badge as RootBadge } from '@vyrnforge/react';

const target = (name) => createElement('button', { type: 'button', 'aria-label': name }, 'Inbox');

test('Badge SSR preserves wrapped native button and puts count only in visual indicator', () => {
  const html = renderToStaticMarkup(createElement(Badge, {
    badgeContent: 4, tone: 'accent', size: 'sm', id: 'mail', className: 'metadata',
  }, target('Inbox, 4 unread messages')));
  assert.match(html, /^<span\b/);
  assert.match(html, /data-vf-badge-tone="accent"/);
  assert.match(html, /data-vf-badge-size="sm"/);
  assert.match(html, /id="mail"/);
  assert.match(html, /class="metadata"/);
  assert.match(html, /<button type="button" aria-label="Inbox, 4 unread messages">Inbox<\/button>/);
  assert.match(html, /data-vf-badge-indicator="" aria-hidden="true">4<\/span>/);
  assert.doesNotMatch(html, /role="status"|aria-live=|tabindex=/i);
});

test('numeric maximum caps display; zero hides unless showZero; invisible hides only indicator', () => {
  const cap = renderToStaticMarkup(createElement(RootBadge, {
    badgeContent: 120, max: 99,
  }, target('Inbox, 120 unread messages')));
  assert.match(cap, /aria-hidden="true">99\+<\/span>/);
  assert.match(cap, /aria-label="Inbox, 120 unread messages"/);
  const zero = renderToStaticMarkup(createElement(Badge, {
    badgeContent: 0,
  }, target('Inbox, no unread messages')));
  assert.match(zero, /data-vf-badge-indicator="" aria-hidden="true" hidden=""/);
  const shown = renderToStaticMarkup(createElement(Badge, {
    badgeContent: 0, showZero: true,
  }, target('Inbox, zero unread messages')));
  assert.match(shown, /aria-hidden="true">0<\/span>/);
  const hidden = renderToStaticMarkup(createElement(Badge, {
    badgeContent: 7, invisible: true,
  }, target('Inbox, 7 unread messages')));
  assert.match(hidden, /data-vf-badge-indicator="" aria-hidden="true" hidden=""/);
  assert.match(hidden, /<button type="button"/);
});

test('dot has no accessible duplicate or implicit focus target', () => {
  const html = renderToStaticMarkup(createElement(Badge, {
    variant: 'dot', tone: 'danger', anchorOrigin: { vertical: 'bottom', horizontal: 'start' },
    overlap: 'circular',
  }, target('Notifications, new items')));
  assert.match(html, /data-vf-badge-variant="dot"/);
  assert.match(html, /data-vf-badge-vertical="bottom"/);
  assert.match(html, /data-vf-badge-horizontal="start"/);
  assert.match(html, /data-vf-badge-overlap="circular"/);
  assert.match(html, /data-vf-badge-indicator="" aria-hidden="true"><\/span>/);
  assert.doesNotMatch(html, /role="img"|role="status"|aria-live=|tabindex=/i);
});

test('large indicator sizing is presentational and keeps the wrapped target intact', () => {
  const count = renderToStaticMarkup(createElement(Badge, {
    badgeContent: 42, size: 'lg',
  }, target('Inbox, 42 unread messages')));
  assert.match(count, /data-vf-badge-size="lg"/);
  assert.match(count, /aria-label="Inbox, 42 unread messages"/);
  const dot = renderToStaticMarkup(createElement(Badge, {
    variant: 'dot', size: 'lg',
  }, target('Notifications, new items')));
  assert.match(dot, /data-vf-badge-variant="dot"/);
  assert.match(dot, /data-vf-badge-size="lg"/);
  assert.match(dot, /aria-hidden="true"/);
});

test('logical positioning produces deterministic SSR output without browser globals', () => {
  for (const vertical of ['top', 'bottom']) {
    for (const horizontal of ['start', 'end']) {
      const html = renderToStaticMarkup(createElement(Badge, {
        badgeContent: 'NEW', anchorOrigin: { vertical, horizontal }, overlap: 'rectangular',
      }, createElement('span', null, 'Item')));
      assert.match(html, new RegExp('data-vf-badge-vertical="' + vertical + '"'));
      assert.match(html, new RegExp('data-vf-badge-horizontal="' + horizontal + '"'));
      assert.match(html, /data-vf-badge-overlap="rectangular"/);
      assert.match(html, /aria-hidden="true">NEW<\/span>/);
    }
  }
});

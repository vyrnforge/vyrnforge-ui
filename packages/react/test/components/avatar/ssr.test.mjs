import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '@vyrnforge/react/avatar';
import { Avatar as RootAvatar } from '@vyrnforge/react';

test('Avatar initials SSR uses native accessible image-like host with deterministic fallback', () => {
  const html = renderToStaticMarkup(createElement(Avatar, {
    id: 'ada', name: 'Ada Lovelace', className: 'person', size: 'sm',
  }));
  assert.match(html, /<span[^>]*role="img"[^>]*aria-label="Ada Lovelace"/);
  assert.match(html, /data-vf-avatar=""/);
  assert.match(html, /data-vf-avatar-size="sm"/);
  assert.match(html, /data-vf-avatar-initials=""/);
  assert.match(html, />AL<\/span>/);
  assert.doesNotMatch(html, /<img|tabindex=|src=/);
  assert.match(html, /id="ada"/);
});

test('Avatar SSR includes native decorative image and retains a visible initials fallback', () => {
  const html = renderToStaticMarkup(createElement(Avatar, {
    name: 'Alex Chen', src: '/alex.webp', initials: 'AC', size: 'lg',
    loading: 'lazy', decoding: 'async', srcSet: '/alex-2x.webp 2x', sizes: '48px',
  }));
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Alex Chen"/);
  assert.match(html, /data-vf-avatar-initials=""/);
  assert.match(html, />AC<\/span>/);
  assert.match(html, /<img[^>]*data-vf-avatar-image/);
  assert.match(html, /alt=""/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /srcSet="\/alex-2x.webp 2x"|srcSet=|srcset=/i);
});

test('Avatar accessible identity does not double-announce image and initials', () => {
  const html = renderToStaticMarkup(createElement(RootAvatar, {
    name: 'Maria García', initials: 'MG', decorative: true,
  }));
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /role="img"|aria-label=/);
  assert.match(html, />MG<\/span>/);
});

test('Avatar handles names with one word and authored locale initials without inventing data', () => {
  const oneWord = renderToStaticMarkup(createElement(Avatar, { name: 'Ada' }));
  assert.match(oneWord, />A<\/span>/);
  const localized = renderToStaticMarkup(createElement(Avatar, { name: '李 小明', initials: '李明' }));
  assert.match(localized, />李明<\/span>/);
});

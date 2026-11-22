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

test('Avatar icon appearance uses one named host and decorative icon content', async () => {
  const { Avatar } = await import('@vyrnforge/react/avatar');
  const html = renderToStaticMarkup(createElement(Avatar, {
    name: 'Anonymous member', appearance: 'icon', shape: 'square',
    icon: createElement('svg', { viewBox: '0 0 24 24' }, createElement('circle', { cx: 12, cy: 12, r: 8 })),
  }));
  assert.match(html, /data-vf-avatar-appearance="icon"/);
  assert.match(html, /data-vf-avatar-shape="square"/);
  assert.match(html, /data-vf-avatar-icon=""/);
  assert.match(html, /aria-label="Anonymous member"/);
  assert.doesNotMatch(html, /data-vf-avatar-image|data-vf-avatar-initials/);
});

test('Avatar can use a supplied icon as the fallback under a native image', () => {
  const html = renderToStaticMarkup(createElement(Avatar, {
    name: 'Alex Chen', src: '/alex.webp', fallback: 'icon',
    icon: createElement('svg', { viewBox: '0 0 24 24' }),
  }));
  assert.match(html, /<img[^>]*alt=""/);
  assert.match(html, /data-vf-avatar-icon=""/);
  assert.doesNotMatch(html, /data-vf-avatar-initials/);
  const letter = renderToStaticMarkup(createElement(Avatar, {
    name: 'Alex Chen', src: '/alex.webp', fallback: 'icon',
  }));
  assert.match(letter, /data-vf-avatar-initials=""/);
});

test('AvatarGroup SSR has a labeled native list, size inheritance and localized surplus', async () => {
  const { AvatarGroup } = await import('@vyrnforge/react/avatar');
  const html = renderToStaticMarkup(createElement(AvatarGroup, {
    id: 'reviewers', label: 'Review team', limit: 2, total: 7,
    size: 'lg', shape: 'square', spacing: 'md',
    formatOverflow: (count) => count + ' more reviewers',
  }, [
    createElement(Avatar, { key: 'ada', name: 'Ada Lovelace' }),
    createElement(Avatar, { key: 'alex', name: 'Alex Chen', size: 'sm' }),
    createElement(Avatar, { key: 'maria', name: 'Maria García' }),
  ]));
  assert.match(html, /^<ul\b/);
  assert.match(html, /role="list"/);
  assert.match(html, /aria-label="Review team"/);
  assert.match(html, /data-vf-avatar-group-spacing="md"/);
  assert.equal((html.match(/<li\b/g) ?? []).length, 3);
  assert.match(html, /aria-label="Ada Lovelace"[^>]*data-vf-avatar/);
  assert.match(html, /data-vf-avatar-size="lg"/);
  assert.match(html, /data-vf-avatar-size="sm"/);
  assert.match(html, /data-vf-avatar-shape="square"/);
  assert.doesNotMatch(html, /aria-label="Maria García"/);
  assert.match(html, /data-vf-avatar-overflow=""/);
  assert.match(html, /aria-label="5 more reviewers"/);
  assert.match(html, />\+5<\/span>/);
});

test('AvatarGroup truncation clamps counts, avoids unknown labels and supports no visible members', async () => {
  const { AvatarGroup } = await import('@vyrnforge/react/avatar');
  const children = [
    createElement(Avatar, { key: 'one', name: 'Ada Lovelace' }),
    createElement(Avatar, { key: 'two', name: 'Alex Chen' }),
  ];
  const html = renderToStaticMarkup(createElement(AvatarGroup, {
    label: 'Contributors', limit: 0, total: 1,
  }, children));
  assert.equal((html.match(/<li\b/g) ?? []).length, 1);
  assert.match(html, /aria-label="\+2"/);
  assert.match(html, />\+2<\/span>/);
  assert.doesNotMatch(html, /aria-label="Ada Lovelace"/);
  const full = renderToStaticMarkup(createElement(AvatarGroup, {
    label: 'Contributors', total: 2,
  }, children));
  assert.equal((full.match(/<li\b/g) ?? []).length, 2);
  assert.doesNotMatch(full, /data-vf-avatar-overflow/);
});

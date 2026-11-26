import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip } from '@vyrnforge/react/chip';
import { Chip as RootChip } from '@vyrnforge/react';

test('static Chip has readable text and no synthetic interactive semantics', () => {
  const html = renderToStaticMarkup(h(RootChip, { tone: 'accent', size: 'sm', variant: 'outlined' }, 'Draft'));
  assert.match(html, /^<span\b/);
  assert.match(html, /data-vf-chip-tone="accent"/);
  assert.match(html, /data-vf-chip-label="">Draft<\/span>/);
  assert.doesNotMatch(html, /<button|aria-pressed|tabindex|aria-live/i);
});

test('selectable and removable actions are sibling native controls', () => {
  const html = renderToStaticMarkup(h(Chip, { selectable: true, selected: true, onRemove() {}, removeLabel: 'Remove Design' }, 'Design'));
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-label="Remove Design"/);
  assert.match(html, /<\/button><button/);
  assert.equal((html.match(/type="button"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /aria-live|role="listbox"/);
});

test('disabled selection and removal are both native disabled buttons', () => {
  const html = renderToStaticMarkup(h(Chip, { selectable: true, defaultSelected: true, disabled: true, onRemove() {}, removeLabel: 'Remove Draft' }, 'Draft'));
  assert.equal((html.match(/disabled=""/g) ?? []).length, 3); // root marker + two native buttons
  assert.match(html, /aria-pressed="true"/);
});

test('wrap keeps the full accessible text and selection mark is decorative', () => {
  const html = renderToStaticMarkup(h(Chip, { selectable: true, wrap: true }, 'Long label that must remain available'));
  assert.match(html, /data-vf-chip-wrap=""/);
  assert.match(html, /aria-hidden="true">✓/);
  assert.match(html, /Long label that must remain available/);
});

test('link Chip renders a native anchor and sibling removal button', () => {
  const html = renderToStaticMarkup(h(Chip, { href: '/docs', target: '_blank', rel: 'noopener', onRemove() {}, removeLabel: 'Remove Docs' }, 'Docs'));
  assert.match(html, /<a[^>]*href="\/docs"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /<\/a><button/);
  assert.doesNotMatch(html, /aria-pressed/);
});
test('disabled link Chip cannot navigate and is not a tab stop', () => {
  const html = renderToStaticMarkup(h(Chip, { href: '/docs', disabled: true }, 'Docs'));
  assert.match(html, /role="link"/);
  assert.match(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /href=|tabindex=/i);
});

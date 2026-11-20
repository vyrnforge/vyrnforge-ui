import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Code, CodeBlock } from '@vyrnforge/react/code';
import { Code as RootCode, CodeBlock as RootCodeBlock } from '@vyrnforge/react';

test('Code and CodeBlock are the same public components at root and subpath', () => {
  assert.equal(Code, RootCode);
  assert.equal(CodeBlock, RootCodeBlock);
});

test('Code preserves native inline semantics and HTML attributes without extra layout', () => {
  const markup = renderToStaticMarkup(h(Code, {
    id: 'command', lang: 'en', dir: 'ltr', className: 'consumer-code',
    title: 'CLI command', 'aria-label': 'Install command',
  }, 'pnpm test'));
  assert.match(markup, /^<code /);
  assert.match(markup, /data-vf-code=""/);
  assert.match(markup, /id="command"/);
  assert.match(markup, /class="consumer-code"/);
  assert.match(markup, /aria-label="Install command"/);
  assert.match(markup, />pnpm test<\/code>$/);
  assert.doesNotMatch(markup, /data-vf-text/);
  assert.doesNotMatch(markup, /role=|tabindex=/);
});

test('Code composes explicit native Text hooks only when requested', () => {
  const markup = renderToStaticMarkup(h(Code, { variant: 'body-lg' }, 'const x = 1'));
  assert.match(markup, /data-vf-code=""/);
  assert.match(markup, /data-vf-text=""/);
  assert.match(markup, /data-vf-text-variant="body-lg"/);
  assert.doesNotMatch(markup, /\svariant=/);
});

test('CodeBlock preserves pre > code semantics, native props and text order', () => {
  const markup = renderToStaticMarkup(h(CodeBlock, { id: 'block', dir: 'ltr', 'aria-label': 'Example' }, 'pnpm build\npnpm test'));
  assert.match(markup, /^<pre /);
  assert.match(markup, /data-vf-code-block=""/);
  assert.match(markup, /aria-label="Example"/);
  assert.match(markup, /<code>pnpm build\npnpm test<\/code><\/pre>$/);
  assert.doesNotMatch(markup, /role=|button|contenteditable=/);
});

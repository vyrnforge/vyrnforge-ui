import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Container, Stack } from '@vyrnforge/react/layout';

test('React layout primitives preserve semantic elements and emit the shared DOM contract during SSR', () => {
  const html = renderToStaticMarkup(
    createElement(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' },
      createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' }, 'Content')
    )
  );
  assert.match(html, /^<main/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /data-vf-container-gutter="md"/);
  assert.match(html, /<section[^>]*data-vf-stack/);
  assert.match(html, /data-vf-stack-gap="lg"/);
  assert.match(html, />Content<\/section><\/main>$/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Cluster, Container, Stack } from '@vyrnforge/react/layout';

test('React layout primitives preserve semantic elements and emit distinct shared DOM contracts during SSR', () => {
  const html = renderToStaticMarkup(
    createElement(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' },
      createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' },
        createElement(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, 'Actions')
      )
    )
  );
  assert.match(html, /^<main/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /<section[^>]*data-vf-stack/);
  assert.doesNotMatch(html, /data-vf-stack-direction/);
  assert.match(html, /<div[^>]*data-vf-cluster/);
  assert.match(html, /data-vf-cluster-gap="sm"/);
});

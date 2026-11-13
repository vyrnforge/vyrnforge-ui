import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AutoGrid, Cluster, Container, ControlGroup, Inline, Stack } from '@vyrnforge/react/layout';

test('React SSR preserves the six L3 composition contracts without manufacturing semantics', () => {
  const html = renderToStaticMarkup(
    createElement(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' },
      createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' },
        createElement(AutoGrid, { as: 'section', id: 'auto-grid', gap: 'md' }, 'Cards'),
        createElement(Inline, { id: 'inline', gap: 'sm' }, 'Inline'),
        createElement(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, 'Actions'),
        createElement(ControlGroup, { as: 'div', id: 'control-group', orientation: 'vertical' }, createElement('button', { type: 'button' }, 'Previous'), createElement('button', { type: 'button' }, 'Next')),
      )
    )
  );

  for (const hook of ['container', 'stack', 'auto-grid', 'inline', 'cluster', 'control-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  for (const retired of ['grid', 'aspect-ratio', 'field', 'fieldset', 'radio-group']) {
    assert.doesNotMatch(html, new RegExp(`data-vf-${retired}(?:\\s|=)`));
  }
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
});

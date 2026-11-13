import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AspectRatio, Cluster, Container, ControlGroup, Field, Fieldset, Grid, Inline, RadioGroup, Stack } from '@vyrnforge/react/layout';

test('React SSR preserves all ten L3 composition contracts without manufacturing behavior', () => {
  const html = renderToStaticMarkup(
    createElement(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' },
      createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' },
        createElement(Grid, { as: 'section', id: 'grid', gap: 'md' }, 'Cards'),
        createElement(Inline, { id: 'inline', gap: 'sm' }, 'Inline'),
        createElement(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, 'Actions'),
        createElement(AspectRatio, { id: 'ratio', ratio: 'video' }),
        createElement(Field, { id: 'field', gap: 'xs' }, createElement('label', { htmlFor: 'email' }, 'Email'), createElement('input', { id: 'email' })),
        createElement(Fieldset, { id: 'fieldset', gap: 'sm' }, createElement('legend', null, 'Profile'), createElement('input', { name: 'displayName' })),
        createElement(ControlGroup, { id: 'control-group', orientation: 'vertical' }, createElement('button', { type: 'button' }, 'Previous'), createElement('button', { type: 'button' }, 'Next')),
        createElement(RadioGroup, { id: 'radio-group', gap: 'sm', orientation: 'horizontal' }, createElement('legend', null, 'Plan'), createElement('label', null, createElement('input', { type: 'radio', name: 'plan', value: 'basic' }), 'Basic'))
      )
    )
  );

  for (const hook of ['container', 'stack', 'grid', 'inline', 'cluster', 'aspect-ratio', 'field', 'fieldset', 'control-group', 'radio-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  assert.match(html, /<fieldset[^>]*id="fieldset"/);
  assert.match(html, /<fieldset[^>]*id="radio-group"/);
  assert.match(html, /<legend>Profile<\/legend>/);
  assert.match(html, /<legend>Plan<\/legend>/);
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
  assert.match(html, /data-vf-radio-group-orientation="horizontal"/);
});

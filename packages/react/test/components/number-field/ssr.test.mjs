import { test } from 'vitest';import assert from'node:assert/strict';test('React NumberField subpath is SSR-safe',async()=>{const api=await import('@vyrnforge/react/number-field');assert.ok(Object.keys(api).length>0);});

test('React NumberField server markup is one labeled native numeric input', async () => {
  const { NumberField } = await import('@vyrnforge/react/number-field');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = renderToStaticMarkup(createElement(NumberField, {
    id: 'qty', label: 'Quantity', name: 'qty', defaultValue: 2, min: 0, max: 10,
    stepControls: 'horizontal', incrementLabel: 'Add item', decrementLabel: 'Remove item',
  }));
  assert.match(html, /<label[^>]*for="qty"/);
  assert.match(html, /<input[^>]*type="number"/);
  assert.equal((html.match(/<input\b/g) || []).length, 1);
  assert.match(html, /aria-label="Add item"/);
  assert.match(html, /aria-label="Remove item"/);
});

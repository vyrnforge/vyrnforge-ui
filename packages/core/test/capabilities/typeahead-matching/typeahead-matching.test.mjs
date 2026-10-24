import test from 'node:test';
import assert from 'node:assert/strict';
import { findTypeaheadMatch, normalizeTypeaheadText } from '../../../dist/capabilities/typeahead-matching/index.js';

test('typeahead normalizes text, skips disabled items, starts after current item, and wraps', () => {
  const items = [{ textValue: 'Álpha' }, { textValue: 'Beta', disabled: true }, { textValue: 'Blueberry' }, { textValue: 'Cherry' }];
  assert.equal(normalizeTypeaheadText('  ÁLpha  '), 'alpha');
  assert.equal(findTypeaheadMatch(items, 'bl', { startIndex: 0 }), 2);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2 }), 0);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2, wrap: false }), null);
  assert.equal(findTypeaheadMatch(items, 'be'), null);
});

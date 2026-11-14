import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { test } from 'vitest';

const families = [
  { family: 'compound-fields', shared: 'compound-fields', ids: ['number-field', 'password-field', 'search-field', 'color-picker'], part: 'root' },
  { family: 'choice-value', shared: 'choice-controls', ids: ['toggle-group', 'segmented-control'], part: 'root' },
  { family: 'commands-actions', shared: 'command-menu', ids: ['menu', 'context-menu', 'split-button'], part: 'content' },
];

test('L5 public styles independently resolve private shared family styles', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  for (const { family, shared, ids, part } of families) {
    assert.equal(manifest.exports['./styles/' + shared + '.css'], undefined, shared + ' stays private');
    for (const id of ids) {
      const path = '../../../../product/components/composite-widgets/' + family + '/' + id + '/web/' + id + '.css';
      const source = await readFile(new URL(path, import.meta.url), 'utf8');
      assert.ok(source.includes("'../../styles/" + shared + ".css'"), id + ' must explicitly import its shared CSS');
      for (const other of ids.filter((candidate) => candidate !== id)) {
        assert.ok(!source.includes('data-vf-' + other + '-'), id + ' must not own ' + other + ' selectors');
      }
      const result = await build({
        stdin: { contents: '@import "@vyrnforge/web/styles/' + id + '.css";', resolveDir: process.cwd(), loader: 'css' },
        bundle: true,
        write: false,
        outfile: id + '.css',
      });
      const css = result.outputFiles[0].text;
      assert.ok(css.includes('[data-vf-' + id + '-' + part + ']'), id + ' isolated bundle must include its shared part styling');
    }
  }
});

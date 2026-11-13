import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('visually-hidden remains a foundation accessibility hook without a standalone component export', async () => {
  const [foundation, webPackage] = await Promise.all([
    readFile(new URL('../../src/styles/foundation.css', import.meta.url), 'utf8'),
    readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  ]);
  const manifest = JSON.parse(webPackage);

  assert.match(foundation, /\[data-vf-visually-hidden\]/);
  assert.match(foundation, /clip-path:\s*inset\(50%\)/);
  assert.match(foundation, /position:\s*absolute/);
  assert.match(foundation, /overflow:\s*hidden/);
  assert.doesNotMatch(foundation, /\[data-vf-visually-hidden\][^{]*\{[^}]*display:\s*none/s);
  assert.doesNotMatch(foundation, /\[data-vf-visually-hidden\][^{]*\{[^}]*visibility:\s*hidden/s);
  assert.equal(manifest.exports['./styles/visually-hidden.css'], undefined);
  assert.ok(manifest.exports['./styles/foundation.css']);
});

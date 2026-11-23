import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('Motion effects extend the existing public foundation without a new component export', async () => {
  const [manifestRaw, motion, foundation, aggregate] = await Promise.all([
    readFile(new URL('../../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/motion.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/foundation.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles.css', import.meta.url), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.exports['./styles/motion.css'], undefined);
  assert.match(aggregate, /@import "\.\/styles\/foundation\.css";/);
  assert.match(foundation, /@import "\.\/motion\.css";/, 'the shared foundation reuses its private effect recipes');
  for (const name of ['fade', 'grow', 'slide', 'zoom', 'fade-slide', 'pop']) {
    assert.ok(motion.includes('[data-vf-motion="' + name + '"]'), 'missing motion recipe ' + name);
  }
  for (const variable of ['--vf-control-motion-duration', '--vf-motion-easing-standard', '--vf-motion-distance']) {
    assert.ok(motion.includes(variable), 'missing shared or scoped token ' + variable);
  }
  for (const side of ['block-start', 'inline-start', 'inline-end']) {
    assert.ok(motion.includes('data-vf-motion-direction="' + side + '"'));
  }
  assert.match(motion, /:dir\(rtl\)/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
  assert.match(motion, /animation:\s*none;/);
  assert.doesNotMatch(motion, /transitionend|animationend|setTimeout|display:\s*none/);
});

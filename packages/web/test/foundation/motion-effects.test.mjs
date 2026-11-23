import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('Motion effects are one optional, public, framework-neutral Web stylesheet', async () => {
  const [manifestRaw, motion, foundation, aggregate] = await Promise.all([
    readFile(new URL('../../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/motion.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/foundation.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles.css', import.meta.url), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.exports['./styles/motion.css'], './dist/styles/motion.css');
  assert.match(aggregate, /@import "\.\/styles\/motion\.css";/);
  assert.doesNotMatch(foundation, /@import "\.\/motion\.css";/, 'the opt-in effect pack is not loaded by the minimal foundation');
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

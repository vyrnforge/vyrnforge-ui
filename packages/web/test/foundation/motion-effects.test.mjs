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
  for (const variable of ['--vf-motion-duration-enter', '--vf-motion-easing-standard', '--vf-motion-distance']) {
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

test('Component state motion reuses canonical recipes and avoids layout or visibility transitions', async () => {
  const source = new URL('../../../../', import.meta.url);
  const css = [
    ['product/components/composite-widgets/transient-surfaces/dialog/web/dialog.css', '[data-vf-dialog-root][open]'],
    ['product/components/composite-widgets/transient-surfaces/drawer/web/drawer.css', '[data-vf-drawer-root][open]'],
    ['product/components/composite-widgets/transient-surfaces/popover/web/popover.css', '[data-vf-popover-content]:popover-open'],
    ['product/components/composite-widgets/transient-surfaces/tooltip/web/tooltip.css', '[data-vf-tooltip-content]:popover-open'],
    ['product/components/composite-widgets/transient-surfaces/preview-card/web/preview-card.css', '[data-vf-preview-card-content]:popover-open'],
    ['packages/web/src/styles/selection.css', '[data-vf-combobox-content]:popover-open'],
    ['packages/web/src/styles/command-menu.css', '[data-vf-menu-content]:popover-open'],
    ['product/components/composite-widgets/disclosure-view-switching/accordion/web/accordion.css', '[data-vf-accordion-panel]:not([hidden])'],
    ['product/components/composite-widgets/disclosure-view-switching/disclosure/web/disclosure.css', '[data-vf-disclosure-panel]:not([hidden])'],
    ['product/components/composite-widgets/disclosure-view-switching/tabs/web/tabs.css', '[data-vf-tabs-panel]:not([hidden])'],
    ['product/components/composite-widgets/content-navigation/carousel/web/carousel.css', '[data-vf-carousel-slide]:not([hidden])'],
    ['product/components/composite-widgets/feedback/toast/web/toast.css', '[data-vf-toast-root]:not([hidden])'],
  ];
  for (const [file, selector] of css) {
    const text = await readFile(new URL(file, source), 'utf8');
    assert.ok(text.includes(selector), file + ' must bind motion to committed visibility');
    assert.match(text, /@media \(prefers-reduced-motion: no-preference\) and \(forced-colors: none\)/);
    assert.match(text, /animation: vf-motion-enter-reveal var\(--vf-motion-duration-enter/);
    assert.doesNotMatch(text, /@keyframes|transition:\s*(?:all|display|visibility|overlay)\b|allow-discrete/);
  }
  const motion = await readFile(new URL('../../src/styles/motion.css', import.meta.url), 'utf8');
  assert.match(motion, /@keyframes vf-motion-enter-reveal\s*\{\s*from\s*\{\s*opacity: 0\.85;/);
});

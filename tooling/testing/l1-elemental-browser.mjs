import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import axeCore from 'axe-core';

const tokens = await readFile('packages/web/src/styles/tokens.css', 'utf8');
const elemental = await readFile('packages/web/src/styles/elemental-primitives.css', 'utf8');
const css = elemental.replace('@import "./tokens.css";\n', '');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>L1 elemental primitive fixture</title><style>${tokens}\n${css}</style></head><body><main><h1>L1 elemental primitive fixture</h1>
<p><code id="code" data-vf-code>const value = true;</code> <kbd id="kbd" data-vf-kbd>Enter</kbd> <mark id="mark" data-vf-mark>highlight</mark></p>
<pre id="code-block" data-vf-code-block><code>npm run check</code></pre>
<img id="image" data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%238b96aa'/%3E%3C/svg%3E" alt="Sample placeholder">
<div id="skeleton" data-vf-skeleton aria-hidden="true"></div>
<span id="swatch" data-vf-color-swatch style="--vf-color-swatch: rgb(36 87 214)" role="img" aria-label="Brand blue"></span>
<article id="prose" data-vf-prose><h2>Native prose</h2><p>Paragraph with <strong>strong text</strong>, <em>emphasis</em>, <q>a quote</q>, <time datetime="2026-10-22">a date</time>, <code>code</code>, <kbd>Ctrl</kbd>, and <mark>mark</mark>.</p><blockquote>Block quotation</blockquote><figure><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E" alt=""><figcaption>Figure caption</figcaption></figure><ul><li>One</li><li>Two</li></ul><p><small>Small text</small> H<sub>2</sub>O x<sup>2</sup> <abbr title="Application Programming Interface">API</abbr> <cite>Source</cite></p><address>Example address</address></article>
<div aria-hidden="true"><span id="checkmark" class="_vf-checkmark"></span><span id="radiomark" class="_vf-radiomark"></span><span id="selection" class="_vf-selection-indicator"></span></div>
</main></body></html>`);

const evidence = await page.evaluate(() => {
  const style = (id) => getComputedStyle(document.getElementById(id));
  return {
    codeFont: style('code').fontFamily,
    codeBackground: style('code').backgroundColor,
    kbdDisplay: style('kbd').display,
    imageMax: style('image').maxInlineSize,
    skeletonAnimation: style('skeleton').animationName,
    swatchWidth: style('swatch').width,
    proseHeadingWeight: getComputedStyle(document.querySelector('#prose h2')).fontWeight,
    blockquoteBorder: getComputedStyle(document.querySelector('#prose blockquote')).borderInlineStartWidth,
    checkmarkWidth: style('checkmark').width,
    radiomarkRadius: style('radiomark').borderRadius,
    selectionBackground: style('selection').backgroundColor,
    skeletonAriaHidden: document.getElementById('skeleton').getAttribute('aria-hidden'),
    nativeTags: ['blockquote', 'q', 'figure', 'figcaption', 'ul', 'li', 'strong', 'em', 'small', 'sub', 'sup', 'abbr', 'address', 'cite', 'time'].every((tag) => document.querySelector(`#prose ${tag}`)),
  };
});

assert.match(evidence.codeFont, /mono/i);
assert.notEqual(evidence.codeBackground, 'rgba(0, 0, 0, 0)');
assert.equal(evidence.kbdDisplay, 'inline-block');
assert.equal(evidence.imageMax, '100%');
assert.equal(evidence.skeletonAnimation, 'vf-skeleton-pulse');
assert.equal(evidence.swatchWidth, '20px');
assert.equal(evidence.proseHeadingWeight, '600');
assert.equal(evidence.blockquoteBorder, '1px');
assert.equal(evidence.checkmarkWidth, '8px');
assert.notEqual(evidence.radiomarkRadius, '0px');
assert.notEqual(evidence.selectionBackground, 'rgba(0, 0, 0, 0)');
assert.equal(evidence.skeletonAriaHidden, 'true');
assert.equal(evidence.nativeTags, true);

await page.addScriptTag({ content: axeCore.source });
const axe = await page.evaluate(async () => globalThis.axe.run(document));
assert.deepEqual(axe.violations, []);

await page.emulateMedia({ reducedMotion: 'reduce' });
assert.equal(await page.locator('#skeleton').evaluate((element) => getComputedStyle(element).animationName), 'none');

await browser.close();
process.stdout.write('L1 elemental browser evidence: passed\n');

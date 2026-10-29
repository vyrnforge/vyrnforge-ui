import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'elemental-primitives',
  prepare: async ({ port }) => {
    if (port !== 'web') return false;

    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/elemental-primitives');
    await mkdir(outDir, { recursive: true });
    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const elementalCss = (await readFile(path.join(root, 'packages/web/dist/components/elemental-primitives/elemental-primitives.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    await writeFile(path.join(outDir, 'elemental-primitives.css'), `${tokensCss}\n${elementalCss}`);

    const body = `<p><code id="code" data-vf-code>const value = true;</code> <kbd id="kbd" data-vf-kbd>Enter</kbd> <mark id="mark" data-vf-mark>highlight</mark></p>
<pre id="code-block" data-vf-code-block><code>npm run check</code></pre>
<img id="image" data-vf-image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%238b96aa'/%3E%3C/svg%3E" alt="Sample placeholder">
<div id="skeleton" data-vf-skeleton aria-hidden="true"></div>
<span id="swatch" data-vf-color-swatch style="--vf-color-swatch: rgb(36 87 214)" role="img" aria-label="Brand blue"></span>
<article id="prose" data-vf-prose><h2>Native prose</h2><p>Paragraph with <strong>strong text</strong>, <em>emphasis</em>, <q>a quote</q>, <time datetime="2026-10-22">a date</time>, <code>code</code>, <kbd>Ctrl</kbd>, and <mark>mark</mark>.</p><blockquote>Block quotation</blockquote><figure><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E" alt=""><figcaption>Figure caption</figcaption></figure><ul><li>One</li><li>Two</li></ul><p><small>Small text</small> H<sub>2</sub>O x<sup>2</sup> <abbr title="Application Programming Interface">API</abbr> <cite>Source</cite></p><address>Example address</address></article>
<div aria-hidden="true"><span id="checkmark" class="_vf-checkmark"></span><span id="radiomark" class="_vf-radiomark"></span><span id="selection" class="_vf-selection-indicator"></span></div>`;

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./elemental-primitives.css"><title>Elemental primitives fixture</title></head><body><main><h1>Elemental primitives fixture</h1>${body}</main></body></html>`;
    await writeFile(path.join(outDir, 'web.html'), html);
  },
};

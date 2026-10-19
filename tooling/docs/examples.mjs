import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const supportedFrameworks = ['native-web', 'react', 'angular', 'vue'];
const frameworkRuntimeEntries = {
  react: `
    import * as React from 'react';
    import { createRoot } from 'react-dom/client';
    import { Button } from '@vyrnforge/react/button';
    globalThis.__vfRuntime = { React, createRoot, Button };
  `,
  angular: `
    import '@angular/compiler';
    import { Component, provideZonelessChangeDetection } from '@angular/core';
    import { bootstrapApplication } from '@angular/platform-browser';
    import { VfButtonDirective } from '@vyrnforge/angular/button';
    globalThis.__vfRuntime = { Component, provideZonelessChangeDetection, bootstrapApplication, VfButtonDirective };
  `,
  vue: `
    import { createApp, h } from 'vue';
    import { Button } from '@vyrnforge/vue/button';
    globalThis.__vfRuntime = { createApp, h, Button };
  `
};

function safeName(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

async function discoverExampleManifests(examplesRoot) {
  const manifests = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(entryPath);
      if (entry.isFile() && entry.name === 'example.json') manifests.push(entryPath);
    }
  }
  await walk(examplesRoot);
  return manifests.sort();
}

function publicPackageAliases(root) {
  return {
    '@vyrnforge/react/button': path.join(root, 'packages/react/dist/button.js'),
    '@vyrnforge/angular/button': path.join(root, 'packages/angular/dist/button.js'),
    '@vyrnforge/vue/button': path.join(root, 'packages/vue/dist/button.js')
  };
}

async function buildTypeScriptCompiler(assetRoot) {
  await build({
    stdin: {
      resolveDir: process.cwd(),
      sourcefile: 'vyrnforge-docs-typescript.ts',
      contents: `import * as ts from 'typescript'; globalThis.__vfDocsTypeScript = ts;`
    },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    minify: true,
    legalComments: 'none',
    outfile: path.join(assetRoot, 'typescript.js')
  });
}

async function buildFrameworkRuntimes(root, assetRoot) {
  const aliases = publicPackageAliases(root);
  const runtimes = {};
  for (const [framework, contents] of Object.entries(frameworkRuntimeEntries)) {
    const filename = `runtime-${framework}.js`;
    await build({
      stdin: { resolveDir: root, sourcefile: `docs-runtime-${framework}.ts`, contents },
      alias: aliases,
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2022'],
      minify: true,
      legalComments: 'none',
      tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } },
      outfile: path.join(assetRoot, filename)
    });
    runtimes[framework] = `assets/examples/${filename}`;
  }
  return runtimes;
}

function previewDocument({ rootMarkup, script, buttonCssHref, frameCssHref }) {
  return `<!doctype html><html lang="en" data-vf-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="${escapeHtml(buttonCssHref)}"><link rel="stylesheet" href="${escapeHtml(frameCssHref)}"><title>VyrnForge example</title></head><body>${rootMarkup}${script ? `<script src="${escapeHtml(script)}"></script>` : ''}</body></html>`;
}

async function compileFrameworkExample({ root, sourcePath, outputPath }) {
  await build({
    entryPoints: [sourcePath],
    alias: publicPackageAliases(root),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    legalComments: 'none',
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false, jsx: 'react' } },
    outfile: outputPath
  });
}

export async function buildDocumentationExamples({ root, channelRoot }) {
  const examplesRoot = path.join(root, 'examples');
  const assetRoot = path.join(channelRoot, 'assets/examples');
  const compiledRoot = path.join(assetRoot, 'compiled');
  const previewRoot = path.join(assetRoot, 'previews');
  await mkdir(compiledRoot, { recursive: true });
  await mkdir(previewRoot, { recursive: true });

  await writeFile(path.join(assetRoot, 'frame.css'), `html { color-scheme: light dark; }\nbody { margin: 0; padding: 1.5rem; background: var(--vf-color-surface); color: var(--vf-color-text); font-family: system-ui, sans-serif; }\n.vf-example-root { min-block-size: 4rem; display: grid; align-content: center; }\n.vf-example-stack { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }\n`);
  await buildTypeScriptCompiler(assetRoot);
  const runtimes = await buildFrameworkRuntimes(root, assetRoot);

  const manifests = await discoverExampleManifests(examplesRoot);
  const examples = new Map();
  for (const manifestPath of manifests) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const directory = path.dirname(manifestPath);
    const expectedId = path.relative(examplesRoot, directory).replaceAll(path.sep, '/');
    if (manifest.id !== expectedId) throw new Error(`Example id ${manifest.id} must match its directory ${expectedId}`);
    if (!manifest.title || !manifest.frameworks || typeof manifest.frameworks !== 'object') throw new Error(`Invalid documentation example manifest: ${manifest.id}`);
    if (!manifest.frameworks[manifest.defaultFramework]) throw new Error(`Example ${manifest.id} defaultFramework is not available`);

    const key = safeName(manifest.id);
    const publicFrameworks = {};
    for (const framework of supportedFrameworks) {
      const config = manifest.frameworks[framework];
      if (!config) continue;
      const sourcePath = path.join(directory, config.source);
      const source = await readFile(sourcePath, 'utf8');
      const previewFilename = `${key}-${framework}.html`;
      const previewPath = path.join(previewRoot, previewFilename);
      const buttonCssHref = '../../vyrnforge/button.css';
      const frameCssHref = '../frame.css';

      if (framework === 'native-web') {
        await writeFile(previewPath, previewDocument({ rootMarkup: `<main class="vf-example-root">${source}</main>`, buttonCssHref, frameCssHref }));
      } else {
        const compiledFilename = `${key}-${framework}.js`;
        const compiledPath = path.join(compiledRoot, compiledFilename);
        await compileFrameworkExample({ root, sourcePath, outputPath: compiledPath });
        const rootMarkup = framework === 'angular' ? '<vf-example-root id="root" class="vf-example-root"></vf-example-root>' : '<main id="root" class="vf-example-root"></main>';
        await writeFile(previewPath, previewDocument({ rootMarkup, script: `../compiled/${compiledFilename}`, buttonCssHref, frameCssHref }));
      }

      publicFrameworks[framework] = {
        label: config.label,
        language: config.language,
        source,
        preview: `assets/examples/previews/${previewFilename}`,
        runtime: runtimes[framework] || null
      };
    }

    examples.set(manifest.id, {
      id: manifest.id,
      title: manifest.title,
      description: manifest.description || '',
      defaultFramework: manifest.defaultFramework,
      frameworks: publicFrameworks,
      compiler: 'assets/examples/typescript.js',
      buttonCss: 'assets/vyrnforge/button.css',
      frameCss: 'assets/examples/frame.css'
    });
  }
  return examples;
}

export function renderDocumentationExample(example) {
  if (!example) throw new Error('Cannot render missing documentation example');
  const tabs = Object.entries(example.frameworks).map(([framework, config]) => `<button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" role="tab" data-vf-example-framework="${escapeHtml(framework)}" aria-selected="false">${escapeHtml(config.label)}</button>`).join('');
  const payload = safeJson(example);
  return `<section class="vf-example" data-vf-example-id="${escapeHtml(example.id)}" data-vf-example-default-framework="${escapeHtml(example.defaultFramework)}">
  <header class="vf-example__header"><div><h3>${escapeHtml(example.title)}</h3>${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}</div><div class="vf-example__tabs" role="tablist" aria-label="Example framework">${tabs}</div></header>
  <div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(example.title)} preview" sandbox="allow-scripts"></iframe></div>
  <div class="vf-example__editor">
    <div class="vf-example__editor-toolbar"><strong>Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>
    <textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(example.title)} code editor"></textarea>
    <p class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>
  </div>
  <script type="application/json" data-vf-example-data>${payload}</script>
</section>`;
}

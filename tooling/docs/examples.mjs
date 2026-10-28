import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';
import { frameworkLabel, renderFrameworkMark, supportedFrameworks } from '../../apps/docs/framework-presentation.mjs';

function safeName(value) { return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase(); }
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'); }
function safeJson(value) { return JSON.stringify(value).replaceAll('<', '\\u003c'); }

function exportTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  return value.import || value.default || Object.values(value).find((entry) => typeof entry === 'string') || null;
}

export function publicPackageAliases(root, { source = false } = {}) {
  const aliases = {};
  for (const { name, manifest } of discoverProductUnits(root).packages) {
    for (const [exportName, value] of Object.entries(manifest.exports ?? {})) {
      if (exportName === '.') continue;
      const target = exportTarget(value);
      if (!target?.startsWith('./dist/')) continue;
      const resolvedTarget = source ? target.replace(/^\.\/dist\//, './src/') : target;
      aliases[`${manifest.name}${exportName.slice(1)}`] = path.join(root, `packages/${name}`, resolvedTarget);
    }
  }
  return aliases;
}

export function runtimeResolveDirectory(sourcePath) {
  return path.dirname(sourcePath);
}

async function discoverExampleManifests(root) {
  const manifests = [];
  for (const component of discoverProductUnits(root).components) {
    const exampleRoot = path.join(root, `product/${component.component}/examples`);
    async function walk(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) await walk(target);
        else if (entry.name === 'example.json') manifests.push({ component: component.component, exampleRoot, manifestPath: target });
      }
    }
    await walk(exampleRoot);
  }
  return manifests.sort((a, b) => a.manifestPath.localeCompare(b.manifestPath));
}

export function importAnalysis(source) {
  const sourceStatements = source.match(/^\s*import\s+(?:[^'"\n]+?\s+from\s+)?['"][^'"\n]+['"];?\s*$/gm) ?? [];
  const statements = [];
  const imports = [];
  const bindings = [];
  for (const statement of sourceStatements) {
    const specifier = /['"]([^'"]+)['"]/.exec(statement)?.[1];
    if (specifier) imports.push(specifier);
    if (/^\s*import\s+type\b/.test(statement)) continue;
    statements.push(statement);
    const clause = /^\s*import\s+(.+?)\s+from\s+['"]/.exec(statement)?.[1]?.trim();
    if (!clause) continue;
    if (clause.startsWith('* as ')) bindings.push(clause.slice(5).trim());
    else if (clause.startsWith('{')) {
      for (const item of clause.slice(1, -1).split(',')) {
        const value = item.trim();
        if (!value || value.startsWith('type ')) continue;
        bindings.push(value.split(/\s+as\s+/).at(-1).trim());
      }
    } else {
      const [defaultBinding, remainder] = clause.split(/,(.+)/).filter(Boolean);
      if (defaultBinding?.trim()) bindings.push(defaultBinding.trim());
      if (remainder?.includes('{')) {
        for (const item of remainder.slice(remainder.indexOf('{') + 1, remainder.lastIndexOf('}')).split(',')) {
          const value = item.trim();
          if (!value || value.startsWith('type ')) continue;
          bindings.push(value.split(/\s+as\s+/).at(-1).trim());
        }
      }
    }
  }
  return { statements, imports: [...new Set(imports)], bindings: [...new Set(bindings)] };
}

async function buildTypeScriptCompiler(assetRoot) {
  await build({ stdin: { resolveDir: process.cwd(), sourcefile: 'vyrnforge-docs-typescript.ts', contents: `import * as ts from 'typescript'; globalThis.__vfDocsTypeScript = ts;` }, bundle: true, format: 'iife', platform: 'browser', target: ['es2022'], minify: true, legalComments: 'none', outfile: path.join(assetRoot, 'typescript.js') });
}

async function buildRuntime({ assetRoot, key, framework, analysis, aliases, sourcePath }) {
  const filename = `runtime-${key}-${framework}.js`;
  const contents = `${analysis.statements.join('\n')}\nglobalThis.__vfRuntime = { ${analysis.bindings.join(', ')} };`;
  await build({ stdin: { resolveDir: runtimeResolveDirectory(sourcePath), sourcefile: `docs-runtime-${key}-${framework}.ts`, loader: 'ts', contents }, alias: aliases, bundle: true, format: 'iife', platform: 'browser', target: ['es2022'], minify: true, legalComments: 'none', tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } }, outfile: path.join(assetRoot, filename) });
  return `assets/examples/${filename}`;
}

function previewDocument({ rootMarkup, script, stylesHref, frameCssHref }) {
  return `<!doctype html><html lang="en" data-vf-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="${escapeHtml(stylesHref)}"><link rel="stylesheet" href="${escapeHtml(frameCssHref)}"><title>VyrnForge example</title></head><body>${rootMarkup}${script ? `<script src="${escapeHtml(script)}"></script>` : ''}</body></html>`;
}

export async function compileFrameworkExample({ root, sourcePath, outputPath, aliases }) {
  await build({ entryPoints: [sourcePath], alias: aliases, bundle: true, format: 'iife', platform: 'browser', target: ['es2022'], legalComments: 'none', tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false, jsx: 'react' } }, outfile: outputPath });
}

export async function buildDocumentationExamples({ root, channelRoot }) {
  const assetRoot = path.join(channelRoot, 'assets/examples');
  const compiledRoot = path.join(assetRoot, 'compiled');
  const previewRoot = path.join(assetRoot, 'previews');
  await mkdir(compiledRoot, { recursive: true });
  await mkdir(previewRoot, { recursive: true });
  await writeFile(path.join(assetRoot, 'frame.css'), `html { color-scheme: light dark; }\nbody { margin: 0; padding: 1.5rem; background: var(--vf-color-surface); color: var(--vf-color-text); font-family: system-ui, sans-serif; }\n.vf-example-root { min-block-size: 4rem; display: grid; align-content: center; }\n.vf-example-stack { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }\n`);
  await buildTypeScriptCompiler(assetRoot);
  const aliases = publicPackageAliases(root);
  const manifests = await discoverExampleManifests(root);
  const examples = new Map();

  for (const { component, exampleRoot, manifestPath } of manifests) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const directory = path.dirname(manifestPath);
    const relativeId = path.relative(exampleRoot, directory).replaceAll(path.sep, '/');
    const expectedId = `${component}/${relativeId}`;
    if (manifest.id !== expectedId) throw new Error(`Example id ${manifest.id} must match its component directory ${expectedId}`);
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
      const stylesHref = '../../vyrnforge/styles.css';
      const frameCssHref = '../frame.css';
      let runtime = null;
      let analysis = { imports: [], bindings: [] };

      if (framework === 'native-web') {
        await writeFile(previewPath, previewDocument({ rootMarkup: `<main class="vf-example-root">${source}</main>`, stylesHref, frameCssHref }));
      } else {
        analysis = importAnalysis(source);
        runtime = await buildRuntime({ assetRoot, key, framework, analysis, aliases, sourcePath });
        const compiledFilename = `${key}-${framework}.js`;
        await compileFrameworkExample({ root, sourcePath, outputPath: path.join(compiledRoot, compiledFilename), aliases });
        const rootMarkup = framework === 'angular' ? '<vf-example-root id="root" class="vf-example-root"></vf-example-root>' : '<main id="root" class="vf-example-root"></main>';
        await writeFile(previewPath, previewDocument({ rootMarkup, script: `../compiled/${compiledFilename}`, stylesHref, frameCssHref }));
      }

      publicFrameworks[framework] = { label: frameworkLabel(framework), language: config.language, source, preview: `assets/examples/previews/${previewFilename}`, runtime, imports: analysis.imports, bindings: analysis.bindings };
    }

    examples.set(manifest.id, { id: manifest.id, component, title: manifest.title, description: manifest.description || '', defaultFramework: manifest.defaultFramework, frameworks: publicFrameworks, compiler: 'assets/examples/typescript.js', styles: 'assets/vyrnforge/styles.css', frameCss: 'assets/examples/frame.css' });
  }
  return examples;
}

export function renderDocumentationExample(example) {
  if (!example) throw new Error('Cannot render missing documentation example');
  const tabs = Object.entries(example.frameworks).map(([framework, config]) => `<button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" role="tab" data-vf-example-framework="${escapeHtml(framework)}" aria-selected="false">${renderFrameworkMark(framework)}<span>${escapeHtml(config.label)}</span></button>`).join('');
  return `<section class="vf-example" data-vf-example-id="${escapeHtml(example.id)}" data-vf-example-default-framework="${escapeHtml(example.defaultFramework)}">\n  <header class="vf-example__header"><div><h3>${escapeHtml(example.title)}</h3>${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}</div><div class="vf-example__tabs" role="tablist" aria-label="Example framework">${tabs}</div></header>\n  <div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(example.title)} preview" sandbox="allow-scripts"></iframe></div>\n  <div class="vf-example__editor">\n    <div class="vf-example__editor-toolbar"><strong>Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>\n    <textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(example.title)} code editor"></textarea>\n    <p class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>\n  </div>\n  <script type="application/json" data-vf-example-data>${safeJson(example)}</script>\n</section>`;
}

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileNativeDocumentation } from '../../tooling/docs/native-documentation.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(outRoot, channel);
const nativeRoot = path.join(channelRoot, 'native-web');
const registry = JSON.parse(await readFile(path.join(root, 'documentation/site/registry.json'), 'utf8'));

if (registry.mode !== 'native-html-first' || registry.framework !== 'native-web') {
  throw new Error('Native documentation build requires documentation/site/registry.json to declare native-html-first mode for native-web');
}

const model = compileNativeDocumentation(root);
if (!model.pages.length) throw new Error('Native documentation build requires at least one Product Graph-owned Markdown component page');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(value) {
  return String(value).split(/(`[^`]+`)/g).map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    return escapeHtml(part);
  }).join('');
}

function renderBlocks(blocks) {
  return blocks.map((block) => {
    if (block.type === 'paragraph') return `<p>${renderInline(block.text)}</p>`;
    if (block.type === 'list') return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
    throw new Error(`Unsupported documentation block type: ${block.type}`);
  }).join('\n');
}

function componentNavigation(currentId = null) {
  return `<nav class="vf-docs-side-nav" aria-label="Components">
    <p class="vf-docs-nav-label">Components</p>
    <ul>${model.pages.map((page) => `<li><a href="/next/native-web/${page.route}"${page.id === currentId ? ' aria-current="page"' : ''}>${escapeHtml(page.title)}</a></li>`).join('')}</ul>
  </nav>`;
}

function shell({ title, description, currentId = null, content, componentStyle = null }) {
  const styleLink = componentStyle ? `\n  <link rel="stylesheet" href="${escapeHtml(componentStyle)}">` : '';
  return `<!doctype html>
<html lang="en" data-vf-theme="system">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} · VyrnForge</title>
  <link rel="stylesheet" href="/assets/vyrnforge-web/styles/tokens.css">${styleLink}
  <link rel="stylesheet" href="/assets/docs.css">
</head>
<body>
  <a class="vf-docs-skip" href="#main">Skip to content</a>
  <header class="vf-docs-header">
    <a class="vf-docs-brand" href="/next/native-web/">VyrnForge</a>
    <span class="vf-docs-surface" aria-label="Documentation surface">Native Web</span>
  </header>
  <div class="vf-docs-layout">
    ${componentNavigation(currentId)}
    <main id="main" class="vf-docs-main">${content}</main>
  </div>
</body>
</html>`;
}

function renderHome() {
  const cards = model.pages.map((page) => `<li><a href="/next/native-web/${page.route}"><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.group)}</span></a></li>`).join('');
  return shell({
    title: 'Native Web documentation',
    description: 'VyrnForge Native Web documentation',
    content: `<section class="vf-docs-hero">
      <p class="vf-docs-eyebrow">Native HTML first</p>
      <h1>VyrnForge Native Web</h1>
      <p>Consumer documentation for the native HTML surface, built from Product Graph-owned guidance and the public <code>@vyrnforge/web</code> package.</p>
    </section>
    <section aria-labelledby="components-heading">
      <h2 id="components-heading">Components</h2>
      <ul class="vf-docs-card-list">${cards}</ul>
    </section>`,
  });
}

function renderExample(example) {
  return `<article class="vf-docs-example" data-vf-docs-example="${escapeHtml(example.id)}">
    <h3>${escapeHtml(example.title)}</h3>
    ${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}
    <div class="vf-docs-preview" data-vf-docs-preview>${example.source}</div>
    <details>
      <summary>View HTML</summary>
      <pre tabindex="0"><code class="language-${escapeHtml(example.language)}">${escapeHtml(example.source)}</code></pre>
    </details>
  </article>`;
}

function renderComponent(page) {
  const sections = page.content.sections.map((section) => `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    ${renderBlocks(section.blocks)}
  </section>`).join('\n');
  const examples = page.examples.map(renderExample).join('\n');
  const criteria = page.accessibility.wcag?.criteria ?? [];
  return shell({
    title: page.title,
    description: `${page.title} documentation for VyrnForge Native Web`,
    currentId: page.id,
    componentStyle: page.styleAssetPath,
    content: `<article data-vf-docs-component="${escapeHtml(page.id)}">
      <header class="vf-docs-component-header">
        <p class="vf-docs-eyebrow">${escapeHtml(page.group)} · Native Web</p>
        <h1>${escapeHtml(page.content.title)}</h1>
        ${renderBlocks(page.content.intro)}
      </header>
      <section>
        <h2>Native Web setup</h2>
        <p>Load the public component stylesheet and author the native semantic element directly.</p>
        <pre tabindex="0"><code class="language-css">@import &quot;${escapeHtml(page.styleSpecifier)}&quot;;</code></pre>
      </section>
      ${sections}
      <section aria-labelledby="examples-heading">
        <h2 id="examples-heading">Examples</h2>
        ${examples}
      </section>
      <aside class="vf-docs-evidence" aria-labelledby="evidence-heading">
        <h2 id="evidence-heading">Repository accessibility mapping</h2>
        <p>Native baseline: <code>${escapeHtml(page.accessibility.nativeBaseline?.reference ?? 'not recorded')}</code>. WCAG target: ${escapeHtml(page.accessibility.wcag?.target ?? 'not recorded')}. Mapping status: ${escapeHtml(page.accessibility.wcag?.status ?? 'not recorded')}.</p>
        ${criteria.length ? `<p>Mapped criteria: ${criteria.map((criterion) => `<code>${escapeHtml(criterion)}</code>`).join(', ')}.</p>` : ''}
        <p>This is repository evidence metadata, not a blanket compliance claim.</p>
      </aside>
    </article>`,
  });
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(nativeRoot, { recursive: true });
await mkdir(path.join(outRoot, 'assets'), { recursive: true });
await cp(path.join(root, 'packages/web/dist'), path.join(outRoot, 'assets/vyrnforge-web'), { recursive: true });
await cp(path.join(root, 'apps/docs/native.css'), path.join(outRoot, 'assets/docs.css'));

await writeFile(path.join(nativeRoot, 'index.html'), renderHome());
for (const page of model.pages) {
  const pageRoot = path.join(nativeRoot, page.route);
  await mkdir(pageRoot, { recursive: true });
  await writeFile(path.join(pageRoot, 'index.html'), renderComponent(page));
}

const manifest = {
  channel,
  status: registry.mode,
  framework: model.framework,
  pages: model.pages.map((page) => ({
    slug: page.route,
    title: page.title,
    group: page.group,
    framework: model.framework,
    source: page.sourcePath,
    examples: page.examples.map((example) => example.id),
  })),
};
await writeFile(path.join(channelRoot, 'site-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(channelRoot, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./native-web/"><title>VyrnForge documentation</title></head><body><a href="./native-web/">Open Native Web documentation</a></body></html>');
await writeFile(path.join(outRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${channel}/native-web/"><title>VyrnForge documentation</title></head><body><a href="./${channel}/native-web/">Open VyrnForge documentation</a></body></html>`);

process.stdout.write(`native documentation build -> ${path.relative(root, nativeRoot)} (${model.pages.length} component page${model.pages.length === 1 ? '' : 's'})\n`);

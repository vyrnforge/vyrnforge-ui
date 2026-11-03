import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileNativeDocumentation } from '../../tooling/docs/native-documentation.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(outRoot, channel);
const nativeRoot = path.join(channelRoot, 'native-web');
const nativeSitePath = `${channel}/native-web/`;
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

function slugify(value) {
  return String(value)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function titleCase(value) {
  return String(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toLocaleUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function artifactHref(pageDirectory, target) {
  const sourceDirectory = String(pageDirectory).replace(/^\/+|\/+$/g, '');
  const rawTarget = String(target);
  const directoryTarget = rawTarget.endsWith('/');
  const normalizedTarget = rawTarget.replace(/^\/+|\/+$/g, '');
  const relative = path.posix.relative(sourceDirectory, normalizedTarget);
  if (!relative) return directoryTarget ? './' : '.';
  return directoryTarget ? `${relative}/` : relative;
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

function groupedPages() {
  const groups = new Map();
  for (const page of model.pages) {
    const entries = groups.get(page.group) ?? [];
    entries.push(page);
    groups.set(page.group, entries);
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
}

function componentNavigation(pageDirectory, currentId = null) {
  const overviewCurrent = currentId === null ? ' aria-current="page"' : '';
  const groups = groupedPages().map(([group, pages]) => `<div data-vf-side-nav-group>
      <p data-vf-side-nav-group-label>${escapeHtml(titleCase(group))}</p>
      <ul data-vf-side-nav-list>${pages.map((page) => `<li data-vf-side-nav-item><a data-vf-side-nav-link href="${artifactHref(pageDirectory, `${nativeSitePath}${page.route}`)}"${page.id === currentId ? ' aria-current="page"' : ''}>${escapeHtml(page.title)}</a></li>`).join('')}</ul>
    </div>`).join('\n');

  return `<nav data-vf-side-nav aria-label="Documentation">
    <div data-vf-side-nav-group>
      <p data-vf-side-nav-group-label>Native Web</p>
      <ul data-vf-side-nav-list>
        <li data-vf-side-nav-item><a data-vf-side-nav-link href="${artifactHref(pageDirectory, nativeSitePath)}"${overviewCurrent}>Overview</a></li>
      </ul>
    </div>
    ${groups}
  </nav>`;
}

function pageSearchText(page) {
  const content = [
    page.title,
    page.group,
    page.content.title,
    ...page.content.intro.flatMap((block) => block.type === 'paragraph' ? [block.text] : block.items),
    ...page.content.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => block.type === 'paragraph' ? [block.text] : block.items),
    ]),
  ];
  return content.join(' ').toLocaleLowerCase();
}

function searchMarkup(pageDirectory) {
  const results = model.pages.map((page) => `<li data-vf-docs-search-item data-vf-docs-search-text="${escapeHtml(pageSearchText(page))}" hidden>
        <a href="${artifactHref(pageDirectory, `${nativeSitePath}${page.route}`)}">
          <strong>${escapeHtml(page.title)}</strong>
          <span>${escapeHtml(titleCase(page.group))} · Native Web</span>
        </a>
      </li>`).join('');

  return `<div class="vf-docs-search" data-vf-docs-search-container>
    <label for="vf-docs-search" data-vf-visually-hidden>Search documentation</label>
    <input id="vf-docs-search" type="search" data-vf-input data-vf-docs-search placeholder="Search documentation" autocomplete="off" aria-controls="vf-docs-search-results">
    <div id="vf-docs-search-results" class="vf-docs-search-panel" data-vf-surface data-vf-docs-search-results hidden>
      <p class="vf-docs-search-label">Documentation results</p>
      <ul>${results}</ul>
      <p data-vf-docs-search-empty hidden>No matching documentation.</p>
    </div>
  </div>`;
}

function styleLinks(pageDirectory, componentStyle = null) {
  const assets = [...model.shellStyles.map((entry) => entry.assetPath)];
  if (componentStyle && !assets.includes(componentStyle)) assets.push(componentStyle);
  return assets.map((assetPath) => `  <link rel="stylesheet" href="${escapeHtml(artifactHref(pageDirectory, assetPath))}">`).join('\n');
}

function shell({ pageDirectory, title, description, currentId = null, content, componentStyle = null }) {
  return `<!doctype html>
<html lang="en" data-vf-theme="light" data-vf-density="comfortable">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(title)} · VyrnForge</title>
  <script>try{const value=localStorage.getItem('vf-docs-theme');if(['light','dark','system'].includes(value))document.documentElement.dataset.vfTheme=value}catch{}</script>
${styleLinks(pageDirectory, componentStyle)}
  <link rel="stylesheet" href="${artifactHref(pageDirectory, 'assets/docs.css')}">
  <script src="${artifactHref(pageDirectory, 'assets/docs.js')}" defer></script>
</head>
<body>
  <a class="vf-docs-skip" href="#main">Skip to content</a>
  <div data-vf-app-shell data-vf-docs-shell>
    <header data-vf-app-shell-header class="vf-docs-header">
      <div class="vf-docs-header-inner">
        <div class="vf-docs-brand-row">
          <button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" class="vf-docs-menu-toggle" data-vf-docs-nav-toggle aria-controls="vf-docs-navigation" aria-expanded="true">Menu</button>
          <a class="vf-docs-brand" href="${artifactHref(pageDirectory, nativeSitePath)}">VyrnForge <span>Docs</span></a>
          <span class="vf-docs-surface" aria-label="Documentation surface">Native Web · ${escapeHtml(channel)}</span>
        </div>
        <div class="vf-docs-header-tools">
          ${searchMarkup(pageDirectory)}
          <div class="vf-docs-theme-control">
            <label for="vf-docs-theme">Theme</label>
            <select id="vf-docs-theme" data-vf-native-select data-vf-docs-theme>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>
    </header>
    <div data-vf-app-shell-body class="vf-docs-app-body">
      <aside id="vf-docs-navigation" data-vf-app-shell-navigation class="vf-docs-navigation-region">
        <div class="vf-docs-navigation-scroll">${componentNavigation(pageDirectory, currentId)}</div>
      </aside>
      <main id="main" data-vf-app-shell-main class="vf-docs-main">${content}</main>
    </div>
    <footer data-vf-app-shell-footer class="vf-docs-footer">
      <span>VyrnForge Native Web documentation</span>
      <span>${escapeHtml(channel)} channel</span>
    </footer>
  </div>
</body>
</html>`;
}

function renderHome() {
  const pageDirectory = nativeSitePath.replace(/\/$/, '');
  const cards = model.pages.map((page) => `<li data-vf-surface>
      <a class="vf-docs-card-link" href="${artifactHref(pageDirectory, `${nativeSitePath}${page.route}`)}">
        <span>
          <strong>${escapeHtml(page.title)}</strong>
          <small>${escapeHtml(titleCase(page.group))}</small>
        </span>
        <span aria-hidden="true">→</span>
      </a>
    </li>`).join('');
  const firstPage = model.pages[0];
  return shell({
    pageDirectory,
    title: 'Native Web documentation',
    description: 'VyrnForge Native Web documentation',
    content: `<section class="vf-docs-hero">
      <p class="vf-docs-eyebrow">Native HTML first</p>
      <h1>VyrnForge Native Web</h1>
      <p class="vf-docs-lede">Build with semantic HTML, the browser platform, and the canonical <code>@vyrnforge/web</code> styling foundation. This is the first documentation surface being rebuilt from the clean foundation.</p>
      <div class="vf-docs-hero-actions">
        <a href="${artifactHref(pageDirectory, `${nativeSitePath}${firstPage.route}`)}" data-vf-button>Explore ${escapeHtml(firstPage.title)}</a>
        <span>${model.pages.length} documented component${model.pages.length === 1 ? '' : 's'}</span>
      </div>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="components-heading">
      <div class="vf-docs-section-heading">
        <div>
          <p class="vf-docs-eyebrow">Catalog</p>
          <h2 id="components-heading">Components</h2>
        </div>
        <p>Only components with rebuilt Native Web guidance are published here.</p>
      </div>
      <ul class="vf-docs-card-list">${cards}</ul>
    </section>`,
  });
}

function renderExample(example) {
  return `<article class="vf-docs-example" data-vf-surface data-vf-docs-example="${escapeHtml(example.id)}">
    <header class="vf-docs-example-header">
      <div>
        <p class="vf-docs-example-label">Example</p>
        <h3>${escapeHtml(example.title)}</h3>
        ${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}
      </div>
      <button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" data-vf-docs-copy>Copy HTML</button>
    </header>
    <div class="vf-docs-preview" data-vf-docs-preview>${example.source}</div>
    <details class="vf-docs-source-disclosure">
      <summary>View HTML source</summary>
      <pre tabindex="0"><code class="language-${escapeHtml(example.language)}" data-vf-docs-source>${escapeHtml(example.source)}</code></pre>
    </details>
    <span data-vf-visually-hidden role="status" aria-live="polite" data-vf-docs-copy-status></span>
  </article>`;
}

function renderBreadcrumbs(page, pageDirectory) {
  return `<nav class="vf-docs-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li><a data-vf-link href="${artifactHref(pageDirectory, nativeSitePath)}">Native Web</a></li>
      <li><span aria-hidden="true">/</span> Components</li>
      <li><span aria-hidden="true">/</span> <span aria-current="page">${escapeHtml(page.title)}</span></li>
    </ol>
  </nav>`;
}

function renderTableOfContents(entries) {
  return `<aside class="vf-docs-toc-region">
    <nav class="vf-docs-toc" aria-label="On this page">
      <p>On this page</p>
      <ol>${entries.map((entry) => `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.label)}</a></li>`).join('')}</ol>
    </nav>
  </aside>`;
}

function renderComponent(page) {
  const pageDirectory = `${nativeSitePath}${page.route}`.replace(/\/$/, '');
  const usedIds = new Set();
  const uniqueId = (heading) => {
    const base = slugify(heading);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return id;
  };

  const setupId = uniqueId('Native Web setup');
  const sectionModels = page.content.sections.map((section) => ({ ...section, id: uniqueId(section.heading) }));
  const examplesId = uniqueId('Examples');
  const evidenceId = uniqueId('Accessibility evidence');
  const toc = [
    { id: setupId, label: 'Native Web setup' },
    ...sectionModels.map((section) => ({ id: section.id, label: section.heading })),
    { id: examplesId, label: 'Examples' },
    { id: evidenceId, label: 'Accessibility evidence' },
  ];

  const sections = sectionModels.map((section) => `<section aria-labelledby="${escapeHtml(section.id)}">
    <h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2>
    ${renderBlocks(section.blocks)}
  </section>`).join('\n');
  const examples = page.examples.map(renderExample).join('\n');
  const criteria = page.accessibility.wcag?.criteria ?? [];

  return shell({
    pageDirectory,
    title: page.title,
    description: `${page.title} documentation for VyrnForge Native Web`,
    currentId: page.id,
    componentStyle: page.styleAssetPath,
    content: `${renderBreadcrumbs(page, pageDirectory)}
    <div class="vf-docs-content-grid">
      <article class="vf-docs-article" data-vf-docs-component="${escapeHtml(page.id)}">
        <header class="vf-docs-component-header">
          <div class="vf-docs-page-meta" aria-label="Page metadata">
            <span>Native Web</span>
            <span>${escapeHtml(channel)}</span>
            <span>${escapeHtml(titleCase(page.group))}</span>
          </div>
          <h1>${escapeHtml(page.content.title)}</h1>
          <div class="vf-docs-lede">${renderBlocks(page.content.intro)}</div>
        </header>
        <section aria-labelledby="${escapeHtml(setupId)}">
          <h2 id="${escapeHtml(setupId)}">Native Web setup</h2>
          <p>Load the public component stylesheet and author the native semantic element directly.</p>
          <pre tabindex="0"><code class="language-css">@import &quot;${escapeHtml(page.styleSpecifier)}&quot;;</code></pre>
        </section>
        ${sections}
        <section aria-labelledby="${escapeHtml(examplesId)}">
          <div class="vf-docs-section-heading">
            <div>
              <p class="vf-docs-eyebrow">Executable Native HTML</p>
              <h2 id="${escapeHtml(examplesId)}">Examples</h2>
            </div>
            <p>Examples are checked-in product-unit sources rendered against public Web CSS.</p>
          </div>
          <div class="vf-docs-examples">${examples}</div>
        </section>
        <aside class="vf-docs-evidence" data-vf-surface aria-labelledby="${escapeHtml(evidenceId)}">
          <p class="vf-docs-eyebrow">Evidence boundary</p>
          <h2 id="${escapeHtml(evidenceId)}">Accessibility evidence</h2>
          <p>Native baseline: <code>${escapeHtml(page.accessibility.nativeBaseline?.reference ?? 'not recorded')}</code>. WCAG target: ${escapeHtml(page.accessibility.wcag?.target ?? 'not recorded')}. Mapping status: ${escapeHtml(page.accessibility.wcag?.status ?? 'not recorded')}.</p>
          ${criteria.length ? `<p>Mapped criteria: ${criteria.map((criterion) => `<code>${escapeHtml(criterion)}</code>`).join(', ')}.</p>` : ''}
          <p>This is repository evidence metadata, not a blanket compliance claim.</p>
        </aside>
      </article>
      ${renderTableOfContents(toc)}
    </div>`,
  });
}

async function verifyLocalAssets(pageDirectory, html) {
  const references = [
    ...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/g),
    ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g),
  ].map((match) => match[1]);

  for (const reference of references) {
    if (/^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
    if (reference.startsWith('/')) throw new Error(`Documentation asset URL must be deployment-relative: ${reference}`);
    const pathname = reference.split(/[?#]/, 1)[0];
    const resolved = path.resolve(outRoot, pageDirectory, pathname);
    const outPrefix = `${outRoot}${path.sep}`;
    if (resolved !== outRoot && !resolved.startsWith(outPrefix)) {
      throw new Error(`Documentation asset URL escapes the output root: ${reference}`);
    }
    const info = await stat(resolved).catch(() => null);
    if (!info?.isFile()) throw new Error(`Documentation asset URL does not resolve to a built file: ${reference}`);
  }
}

async function writePage(pageDirectory, html) {
  const pageRoot = path.join(outRoot, pageDirectory);
  await mkdir(pageRoot, { recursive: true });
  await verifyLocalAssets(pageDirectory, html);
  await writeFile(path.join(pageRoot, 'index.html'), html);
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(nativeRoot, { recursive: true });
await mkdir(path.join(outRoot, 'assets'), { recursive: true });
await cp(path.join(root, 'packages/web/dist'), path.join(outRoot, 'assets/vyrnforge-web'), { recursive: true });
await cp(path.join(root, 'apps/docs/native.css'), path.join(outRoot, 'assets/docs.css'));
await cp(path.join(root, 'apps/docs/client.js'), path.join(outRoot, 'assets/docs.js'));

await writePage(nativeSitePath.replace(/\/$/, ''), renderHome());
for (const page of model.pages) {
  const pageDirectory = `${nativeSitePath}${page.route}`.replace(/\/$/, '');
  await writePage(pageDirectory, renderComponent(page));
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

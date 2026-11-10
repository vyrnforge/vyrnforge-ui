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
const componentTaxonomy = JSON.parse(await readFile(path.join(root, 'documentation/site/component-taxonomy.json'), 'utf8'));

if (registry.mode !== 'native-html-first' || registry.framework !== 'native-web') {
  throw new Error('Native documentation build requires documentation/site/registry.json to declare native-html-first mode for native-web');
}

const model = compileNativeDocumentation(root);
if (!model.componentCatalog.length) throw new Error('Native documentation build requires at least one public Native Web component in the Product Graph');

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

function artifactHref(pageDirectory, target) {
  const sourceDirectory = String(pageDirectory).replace(/^\/+|\/+$/g, '');
  const rawTarget = String(target);
  const directoryTarget = rawTarget.endsWith('/');
  const normalizedTarget = rawTarget.replace(/^\/+|\/+$/g, '');
  const relative = path.posix.relative(sourceDirectory, normalizedTarget);
  if (!relative) return directoryTarget ? './' : '.';
  return directoryTarget ? `${relative}/` : relative;
}

function pageDirectory(route = '') {
  return `${nativeSitePath}${route}`.replace(/\/$/, '');
}

function routeTarget(route = '') {
  return `${nativeSitePath}${route}`;
}

function renderInline(value) {
  return String(value).split(/(`[^`]+`)/g).map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    return escapeHtml(part);
  }).join('');
}

function renderBlocks(blocks = []) {
  return blocks.map((block) => {
    if (block.type === 'paragraph') return `<p>${renderInline(block.text)}</p>`;
    if (block.type === 'list') return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
    throw new Error(`Unsupported documentation block type: ${block.type}`);
  }).join('\n');
}

function readComponentCategories() {
  const groups = Array.isArray(componentTaxonomy.groups) ? componentTaxonomy.groups : [];
  const seen = new Set();
  for (const group of groups) {
    if (!group?.id || !group?.label || !Array.isArray(group.components)) {
      throw new Error('documentation/site/component-taxonomy.json contains an invalid group');
    }
    for (const componentId of group.components) {
      if (seen.has(componentId)) throw new Error('Duplicate documentation taxonomy component: ' + componentId);
      seen.add(componentId);
    }
  }
  return groups;
}

const componentCategories = readComponentCategories();

function componentCategoryForId(componentId) {
  return componentCategories.find((group) => group.components.includes(componentId)) ?? null;
}

function componentCategory(page) {
  return componentCategoryForId(page.id) ?? {
    id: 'other',
    label: 'Other',
    description: 'Additional public components that have not yet been assigned to a consumer-facing documentation category.',
    components: [],
  };
}

function componentDestination(page) {
  return page.showcaseAvailable ? page.showcaseRoute : page.apiRoute;
}

function consumerComponentGroups(pages) {
  const classified = new Set();
  const groups = componentCategories.map((category) => {
    const members = pages
      .filter((page) => category.components.includes(page.id))
      .sort((left, right) => left.title.localeCompare(right.title));
    for (const member of members) classified.add(member.id);
    return { ...category, members };
  }).filter((group) => group.members.length);

  const unclassified = pages
    .filter((page) => !classified.has(page.id))
    .sort((left, right) => left.title.localeCompare(right.title));
  if (unclassified.length) {
    groups.push({
      id: 'other',
      label: 'Other',
      description: 'Additional public components that have not yet been assigned to a consumer-facing documentation category.',
      components: [],
      members: unclassified,
    });
  }
  return groups;
}

function componentNavigationGroups() {
  return consumerComponentGroups(model.componentCatalog).map((group) => ({
    label: group.label,
    items: group.members.map((page) => ({
      id: 'component:' + page.id,
      title: page.title,
      route: componentDestination(page),
      currentRoutes: [page.showcaseRoute, page.apiRoute],
    })),
  }));
}

function navigationGroups() {
  return [
    {
      label: 'Native Web',
      items: [{ id: 'overview', title: 'Overview', route: '' }],
    },
    {
      label: 'Foundations',
      items: model.foundationPages.map((page) => ({ id: 'foundation:' + page.id, title: page.title, route: page.route })),
    },
    {
      label: 'Components',
      items: [{ id: 'components:index', title: 'Browse all', route: 'components/' }],
    },
    ...componentNavigationGroups(),
    {
      label: 'API Reference',
      items: [{ id: 'api:index', title: 'Components API', route: 'api/components/' }],
    },
  ];
}

function documentationNavigation(currentPageDirectory, currentRoute = '') {
  const groups = navigationGroups().map((group) => `<div data-vf-side-nav-group>
      <p data-vf-side-nav-group-label>${escapeHtml(group.label)}</p>
      <ul data-vf-side-nav-list>${group.items.map((item) => `<li data-vf-side-nav-item><a data-vf-side-nav-link href="${artifactHref(currentPageDirectory, routeTarget(item.route))}"${(item.currentRoutes ?? [item.route]).includes(currentRoute) ? ' aria-current="page"' : ''}>${escapeHtml(item.title)}</a></li>`).join('')}</ul>
    </div>`).join('\n');

  return `<nav data-vf-side-nav aria-label="Documentation">${groups}</nav>`;
}

function pageSearchText(page) {
  const values = [page.title, page.group, componentCategoryForId(page.id)?.label, page.description, ...(page.publicEntrypoints ?? [])];
  const content = page.content ?? page.sharedContent;
  if (content) {
    values.push(content.title);
    values.push(...content.intro.flatMap((block) => block.type === 'paragraph' ? [block.text] : block.items));
    values.push(...content.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => block.type === 'paragraph' ? [block.text] : block.items),
    ]));
  }
  return values.filter(Boolean).join(' ').toLocaleLowerCase();
}

function searchablePages() {
  return [
    ...model.foundationPages.map((page) => ({ ...page, searchKind: 'Foundation' })),
    { id: 'components-index', title: 'Components', route: 'components/', searchKind: 'Components' },
    ...model.showcasePages.map((page) => ({ ...page, searchKind: 'Component guide' })),
    { id: 'api-index', title: 'Components API', route: 'api/components/', searchKind: 'API Reference' },
    ...model.apiPages.map((page) => ({ ...page, searchKind: 'API Reference' })),
  ];
}

function searchMarkup(currentPageDirectory) {
  const results = searchablePages().map((page) => `<li data-vf-docs-search-item data-vf-docs-search-text="${escapeHtml(pageSearchText(page))}" hidden>
        <a href="${artifactHref(currentPageDirectory, routeTarget(page.route))}">
          <strong>${escapeHtml(page.title)}</strong>
          <span>${escapeHtml(page.searchKind)} · Native Web</span>
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

function styleLinks(currentPageDirectory, componentStyle = null) {
  const assets = [...model.shellStyles.map((entry) => entry.assetPath)];
  if (componentStyle && !assets.includes(componentStyle)) assets.push(componentStyle);
  return assets.map((assetPath) => `  <link rel="stylesheet" href="${escapeHtml(artifactHref(currentPageDirectory, assetPath))}">`).join('\n');
}

function shell({ route = '', title, description, content, componentStyle = null }) {
  const currentPageDirectory = pageDirectory(route);
  return `<!doctype html>
<html lang="en" data-vf-theme="light" data-vf-density="comfortable">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(title)} · VyrnForge</title>
  <script>try{const value=localStorage.getItem('vf-docs-theme');if(['light','dark','system'].includes(value))document.documentElement.dataset.vfTheme=value}catch{}</script>
${styleLinks(currentPageDirectory, componentStyle)}
  <link rel="stylesheet" href="${artifactHref(currentPageDirectory, 'assets/docs.css')}">
  <script src="${artifactHref(currentPageDirectory, 'assets/docs.js')}" defer></script>
</head>
<body>
  <a class="vf-docs-skip" href="#main">Skip to content</a>
  <div data-vf-app-shell data-vf-docs-shell>
    <header data-vf-app-shell-header class="vf-docs-header">
      <div class="vf-docs-header-inner">
        <div class="vf-docs-brand-row">
          <button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" class="vf-docs-menu-toggle" data-vf-docs-nav-toggle aria-controls="vf-docs-navigation" aria-expanded="true">Menu</button>
          <a class="vf-docs-brand" href="${artifactHref(currentPageDirectory, nativeSitePath)}">VyrnForge <span>Docs</span></a>
          <span class="vf-docs-surface" aria-label="Documentation surface">Native Web · ${escapeHtml(channel)}</span>
        </div>
        <div class="vf-docs-header-tools">
          ${searchMarkup(currentPageDirectory)}
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
        <div class="vf-docs-navigation-scroll">${documentationNavigation(currentPageDirectory, route)}</div>
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

function cardList(entries, currentPageDirectory) {
  return `<ul class="vf-docs-card-list">${entries.map((entry) => `<li data-vf-surface>
      <a class="vf-docs-card-link" href="${artifactHref(currentPageDirectory, routeTarget(entry.route))}">
        <span>
          <strong>${escapeHtml(entry.title)}</strong>
          <small>${escapeHtml(entry.meta ?? '')}</small>
        </span>
        <span aria-hidden="true">→</span>
      </a>
    </li>`).join('')}</ul>`;
}

function renderHome() {
  const route = '';
  const currentPageDirectory = pageDirectory(route);
  const foundationCards = model.foundationPages.map((page) => ({ ...page, meta: 'Foundation' }));
  return shell({
    route,
    title: 'Native Web documentation',
    description: 'VyrnForge Native Web documentation',
    content: `<section class="vf-docs-hero">
      <p class="vf-docs-eyebrow">Native Web documentation</p>
      <h1>VyrnForge Native Web</h1>
      <p class="vf-docs-lede">Find components by the interface job they solve, then open practical guidance, examples, or the exact public API. Internal VyrnForge architecture stays behind the documentation instead of becoming something consumers need to learn.</p>
      <div class="vf-docs-hero-actions">
        <a href="${artifactHref(currentPageDirectory, routeTarget('components/'))}" data-vf-link class="vf-docs-hero-cta">Browse components</a>
        <a href="${artifactHref(currentPageDirectory, routeTarget('api/components/'))}" data-vf-link>Browse API reference</a>
      </div>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="foundations-heading">
      <div class="vf-docs-section-heading">
        <div>
          <p class="vf-docs-eyebrow">Shared foundation</p>
          <h2 id="foundations-heading">Foundations</h2>
        </div>
        <p>Styling and tokens are documented independently from component usage.</p>
      </div>
      ${cardList(foundationCards, currentPageDirectory)}
    </section>
    <section class="vf-docs-catalog" aria-labelledby="catalog-heading">
      <div class="vf-docs-section-heading">
        <div>
          <p class="vf-docs-eyebrow">Components</p>
          <h2 id="catalog-heading">Browse components</h2>
        </div>
        <p>${model.componentCatalog.length} public Native Web components, organized by familiar UI categories. ${model.showcasePages.length} currently include complete usage guidance and examples.</p>
      </div>
      ${cardList([
        { title: 'Browse components', route: 'components/', meta: `${model.componentCatalog.length} components by UI purpose` },
        { title: 'API reference', route: 'api/components/', meta: `${model.apiPages.length} public API entries` },
      ], currentPageDirectory)}
    </section>`,
  });
}

function renderComponentGroupSections(pages, currentPageDirectory, { apiOnly = false } = {}) {
  return '<div class="vf-docs-component-groups">' + consumerComponentGroups(pages).map((group) => {
    const cards = group.members.map((component) => ({
      title: component.title,
      route: apiOnly ? component.apiRoute : componentDestination(component),
      meta: apiOnly
        ? component.publicEntrypoints.join(', ')
        : component.showcaseAvailable ? 'Guide + API' : 'API reference',
    }));
    return `<section class="vf-docs-component-group" data-vf-docs-component-group="${escapeHtml(group.id)}" aria-labelledby="component-group-${escapeHtml(group.id)}">
      <div class="vf-docs-component-group-header">
        <div>
          <h2 id="component-group-${escapeHtml(group.id)}">${escapeHtml(group.label)}</h2>
          <p>${escapeHtml(group.description)}</p>
        </div>
        <span>${group.members.length} component${group.members.length === 1 ? '' : 's'}</span>
      </div>
      ${cardList(cards, currentPageDirectory)}
    </section>`;
  }).join('\n') + '</div>';
}

function renderComponentsIndex() {
  const route = 'components/';
  const currentPageDirectory = pageDirectory(route);
  return shell({
    route,
    title: 'Components',
    description: 'Browse Native Web components by familiar interface purpose',
    content: `<section class="vf-docs-hero">
      <p class="vf-docs-eyebrow">Components</p>
      <h1>Components</h1>
      <p class="vf-docs-lede">Browse by what you are building: forms and inputs, actions, navigation, layout, content, feedback, overlays, collections, and supporting utilities. Internal VyrnForge layers do not define this catalog.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="component-catalog-heading">
      <div class="vf-docs-section-heading"><div><h2 id="component-catalog-heading">Browse by UI purpose</h2></div><p>${model.componentCatalog.length} public Native Web components</p></div>
      ${renderComponentGroupSections(model.componentCatalog, currentPageDirectory)}
    </section>`,
  });
}

function renderApiIndex() {
  const route = 'api/components/';
  const currentPageDirectory = pageDirectory(route);
  return shell({
    route,
    title: 'Components API',
    description: 'Verified Native Web component API reference',
    content: `<section class="vf-docs-hero">
      <p class="vf-docs-eyebrow">API Reference</p>
      <h1>Components API</h1>
      <p class="vf-docs-lede">Use this reference when you need exact public entrypoints. Components are grouped with the same consumer-facing categories used by the main catalog; availability still comes from the real Native Web package surface.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="api-catalog-heading">
      <div class="vf-docs-section-heading"><div><h2 id="api-catalog-heading">Public component entrypoints</h2></div><p>${model.apiPages.length} components</p></div>
      ${renderComponentGroupSections(model.apiPages, currentPageDirectory, { apiOnly: true })}
    </section>`,
  });
}

function renderFoundation(page) {
  const entrypoints = page.entrypoints.map((entrypoint) => `<li><code>${escapeHtml(entrypoint)}</code></li>`).join('');
  const extra = page.id === 'tokens'
    ? '<p>Tokens are the shared visual contract. Component and documentation CSS should consume token values rather than introduce hard-coded design decisions.</p>'
    : '<p>Load the foundation once, then load component styles through their public entrypoints as needed. Documentation-specific CSS may style the docs product, but it does not replace VyrnForge component CSS.</p>';
  return shell({
    route: page.route,
    title: page.title,
    description: page.description,
    content: `${renderBreadcrumbs(page, pageDirectory(page.route), 'Foundations')}
    <article class="vf-docs-article">
      <header class="vf-docs-component-header">
        <p class="vf-docs-eyebrow">Foundation</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="vf-docs-lede">${escapeHtml(page.description)}</p>
      </header>
      <section>
        <h2>Public entrypoints</h2>
        <ul>${entrypoints}</ul>
      </section>
      <section>
        <h2>Usage boundary</h2>
        ${extra}
      </section>
    </article>`,
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

function renderBreadcrumbs(page, currentPageDirectory, family = 'Components') {
  const familyRoute = family === 'API Reference' ? 'api/components/' : family === 'Foundations' ? 'foundations/' : 'components/';
  const category = family === 'Components' ? componentCategoryForId(page.id) : null;
  return `<nav class="vf-docs-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li><a data-vf-link href="${artifactHref(currentPageDirectory, nativeSitePath)}">Native Web</a></li>
      <li><span aria-hidden="true">/</span> ${escapeHtml(familyRoute === 'foundations/' ? 'Foundations' : family)}</li>
      ${category ? `<li><span aria-hidden="true">/</span> ${escapeHtml(category.label)}</li>` : ''}
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

function renderFrameworkContent(content, uniqueId) {
  if (!content) return { markup: '', toc: [] };
  const introId = uniqueId('Native Web integration');
  const sections = content.sections.map((section) => ({ ...section, id: uniqueId(section.heading) }));
  return {
    toc: [{ id: introId, label: 'Native Web integration' }, ...sections.map((section) => ({ id: section.id, label: section.heading }))],
    markup: `<section aria-labelledby="${escapeHtml(introId)}">
      <h2 id="${escapeHtml(introId)}">Native Web integration</h2>
      ${renderBlocks(content.intro)}
    </section>
    ${sections.map((section) => `<section aria-labelledby="${escapeHtml(section.id)}"><h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2>${renderBlocks(section.blocks)}</section>`).join('\n')}`,
  };
}

function renderComponent(page) {
  const currentPageDirectory = pageDirectory(page.route);
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
  const framework = renderFrameworkContent(page.frameworkContent, uniqueId);
  const examplesId = uniqueId('Examples');
  const evidenceId = uniqueId('Accessibility evidence');
  const referenceId = uniqueId('Reference');
  const toc = [
    { id: setupId, label: 'Native Web setup' },
    ...sectionModels.map((section) => ({ id: section.id, label: section.heading })),
    ...framework.toc,
    { id: examplesId, label: 'Examples' },
    { id: evidenceId, label: 'Accessibility evidence' },
    { id: referenceId, label: 'Reference' },
  ];

  const sections = sectionModels.map((section) => `<section aria-labelledby="${escapeHtml(section.id)}">
    <h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2>
    ${renderBlocks(section.blocks)}
  </section>`).join('\n');
  const examples = page.examples.map(renderExample).join('\n');
  const criteria = page.accessibility.wcag?.criteria ?? [];

  return shell({
    route: page.route,
    title: page.title,
    description: `${page.title} showcase for VyrnForge Native Web`,
    componentStyle: page.styleAssetPath,
    content: `${renderBreadcrumbs(page, currentPageDirectory)}
    <div class="vf-docs-content-grid">
      <article class="vf-docs-article" data-vf-docs-component="${escapeHtml(page.id)}">
        <header class="vf-docs-component-header">
          <div class="vf-docs-page-meta" aria-label="Page metadata">
            <span>Native Web</span>
            <span>${escapeHtml(channel)}</span>
            <span>${escapeHtml(componentCategory(page).label)}</span>
            <span>Guide</span>
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
        ${framework.markup}
        <section aria-labelledby="${escapeHtml(examplesId)}">
          <div class="vf-docs-section-heading">
            <div><p class="vf-docs-eyebrow">Executable Native HTML</p><h2 id="${escapeHtml(examplesId)}">Examples</h2></div>
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
        <section aria-labelledby="${escapeHtml(referenceId)}">
          <h2 id="${escapeHtml(referenceId)}">Reference</h2>
          <ul>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget(page.apiRoute))}">${escapeHtml(page.title)} API reference</a></li>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/styling/'))}">Styling foundation</a></li>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/tokens/'))}">Design tokens</a></li>
          </ul>
        </section>
      </article>
      ${renderTableOfContents(toc)}
    </div>`,
  });
}

function renderApiPage(page) {
  const currentPageDirectory = pageDirectory(page.route);
  const entrypoints = page.publicEntrypoints.map((entrypoint) => `<li><code>${escapeHtml(entrypoint)}</code></li>`).join('');
  return shell({
    route: page.route,
    title: `${page.title} API`,
    description: `${page.title} Native Web API reference`,
    content: `${renderBreadcrumbs(page, currentPageDirectory, 'API Reference')}
    <article class="vf-docs-article" data-vf-docs-api-component="${escapeHtml(page.id)}">
      <header class="vf-docs-component-header">
        <div class="vf-docs-page-meta"><span>Native Web</span><span>${escapeHtml(componentCategory(page).label)}</span><span>API Reference</span></div>
        <h1>${escapeHtml(page.title)} API</h1>
        <p class="vf-docs-lede">Verified from the public Native Web package surface. Use the component guide for design and usage guidance when one is available.</p>
      </header>
      <section>
        <h2>Public entrypoints</h2>
        <ul>${entrypoints}</ul>
      </section>
      <section>
        <h2>Documentation availability</h2>
        <p>${page.showcaseAvailable ? `A complete Native Web showcase is available for ${escapeHtml(page.title)}.` : `The public Native Web surface exists, but complete showcase guidance is not yet rebuilt for ${escapeHtml(page.title)}.`}</p>
        ${page.showcaseAvailable ? `<p><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget(page.showcaseRoute))}">Open ${escapeHtml(page.title)} showcase</a></p>` : ''}
      </section>
      <section>
        <h2>Foundation links</h2>
        <ul>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/styling/'))}">Styling foundation</a></li>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/tokens/'))}">Design tokens</a></li>
        </ul>
      </section>
    </article>`,
  });
}

async function verifyLocalAssets(currentPageDirectory, html) {
  const references = [
    ...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/g),
    ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g),
  ].map((match) => match[1]);

  for (const reference of references) {
    if (/^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
    if (reference.startsWith('/')) throw new Error(`Documentation asset URL must be deployment-relative: ${reference}`);
    const pathname = reference.split(/[?#]/, 1)[0];
    const resolved = path.resolve(outRoot, currentPageDirectory, pathname);
    const outPrefix = `${outRoot}${path.sep}`;
    if (resolved !== outRoot && !resolved.startsWith(outPrefix)) {
      throw new Error(`Documentation asset URL escapes the output root: ${reference}`);
    }
    const info = await stat(resolved).catch(() => null);
    if (!info?.isFile()) throw new Error(`Documentation asset URL does not resolve to a built file: ${reference}`);
  }
}

async function writePage(route, html) {
  const currentPageDirectory = pageDirectory(route);
  const pageRoot = path.join(outRoot, currentPageDirectory);
  await mkdir(pageRoot, { recursive: true });
  await verifyLocalAssets(currentPageDirectory, html);
  await writeFile(path.join(pageRoot, 'index.html'), html);
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(nativeRoot, { recursive: true });
await mkdir(path.join(outRoot, 'assets'), { recursive: true });
await cp(path.join(root, 'packages/web/dist'), path.join(outRoot, 'assets/vyrnforge-web'), { recursive: true });
await cp(path.join(root, 'apps/docs/native.css'), path.join(outRoot, 'assets/docs.css'));
await cp(path.join(root, 'apps/docs/client.js'), path.join(outRoot, 'assets/docs.js'));

await writePage('', renderHome());
await writePage('components/', renderComponentsIndex());
await writePage('api/components/', renderApiIndex());
for (const page of model.foundationPages) await writePage(page.route, renderFoundation(page));
for (const page of model.showcasePages) await writePage(page.route, renderComponent(page));
for (const page of model.apiPages) await writePage(page.route, renderApiPage(page));

const manifest = {
  channel,
  status: registry.mode,
  framework: model.framework,
  componentCatalog: model.componentCatalog.map((component) => ({
    slug: component.id,
    title: component.title,
    group: component.group,
    category: componentCategory(component).label,
    showcase: component.showcaseAvailable,
    api: component.apiAvailable,
    publicEntrypoints: component.publicEntrypoints,
  })),
  pages: model.showcasePages.map((page) => ({
    slug: page.route,
    title: page.title,
    group: page.group,
    category: componentCategory(page).label,
    framework: model.framework,
    source: page.sourcePath,
    examples: page.examples.map((example) => example.id),
  })),
  api: model.apiPages.map((page) => ({ slug: page.route, title: page.title, publicEntrypoints: page.publicEntrypoints })),
  foundations: model.foundationPages.map((page) => ({ slug: page.route, title: page.title })),
};
await writeFile(path.join(channelRoot, 'site-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(channelRoot, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./native-web/"><title>VyrnForge documentation</title></head><body><a href="./native-web/">Open Native Web documentation</a></body></html>');
await writeFile(path.join(outRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${channel}/native-web/"><title>VyrnForge documentation</title></head><body><a href="./${channel}/native-web/">Open VyrnForge documentation</a></body></html>`);

process.stdout.write(`native documentation build -> ${path.relative(root, nativeRoot)} (${model.componentCatalog.length} public component${model.componentCatalog.length === 1 ? '' : 's'}, ${model.showcasePages.length} showcase${model.showcasePages.length === 1 ? '' : 's'})\n`);

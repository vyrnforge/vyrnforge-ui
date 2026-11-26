import { standardsCopy, criteriaHeading, mappingLabel, criterionLearningNote } from './standards-presentation.mjs';
import { visibleGuideSections } from './guide-presentation.mjs';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileNativeDocumentation, parseMarkdownDocument } from '../../tooling/docs/native-documentation.mjs';
import { documentationFrameworks } from '../../tooling/docs/framework-documentation.mjs';

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
const overlayGuide = parseMarkdownDocument(await readFile(path.join(root, 'documentation/utilities/overlay.md'), 'utf8'));
const overlayRoute = 'utilities/overlay/';
const motionGuide = parseMarkdownDocument(await readFile(path.join(root, 'documentation/utilities/motion.md'), 'utf8'));
const motionRoute = 'utilities/motion/';
const motionStyleExport = model.packageManifest.exports?.['./styles/switch.css'];
if (typeof motionStyleExport !== 'string' || !motionStyleExport.startsWith('./dist/')) {
  throw new Error('Native Motion utility requires public @vyrnforge/web/styles/switch.css');
}
const motionStyleAsset = '/assets/vyrnforge-web/' + motionStyleExport.slice('./dist/'.length);
const overlayStyleExport = model.packageManifest.exports?.['./styles/popover.css'];
if (typeof overlayStyleExport !== 'string' || !overlayStyleExport.startsWith('./dist/')) {
  throw new Error('Native Overlay utility requires public @vyrnforge/web/styles/popover.css');
}
const overlayStyleAsset = '/assets/vyrnforge-web/' + overlayStyleExport.slice('./dist/'.length);
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

// References describe external standards, not VyrnForge implementation or compliance.
const ariaAttributeReferences = Object.freeze({
  'aria-busy': 'https://www.w3.org/TR/wai-aria-1.2/#aria-busy',
  'aria-label': 'https://www.w3.org/TR/wai-aria-1.2/#aria-label',
  'aria-labelledby': 'https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby',
  'aria-disabled': 'https://www.w3.org/TR/wai-aria-1.2/#aria-disabled',
  'aria-pressed': 'https://www.w3.org/TR/wai-aria-1.2/#aria-pressed',
  'aria-expanded': 'https://www.w3.org/TR/wai-aria-1.2/#aria-expanded',
  'aria-controls': 'https://www.w3.org/TR/wai-aria-1.2/#aria-controls',
  'aria-live': 'https://www.w3.org/TR/wai-aria-1.2/#aria-live',
  'aria-current': 'https://www.w3.org/TR/wai-aria-1.2/#aria-current',
});

function standardLink(label, url) {
  return `<a data-vf-link href="${escapeHtml(url)}">${label}</a>`;
}

function renderStandardLink(reference) {
  const label = escapeHtml(reference.label);
  return reference.url ? standardLink(label, reference.url) : `<span>${label}</span>`;
}

function renderCriterionLink(criterion) {
  const label = `<code data-vf-code>${escapeHtml(criterion.id)}</code>`;
  return criterion.url
    ? standardLink(`${label} ${escapeHtml(criterion.label)}`, criterion.url)
    : `<span>${label}</span>`;
}

function renderAccessibilityStandards(references, headingId = 'accessibility-evidence') {
  if (!references) return '';
  const criteria = references.criteria ?? [];
  const nativeBaseline = references.nativeBaseline;
  const hasNativeLink = references.hasNativeReference;
  const baselineNote = nativeBaseline && !hasNativeLink
    ? `<p class="vf-docs-standards-baseline">Semantic baseline: ${escapeHtml(nativeBaseline)}</p>` : '';
  const showDetails = criteria.length || baselineNote;
  const summary = criteriaHeading(criteria.length);
  const reviewNote = references.reviewStatus === 'review-required' ? ' ' + standardsCopy.reviewRequired : '';

  return `<details class="vf-docs-reference-details" data-vf-docs-standards-disclosure><summary>${escapeHtml(standardsCopy.title)}</summary><section class="vf-docs-standards" data-vf-flow data-vf-flow-gap="sm" data-vf-docs-accessibility aria-labelledby="${escapeHtml(headingId)}">
    <h2 id="${escapeHtml(headingId)}">${escapeHtml(standardsCopy.heading)}</h2>
    <p class="vf-docs-standards-intro">${escapeHtml(standardsCopy.introduction)}</p>
    <ul class="vf-docs-standards-primary" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="xs" aria-label="Standards">${references.standards.map((item) => `<li>${renderStandardLink(item)}</li>`).join('')}</ul>
    ${showDetails ? `<details class="vf-docs-standards-details">
      <summary>${escapeHtml(summary)}</summary>
      ${criteria.length ? `<p class="vf-docs-standards-intro">${escapeHtml(standardsCopy.criteriaIntroduction)}</p><ul data-vf-auto-grid data-vf-auto-grid-gap="sm" style="--vf-auto-grid-min-item-size:20rem" aria-label="Mapped WCAG criteria">${criteria.map((item) => `<li>${renderCriterionLink(item)}${criterionLearningNote(item) ? `<p class="vf-docs-criterion-note">${escapeHtml(criterionLearningNote(item))}</p>` : ''}</li>`).join('')}</ul>` : ''}
      ${baselineNote}
    </details>` : ''}
    <p class="vf-docs-standards-note">${escapeHtml(standardsCopy.mappingLabel)}: <strong>${escapeHtml(mappingLabel(references.mappingStatus))}</strong>.${escapeHtml(reviewNote)} ${escapeHtml(standardsCopy.scope)}</p>
  </section></details>`;
}

function renderInline(value) {
  return String(value).split(/(`[^`]+`)/g).map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const token = part.slice(1, -1);
      const code = `<code data-vf-code>${escapeHtml(token)}</code>`;
      const url = ariaAttributeReferences[token.split('=', 1)[0]];
      return url ? standardLink(code, url) : code;
    }
    return escapeHtml(part);
  }).join('');
}

function renderBlocks(blocks = []) {
  return blocks.map((block) => {
    if (block.type === 'paragraph') return `<p>${renderInline(block.text)}</p>`;
    if (block.type === 'list') return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
    if (block.type === 'code') return `<pre data-vf-code-block tabindex="0"><code>${escapeHtml(block.text)}</code></pre>`;
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

function patternNavigationGroup() {
  if (!model.patternCatalog.length) return null;
  return {
    label: 'Patterns',
    items: [
      { id: 'patterns:index', title: 'Browse patterns', route: 'patterns/' },
      ...model.patternCatalog.map((page) => ({
        id: 'pattern:' + page.id,
        title: page.title,
        route: componentDestination(page),
        currentRoutes: [page.showcaseRoute, page.apiRoute],
      })),
    ],
  };
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
      label: 'Utilities',
      items: [
        { id: 'utility:overlay', title: 'Overlay', route: overlayRoute },
        { id: 'utility:motion', title: 'Motion', route: motionRoute },
      ],
    },
    {
      label: 'Components',
      items: [{ id: 'components:index', title: 'Browse all', route: 'components/' }],
    },
    ...componentNavigationGroups(),
    ...(patternNavigationGroup() ? [patternNavigationGroup()] : []),
    {
      label: 'API Reference',
      items: [
        { id: 'api:index', title: 'Components API', route: 'api/components/' },
        ...(model.patternCatalog.length ? [{ id: 'pattern-api:index', title: 'Patterns API', route: 'api/patterns/' }] : []),
      ],
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
    { id: 'overlay', title: 'Overlay utility', route: overlayRoute, searchKind: 'Utility',
      description: 'Shared native top layer, anchor positioning, elevation, theme and customization' },
    { id: 'motion', title: 'Motion utility', route: motionRoute, searchKind: 'Utility',
      description: 'Shared transitions, timing, easing, loading cadence and reduced-motion accessibility' },
    { id: 'components-index', title: 'Components', route: 'components/', searchKind: 'Components' },
    ...model.componentShowcasePages.map((page) => ({ ...page, searchKind: 'Component guide' })),
    ...(model.patternCatalog.length ? [{ id: 'patterns-index', title: 'Patterns', route: 'patterns/', searchKind: 'Patterns' }] : []),
    ...model.patternShowcasePages.map((page) => ({ ...page, searchKind: 'Pattern guide' })),
    { id: 'api-index', title: 'Components API', route: 'api/components/', searchKind: 'API Reference' },
    ...model.componentApiPages.map((page) => ({ ...page, searchKind: 'API Reference' })),
    ...(model.patternCatalog.length ? [{ id: 'pattern-api-index', title: 'Patterns API', route: 'api/patterns/', searchKind: 'API Reference' }] : []),
    ...model.patternApiPages.map((page) => ({ ...page, searchKind: 'Pattern API' })),
  ];
}

function searchMarkup(currentPageDirectory) {
  const results = searchablePages().map((page) => `<li data-vf-docs-search-item data-vf-docs-search-title="${escapeHtml(page.title.toLocaleLowerCase())}" data-vf-docs-search-text="${escapeHtml(pageSearchText(page))}" hidden>
        <a href="${artifactHref(currentPageDirectory, routeTarget(page.route))}">
          <strong>${escapeHtml(page.title)}</strong>
          <span>${escapeHtml(page.searchKind)} · Native Web</span>
        </a>
      </li>`).join('');

  return `<search class="vf-docs-search" data-vf-search-field-root data-vf-docs-search-container aria-label="Documentation search">
    <label for="vf-docs-search" data-vf-visually-hidden>Search documentation</label>
    <input id="vf-docs-search" type="search" data-vf-input data-vf-search-field-input data-vf-docs-search placeholder="Search docs" autocomplete="off" aria-controls="vf-docs-search-results">
    <button type="button" data-vf-search-field-clear data-vf-docs-search-clear aria-label="Clear search" disabled>×</button>
    <span data-vf-visually-hidden data-vf-docs-search-status role="status" aria-live="polite"></span>
    <div id="vf-docs-search-results" class="vf-docs-search-panel" data-vf-docs-search-results hidden>
      <p class="vf-docs-search-label">Documentation results</p>
      <ul data-vf-flow data-vf-flow-gap="xs">${results}</ul>
      <p data-vf-docs-search-empty hidden>No matching documentation.</p>
    </div>
  </search>`;
}

function styleLinks(currentPageDirectory, componentStyle = null) {
  const assets = [...model.shellStyles.map((entry) => entry.assetPath)];
  if (componentStyle && !assets.includes(componentStyle)) assets.push(componentStyle);
  return assets.map((assetPath) => `  <link rel="stylesheet" href="${escapeHtml(artifactHref(currentPageDirectory, assetPath))}">`).join('\n');
}

function shell({ route = '', title, description, content, componentStyle = null }) {
  const currentPageDirectory = pageDirectory(route);
  const nativeDestination = artifactHref(currentPageDirectory, routeTarget(route));
  // A React page is generated for every Native route: supported pilot view or explicit unavailability.
  const reactDestination = artifactHref(currentPageDirectory, channel + '/react/' + route);
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
          <button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" class="vf-docs-menu-toggle" data-vf-docs-nav-toggle hidden aria-controls="vf-docs-navigation" aria-expanded="true">Menu</button>
          <a class="vf-docs-brand" href="${artifactHref(currentPageDirectory, nativeSitePath)}"><span class="vf-docs-brand-full">VyrnForge <span>Docs</span></span><span class="vf-docs-brand-compact">VF Docs <span data-vf-visually-hidden>VyrnForge</span></span></a>
          <span class="vf-docs-surface" aria-label="Documentation surface">Native Web · ${escapeHtml(channel)}</span>
        </div>
        <div class="vf-docs-header-tools">
          ${searchMarkup(currentPageDirectory)}
          <div class="vf-docs-framework-control">
            <label for="vf-docs-framework">Framework</label>
            <select id="vf-docs-framework" data-vf-native-select data-vf-docs-framework>
              <option value="${escapeHtml(nativeDestination)}" selected>Native Web</option>
              <option value="${escapeHtml(reactDestination)}">React (pilot)</option>
            </select>
            <noscript><a data-vf-link href="${escapeHtml(reactDestination)}">Open this topic in React documentation</a></noscript>
          </div>
          <div class="vf-docs-version-control">
            <label for="vf-docs-version">Version</label>
            <select id="vf-docs-version" data-vf-native-select aria-label="Version">
              <option value="${escapeHtml(channel)}">${escapeHtml(channel)}</option>
            </select>
          </div>
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
      <main id="main" tabindex="-1" data-vf-app-shell-main class="vf-docs-main">${content}</main>
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
  return `<ul class="vf-docs-card-list" data-vf-auto-grid data-vf-auto-grid-gap="md">${entries.map((entry) => `<li>
      <a class="vf-docs-card-link" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="lg" data-vf-flow-justify="space-between" href="${artifactHref(currentPageDirectory, routeTarget(entry.route))}">
        <div data-vf-flow data-vf-flow-gap="xs">
          <strong>${escapeHtml(entry.title)}</strong>
          <small>${escapeHtml(entry.meta ?? '')}</small>
        </div>
        <span aria-hidden="true">→</span>
      </a>
    </li>`).join('')}</ul>`;
}

function renderHome() {
  const route = '';
  const currentPageDirectory = pageDirectory(route);
  const foundationCards = model.foundationPages.map((page) => ({ ...page, meta: 'Foundation' }));
  const buttonGuide = model.componentCatalog.find((page) => page.id === 'button' && page.showcaseAvailable);
  return shell({
    route,
    title: 'Native Web documentation',
    description: 'VyrnForge Native Web documentation',
    content: `<section class="vf-docs-hero">
      <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Native Web documentation</p>
      <h1>VyrnForge Native Web</h1>
      <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Start with the interface you need to build, browse components by familiar UI purpose, then open practical guidance, examples, or the exact public API.</p>
      <div class="vf-docs-hero-actions" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="md">
        <a href="${artifactHref(currentPageDirectory, routeTarget('components/'))}" data-vf-link class="vf-docs-hero-cta">Browse components</a>
        <a href="${artifactHref(currentPageDirectory, routeTarget('api/components/'))}" data-vf-link>Browse API reference</a>
        ${buttonGuide ? `<a href="${artifactHref(currentPageDirectory, routeTarget(buttonGuide.showcaseRoute))}" data-vf-link>Start with Button</a>` : ''}
      </div>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="foundations-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
        <div>
          <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Shared foundation</p>
          <h2 id="foundations-heading">Foundations</h2>
        </div>
        <p>Styling and tokens are documented independently from component usage.</p>
      </div>
      ${cardList(foundationCards, currentPageDirectory)}
    </section>
    <section class="vf-docs-catalog" aria-labelledby="catalog-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
        <div>
          <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Components</p>
          <h2 id="catalog-heading">Browse components</h2>
        </div>
        <p>${model.componentCatalog.length} public Native Web components, organized by familiar UI categories. ${model.componentShowcasePages.length} currently include complete usage guidance and examples.</p>
      </div>
      ${cardList([
        { title: 'Browse components', route: 'components/', meta: `${model.componentCatalog.length} components by UI purpose` },
        { title: 'API reference', route: 'api/components/', meta: `${model.componentApiPages.length} public API entries` },
      ], currentPageDirectory)}
    </section>
    ${model.patternCatalog.length ? `<section class="vf-docs-catalog" aria-labelledby="patterns-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
        <div>
          <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Patterns</p>
          <h2 id="patterns-heading">Patterns & workflows</h2>
        </div>
        <p>Reusable task and feedback guidance composed from foundations and components.</p>
      </div>
      ${cardList([
        { title: 'Browse patterns', route: 'patterns/', meta: `${model.patternCatalog.length} pattern${model.patternCatalog.length === 1 ? '' : 's'}` },
        { title: 'Patterns API', route: 'api/patterns/', meta: `${model.patternApiPages.length} public pattern entr${model.patternApiPages.length === 1 ? 'y' : 'ies'}` },
      ], currentPageDirectory)}
    </section>` : ''}`,
  });
}

function renderComponentGroupSections(pages, currentPageDirectory, { apiOnly = false } = {}) {
  return '<div class="vf-docs-component-groups" data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="3xl">' + consumerComponentGroups(pages).map((group) => {
    const cards = group.members.map((component) => ({
      title: component.title,
      route: apiOnly ? component.apiRoute : componentDestination(component),
      meta: apiOnly
        ? component.publicEntrypoints.join(', ')
        : component.showcaseAvailable ? 'Guide + API' : 'API reference',
    }));
    return `<section class="vf-docs-component-group" data-vf-docs-component-group="${escapeHtml(group.id)}" aria-labelledby="component-group-${escapeHtml(group.id)}">
      <div class="vf-docs-component-group-header" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
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
      <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Components</p>
      <h1>Components</h1>
      <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Browse by what you are building: forms and inputs, actions, navigation, layout, content, feedback, overlays, collections, and supporting utilities.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="component-catalog-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between"><div><h2 id="component-catalog-heading">Browse by UI purpose</h2></div><p>${model.componentCatalog.length} public Native Web components</p></div>
      ${renderComponentGroupSections(model.componentCatalog, currentPageDirectory)}
    </section>`,
  });
}

function renderPatternsIndex() {
  const route = 'patterns/';
  const currentPageDirectory = pageDirectory(route);
  return shell({
    route,
    title: 'Patterns',
    description: 'Browse reusable VyrnForge patterns and workflows',
    content: `<section class="vf-docs-hero">
      <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Patterns & Workflows</p>
      <h1>Patterns</h1>
      <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Patterns compose foundations and components into reusable task and feedback guidance without becoming another component layer.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="pattern-catalog-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between"><div><h2 id="pattern-catalog-heading">Available patterns</h2></div><p>${model.patternCatalog.length} Native Web pattern${model.patternCatalog.length === 1 ? '' : 's'}</p></div>
      ${cardList(model.patternCatalog.map((pattern) => ({
        title: pattern.title,
        route: componentDestination(pattern),
        meta: pattern.guideOnly ? 'Guide only' : pattern.showcaseAvailable ? 'Guide + API' : 'API reference',
      })), currentPageDirectory)}
    </section>`,
  });
}

function renderPatternApiIndex() {
  const route = 'api/patterns/';
  const currentPageDirectory = pageDirectory(route);
  return shell({
    route,
    title: 'Patterns API',
    description: 'Verified Native Web pattern API reference',
    content: `<section class="vf-docs-hero">
      <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">API Reference</p>
      <h1>Patterns API</h1>
      <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Public package entrypoints owned by reusable Pattern product units.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="pattern-api-catalog-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between"><div><h2 id="pattern-api-catalog-heading">Public pattern entrypoints</h2></div><p>${model.patternApiPages.length} pattern${model.patternApiPages.length === 1 ? '' : 's'}</p></div>
      ${cardList(model.patternApiPages.map((pattern) => ({
        title: pattern.title,
        route: pattern.apiRoute,
        meta: pattern.publicEntrypoints.join(', '),
      })), currentPageDirectory)}
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
      <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">API Reference</p>
      <h1>Components API</h1>
      <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Use this reference when you need exact public entrypoints. Components are grouped with the same consumer-facing categories used by the main catalog; availability still comes from the real Native Web package surface.</p>
    </section>
    <section class="vf-docs-catalog" aria-labelledby="api-catalog-heading">
      <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between"><div><h2 id="api-catalog-heading">Public component entrypoints</h2></div><p>${model.componentApiPages.length} components</p></div>
      ${renderComponentGroupSections(model.componentApiPages, currentPageDirectory, { apiOnly: true })}
    </section>`,
  });
}

function renderFoundation(page) {
  const entrypoints = page.entrypoints.map((entrypoint) => `<li><code data-vf-code>${escapeHtml(entrypoint)}</code></li>`).join('');
  const extra = page.id === 'tokens'
    ? '<p>Tokens are the shared visual contract. Component and documentation CSS should consume token values rather than introduce hard-coded design decisions.</p>'
    : '<p>Load the foundation once, then load component styles through their public entrypoints as needed. Documentation-specific CSS may style the docs product, but it does not replace VyrnForge component CSS.</p>';
  return shell({
    route: page.route,
    title: page.title,
    description: page.description,
    content: `${renderBreadcrumbs(page, pageDirectory(page.route), 'Foundations')}
    <article class="vf-docs-article" data-vf-flow data-vf-flow-gap="3xl">
      <header class="vf-docs-component-header">
        <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Foundation</p>
        <h1>${escapeHtml(page.title)}</h1>
        ${renderAccessibilityStandards(page.standardReferences)}
        <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">${escapeHtml(page.description)}</p>
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

function renderMotionUtility() {
  const currentPageDirectory = pageDirectory(motionRoute);
  const nativeExample = `<div data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="2xl">
    <div data-vf-flow data-vf-flow-gap="sm">
      <strong>Default motion</strong>
      <button type="button" data-vf-button data-vf-variant="secondary">Hover or focus</button>
      <label data-vf-flow data-vf-flow-direction="inline" data-vf-flow-align="center" data-vf-flow-gap="sm">
        <input id="vf-motion-default-switch" type="checkbox" role="switch" data-vf-switch> Enable option
      </label>
    </div>
    <div data-vf-flow data-vf-flow-gap="sm" style="--vf-control-motion-duration: 80ms; --vf-motion-easing-standard: linear">
      <strong>Scoped CSS override</strong>
      <button type="button" data-vf-button data-vf-variant="secondary">Hover or focus</button>
      <label data-vf-flow data-vf-flow-direction="inline" data-vf-flow-align="center" data-vf-flow-gap="sm">
        <input id="vf-motion-custom-switch" type="checkbox" role="switch" data-vf-switch> Enable option
      </label>
    </div>
  </div>`;
  const effectExample = `<div data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg">
    <div data-vf-motion="fade">
      <button type="button" data-vf-button data-vf-variant="secondary">Fade</button>
    </div>
    <div data-vf-motion="grow">
      <button type="button" data-vf-button data-vf-variant="secondary">Grow</button>
    </div>
    <div data-vf-motion="slide" data-vf-motion-direction="inline-start">
      <button type="button" data-vf-button data-vf-variant="secondary">Slide</button>
    </div>
    <div data-vf-motion="zoom">
      <button type="button" data-vf-button data-vf-variant="secondary">Zoom</button>
    </div>
    <div data-vf-motion="fade-slide" data-vf-motion-direction="block-end">
      <button type="button" data-vf-button data-vf-variant="secondary">Fade + slide</button>
    </div>
    <div data-vf-motion="pop">
      <button type="button" data-vf-button data-vf-variant="secondary">Pop</button>
    </div>
  </div>`;
  const sections = motionGuide.sections.map((section) => {
    const id = 'motion-' + slugify(section.heading);
    return `<section id="${id}" aria-labelledby="${id}-title">
      <h2 id="${id}-title">${escapeHtml(section.heading)}</h2>
      ${renderBlocks(section.blocks)}
    </section>`;
  }).join('\n');
  return shell({
    route: motionRoute,
    title: motionGuide.title,
    description: 'Shared VyrnForge motion tokens, transitions, loading and reduced-motion behavior.',
    componentStyle: motionStyleAsset,
    content: `<nav class="vf-docs-breadcrumbs" aria-label="Breadcrumb">
      <ol data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="xs">
        <li><a data-vf-link href="${artifactHref(currentPageDirectory, nativeSitePath)}">Native Web</a></li>
        <li><span aria-hidden="true">/</span> Utilities</li>
        <li><span aria-hidden="true">/</span> <span aria-current="page">Motion</span></li>
      </ol>
    </nav>
    <article class="vf-docs-article" data-vf-docs-native-motion-utility data-vf-flow data-vf-flow-gap="3xl">
      <header class="vf-docs-component-header">
        <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Utilities</p>
        <h1>${escapeHtml(motionGuide.title)}</h1>
        ${renderBlocks(motionGuide.intro)}
      </header>
      <section aria-labelledby="motion-native-example-heading">
        <h2 id="motion-native-example-heading">Native Web motion examples</h2>
        <p>Actual public Button and Switch styles consume the same motion tokens. Try the controls with hover, keyboard focus, and reduced-motion preference.</p>
        <div class="vf-docs-preview" data-vf-docs-motion-native-preview>${nativeExample}</div>
        <details class="vf-docs-source-disclosure">
          <summary>View example HTML</summary>
          <pre data-vf-code-block tabindex="0"><code>${escapeHtml(nativeExample)}</code></pre>
        </details>
        <p><a data-vf-link href="${artifactHref(currentPageDirectory, channel + '/react/' + motionRoute)}">Open interactive React Motion playground</a></p>
      </section>
      <section aria-labelledby="motion-native-effects-heading" data-vf-docs-motion-native-effects>
        <h2 id="motion-native-effects-heading">Reusable CSS entrance effects</h2>
        <p>Fade, grow, slide, zoom, fade-slide and pop are opt-in effects on ordinary elements. Here each effect wraps a real native Button; the same attributes work around a Switch or any other composition.</p>
        <div class="vf-docs-preview" data-vf-docs-motion-effects-preview>${effectExample}</div>
        <details class="vf-docs-source-disclosure">
          <summary>View reusable effect HTML</summary>
          <pre data-vf-code-block tabindex="0"><code>${escapeHtml(effectExample)}</code></pre>
        </details>
      </section>
      ${sections}
      <section aria-labelledby="motion-related-heading">
        <h2 id="motion-related-heading">Related guidance</h2>
        <ul>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/tokens/'))}">Design tokens</a></li>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/styling/'))}">Styling and CSS</a></li>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget(overlayRoute))}">Overlay utility</a></li>
          <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('api/components/button/'))}">Button API</a></li>
        </ul>
      </section>
    </article>`,
  });
}

function renderOverlayUtility() {
  const pageDirectory = pageDirectoryForOverlay();
  const surfaceExample = `<div data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg">
    <div>
      <button id="vf-overlay-basic-trigger" type="button" data-vf-button data-vf-variant="secondary" data-vf-popover-trigger popovertarget="vf-overlay-basic" aria-haspopup="dialog" aria-controls="vf-overlay-basic">Open Popover</button>
      <div id="vf-overlay-basic" popover="auto" role="dialog" aria-label="Native contextual details" data-vf-popover-content data-vf-placement="bottom-start">
        Native popover in the browser top layer.
      </div>
    </div>
    <div style="--vf-shadow-popover: var(--vf-shadow-lg)">
      <button id="vf-overlay-custom-trigger" type="button" data-vf-button data-vf-variant="secondary" data-vf-popover-trigger popovertarget="vf-overlay-custom" aria-haspopup="dialog" aria-controls="vf-overlay-custom">Custom elevation</button>
      <div id="vf-overlay-custom" popover="auto" role="dialog" aria-label="Customized contextual details" data-vf-popover-content data-vf-placement="top-end">
        Elevated popover using a consumer-scoped token.
      </div>
    </div>
  </div>`;
  const sections = overlayGuide.sections.map((section) => {
    const id = 'overlay-' + slugify(section.heading);
    return `<section id="${id}" aria-labelledby="${id}-title">
      <h2 id="${id}-title">${escapeHtml(section.heading)}</h2>
      ${renderBlocks(section.blocks)}
    </section>`;
  }).join('\n');
  const components = ['popover', 'tooltip', 'preview-card', 'dialog', 'alert-dialog', 'drawer'];
  const references = components.map((id) => `<li><a data-vf-link href="${artifactHref(pageDirectory, routeTarget('api/components/' + id + '/'))}">${escapeHtml(id)} API</a></li>`).join('');
  return shell({
    route: overlayRoute,
    title: overlayGuide.title,
    description: 'Shared overlay usage and customization with a public Native Web popover example.',
    componentStyle: overlayStyleAsset,
    content: `<nav class="vf-docs-breadcrumbs" aria-label="Breadcrumb"><ol data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="xs">
      <li><a data-vf-link href="${artifactHref(pageDirectory, nativeSitePath)}">Native Web</a></li>
      <li><span aria-hidden="true">/</span> Utilities</li>
      <li><span aria-hidden="true">/</span> <span aria-current="page">Overlay</span></li>
    </ol></nav>
    <article class="vf-docs-article" data-vf-docs-native-overlay-utility data-vf-flow data-vf-flow-gap="3xl">
      <header class="vf-docs-component-header">
        <p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Utilities</p>
        <h1>${escapeHtml(overlayGuide.title)}</h1>
        ${renderBlocks(overlayGuide.intro)}
      </header>
      <section aria-labelledby="overlay-native-example-heading">
        <h2 id="overlay-native-example-heading">Native Web overlay examples</h2>
        <p>These use the public Popover stylesheet, native popover controls and a semantic shadow token. Select a trigger to open its real browser top-layer surface.</p>
        <div class="vf-docs-preview" data-vf-docs-overlay-native-preview>${surfaceExample}</div>
        <details class="vf-docs-source-disclosure">
          <summary>View example HTML</summary>
          <pre data-vf-code-block tabindex="0"><code>${escapeHtml(surfaceExample)}</code></pre>
        </details>
        <p><a data-vf-link href="${artifactHref(pageDirectory, channel + '/react/' + overlayRoute)}">Open interactive React Overlay playground</a></p>
      </section>
      ${sections}
      <section aria-labelledby="overlay-api-heading">
        <h2 id="overlay-api-heading">Individual component references</h2>
        <p>These are separate component contracts; the Overlay utility is not an additional public component.</p>
        <ul>${references}</ul>
      </section>
    </article>`,
  });
}
function pageDirectoryForOverlay() {
  return pageDirectory(overlayRoute);
}

function renderExample(example) {
  return `<article class="vf-docs-example" data-vf-docs-example="${escapeHtml(example.id)}">
    <header class="vf-docs-example-header" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="start" data-vf-flow-justify="space-between">
      <div>
        <p data-vf-text data-vf-text-variant="overline" class="vf-docs-example-label">Example</p>
        <h3>${escapeHtml(example.title)}</h3>
        ${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}
      </div>
      <button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" data-vf-docs-copy>Copy HTML</button>
    </header>
    <div class="vf-docs-preview" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="md" data-vf-docs-preview>${example.source}</div>
    <details class="vf-docs-source-disclosure">
      <summary>View HTML source</summary>
      <pre data-vf-code-block tabindex="0"><code class="language-${escapeHtml(example.language)}" data-vf-docs-source>${escapeHtml(example.source)}</code></pre>
    </details>
    <span data-vf-visually-hidden role="status" aria-live="polite" data-vf-docs-copy-status></span>
  </article>`;
}

function renderBreadcrumbs(page, currentPageDirectory, family = 'Components') {
  const familyRoute = family === 'API Reference'
    ? 'api/components/'
    : family === 'Pattern API'
      ? 'api/patterns/'
      : family === 'Foundations'
        ? 'foundations/'
        : family === 'Patterns'
          ? 'patterns/'
          : 'components/';
  const category = family === 'Components' ? componentCategoryForId(page.id) : null;
  return `<nav class="vf-docs-breadcrumbs" aria-label="Breadcrumb">
    <ol data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="xs">
      <li><a data-vf-link href="${artifactHref(currentPageDirectory, nativeSitePath)}">Native Web</a></li>
      <li><span aria-hidden="true">/</span> ${family === 'Foundations' ? 'Foundations' : `<a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget(familyRoute))}">${escapeHtml(family)}</a>`}</li>
      ${category ? `<li><span aria-hidden="true">/</span> <a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('components/'))}#component-group-${escapeHtml(category.id)}">${escapeHtml(category.label)}</a></li>` : ''}
      <li><span aria-hidden="true">/</span> <span aria-current="page">${escapeHtml(page.title)}</span></li>
    </ol>
  </nav>`;
}

function renderTableOfContents(entries) {
  return `<aside class="vf-docs-toc-region">
    <nav class="vf-docs-toc" aria-label="On this page">
      <p>On this page</p>
      <ol data-vf-flow data-vf-flow-gap="xs">${entries.map((entry) => `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.label)}</a></li>`).join('')}</ol>
    </nav>
  </aside>`;
}

function renderFrameworkContent(content, uniqueId) {
  if (!content) return { markup: '', toc: [] };
  const introId = uniqueId('Native Web integration');
  const sections = visibleGuideSections(content.sections).map((section) => ({ ...section, id: uniqueId(section.heading) }));
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
  if (page.guideOnly) return renderPatternGuide(page);
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
  const sectionModels = visibleGuideSections(page.content.sections, page.examples).map((section) => ({ ...section, id: uniqueId(section.heading) }));
  const framework = renderFrameworkContent(page.frameworkContent, uniqueId);
  const featuredExample = page.examples.find((example) => !example.documentationSection) ?? page.examples[0];
  const remainingExamples = page.examples.filter((example) =>
    example.id !== featuredExample.id && !example.documentationSection);
  const usageId = uniqueId('Usage preview');
  const examplesId = remainingExamples.length ? uniqueId('More examples') : null;
  const referenceId = uniqueId('Reference');
  const toc = [
    { id: setupId, label: 'Native Web setup' },
    { id: usageId, label: 'Usage preview' },
    ...sectionModels.map((section) => ({ id: section.id, label: section.heading })),
    ...framework.toc,
    ...(examplesId ? [{ id: examplesId, label: 'More examples' }] : []),
    { id: referenceId, label: 'Reference' },
  ];

  const sections = sectionModels.map((section) => {
    const examplesForSection = page.examples.filter((example) =>
      example.id !== featuredExample.id && example.documentationSection === (section.sourceHeading ?? section.heading));
    return `<section aria-labelledby="${escapeHtml(section.id)}">
    <h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2>
    ${renderBlocks(section.blocks)}
    ${examplesForSection.length ? `<div class="vf-docs-examples" data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xl">${examplesForSection.map(renderExample).join('\n')}</div>` : ''}
  </section>`;
  }).join('\n');
  const examples = remainingExamples.map(renderExample).join('\n');
  return shell({
    route: page.route,
    title: page.title,
    description: `${page.title} showcase for VyrnForge Native Web`,
    componentStyle: page.styleAssetPath,
    content: `${renderBreadcrumbs(page, currentPageDirectory, page.kind === 'pattern' ? 'Patterns' : 'Components')}
    <div class="vf-docs-content-grid">
      ${renderTableOfContents(toc)}
      <article class="vf-docs-article" data-vf-flow data-vf-flow-gap="3xl" ${page.kind === 'pattern' ? 'data-vf-docs-pattern' : 'data-vf-docs-component'}="${escapeHtml(page.id)}">
        <header class="vf-docs-component-header">
          <div class="vf-docs-page-meta" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="xs" aria-label="Page metadata">
            <span>Native Web</span>
            <span>${escapeHtml(channel)}</span>
            <span>${escapeHtml(page.kind === 'pattern' ? 'Pattern' : componentCategory(page).label)}</span>
            <span>Guide</span>
          </div>
          <h1>${escapeHtml(page.content.title)}</h1>
          ${renderAccessibilityStandards(page.standardReferences)}
          <div data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">${renderBlocks(page.content.intro)}</div>
        </header>
        <section aria-labelledby="${escapeHtml(setupId)}">
          <h2 id="${escapeHtml(setupId)}">Native Web setup</h2>
          <p>Load the public stylesheet and author the appropriate native semantics/composition directly.</p>
          <pre data-vf-code-block tabindex="0"><code class="language-css">@import &quot;${escapeHtml(page.styleSpecifier)}&quot;;</code></pre>
        </section>
        <section aria-labelledby="${escapeHtml(usageId)}">
          <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
            <div><p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Executable Native HTML</p><h2 id="${escapeHtml(usageId)}">Usage preview</h2></div>
            <p>This example comes from the checked-in product unit and renders with public VyrnForge Web CSS.</p>
          </div>
          <div class="vf-docs-examples" data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xl">${renderExample(featuredExample)}</div>
        </section>
        ${sections}
        ${framework.markup}
        ${examplesId ? `<section aria-labelledby="${escapeHtml(examplesId)}">
          <div class="vf-docs-section-heading" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="lg" data-vf-flow-align="end" data-vf-flow-justify="space-between">
            <div><p data-vf-text data-vf-text-variant="overline" class="vf-docs-eyebrow">Executable Native HTML</p><h2 id="${escapeHtml(examplesId)}">More examples</h2></div>
            <p>Additional checked-in sources demonstrate supported behavior.</p>
          </div>
          <div class="vf-docs-examples" data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xl">${examples}</div>
        </section>` : ''}
        <section aria-labelledby="${escapeHtml(referenceId)}">
          <h2 id="${escapeHtml(referenceId)}">Reference</h2>
          <ul>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget(page.apiRoute))}">${escapeHtml(page.title)} API reference</a></li>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/styling/'))}">Styling foundation</a></li>
            <li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('foundations/tokens/'))}">Design tokens</a></li>
            ${page.id === 'button' ? `<li><a data-vf-link href="${artifactHref(currentPageDirectory, channel + '/react/components/button/')}">React Button documentation</a></li>` : ''}
            ${['button', 'toggle-button'].includes(page.id) ? `<li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('patterns/button-group/'))}">Button Group</a></li>` : ''}
            ${page.id === 'button' ? `<li><a data-vf-link href="${artifactHref(currentPageDirectory, routeTarget('components/toggle-button/'))}">ToggleButton</a></li>` : ''}
          </ul>
        </section>
      </article>
    </div>`,
  });
}

function renderPatternGuide(page) {
  const currentPageDirectory = pageDirectory(page.route);
  const sections = visibleGuideSections(page.content.sections, page.examples).map((section) =>
    '<section><h2>' + escapeHtml(section.heading) + '</h2>' + renderBlocks(section.blocks) + page.examples.filter((example) => example.documentationSection === (section.sourceHeading ?? section.heading)).map(renderExample).join('') + '</section>').join('');
  const examples = page.exampleReferences.flatMap((reference) => reference.frameworks.map((adaptation) =>
    '<li>' + escapeHtml(reference.title) + ' — ' + escapeHtml(documentationFrameworks[adaptation.framework].label) +
    ' example (repository source): <a data-vf-link href="https://github.com/vyrnforge/vyrnforge-ui/blob/main/' +
    escapeHtml(adaptation.sourcePath) + '">' + escapeHtml(reference.id) + '</a></li>')).join('');
  return shell({
    route: page.route,
    title: page.title,
    description: page.title + ' task composition guide',
    content: renderBreadcrumbs(page, currentPageDirectory, 'Patterns') +
      '<article class="vf-docs-article" data-vf-flow data-vf-flow-gap="3xl" data-vf-docs-pattern="' + escapeHtml(page.id) + '">' +
      '<header class="vf-docs-component-header"><h1>' + escapeHtml(page.content.title) + '</h1>' +
      renderAccessibilityStandards(page.standardReferences) +
      '<div data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">' + renderBlocks(page.content.intro) + '</div>' +
      '</header>' + sections +
      (examples ? '<section><h2>Referenced examples</h2><p>Guide only. Referenced examples run in repository browser fixtures in the indicated framework; this Native Web page does not execute them or provide a pattern API.</p><ul>' + examples + '</ul></section>' : '') +
      (page.id === 'button-group' ? '<section><h2>Related guides</h2><ul><li><a data-vf-link href="' + artifactHref(currentPageDirectory, routeTarget('components/button/')) + '">Button</a></li><li><a data-vf-link href="' + artifactHref(currentPageDirectory, routeTarget('components/toggle-button/')) + '">ToggleButton</a></li></ul></section>' : '') + '</article>',
  });
}

function renderApiPage(page) {
  const currentPageDirectory = pageDirectory(page.route);
  const entrypoints = page.publicEntrypoints.map((entrypoint) => `<li><code data-vf-code>${escapeHtml(entrypoint)}</code></li>`).join('');
  return shell({
    route: page.route,
    title: `${page.title} API`,
    description: `${page.title} Native Web API reference`,
    content: `${renderBreadcrumbs(page, currentPageDirectory, page.kind === 'pattern' ? 'Pattern API' : 'API Reference')}
    <article class="vf-docs-article" ${page.kind === 'pattern' ? 'data-vf-docs-api-pattern' : 'data-vf-docs-api-component'}="${escapeHtml(page.id)}">
      <header class="vf-docs-component-header">
        <div class="vf-docs-page-meta" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="xs"><span>Native Web</span><span>${escapeHtml(page.kind === 'pattern' ? 'Pattern' : componentCategory(page).label)}</span><span>API Reference</span></div>
        <h1>${escapeHtml(page.title)} API</h1>
        ${renderAccessibilityStandards(page.standardReferences)}
        <p data-vf-text data-vf-text-variant="body-lg" class="vf-docs-lede">Verified from the public Native Web package surface. Use the corresponding guide for design and usage guidance when one is available.</p>
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
          ${page.id === 'button' ? `<li><a data-vf-link href="${artifactHref(currentPageDirectory, channel + '/react/api/components/button/')}">React Button API</a></li>` : ''}
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
await writePage(overlayRoute, renderOverlayUtility());
await writePage(motionRoute, renderMotionUtility());
await writePage('patterns/', renderPatternsIndex());
await writePage('api/components/', renderApiIndex());
await writePage('api/patterns/', renderPatternApiIndex());
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
  patternCatalog: model.patternCatalog.map((pattern) => ({
    slug: pattern.id,
    title: pattern.title,
    group: pattern.group,
    showcase: pattern.showcaseAvailable,
    api: pattern.apiAvailable,
    publicEntrypoints: pattern.publicEntrypoints,
    ...(pattern.guideOnly ? { guideOnly: true, exampleFrameworks: [...new Set(pattern.exampleReferences.flatMap((reference) => reference.frameworks.map((adaptation) => adaptation.framework)))] } : {}),
  })),
  pages: model.showcasePages.map((page) => ({
    slug: page.route,
    title: page.title,
    kind: page.kind,
    group: page.group,
    category: page.kind === 'pattern' ? 'Pattern' : componentCategory(page).label,
    framework: model.framework,
    source: page.sourcePath,
    examples: page.examples.map((example) => example.id),
  })),
  api: model.componentApiPages.map((page) => ({ slug: page.route, title: page.title, publicEntrypoints: page.publicEntrypoints })),
  patternApi: model.patternApiPages.map((page) => ({ slug: page.route, title: page.title, publicEntrypoints: page.publicEntrypoints })),
  foundations: model.foundationPages.map((page) => ({ slug: page.route, title: page.title })),
  utilities: [
    { id: 'overlay', slug: overlayRoute, title: overlayGuide.title,
      source: 'documentation/utilities/overlay.md' },
    { id: 'motion', slug: motionRoute, title: motionGuide.title,
      source: 'documentation/utilities/motion.md' },
  ],
};
await writeFile(path.join(channelRoot, 'site-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(channelRoot, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./native-web/"><title>VyrnForge documentation</title></head><body><a href="./native-web/">Open Native Web documentation</a></body></html>');
await writeFile(path.join(outRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${channel}/native-web/"><title>VyrnForge documentation</title></head><body><a href="./${channel}/native-web/">Open VyrnForge documentation</a></body></html>`);

await import('./react-build.mjs');

process.stdout.write(`native documentation build -> ${path.relative(root, nativeRoot)} (${model.componentCatalog.length} public component${model.componentCatalog.length === 1 ? '' : 's'}, ${model.patternCatalog.length} pattern${model.patternCatalog.length === 1 ? '' : 's'}, ${model.showcasePages.length} showcase${model.showcasePages.length === 1 ? '' : 's'})\n`);

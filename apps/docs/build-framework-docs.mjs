import { documentationExamples } from './build.mjs';

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverProductGraph } from '../../tooling/product/discover-product-graph.mjs';
import { buildFrameworkDocsApps } from './build-framework-apps.mjs';
import { componentUsageGroups } from './component-usage-groups.mjs';
import {
  documentationContentText,
  readDocumentationContentModel,
  renderDocumentationContentHtml,
  resolveDocumentationContent,
} from './content-model.mjs';
import { frameworkLabel, frameworkMarkDefinition, renderFrameworkMark, supportedFrameworks } from './framework-presentation.mjs';
import { documentationRegistry } from './registry.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(root, 'dist/docs', channel);
const registry = documentationRegistry(root);
const productGraph = discoverProductGraph(root);
const rootManifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const frameworkSurface = Object.freeze({
  'native-web': 'web',
  react: 'react',
  angular: 'angular',
  vue: 'vue',
  elements: 'elements',
});
const componentById = new Map(productGraph.components.map((component) => [component.unitId, component]));
const frameworkPages = new Map(registry.pages.filter((page) => page.kind === 'framework').map((page) => [page.framework, page]));
const sourcePages = new Map();
const sourceModels = new Map();

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

function pageDir(slug) {
  return path.posix.join('/', channel, slug || '');
}

function relativeRoute(fromSlug, toSlug) {
  const from = pageDir(fromSlug);
  const to = pageDir(toSlug);
  let value = path.posix.relative(from, to) || '.';
  if (!value.startsWith('.')) value = `./${value}`;
  return value === '.' ? './' : `${value.replace(/\/$/, '')}/`;
}

function scopedSlug(framework, logicalSlug) {
  return logicalSlug ? `${framework}/${logicalSlug}` : framework;
}

function extractMain(html, page) {
  const match = /<main data-vf-app-shell-main id="main">([\s\S]*?)<\/main>/.exec(html);
  if (!match) throw new Error(`Unable to extract documentation main content for ${page.slug || 'home'}`);
  return match[1];
}

function pageAvailable(page, framework) {
  if (page.kind !== 'component') return page.kind !== 'framework' || page.framework === framework;
  return page.surfaces.includes(frameworkSurface[framework]);
}

function frameworkRoutePage(page, targetFramework) {
  if (page.kind === 'framework') return frameworkPages.get(targetFramework);
  return page;
}

function routeForFramework(page, currentFramework, targetFramework) {
  const targetPage = frameworkRoutePage(page, targetFramework);
  if (!targetPage) return relativeRoute(scopedSlug(currentFramework, page.slug), targetFramework);
  return relativeRoute(scopedSlug(currentFramework, page.slug), scopedSlug(targetFramework, targetPage.slug));
}

function frameworkChoices(page, framework) {
  return supportedFrameworks.map((target) => ({
    id: target,
    label: frameworkLabel(target),
    href: routeForFramework(page, framework, target),
    current: target === framework,
    mark: frameworkMarkDefinition(target),
  }));
}

function renderFrameworkSwitcher(page, framework) {
  const links = frameworkChoices(page, framework)
    .map((choice) => `<li><a data-vf-link class="vf-docs-framework-switcher__link" href="${escapeHtml(choice.href)}" data-vf-framework-choice="${escapeHtml(choice.id)}"${choice.current ? ' data-vf-framework-current="true" aria-current="page"' : ''} aria-label="${escapeHtml(choice.label)} documentation" title="${escapeHtml(choice.label)}">${renderFrameworkMark(choice.id)}</a></li>`)
    .join('');
  return `<nav class="vf-docs-framework-switcher" aria-label="Framework"><ul class="vf-docs-framework-switcher__list">${links}</ul></nav>`;
}

function renderHeader(page, framework) {
  return `<div class="vf-docs-header__inner"><a class="vf-docs-brand" href="${relativeRoute(scopedSlug(framework, page.slug), framework)}">VyrnForge</a><span class="vf-docs-version" data-vf-docs-version>${escapeHtml(channel)} · ${escapeHtml(rootManifest.version)}</span><div class="vf-docs-tools"><div class="vf-docs-search-wrap"><label for="vf-docs-search">Search</label> <input id="vf-docs-search" data-vf-docs-search data-vf-input type="search" autocomplete="off"><ul class="vf-docs-search-results" data-vf-docs-search-results hidden></ul></div>${renderFrameworkSwitcher(page, framework)}</div></div>`;
}

function navItemModel(currentPage, item, framework) {
  return {
    title: item.title,
    href: relativeRoute(scopedSlug(framework, currentPage.slug), scopedSlug(framework, item.slug)),
    current: item.slug === currentPage.slug,
    framework: item.kind === 'framework' ? item.framework : null,
  };
}

function componentNavigationModel(currentPage, pages, framework) {
  const grouped = new Map(componentUsageGroups.map((group) => [group.title, []]));
  for (const item of pages) {
    const items = grouped.get(item.subgroup) ?? [];
    items.push(item);
    grouped.set(item.subgroup, items);
  }
  return [...grouped.entries()]
    .filter(([, items]) => items.length)
    .map(([label, items]) => {
      const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));
      return {
        label,
        count: sortedItems.length,
        open: sortedItems.some((item) => item.slug === currentPage.slug),
        items: sortedItems.map((item) => navItemModel(currentPage, item, framework)),
      };
    });
}

function pagesForNavigation(framework) {
  return registry.pages.filter((page) => {
    if (page.kind === 'framework') return page.framework === framework;
    return pageAvailable(page, framework);
  });
}

function navigationModel(currentPage, framework) {
  const groups = new Map();
  for (const page of pagesForNavigation(framework)) {
    const pages = groups.get(page.group) || [];
    pages.push(page);
    groups.set(page.group, pages);
  }
  return [...groups.entries()].map(([label, pages]) => ({
    label,
    items: label === 'Components' ? [] : pages.map((item) => navItemModel(currentPage, item, framework)),
    subgroups: label === 'Components' ? componentNavigationModel(currentPage, pages, framework) : [],
  }));
}

function renderNavLabel(item) {
  return item.framework
    ? `${renderFrameworkMark(item.framework)}<span>${escapeHtml(item.title)}</span>`
    : escapeHtml(item.title);
}

function renderNavItems(items) {
  return items.map((item) => `<li data-vf-side-nav-item><a data-vf-side-nav-link href="${escapeHtml(item.href)}"${item.current ? ' data-vf-current="true" aria-current="page"' : ''}>${renderNavLabel(item)}</a></li>`).join('');
}

function renderNavigation(currentPage, framework) {
  const contents = navigationModel(currentPage, framework).map((group) => {
    const body = group.subgroups.length
      ? group.subgroups.map((subgroup) => `<details class="vf-docs-component-subgroup" data-vf-docs-component-subgroup${subgroup.open ? ' data-vf-current-group="true" open' : ''}><summary class="vf-docs-component-subgroup__label"><span>${escapeHtml(subgroup.label)}</span><span class="vf-docs-component-subgroup__count" aria-hidden="true">${subgroup.count}</span></summary><ul data-vf-side-nav-list>${renderNavItems(subgroup.items)}</ul></details>`).join('')
      : `<ul data-vf-side-nav-list>${renderNavItems(group.items)}</ul>`;
    return `<section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>${escapeHtml(group.label)}</h2>${body}</section>`;
  }).join('');
  return `<nav data-vf-side-nav aria-label="Documentation">${contents}</nav>`;
}

function renderLegacyExample(example, framework) {
  const config = example.frameworks?.[framework];
  if (!config) {
    return `<section class="vf-example--unavailable" data-vf-example-unavailable="${escapeHtml(example.id)}"><h3>${escapeHtml(example.title)}</h3><p>This executable example is not available for ${escapeHtml(frameworkLabel(framework))} in this documentation channel.</p></section>`;
  }
  const locked = { ...example, defaultFramework: framework, frameworks: { [framework]: config } };
  const description = example.description ? `<p>${escapeHtml(example.description)}</p>` : '';
  return `<section class="vf-example" data-vf-example-id="${escapeHtml(example.id)}" data-vf-example-default-framework="${escapeHtml(framework)}" data-vf-example-locked-framework="${escapeHtml(framework)}">
    <header class="vf-example__header"><div><h3>${escapeHtml(example.title)}</h3>${description}</div><span class="vf-example__framework">${renderFrameworkMark(framework)}<span>${escapeHtml(frameworkLabel(framework))}</span></span></header>
    <div class="vf-example__preview"><iframe data-vf-example-frame title="${escapeHtml(example.title)} preview" sandbox="allow-scripts"></iframe></div>
    <div class="vf-example__controls"><button type="button" data-vf-button data-vf-variant="ghost" data-vf-size="sm" data-vf-example-code-toggle aria-expanded="false">Show code</button></div>
    <div class="vf-example__editor" data-vf-example-editor hidden>
      <div class="vf-example__editor-toolbar"><strong>Editable source</strong><span data-vf-example-language></span><span class="vf-example__editor-actions"><button type="button" data-vf-button data-vf-variant="primary" data-vf-size="sm" data-vf-example-run>Run</button><button type="button" data-vf-button data-vf-variant="secondary" data-vf-size="sm" data-vf-example-reset>Reset</button></span></div>
      <textarea data-vf-example-source spellcheck="false" aria-label="${escapeHtml(example.title)} code editor"></textarea>
      <p class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>
    </div>
    <script type="application/json" data-vf-example-data>${safeJson(locked)}</script>
  </section>`;
}

function lockLegacyExamples(mainHtml, framework) {
  return mainHtml.replace(/<section class="vf-example" data-vf-example-id="[^"]+"[\s\S]*?<script type="application\/json" data-vf-example-data>([\s\S]*?)<\/script>\s*<\/section>/g, (_match, data) => renderLegacyExample(JSON.parse(data), framework));
}

async function frameworkAdaptation(page, framework) {
  if (page.kind !== 'component' || !page.source || page.sourceFormat === 'model') return '';
  const directory = path.dirname(path.join(root, page.source));
  const target = path.join(directory, 'frameworks', `${framework}.html`);
  return existsSync(target) ? readFile(target, 'utf8') : '';
}

async function composeFrameworkContent(page, mainHtml, framework) {
  const marker = '<div data-vf-framework-content></div>';
  const adaptation = await frameworkAdaptation(page, framework);
  if (mainHtml.includes(marker)) return mainHtml.replace(marker, adaptation);
  if (adaptation) throw new Error(`${page.slug} has ${framework} adaptation content but no data-vf-framework-content marker`);
  return mainHtml;
}

function componentContextModel(page, framework) {
  if (page.kind !== 'component') return null;
  const component = componentById.get(page.component);
  const surface = component?.surfaces?.[frameworkSurface[framework]];
  const entrypoint = surface?.publicEntrypoints?.[0] ?? null;
  return {
    framework,
    label: frameworkLabel(framework),
    entrypoint,
    mark: frameworkMarkDefinition(framework),
  };
}

function componentContext(page, framework) {
  const context = componentContextModel(page, framework);
  if (!context) return '';
  const detail = context.entrypoint
    ? `Public entrypoint: <code>${escapeHtml(context.entrypoint)}</code>`
    : `This component has a ${escapeHtml(context.label)} surface in this documentation channel.`;
  return `<div class="vf-docs-framework-context" data-vf-framework-context="${escapeHtml(framework)}"><strong>${renderFrameworkMark(framework)}<span>${escapeHtml(context.label)}</span></strong><span>${detail}</span></div>`;
}

function insertComponentContext(page, mainHtml, framework) {
  const context = componentContext(page, framework);
  if (!context) return mainHtml;
  return mainHtml.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, `$1${context}`);
}

function renderUnavailable(page, framework) {
  return `<h1>${escapeHtml(page.title)}</h1><div class="vf-docs-framework-context" data-vf-framework-context="${escapeHtml(framework)}"><strong>${renderFrameworkMark(framework)}<span>${escapeHtml(frameworkLabel(framework))}</span></strong><span>Framework-specific documentation view</span></div><div class="vf-docs-unavailable" data-vf-framework-unavailable="${escapeHtml(framework)}"><h2>Not available for ${escapeHtml(frameworkLabel(framework))}</h2><p>${escapeHtml(page.title)} does not expose a supported ${escapeHtml(frameworkLabel(framework))} surface in this documentation channel. VyrnForge does not substitute another framework implementation or fabricate an equivalent API.</p><p>Choose another framework above to keep this component context while viewing an implemented surface.</p></div>`;
}

function documentShell({ page, framework, mainHtml = '', mainContent = null }) {
  const fullSlug = scopedSlug(framework, page.slug);
  const siteRoot = relativeRoute(fullSlug, framework);
  const assetRoot = relativeRoute(fullSlug, '');
  const footerText = `VyrnForge ${frameworkLabel(framework)} documentation · ${channel} channel`;
  const title = `${page.title} · ${frameworkLabel(framework)} · VyrnForge`;
  const model = {
    currentFramework: framework,
    brandHref: relativeRoute(fullSlug, framework),
    versionText: `${channel} · ${rootManifest.version}`,
    frameworkChoices: frameworkChoices(page, framework),
    navigation: navigationModel(page, framework),
    ...(mainContent ? { mainContent } : { mainHtml }),
    footerText,
  };
  const styles = `<link rel="stylesheet" href="${assetRoot}assets/vyrnforge/styles.css"><link rel="stylesheet" href="${assetRoot}assets/styles.css"><link rel="stylesheet" href="${assetRoot}assets/shell.css"><link rel="stylesheet" href="${assetRoot}assets/framework-sites.css">`;
  const bodyAttrs = `data-vf-site-root="${siteRoot}" data-vf-asset-root="${assetRoot}" data-vf-framework="${escapeHtml(framework)}" data-vf-version="${escapeHtml(rootManifest.version)}"`;
  const staticMain = mainContent ? renderDocumentationContentHtml(mainContent) : mainHtml;
  const staticShell = (tag, renderer, elementsScript = '') => `<${tag} data-vf-app-shell data-vf-docs-renderer="${renderer}"><a class="vf-skip-link" href="#main">Skip to content</a><header data-vf-app-shell-header class="vf-docs-header">${renderHeader(page, framework)}</header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation class="vf-docs-navigation">${renderNavigation(page, framework)}</aside><main data-vf-app-shell-main id="main">${staticMain}</main></div><footer data-vf-app-shell-footer class="vf-docs-footer">${escapeHtml(footerText)}</footer></${tag}>${elementsScript}`;
  let app = '';
  if (framework === 'native-web') {
    app = staticShell('div', 'native-web');
  } else if (framework === 'elements') {
    const elementRuntime = `${assetRoot}assets/vyrnforge/elements/app-shell.js`;
    app = staticShell('vf-app-shell', 'elements', `<script type="module">import { defineAppShellElements } from "${elementRuntime}"; defineAppShellElements(); document.documentElement.dataset.vfDocsRendered='elements'; document.dispatchEvent(new CustomEvent('vfdocsrendered',{detail:{framework:'elements'}}));</script>`);
  } else {
    const rootTag = framework === 'angular' ? 'vf-docs-angular-root' : 'div';
    app = `<${rootTag} id="vf-docs-app"></${rootTag}><script id="vf-docs-page-model" type="application/json">${safeJson(model)}</script><script src="${assetRoot}assets/framework-apps/${framework}.js"></script>`;
  }
  return `<!doctype html>\n<html lang="en" data-vf-docs-channel="${escapeHtml(channel)}" data-vf-theme="system" data-vf-docs-framework="${escapeHtml(framework)}">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="VyrnForge ${escapeHtml(page.title)} ${escapeHtml(frameworkLabel(framework))} documentation"><title>${escapeHtml(title)}</title>${styles}</head>\n<body ${bodyAttrs}>${app}<script src="${assetRoot}assets/client.js" defer></script></body></html>`;
}

function gatewayDocument() {
  const cards = supportedFrameworks.map((framework) => `<a class="vf-docs-framework-card" href="./${framework}/" data-vf-framework-gateway-choice="${framework}">${renderFrameworkMark(framework)}<strong>${escapeHtml(frameworkLabel(framework))}</strong><span>Open ${escapeHtml(frameworkLabel(framework))} documentation</span></a>`).join('');
  return `<!doctype html><html lang="en" data-vf-docs-channel="${escapeHtml(channel)}" data-vf-theme="system"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Choose a VyrnForge documentation framework"><title>Choose your framework · VyrnForge</title><link rel="stylesheet" href="./assets/vyrnforge/styles.css"><link rel="stylesheet" href="./assets/styles.css"><link rel="stylesheet" href="./assets/framework-sites.css"></head><body><main class="vf-docs-gateway"><div class="vf-docs-gateway__inner"><span class="vf-docs-version">${escapeHtml(channel)} · ${escapeHtml(rootManifest.version)}</span><h1>Choose your framework</h1><p>VyrnForge keeps one shared design and semantic foundation while documenting each framework through its own idiomatic application, APIs, examples, lifecycle, forms, and accessibility execution.</p><div class="vf-docs-framework-grid">${cards}</div></div></main><script>for(const link of document.querySelectorAll('[data-vf-framework-gateway-choice]'))link.addEventListener('click',()=>localStorage.setItem('vyrnforge.docs.framework',link.dataset.vfFrameworkGatewayChoice));</script></body></html>`;
}

for (const page of registry.pages) {
  if (page.sourceFormat === 'model') {
    sourceModels.set(page.slug, await readDocumentationContentModel(path.join(root, page.source)));
    continue;
  }
  const file = path.join(channelRoot, page.slug, 'index.html');
  sourcePages.set(page.slug, extractMain(await readFile(file, 'utf8'), page));
}
const sourceSearch = JSON.parse(await readFile(path.join(channelRoot, 'search-index.json'), 'utf8'));
const searchBySlug = new Map(registry.pages.map((page, index) => [page.slug, sourceSearch[index]]));

await buildFrameworkDocsApps({ root, channelRoot });
await cp(path.join(root, 'apps/docs/framework-sites.css'), path.join(channelRoot, 'assets/framework-sites.css'));

const oldSegments = new Set(registry.pages.map((page) => page.slug.split('/')[0]).filter(Boolean));
for (const segment of oldSegments) await rm(path.join(channelRoot, segment), { recursive: true, force: true });

const publishedPages = [];
for (const framework of supportedFrameworks) {
  const frameworkSearch = [];
  const frameworkManifestPages = [];
  for (const page of registry.pages) {
    if (page.kind === 'framework' && page.framework !== framework) continue;
    const available = pageAvailable(page, framework);
    let mainHtml = '';
    let mainContent = null;

    if (!available) {
      mainHtml = renderUnavailable(page, framework);
    } else if (page.sourceFormat === 'model') {
      mainContent = resolveDocumentationContent(sourceModels.get(page.slug), {
        framework,
        examples: documentationExamples,
        pageTitle: page.title,
        context: componentContextModel(page, framework),
      });
    } else {
      mainHtml = sourcePages.get(page.slug);
      mainHtml = lockLegacyExamples(mainHtml, framework);
      mainHtml = await composeFrameworkContent(page, mainHtml, framework);
      mainHtml = insertComponentContext(page, mainHtml, framework);
    }

    const fullSlug = scopedSlug(framework, page.slug);
    const output = path.join(channelRoot, fullSlug, 'index.html');
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, documentShell({ page, framework, mainHtml, mainContent }));

    const manifestEntry = { slug: fullSlug, logicalSlug: page.slug, title: page.title, kind: page.kind, framework, available, sourceFormat: page.sourceFormat ?? 'html' };
    publishedPages.push(manifestEntry);
    frameworkManifestPages.push(manifestEntry);
    if (available) {
      const sourceEntry = searchBySlug.get(page.slug);
      frameworkSearch.push({
        title: sourceEntry?.title ?? page.title,
        path: page.slug ? `${page.slug}/` : './',
        text: mainContent ? documentationContentText(mainContent) : sourceEntry?.text ?? '',
        framework,
      });
    }
  }
  await writeFile(path.join(channelRoot, framework, 'search-index.json'), `${JSON.stringify(frameworkSearch, null, 2)}\n`);
  await writeFile(path.join(channelRoot, framework, 'site-manifest.json'), `${JSON.stringify({ channel, version: rootManifest.version, framework, pages: frameworkManifestPages }, null, 2)}\n`);
}

await writeFile(path.join(channelRoot, 'index.html'), gatewayDocument());
await writeFile(path.join(channelRoot, 'site-manifest.json'), `${JSON.stringify({ channel, version: rootManifest.version, frameworks: supportedFrameworks, pages: publishedPages }, null, 2)}\n`);
await rm(path.join(channelRoot, 'search-index.json'), { force: true });

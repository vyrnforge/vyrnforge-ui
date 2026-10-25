import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDocumentationExamples, renderDocumentationExample } from './examples.mjs';
import { componentUsageGroups } from './component-usage-groups.mjs';
import { renderFrameworkMark } from './framework-presentation.mjs';
import { documentationRegistry } from './registry.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(outRoot, channel);
const registry = documentationRegistry(root);
const rootManifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const compatibility = JSON.parse(await readFile(path.join(root, 'tooling/compatibility/support-status.json'), 'utf8'));
const packageNames = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const packageManifests = Object.fromEntries(await Promise.all(packageNames.map(async (name) => [name, JSON.parse(await readFile(path.join(root, `packages/${name}/package.json`), 'utf8'))])));

function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function stripHtml(value) { return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function makeScrollableRegionsKeyboardReachable(value) { return value.replace(/<pre(?![^>]*\btabindex=)([^>]*)>/gi, '<pre tabindex="0"$1>'); }
function pageDir(slug) { return path.posix.join('/', channel, slug || ''); }
function relativeRoute(fromSlug, toSlug) { const from = pageDir(fromSlug); const to = pageDir(toSlug); let value = path.posix.relative(from, to) || '.'; if (!value.startsWith('.')) value = `./${value}`; return value === '.' ? './' : `${value.replace(/\/$/, '')}/`; }
function relativeAsset(fromSlug, asset) { let value = path.posix.relative(pageDir(fromSlug), path.posix.join('/', channel, 'assets', asset)); if (!value.startsWith('.')) value = `./${value}`; return value; }

function renderPackages() {
  const rows = packageNames.map((name) => { const manifest = packageManifests[name]; const exports = Object.keys(manifest.exports || {}).map((entry) => entry === '.' ? manifest.name : `${manifest.name}${entry.slice(1)}`).join('<br>'); return `<tr><th scope="row"><code>${escapeHtml(manifest.name)}</code></th><td>${escapeHtml(manifest.description || '')}</td><td>${exports || 'No public entrypoints'}</td><td>${manifest.private ? 'Bootstrap private' : 'Publishable'}</td></tr>`; }).join('');
  return `<p class="vf-docs-lede">Package reference is generated from the active package manifests so documentation cannot silently invent public package names or entrypoints.</p><div class="vf-docs-table-wrap" tabindex="0" role="region" aria-label="Package reference"><table><thead><tr><th>Package</th><th>Role</th><th>Public entrypoints</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function renderCompatibilityValue(value) { if (value && typeof value === 'object' && !Array.isArray(value)) return `<dl>${Object.entries(value).map(([key, nested]) => `<dt><code>${escapeHtml(key)}</code></dt><dd>${renderCompatibilityValue(nested)}</dd>`).join('')}</dl>`; if (Array.isArray(value)) return `<ul>${value.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`; return `<code>${escapeHtml(value)}</code>`; }
function renderCompatibility() { return `<p class="vf-docs-lede">This page is generated from the repository compatibility source used by CI and future release checks. Unselected support ranges remain visibly unselected instead of being guessed.</p>${renderCompatibilityValue(compatibility)}`; }
function composeExamples(bodyHtml, examples) { return bodyHtml.replace(/<div\s+data-vf-example="([^"]+)"\s*><\/div>/g, (_match, id) => { const example = examples.get(id); if (!example) throw new Error(`Documentation references unknown executable example: ${id}`); return renderDocumentationExample(example); }); }
async function pageBody(page, examples) { if (page.kind === 'generated') { if (page.generator === 'packages') return renderPackages(); if (page.generator === 'compatibility') return renderCompatibility(); throw new Error(`Unknown documentation generator: ${page.generator}`); } return composeExamples(await readFile(path.join(root, page.source), 'utf8'), examples); }
function navGroups() { const groups = new Map(); for (const page of registry.pages) { const pages = groups.get(page.group) || []; pages.push(page); groups.set(page.group, pages); } return groups; }
function renderNavLabel(item) { return item.kind === 'framework' ? `${renderFrameworkMark(item.framework)}<span>${escapeHtml(item.title)}</span>` : escapeHtml(item.title); }
function renderNavItem(currentPage, item) { return `<li data-vf-side-nav-item><a data-vf-side-nav-link href="${relativeRoute(currentPage.slug, item.slug)}"${item.slug === currentPage.slug ? ' data-vf-current="true" aria-current="page"' : ''}>${renderNavLabel(item)}</a></li>`; }
function renderComponentNavigation(currentPage, pages) {
  const grouped = new Map(componentUsageGroups.map((group) => [group.title, []]));
  for (const item of pages) {
    const items = grouped.get(item.subgroup) ?? [];
    items.push(item);
    grouped.set(item.subgroup, items);
  }
  return [...grouped.entries()].filter(([, items]) => items.length).map(([subgroup, items]) => `<div class="vf-docs-component-subgroup" data-vf-docs-component-subgroup><h3 class="vf-docs-component-subgroup__label">${escapeHtml(subgroup)}</h3><ul data-vf-side-nav-list>${items.sort((a, b) => a.title.localeCompare(b.title)).map((item) => renderNavItem(currentPage, item)).join('')}</ul></div>`).join('');
}
function renderNavigation(currentPage) {
  return [...groups.entries()].map(([group, pages]) => {
    const contents = group === 'Components' ? renderComponentNavigation(currentPage, pages) : `<ul data-vf-side-nav-list>${pages.map((item) => renderNavItem(currentPage, item)).join('')}</ul>`;
    return `<section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>${escapeHtml(group)}</h2>${contents}</section>`;
  }).join('');
}
const groups = navGroups();
const sharedFoundationPages = registry.pages.filter((page) => page.kind === 'shared' && page.slug !== '');
const frameworkPages = registry.pages.filter((page) => page.kind === 'framework');

function renderLayout(page, bodyHtml) {
  const nav = renderNavigation(page);
  const frameworkRoutes = Object.fromEntries(frameworkPages.map((item) => [item.framework, item.slug ? `${item.slug}/` : './']));
  const frameworkChoices = frameworkPages.map((item) => `<button type="button" data-vf-button data-vf-size="sm" data-vf-variant="${item.framework === page.framework ? 'secondary' : 'ghost'}" data-vf-framework-choice="${escapeHtml(item.framework)}" aria-pressed="${item.framework === page.framework ? 'true' : 'false'}">${renderFrameworkMark(item.framework)}<span>${escapeHtml(item.title)}</span></button>`).join('');
  const sharedLinks = page.kind === 'framework' ? `<section class="vf-docs-shared-links"><h2>Shared VyrnForge foundations</h2><p>These concepts are shared across framework ports and are intentionally not copied into this framework guide.</p><ul>${sharedFoundationPages.map((item) => `<li><a href="${relativeRoute(page.slug, item.slug)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></section>` : '';
  const pageTitle = page.kind === 'framework' ? `<h1 class="vf-docs-page-title">${renderFrameworkMark(page.framework)}<span>${escapeHtml(page.title)}</span></h1>` : `<h1>${escapeHtml(page.title)}</h1>`;
  const siteRoot = relativeRoute(page.slug, '');
  const appShellRuntime = relativeAsset(page.slug, 'vyrnforge/elements/app-shell.js');
  return `<!doctype html>\n<html lang="en" data-vf-docs-channel="${escapeHtml(channel)}" data-vf-theme="system">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="VyrnForge ${escapeHtml(page.title)} documentation"><title>${escapeHtml(page.title)} · VyrnForge</title><link rel="stylesheet" href="${relativeAsset(page.slug, 'vyrnforge/styles.css')}"><link rel="stylesheet" href="${relativeAsset(page.slug, 'styles.css')}"><link rel="stylesheet" href="${relativeAsset(page.slug, 'shell.css')}"></head>\n<body data-vf-site-root="${siteRoot}" data-vf-framework="${escapeHtml(page.framework || '')}" data-vf-version="${escapeHtml(rootManifest.version)}"><vf-app-shell data-vf-app-shell><a class="vf-skip-link" href="#main">Skip to content</a><header data-vf-app-shell-header class="vf-docs-header"><div class="vf-docs-header__inner"><a class="vf-docs-brand" href="${relativeRoute(page.slug, '')}">VyrnForge</a><span class="vf-docs-version" data-vf-docs-version>${escapeHtml(channel)} · ${escapeHtml(rootManifest.version)}</span><div class="vf-docs-tools"><div class="vf-docs-framework-picker" role="group" aria-label="Framework" data-vf-framework-picker>${frameworkChoices}</div><div class="vf-docs-search-wrap"><label for="vf-docs-search">Search</label> <input id="vf-docs-search" data-vf-docs-search type="search" autocomplete="off"><ul class="vf-docs-search-results" data-vf-docs-search-results hidden></ul></div></div></div></header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation class="vf-docs-navigation"><nav data-vf-side-nav aria-label="Documentation">${nav}</nav></aside><main data-vf-app-shell-main id="main">${pageTitle}${bodyHtml}${sharedLinks}</main></div><footer data-vf-app-shell-footer class="vf-docs-footer">VyrnForge documentation · ${escapeHtml(channel)} channel</footer></vf-app-shell><script type="module">import { defineAppShellElements } from "${appShellRuntime}"; defineAppShellElements();</script><script id="vf-framework-routes" type="application/json">${JSON.stringify(frameworkRoutes).replaceAll('<', '\\u003c')}</script><script src="${relativeAsset(page.slug, 'client.js')}" defer></script></body></html>`;
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(path.join(channelRoot, 'assets/vyrnforge'), { recursive: true });
await mkdir(path.join(channelRoot, 'assets/vyrnforge/elements'), { recursive: true });
await cp(path.join(root, 'apps/docs/styles.css'), path.join(channelRoot, 'assets/styles.css'));
await cp(path.join(root, 'apps/docs/shell.css'), path.join(channelRoot, 'assets/shell.css'));
await cp(path.join(root, 'apps/docs/client.js'), path.join(channelRoot, 'assets/client.js'));
await cp(path.join(root, 'packages/web/src/styles.css'), path.join(channelRoot, 'assets/vyrnforge/styles.css'));
await cp(path.join(root, 'packages/web/src/styles'), path.join(channelRoot, 'assets/vyrnforge/styles'), { recursive: true });
await cp(path.join(root, 'packages/web/src/components'), path.join(channelRoot, 'assets/vyrnforge/components'), { recursive: true });
await cp(path.join(root, 'packages/elements/dist/components/app-shell/index.js'), path.join(channelRoot, 'assets/vyrnforge/elements/app-shell.js'));
const examples = await buildDocumentationExamples({ root, channelRoot });
await writeFile(path.join(outRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${channel}/"><title>VyrnForge documentation</title></head><body><a href="./${channel}/">Open VyrnForge ${channel} documentation</a></body></html>`);
const searchIndex = [];
for (const page of registry.pages) { const bodyHtml = makeScrollableRegionsKeyboardReachable(await pageBody(page, examples)); const outputDirectory = path.join(channelRoot, page.slug); await mkdir(outputDirectory, { recursive: true }); await writeFile(path.join(outputDirectory, 'index.html'), renderLayout(page, bodyHtml)); searchIndex.push({ title: page.title, path: page.slug ? `${page.slug}/` : './', text: stripHtml(bodyHtml), framework: page.framework || null }); }
await writeFile(path.join(channelRoot, 'search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`);
await writeFile(path.join(channelRoot, 'site-manifest.json'), `${JSON.stringify({ channel, version: rootManifest.version, pages: registry.pages.map(({ slug, title, kind, framework }) => ({ slug, title, kind, framework: framework || null })), examples: [...examples.keys()] }, null, 2)}\n`);
process.stdout.write(`documentation build: ${registry.pages.length} pages, ${examples.size} executable examples -> ${path.relative(root, channelRoot)}\n`);
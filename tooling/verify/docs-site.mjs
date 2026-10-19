import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(root, 'dist/docs', channel);
const registry = JSON.parse(await readFile(path.join(root, 'documentation/site/registry.json'), 'utf8'));
const compatibility = JSON.parse(await readFile(path.join(root, 'tooling/compatibility/support-status.json'), 'utf8'));

const slugs = new Set();
for (const page of registry.pages) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate docs slug: ${page.slug}`);
  slugs.add(page.slug);
  if (page.source) await access(path.join(root, page.source));
}

for (const framework of ['react', 'angular', 'vue', 'elements', 'native-web']) {
  const page = registry.pages.find((item) => item.framework === framework);
  if (!page) throw new Error(`Missing framework documentation page for ${framework}`);
}

function htmlLinks(html) {
  return [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
}

function resolveLocalLink(pageDirectory, href) {
  if (/^(?:https?:|mailto:|#)/.test(href)) return null;
  const withoutHash = href.split('#')[0].split('?')[0];
  if (!withoutHash) return null;
  const resolved = path.resolve(pageDirectory, withoutHash);
  if (/\.[a-z0-9]+$/i.test(withoutHash)) return resolved;
  return path.join(resolved, 'index.html');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function leafValues(value) {
  if (Array.isArray(value)) return value.flatMap(leafValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(leafValues);
  return value === null || value === undefined ? [] : [value];
}

for (const page of registry.pages) {
  const pageDirectory = path.join(channelRoot, page.slug);
  const file = path.join(pageDirectory, 'index.html');
  const html = await readFile(file, 'utf8');
  for (const required of ['<html lang="en"', 'name="viewport"', 'class="vf-skip-link"', '<nav class="vf-docs-nav"', '<main id="main">', '<h1>', 'data-vf-framework-select', 'data-vf-docs-search', 'vyrnforge/button.css']) {
    if (!html.includes(required)) throw new Error(`${page.slug || '<home>'} missing required docs markup: ${required}`);
  }
  if (page.kind === 'framework' && !html.includes('data-vf-support-status=')) {
    throw new Error(`${page.slug} must explicitly declare implementation/support status`);
  }
  for (const href of htmlLinks(html)) {
    if (href.startsWith('javascript:')) throw new Error(`${page.slug} contains javascript: URL`);
    const target = resolveLocalLink(pageDirectory, href);
    if (target) await access(target).catch(() => { throw new Error(`Broken documentation link from ${page.slug || '<home>'}: ${href}`); });
  }
}

const buttonHtml = await readFile(path.join(channelRoot, 'components/button/index.html'), 'utf8');
for (const required of [
  'data-vf-example-id="button/basic"',
  'data-vf-example-framework="native-web"',
  'data-vf-example-framework="react"',
  'data-vf-example-framework="angular"',
  'data-vf-example-framework="vue"',
  'data-vf-example-frame',
  'data-vf-example-source',
  'data-vf-example-run',
  'data-vf-example-reset'
]) {
  if (!buttonHtml.includes(required)) throw new Error(`Generated Button page missing executable playground markup: ${required}`);
}
if (buttonHtml.includes('first new-generation component baseline')) throw new Error('Generated Button page leaked rebuild-history status language');

for (const relative of [
  'assets/vyrnforge/tokens.css',
  'assets/vyrnforge/button.css',
  'assets/examples/typescript.js',
  'assets/examples/runtime-react.js',
  'assets/examples/runtime-angular.js',
  'assets/examples/runtime-vue.js',
  'assets/examples/frame.css',
  'assets/examples/previews/button-basic-native-web.html',
  'assets/examples/previews/button-basic-react.html',
  'assets/examples/previews/button-basic-angular.html',
  'assets/examples/previews/button-basic-vue.html',
  'assets/examples/compiled/button-basic-react.js',
  'assets/examples/compiled/button-basic-angular.js',
  'assets/examples/compiled/button-basic-vue.js'
]) await access(path.join(channelRoot, relative));

const searchIndex = JSON.parse(await readFile(path.join(channelRoot, 'search-index.json'), 'utf8'));
if (searchIndex.length !== registry.pages.length) throw new Error('Docs search index does not include every registered page');
for (const item of searchIndex) {
  const slug = item.path === './' ? '' : item.path.replace(/\/$/, '');
  if (!slugs.has(slug)) throw new Error(`Search index points to unknown docs page: ${item.path}`);
}

const compatibilityHtml = await readFile(path.join(channelRoot, 'reference/compatibility/index.html'), 'utf8');
for (const value of leafValues(compatibility)) {
  if (!compatibilityHtml.includes(escapeHtml(value))) throw new Error(`Compatibility page drifted from support source leaf value: ${value}`);
}

const siteManifest = JSON.parse(await readFile(path.join(channelRoot, 'site-manifest.json'), 'utf8'));
if (!siteManifest.examples?.includes('button/basic')) throw new Error('Site manifest must expose the Button executable example');

await access(path.join(root, 'dist/docs/index.html'));
process.stdout.write(`documentation site verification: ${registry.pages.length} pages and executable Button playground ok\n`);

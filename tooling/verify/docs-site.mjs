import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentUsageGroups } from '../docs/component-usage-groups.mjs';
import { documentationRegistry } from '../docs/registry.mjs';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const channelRoot = path.join(root, 'dist/docs', channel);
const registry = documentationRegistry(root);
const discovery = discoverProductUnits(root);
const slugs = new Set();
for (const page of registry.pages) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate docs slug: ${page.slug}`);
  slugs.add(page.slug);
  if (page.source) await access(path.join(root, page.source));
}
for (const framework of ['react', 'angular', 'vue', 'elements', 'native-web']) if (!registry.pages.some((item) => item.framework === framework)) throw new Error(`Missing framework documentation page for ${framework}`);
function htmlLinks(html) { return [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]); }
function resolveLocalLink(pageDirectory, href) { if (/^(?:https?:|mailto:|#)/.test(href)) return null; const withoutHash = href.split('#')[0].split('?')[0]; if (!withoutHash) return null; const resolved = path.resolve(pageDirectory, withoutHash); return /\.[a-z0-9]+$/i.test(withoutHash) ? resolved : path.join(resolved, 'index.html'); }
function safeName(value) { return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase(); }
function escapedText(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
for (const page of registry.pages) {
  const pageDirectory = path.join(channelRoot, page.slug);
  const html = await readFile(path.join(pageDirectory, 'index.html'), 'utf8');
  for (const required of [
    '<html lang="en"',
    'name="viewport"',
    'class="vf-skip-link"',
    '<vf-app-shell data-vf-app-shell>',
    'data-vf-app-shell-header',
    'data-vf-app-shell-body',
    'data-vf-app-shell-navigation',
    'data-vf-side-nav',
    'data-vf-app-shell-main',
    'id="main"',
    'data-vf-app-shell-footer',
    'defineAppShellElements',
    'vyrnforge/elements/app-shell.js',
    '<h1',
    'data-vf-framework-picker',
    'data-vf-framework-choice',
    'data-vf-framework-mark',
    'data-vf-docs-component-subgroup',
    'data-vf-docs-search',
    'vyrnforge/styles.css'
  ]) if (!html.includes(required)) throw new Error(`${page.slug || '<home>'} missing required docs markup: ${required}`);
  for (const group of componentUsageGroups) if (!html.includes(`<span>${escapedText(group.title)}</span>`)) throw new Error(`${page.slug || '<home>'} missing component usage group: ${group.title}`);
  const componentGroupCount = [...html.matchAll(/data-vf-docs-component-subgroup/g)].length;
  if (componentGroupCount !== componentUsageGroups.length) throw new Error(`${page.slug || '<home>'} renders ${componentGroupCount} component groups; expected ${componentUsageGroups.length}`);
  if (html.includes('data-vf-framework-select')) throw new Error(`${page.slug || '<home>'} still emits the superseded text-only framework select`);
  if (html.includes('<body data-vf-app-shell')) throw new Error(`${page.slug || '<home>'} still uses body as an AppShell lookalike instead of consuming vf-app-shell`);
  if (!html.includes('aria-current="page"')) throw new Error(`${page.slug || '<home>'} missing current-page navigation semantics`);
  if (html.includes('class="vf-docs-shell"') || html.includes('class="vf-docs-nav"')) throw new Error(`${page.slug || '<home>'} still emits the superseded docs-only shell/navigation classes`);
  if (page.kind === 'framework' && !html.includes('data-vf-support-status=')) throw new Error(`${page.slug} must explicitly declare implementation/support status`);
  for (const href of htmlLinks(html)) {
    if (href.startsWith('javascript:')) throw new Error(`${page.slug} contains javascript: URL`);
    const target = resolveLocalLink(pageDirectory, href);
    if (target) await access(target).catch(() => { throw new Error(`Broken documentation link from ${page.slug || '<home>'}: ${href}`); });
  }
}
await access(path.join(channelRoot, 'assets/vyrnforge/styles.css'));
await access(path.join(channelRoot, 'assets/vyrnforge/styles/tokens.css'));
await access(path.join(channelRoot, 'assets/vyrnforge/elements/app-shell.js'));
await access(path.join(channelRoot, 'assets/examples/typescript.js'));
await access(path.join(channelRoot, 'assets/examples/frame.css'));
const expectedExampleIds = [];
for (const component of discovery.components) {
  const componentHtml = await readFile(path.join(channelRoot, `components/${component.component}/index.html`), 'utf8');
  if (component.ports.web) await access(path.join(channelRoot, `assets/vyrnforge/components/${component.component}/${component.component}.css`));
  for (const manifestPath of component.exampleManifests) {
    const manifest = JSON.parse(await readFile(path.join(root, manifestPath), 'utf8'));
    expectedExampleIds.push(manifest.id);
    if (!componentHtml.includes(`data-vf-example-id="${manifest.id}"`)) throw new Error(`${component.component} page missing executable example ${manifest.id}`);
    const key = safeName(manifest.id);
    for (const framework of Object.keys(manifest.frameworks ?? {})) {
      if (!componentHtml.includes(`data-vf-example-framework="${framework}"`)) throw new Error(`${manifest.id} page missing framework tab ${framework}`);
      await access(path.join(channelRoot, `assets/examples/previews/${key}-${framework}.html`));
      if (framework !== 'native-web') {
        await access(path.join(channelRoot, `assets/examples/compiled/${key}-${framework}.js`));
        await access(path.join(channelRoot, `assets/examples/runtime-${key}-${framework}.js`));
      }
    }
  }
}
const searchIndex = JSON.parse(await readFile(path.join(channelRoot, 'search-index.json'), 'utf8'));
if (searchIndex.length !== registry.pages.length) throw new Error('Docs search index does not include every discovered page');
for (const item of searchIndex) { const slug = item.path === './' ? '' : item.path.replace(/\/$/, ''); if (!slugs.has(slug)) throw new Error(`Search index points to unknown docs page: ${item.path}`); }
const compatibilityHtml = await readFile(path.join(channelRoot, 'reference/compatibility/index.html'), 'utf8');
for (const required of ['Framework versions', 'Component availability', 'Browser support', 'Server rendering', '19.3.x', '22.x', '3.5.x']) if (!compatibilityHtml.includes(required)) throw new Error(`Compatibility page missing public support information: ${required}`);
for (const marker of ['implementation-baseline', 'representative-components-implemented', 'selected-validation-baseline', 'typescriptEslint']) if (compatibilityHtml.includes(marker)) throw new Error(`Compatibility page exposes internal support metadata: ${marker}`);
const siteManifest = JSON.parse(await readFile(path.join(channelRoot, 'site-manifest.json'), 'utf8'));
for (const id of expectedExampleIds) if (!siteManifest.examples?.includes(id)) throw new Error(`Site manifest is missing executable example ${id}`);
await access(path.join(root, 'dist/docs/index.html'));
process.stdout.write(`documentation site verification: ${registry.pages.length} pages and ${expectedExampleIds.length} discovered examples ok\n`);

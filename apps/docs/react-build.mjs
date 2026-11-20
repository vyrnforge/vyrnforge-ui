import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { compileFrameworkDocumentation } from '../../tooling/docs/framework-documentation.mjs';
import { compileNativeDocumentation } from '../../tooling/docs/native-documentation.mjs';
import { documentationShellStyleSpecifiers, resolvePublicWebStyleAsset } from '../../tooling/docs/public-shell-styles.mjs';
import { ReactReferencePage } from './react-reference.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const reactRoot = path.join(outRoot, channel, 'react');
const reactModel = compileFrameworkDocumentation('react', root);
const webModel = compileFrameworkDocumentation('native-web', root);
const nativeModel = compileNativeDocumentation(root);
const button = reactModel.componentCatalog.find((entry) => entry.id === 'button');
if (!button?.showcaseAvailable || !button.apiAvailable || !button.frameworkContent) {
  throw new Error('React documentation pilot requires real public Button API, shared and React-authored content');
}
const basicExample = button.examples.find((entry) => entry.id === 'button/basic');
if (!basicExample?.sourcePath.endsWith('/react.tsx')) {
  throw new Error('React documentation requires the checked-in executable Button example');
}
const layout = reactModel.componentCatalog.find((entry) => entry.id === 'layout');
// Extend the existing bounded React pilot from real Product Graph owners.
const typographyIds = ['text', 'code', 'kbd'];
const typography = Object.fromEntries(await Promise.all(typographyIds.map(async (id) => {
  const owner = reactModel.componentCatalog.find((entry) => entry.id === id);
  const examples = owner?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
  const basic = examples.find((example) => example.id === id + '/basic');
  if (!owner?.showcaseAvailable || !owner.apiAvailable || !owner.sharedContent ||
      !owner.frameworkContent || !basic?.sourcePath.endsWith('/react.tsx') ||
      !examples.every((example) => example.sourcePath.endsWith('/react.tsx') &&
        example.source.includes("'@vyrnforge/react/" + id + "'")) ||
      !owner.publicEntrypoints.includes('@vyrnforge/react/' + id) ||
      !webModel.packageManifest.exports?.['./styles/' + id + '.css']) {
    throw new Error('React Typography guide needs real ' + id + ' source, CSS and authored React example');
  }
  const publicSourcePath = path.join(
    path.dirname(path.dirname(owner.frameworkSourcePath)), 'index.ts');
  const publicSource = await readFile(path.join(root, publicSourcePath), 'utf8');
  if (!publicSource.includes('export ')) {
    throw new Error('React Typography ' + id + ' has no public TypeScript source');
  }
  return [id, {
    id, title: owner.title, sharedContent: owner.sharedContent,
    frameworkContent: owner.frameworkContent, standardReferences: owner.standardReferences,
    publicEntrypoints: owner.publicEntrypoints, showcaseRoute: owner.showcaseRoute,
    apiRoute: owner.apiRoute, sharedSourcePath: owner.sharedSourcePath,
    frameworkSourcePath: owner.frameworkSourcePath, publicSourcePath,
    publicSource, example: basic, examples,
  }];
})));
const layoutStylesheet = '@vyrnforge/web/styles/layout.css';
if (!layout?.apiAvailable || layout.guideOnly ||
    !layout.publicEntrypoints.includes('@vyrnforge/react/layout') ||
    !webModel.packageManifest.exports?.['./styles/layout.css'] ||
    !layout.sharedContent || !layout.frameworkContent || layout.examples.length !== 6) {
  throw new Error('React Layout guide requires real Flow/AutoGrid React exports, their shared stylesheet, and six checked-in React examples');
}
const layoutPublicSource = await readFile(
  path.join(root, path.dirname(path.dirname(layout.frameworkSourcePath)), 'index.ts'), 'utf8');
const layoutTypesStart = layoutPublicSource.indexOf('export type LayoutElement');
const layoutTypesEnd = layoutPublicSource.indexOf('// Mirrors VyrnForge Text', layoutTypesStart);
if (layoutTypesStart < 0 || layoutTypesEnd < 0 ||
    !layoutPublicSource.includes('export const Flow = FlowImpl') ||
    !layoutPublicSource.includes('export const AutoGrid = AutoGridImpl')) {
  throw new Error('React Layout type contract changed; review the generated reference');
}
const publicLayoutTypes = layoutPublicSource.slice(layoutTypesStart, layoutTypesEnd).trim();
const layoutExamples = layout.examples.sort((a, b) => a.id.localeCompare(b.id));
const layoutSlugs = layoutExamples.map((example) => example.id.split('/')[1]);
if (new Set(layoutSlugs).size !== 6 || !layoutSlugs.includes('basic')) {
  throw new Error('React Layout examples must have six unique product-owned example ids');
}

// Verify reference types against the product-owned public React source, not a hand-maintained API table.
const reactButtonTypePath = path.join(root, path.dirname(path.dirname(button.frameworkSourcePath)), 'index.ts');
const reactButtonSource = await readFile(reactButtonTypePath, 'utf8');
const publicTypesStart = reactButtonSource.indexOf('export type ButtonVariant');
const publicTypesEnd = reactButtonSource.indexOf('export const Button =', publicTypesStart);
if (publicTypesStart < 0 || publicTypesEnd < 0 ||
  !reactButtonSource.slice(publicTypesStart, publicTypesEnd).includes('interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>') ||
  !reactButtonSource.includes('forwardRef<HTMLButtonElement, ButtonProps>')) {
  throw new Error('React Button type contract changed; review the public documentation reference');
}
const publicButtonTypes = reactButtonSource.slice(publicTypesStart, publicTypesEnd).trim();
const shellStyles = documentationShellStyleSpecifiers.map((specifier) =>
  resolvePublicWebStyleAsset(webModel.packageManifest, specifier).assetPath);

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function directory(route) {
  return (channel + '/react/' + route).replace(/\/$/, '');
}
function relative(from, to, isDirectory = false) {
  const target = to.replace(/^\/+|\/+$/g, '');
  const result = path.posix.relative(from, target) || '.';
  return isDirectory ? (result === '.' ? './' : result + '/') : result;
}
function linksFor(route) {
  const dir = directory(route);
  const react = channel + '/react/';
  const native = channel + '/native-web/';
  return {
    channel,
    home: relative(dir, react, true),
    self: relative(dir, react + route, true),
    guide: relative(dir, react + 'components/button/', true),
    api: relative(dir, react + 'api/components/button/', true),
    example: relative(dir, react + 'examples/button-basic/', true),
    layout: relative(dir, react + layout.showcaseRoute, true),
    layoutApi: relative(dir, react + layout.apiRoute, true),
    layoutExampleBase: relative(dir, react + 'examples/layout/', true),
    typography: Object.fromEntries(typographyIds.map((id) => [id, {
      guide: relative(dir, react + typography[id].showcaseRoute, true),
      api: relative(dir, react + typography[id].apiRoute, true),
      example: relative(dir, react + 'examples/typography/' + id + '/', true),
      examples: Object.fromEntries(typography[id].examples.map((example) => {
        const slug = example.id.slice(id.length + 1);
        return [slug, relative(dir, react + 'examples/typography/' + id +
          (slug === 'basic' ? '/' : '/' + slug + '/'), true)];
      })),
    }])),
    native: relative(dir, native + (route === '' ? '' : route), true),
  };
}
async function verifyStyles(dir) {
  for (const name of [...shellStyles, '/assets/docs.css']) {
    const target = path.resolve(outRoot, dir, relative(dir, name));
    const info = await stat(target).catch(() => null);
    if (!info?.isFile()) throw new Error('React documentation stylesheet missing: ' + name);
  }
}
async function writePage(route, page) {
  const dir = directory(route);
  await verifyStyles(dir);
  const pageRoot = path.join(outRoot, dir);
  await mkdir(pageRoot, { recursive: true });
  await writeFile(path.join(pageRoot, 'index.html'), page);
}
await mkdir(reactRoot, { recursive: true });
await mkdir(path.join(outRoot, 'assets'), { recursive: true });

await build({
  entryPoints: [path.join(root, 'apps/docs/react-hydrate.mjs')],
  bundle: true, platform: 'browser', format: 'esm', target: 'es2022',
  outfile: path.join(outRoot, 'assets/react-reference.js'), logLevel: 'silent',
});
await build({
  entryPoints: [path.join(root, basicExample.sourcePath)],
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
  outfile: path.join(outRoot, 'assets/react-button-basic.js'), logLevel: 'silent',
});
await build({
  entryPoints: [path.join(root, 'apps/docs/react-layout-examples.tsx')],
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
  jsx: 'automatic',
  outfile: path.join(outRoot, 'assets/react-layout-examples.js'), logLevel: 'silent',
});

// Each runnable example is discovered from its product-owned manifest and
// bundled directly from the checked-in React TSX. This presentation pattern
// serves later components without adding a second example registry.
for (const id of typographyIds) {
  const unit = typography[id];
  for (const example of unit.examples) {
    const slug = example.id.slice(id.length + 1);
    const asset = 'react-typography-' + id + (slug === 'basic' ? '' : '-' + slug);
    await build({
      entryPoints: [path.join(root, example.sourcePath)],
      bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
      jsx: 'automatic', logLevel: 'silent',
      outfile: path.join(outRoot, 'assets', asset + '.js'),
    });
    const cssFile = path.join(outRoot, 'assets', asset + '.css');
    if (!(await stat(cssFile).catch(() => null))?.isFile()) {
      throw new Error('React ' + example.id + ' must extract canonical browser CSS');
    }
    const route = 'examples/typography/' + id + (slug === 'basic' ? '/' : '/' + slug + '/');
    const dir = directory(route);
    const styles = shellStyles.map((file) =>
      '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\\n');
    const extracted = relative(dir, 'assets/' + asset + '.css');
    await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>React ' + escapeHtml(example.title) + ' example · VyrnForge</title>' +
      styles + '<link rel="stylesheet" href="' + escapeHtml(extracted) + '">' +
      '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
      '#root{min-width:0}.vf-example-stack{display:flex;flex-direction:column;gap:var(--vf-space-md)}</style>' +
      '</head><body><div id="root"></div><script src="' +
      escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
  }
}

const exampleDir = directory('examples/button-basic/');
const exampleStyles = shellStyles.map((asset) =>
  '  <link rel="stylesheet" href="' + escapeHtml(relative(exampleDir, asset)) + '">').join('\n');
await writePage('examples/button-basic/', '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>React Button example · VyrnForge</title>\n' + exampleStyles +
  '\n<style>body{margin:0;padding:1rem;min-width:0}.vf-example-stack{display:flex;flex-wrap:wrap;gap:1rem}</style>' +
  '</head><body><div id="root"></div><script src="' +
  escapeHtml(relative(exampleDir, 'assets/react-button-basic.js')) + '"></script></body></html>');

// One checked-in React example component per iframe; the application adapter
// composes the product-owned examples without adding public React layout wrappers.
for (const slug of layoutSlugs) {
  const exampleRoute = 'examples/layout/' + slug + '/';
  const demoDir = directory(exampleRoute);
  const demoStyles = shellStyles.map((asset) =>
    '  <link rel="stylesheet" href="' + escapeHtml(relative(demoDir, asset)) + '">').join('\n');
  await writePage(exampleRoute, '<!doctype html><html lang="en"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React Layout example · VyrnForge</title>\n' + demoStyles +
    '\n<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}#root{min-width:0}input{max-width:100%;box-sizing:border-box}body[data-vf-layout-example="flow-wrap"] #root{max-inline-size:16rem}</style>' +
    '</head><body data-vf-layout-example="' + escapeHtml(slug) + '"><div id="root"></div><script src="' +
    escapeHtml(relative(demoDir, 'assets/react-layout-examples.js')) + '"></script></body></html>');
}

const pageViews = [
  { route: '', view: 'home', title: 'React overview', description: 'VyrnForge React documentation pilot' },
  { route: button.showcaseRoute, view: 'guide', title: 'React Button guide', description: 'Shared Button semantics and React usage' },
  { route: button.apiRoute, view: 'api', title: 'React Button API', description: 'Verified public React Button API' },
  { route: layout.showcaseRoute, view: 'layout', title: 'React Layout guide', description: 'Flow and AutoGrid usage in React with shared Web CSS' },
  { route: layout.apiRoute, view: 'layout-api', title: 'React Layout API', description: 'Public React Flow and AutoGrid props and stylesheet' },
  ...typographyIds.flatMap((id) => [
    { route: typography[id].showcaseRoute, view: 'typography', topic: id,
      title: 'React ' + typography[id].title + ' guide',
      description: 'Live checked-in React ' + typography[id].title + ' example and shared typography semantics' },
    { route: typography[id].apiRoute, view: 'typography-api', topic: id,
      title: 'React ' + typography[id].title + ' API',
      description: 'Source-backed React ' + typography[id].title + ' API reference' },
  ]),
];
// All Native destinations have a React-context response, even when a React guide
// has not been implemented. Never disguise an unavailable view as another port.
const renderedRoutes = new Set(pageViews.map((page) => page.route));
const nativeRoutes = new Set([
  'components/', 'patterns/', 'api/components/', 'api/patterns/',
  ...nativeModel.foundationPages.map((page) => page.route),
  ...nativeModel.showcasePages.map((page) => page.route),
  ...nativeModel.apiPages.map((page) => page.route),
]);
const namedNativePages = [...nativeModel.foundationPages, ...nativeModel.showcasePages, ...nativeModel.apiPages];
for (const route of nativeRoutes) {
  if (renderedRoutes.has(route)) continue;
  const nativePage = namedNativePages.find((page) => page.route === route);
  pageViews.push({
    route, view: 'unavailable', requestedTopic: nativePage?.title ?? route.replace(/\/$/, ''),
    title: 'React documentation unavailable', description: 'React documentation is not available for this topic',
  });
}
const pageData = {
  id: button.id,
  title: button.title,
  publicEntrypoints: button.publicEntrypoints,
  sharedContent: button.sharedContent,
  frameworkContent: button.frameworkContent,
  standardReferences: button.standardReferences,
  publicButtonTypes,
  examples: button.examples.filter((example) => example.id === 'button/basic'),
};
const layoutData = {
  id: layout.id,
  sharedContent: layout.sharedContent,
  frameworkContent: layout.frameworkContent,
  frameworkSourcePath: layout.frameworkSourcePath,
  standardReferences: layout.standardReferences,
  publicEntrypoints: layout.publicEntrypoints,
  publicLayoutTypes,
  cssRecipeStyle: layoutStylesheet,
  examples: layoutExamples,
};
for (const page of pageViews) {
  const dir = directory(page.route);
  const props = { view: page.view, links: linksFor(page.route), button: pageData,
    layout: (page.view === 'layout' || page.view === 'layout-api') ? layoutData : null,
    typography: page.topic ? typography[page.topic] : null,
    requestedTopic: page.requestedTopic ?? null };
  const initialHtml = renderToString(createElement(ReactReferencePage, props));
  const serialized = JSON.stringify(props).replaceAll('<', '\\u003c');
  const styles = shellStyles.map((asset) =>
    '  <link rel="stylesheet" href="' + escapeHtml(relative(dir, asset)) + '">').join('\n');
  const pageHtml = '<!doctype html><html lang="en" data-vf-theme="light" data-vf-density="comfortable"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="description" content="' + escapeHtml(page.description) + '">' +
    '<meta name="color-scheme" content="light dark">' +
    '<title>' + escapeHtml(page.title) + ' · VyrnForge</title>' +
    '<script>try{const v=localStorage.getItem("vf-docs-theme");if(v==="light"||v==="dark")document.documentElement.dataset.vfTheme=v}catch{}</script>\n' +
    styles + '\n<link rel="stylesheet" href="' + escapeHtml(relative(dir, 'assets/docs.css')) + '">' +
    '<style>.vf-docs-react-example-frame{box-sizing:border-box;display:block;inline-size:100%;min-block-size:10rem;border:1px solid var(--vf-color-border);border-radius:var(--vf-control-radius)}</style>' +
    '</head><body><div id="vf-react-root">' + initialHtml + '</div>' +
    '<script type="application/json" id="vf-react-page-data">' + serialized + '</script>' +
    '<script type="module" src="' + escapeHtml(relative(dir, 'assets/react-reference.js')) + '"></script>' +
    '</body></html>';
  await writePage(page.route, pageHtml);
}
await writeFile(path.join(reactRoot, 'site-manifest.json'), JSON.stringify({
  channel, framework: 'react', status: 'button-layout-typography-pilot',
  source: 'Product Graph public React surface',
  routes: pageViews.map(({ route, view }) => ({ route, view })),
  layout: {
    guideOnly: layout.guideOnly,
    api: layout.apiAvailable,
    publicEntrypoints: layout.publicEntrypoints,
    cssRecipeStyle: layoutStylesheet,
    frameworkSourcePath: layout.frameworkSourcePath,
    sharedSourcePath: layout.sharedSourcePath,
    examples: layoutExamples.map((example) => ({ id: example.id, sourcePath: example.sourcePath })),
  },
  typography: Object.fromEntries(typographyIds.map((id) => [id, {
    guideRoute: typography[id].showcaseRoute,
    apiRoute: typography[id].apiRoute,
    publicEntrypoints: typography[id].publicEntrypoints,
    sharedSourcePath: typography[id].sharedSourcePath,
    frameworkSourcePath: typography[id].frameworkSourcePath,
    publicSourcePath: typography[id].publicSourcePath,
    exampleSourcePath: typography[id].example.sourcePath,
    examples: typography[id].examples.map((example) => ({
      id: example.id, title: example.title, description: example.description,
      documentationSection: example.documentationSection, sourcePath: example.sourcePath,
    })),
  }])),
  button: {
    publicEntrypoints: button.publicEntrypoints,
    sharedSourcePath: button.sharedSourcePath,
    frameworkSourcePath: button.frameworkSourcePath,
    executableExampleSource: basicExample.sourcePath,
  },
}, null, 2) + '\n');
process.stdout.write('React Button, Layout and Typography documentation pilot -> ' + path.relative(root, reactRoot) + '\n');

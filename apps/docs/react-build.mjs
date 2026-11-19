import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { compileFrameworkDocumentation } from '../../tooling/docs/framework-documentation.mjs';
import { documentationShellStyleSpecifiers, resolvePublicWebStyleAsset } from '../../tooling/docs/public-shell-styles.mjs';
import { ReactReferencePage } from './react-reference.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const reactRoot = path.join(outRoot, channel, 'react');
const reactModel = compileFrameworkDocumentation('react', root);
const webModel = compileFrameworkDocumentation('native-web', root);
const button = reactModel.componentCatalog.find((entry) => entry.id === 'button');
if (!button?.showcaseAvailable || !button.apiAvailable || !button.frameworkContent) {
  throw new Error('React documentation pilot requires real public Button API, shared and React-authored content');
}
const basicExample = button.examples.find((entry) => entry.id === 'button/basic');
if (!basicExample?.sourcePath.endsWith('/react.tsx')) {
  throw new Error('React documentation requires the checked-in executable Button example');
}
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
    guide: relative(dir, react + 'components/button/', true),
    api: relative(dir, react + 'api/components/button/', true),
    example: relative(dir, react + 'examples/button-basic/', true),
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

const exampleDir = directory('examples/button-basic/');
const exampleStyles = shellStyles.map((asset) =>
  '  <link rel="stylesheet" href="' + escapeHtml(relative(exampleDir, asset)) + '">').join('\n');
await writePage('examples/button-basic/', '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>React Button example · VyrnForge</title>\n' + exampleStyles +
  '\n<style>body{margin:0;padding:1rem;min-width:0}.vf-example-stack{display:flex;flex-wrap:wrap;gap:1rem}</style>' +
  '</head><body><div id="root"></div><script src="' +
  escapeHtml(relative(exampleDir, 'assets/react-button-basic.js')) + '"></script></body></html>');

const pageViews = [
  { route: '', view: 'home', title: 'React overview', description: 'VyrnForge React documentation pilot' },
  { route: 'components/button/', view: 'guide', title: 'React Button guide', description: 'Shared Button semantics and React usage' },
  { route: 'api/components/button/', view: 'api', title: 'React Button API', description: 'Verified public React Button API' },
];
const pageData = {
  id: button.id,
  title: button.title,
  publicEntrypoints: button.publicEntrypoints,
  sharedContent: button.sharedContent,
  frameworkContent: button.frameworkContent,
  examples: button.examples.filter((example) => example.id === 'button/basic'),
};
for (const page of pageViews) {
  const dir = directory(page.route);
  const props = { view: page.view, links: linksFor(page.route), button: pageData };
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
  channel, framework: 'react', status: 'button-pilot',
  source: 'Product Graph public React surface',
  routes: pageViews.map(({ route, view }) => ({ route, view })),
  button: {
    publicEntrypoints: button.publicEntrypoints,
    sharedSourcePath: button.sharedSourcePath,
    frameworkSourcePath: button.frameworkSourcePath,
    executableExampleSource: basicExample.sourcePath,
  },
}, null, 2) + '\n');
process.stdout.write('React Button documentation pilot -> ' + path.relative(root, reactRoot) + '\n');

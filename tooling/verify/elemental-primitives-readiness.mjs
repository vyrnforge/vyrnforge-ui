import { readFile } from 'node:fs/promises';

const impact = JSON.parse(await readFile('tooling/impact/config.json', 'utf8'));
const webManifest = JSON.parse(await readFile('packages/web/package.json', 'utf8'));
const aggregateCss = await readFile('packages/web/src/styles.css', 'utf8');
const elementalCss = await readFile('packages/web/src/components/elemental-primitives/elemental-primitives.css', 'utf8');
const docsRegistry = JSON.parse(await readFile('documentation/site/registry.json', 'utf8'));
const elementalDocs = await readFile('documentation/shared/l1-primitives.html', 'utf8');

const requiredPublicHooks = [
  'data-vf-code',
  'data-vf-code-block',
  'data-vf-kbd',
  'data-vf-mark',
  'data-vf-image',
  'data-vf-skeleton',
  'data-vf-color-swatch',
  'data-vf-prose',
];
for (const hook of requiredPublicHooks) {
  if (!elementalCss.includes(hook)) throw new Error(`Elemental primitive CSS is missing public hook: ${hook}`);
}

for (const privateRecipe of ['._vf-checkmark', '._vf-radiomark', '._vf-selection-indicator']) {
  if (!elementalCss.includes(privateRecipe)) throw new Error(`Elemental primitive internal recipe is missing: ${privateRecipe}`);
  const publicName = privateRecipe.replace('._vf-', 'data-vf-');
  if (elementalCss.includes(publicName)) throw new Error(`Elemental primitive internal recipe leaked a public data hook: ${publicName}`);
}

if (webManifest.exports?.['./styles/elemental-primitives.css'] !== './dist/components/elemental-primitives/elemental-primitives.css') {
  throw new Error('@vyrnforge/web must export the elemental primitive stylesheet from its conventional component output');
}
if (!aggregateCss.includes('@import "./components/elemental-primitives/elemental-primitives.css";')) {
  throw new Error('Aggregate Web CSS must include the elemental primitive stylesheet');
}

const nativeElements = ['blockquote', 'q', 'h1', 'p', 'figure', 'figcaption', 'ul', 'ol', 'li', 'strong', 'em', 'small', 'sub', 'sup', 'abbr', 'address', 'cite', 'time'];
for (const tag of nativeElements) {
  if (!elementalDocs.includes(`<code>${tag}</code>`)) throw new Error(`Elemental primitive documentation is missing supported native element: ${tag}`);
}
for (const deferred of ['StatusIndicator', 'AvatarFallback']) {
  if (!elementalDocs.includes(deferred) || !elementalDocs.includes('deferred')) throw new Error(`Elemental primitive documentation must explicitly resolve deferred candidate ${deferred}`);
}

const elementalRoute = docsRegistry.pages?.find((page) => page.slug === 'foundations/l1-primitives');
if (!elementalRoute || elementalRoute.source !== 'documentation/shared/l1-primitives.html') throw new Error('Elemental primitive documentation route is missing');

for (const scope of ['elemental-primitives-readiness', 'browser-elemental-primitives']) {
  if (!impact.scopeOrder?.includes(scope)) throw new Error(`Elemental primitive validation scope is missing: ${scope}`);
  for (const tier of ['main', 'scheduled', 'release']) {
    if (!impact.tiers?.[tier]?.includes(scope)) throw new Error(`Elemental primitive ${scope} evidence is missing from ${tier} validation`);
  }
}

process.stdout.write('elemental primitives readiness: complete inventory resolved\n');

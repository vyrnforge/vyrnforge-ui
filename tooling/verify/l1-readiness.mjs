import { readFile } from 'node:fs/promises';

const impact = JSON.parse(await readFile('testing/impact.json', 'utf8'));
const webManifest = JSON.parse(await readFile('packages/web/package.json', 'utf8'));
const aggregateCss = await readFile('packages/web/src/styles.css', 'utf8');
const elementalCss = await readFile('packages/web/src/components/elemental-primitives/elemental-primitives.css', 'utf8');
const docsRegistry = JSON.parse(await readFile('documentation/site/registry.json', 'utf8'));
const l1Docs = await readFile('documentation/shared/l1-primitives.html', 'utf8');

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
  if (!elementalCss.includes(hook)) throw new Error(`Layer 1 elemental CSS is missing public hook: ${hook}`);
}

for (const privateRecipe of ['._vf-checkmark', '._vf-radiomark', '._vf-selection-indicator']) {
  if (!elementalCss.includes(privateRecipe)) throw new Error(`Layer 1 internal recipe is missing: ${privateRecipe}`);
  const publicName = privateRecipe.replace('._vf-', 'data-vf-');
  if (elementalCss.includes(publicName)) throw new Error(`Internal Layer 1 recipe leaked a public data hook: ${publicName}`);
}

if (webManifest.exports?.['./styles/elemental-primitives.css'] !== './dist/components/elemental-primitives/elemental-primitives.css') {
  throw new Error('@vyrnforge/web must export the Layer 1 elemental stylesheet from its conventional component output');
}
if (!aggregateCss.includes('@import "./components/elemental-primitives/elemental-primitives.css";')) {
  throw new Error('Aggregate Web CSS must include the Layer 1 elemental stylesheet');
}

const nativeElements = ['blockquote', 'q', 'h1', 'p', 'figure', 'figcaption', 'ul', 'ol', 'li', 'strong', 'em', 'small', 'sub', 'sup', 'abbr', 'address', 'cite', 'time'];
for (const tag of nativeElements) {
  if (!l1Docs.includes(`<code>${tag}</code>`)) throw new Error(`Layer 1 documentation is missing supported native element: ${tag}`);
}
for (const deferred of ['StatusIndicator', 'AvatarFallback']) {
  if (!l1Docs.includes(deferred) || !l1Docs.includes('deferred')) throw new Error(`Layer 1 documentation must explicitly resolve deferred candidate ${deferred}`);
}

const l1Route = docsRegistry.pages?.find((page) => page.slug === 'foundations/l1-primitives');
if (!l1Route || l1Route.source !== 'documentation/shared/l1-primitives.html') throw new Error('Layer 1 primitive documentation route is missing');

for (const scope of ['l1-readiness', 'browser-l1-primitives']) {
  if (!impact.scopeOrder?.includes(scope)) throw new Error(`Layer 1 validation scope is missing: ${scope}`);
  for (const tier of ['main', 'scheduled', 'release']) {
    if (!impact.tiers?.[tier]?.includes(scope)) throw new Error(`Layer 1 ${scope} evidence is missing from ${tier} validation`);
  }
}

process.stdout.write('layer 1 readiness: complete inventory resolved\n');

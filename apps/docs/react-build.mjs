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
const buttonExamples = button.examples.slice().sort((a, b) => a.id.localeCompare(b.id));
const basicExample = buttonExamples.find((entry) => entry.id === 'button/basic');
if (buttonExamples.length !== 5 ||
    !buttonExamples.every((entry) => entry.sourcePath.endsWith('/react.tsx') &&
      entry.source.includes("'@vyrnforge/react/button'"))) {
  throw new Error('React Button guide needs five real product-owned runnable examples');
}
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
    !layout.sharedContent || !layout.frameworkContent || layout.examples.length !== 7) {
  throw new Error('React Layout guide requires real Flow/AutoGrid React exports, their shared stylesheet, and seven checked-in React examples');
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
if (new Set(layoutSlugs).size !== 7 || !layoutSlugs.includes('basic')) {
  throw new Error('React Layout examples must have seven unique product-owned example ids');
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
// Product Graph-derived Icon surface: no second catalog or parallel semantic contract.
const icon = reactModel.componentCatalog.find((entry) => entry.id === 'icon');
const iconExamples = icon?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!icon?.showcaseAvailable || !icon.apiAvailable ||
    !icon.sharedContent || !icon.frameworkContent ||
    !icon.publicEntrypoints.includes('@vyrnforge/react/icon') ||
    !webModel.packageManifest.exports?.['./styles/icon.css'] ||
    !iconExamples.some((example) => example.id === 'icon/basic') ||
    iconExamples.length !== 8 ||
    !iconExamples.every((example) => example.sourcePath.endsWith('/react.tsx') &&
      (example.id === 'icon/inline-svg'
        ? example.source.includes("'@vyrnforge/web/styles/icon.css'")
        : example.id === 'icon/svg-wrapper'
          ? example.source.includes("'@vyrnforge/react'") &&
            example.source.includes('createSvgIcon')
          : example.source.includes("'@vyrnforge/react/icon'")))) {
  throw new Error('React Icon documentation requires public renderer, shared CSS, adaptation and eight owned examples');
}
const iconPublicSourcePath = path.join(root,
  path.dirname(path.dirname(icon.frameworkSourcePath)), 'index.ts');
const iconPublicSource = await readFile(iconPublicSourcePath, 'utf8');
const iconTypeStart = iconPublicSource.indexOf('export type { IconDefinition');
const iconTypeEnd = iconPublicSource.indexOf('export const Icon =', iconTypeStart);
if (iconTypeStart < 0 || iconTypeEnd < 0 ||
    !iconPublicSource.includes('export interface IconProps extends') ||
    !iconPublicSource.includes('forwardRef<SVGSVGElement, IconProps>') ||
    !iconPublicSource.includes('export interface SvgIconProps extends') ||
    !iconPublicSource.includes('forwardRef<SVGSVGElement, SvgIconProps>') ||
    !iconPublicSource.includes('export function createSvgIcon(content: ReactNode): ForwardRefExoticComponent<')) {
  throw new Error('React Icon public type contract changed; review the Icon API reference');
}
const createSvgIconStart = iconPublicSource.indexOf('export function createSvgIcon(');
const createSvgIconSignatureEnd = iconPublicSource.indexOf('> {', createSvgIconStart);
if (createSvgIconSignatureEnd < 0) {
  throw new Error('React createSvgIcon signature changed; review the public Icon API');
}
const publicIconTypes = iconPublicSource.slice(iconTypeStart, iconTypeEnd).trim() +
  '\n\n' + iconPublicSource.slice(createSvgIconStart, createSvgIconSignatureEnd + 1).trim() + ';';
// Badge is an anchored indicator; Chip and TagGroup remain independent products.
const badge = reactModel.componentCatalog.find((entry) => entry.id === 'badge');
const badgeExamples = badge?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!badge?.showcaseAvailable || !badge.apiAvailable || !badge.sharedContent ||
    !badge.frameworkContent || badgeExamples.length !== 5 ||
    !badge.publicEntrypoints.includes('@vyrnforge/react/badge') ||
    !webModel.packageManifest.exports?.['./styles/badge.css'] ||
    !['badge/basic', 'badge/dot', 'badge/positioning', 'badge/variants', 'badge/visibility']
      .every((id) => badgeExamples.some((example) => example.id === id)) ||
    !badgeExamples.every((example) =>
      example.sourcePath.endsWith('/react.tsx') &&
      example.source.includes("'@vyrnforge/react/badge'") &&
      example.source.includes("'@vyrnforge/web/styles/badge.css'"))) {
  throw new Error('React Badge requires five source-backed examples, shared CSS and a public entrypoint');
}
const badgePublicSourcePath = path.join(root,
  path.dirname(path.dirname(badge.frameworkSourcePath)), 'index.ts');
const badgePublicSource = await readFile(badgePublicSourcePath, 'utf8');
const badgeTypeStart = badgePublicSource.indexOf('export type BadgeTone');
const badgeTypeEnd = badgePublicSource.indexOf('/** Anchored count/dot indicator', badgeTypeStart);
if (badgeTypeStart < 0 || badgeTypeEnd < 0 ||
    !badgePublicSource.includes('forwardRef<HTMLSpanElement, BadgeProps>')) {
  throw new Error('React Badge public type contract changed; review the API');
}
const publicBadgeTypes = badgePublicSource.slice(badgeTypeStart, badgeTypeEnd).trim();

// Avatar is a composition capability distinct from Image and AvatarFallback candidates.
const avatar = reactModel.componentCatalog.find((entry) => entry.id === 'avatar');
const avatarExamples = avatar?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!avatar?.showcaseAvailable || !avatar.apiAvailable ||
    !avatar.sharedContent || !avatar.frameworkContent ||
    !avatar.publicEntrypoints.includes('@vyrnforge/react/avatar') ||
    !webModel.packageManifest.exports?.['./styles/avatar.css'] ||
    avatarExamples.length !== 10 ||
    !['avatar/initials', 'avatar/image', 'avatar/fallback', 'avatar/decorative',
      'avatar/icon', 'avatar/shapes', 'avatar/sizing', 'avatar/group', 'avatar/total', 'avatar/spacing']
      .every((id) => avatarExamples.some((example) => example.id === id)) ||
    !avatarExamples.every((example) => example.sourcePath.endsWith('/react.tsx') &&
      example.source.includes("'@vyrnforge/react/avatar'") &&
      example.source.includes("'@vyrnforge/web/styles/avatar.css'"))) {
  throw new Error('React Avatar requires a public native-backed component, shared CSS and four runnable examples');
}
const avatarPublicSourcePath = path.join(root,
  path.dirname(path.dirname(avatar.frameworkSourcePath)), 'index.ts');
const avatarPublicSource = await readFile(avatarPublicSourcePath, 'utf8');
const avatarTypeStart = avatarPublicSource.indexOf('export type AvatarSize');
const avatarTypeEnd = avatarPublicSource.indexOf('/** Deterministic convenience,', avatarTypeStart);
if (avatarTypeStart < 0 || avatarTypeEnd < 0 ||
    !avatarPublicSource.includes('forwardRef<HTMLSpanElement, AvatarProps>') ||
    !avatarPublicSource.includes('forwardRef<HTMLUListElement, AvatarGroupProps>') ||
    !avatarPublicSource.includes('useState<string | undefined>')) {
  throw new Error('React Avatar source changed: review public API types and error fallback contract');
}
const publicAvatarTypes = avatarPublicSource.slice(avatarTypeStart, avatarTypeEnd).trim();

// Preserve Image's native HTML semantics and canonical Web CSS.
const image = reactModel.componentCatalog.find((entry) => entry.id === 'image');
const imageExamples = image?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!image?.showcaseAvailable || !image.apiAvailable ||
    !image.sharedContent || !image.frameworkContent ||
    !image.publicEntrypoints.includes('@vyrnforge/react/image') ||
    !webModel.packageManifest.exports?.['./styles/image.css'] ||
    imageExamples.length !== 4 ||
    !imageExamples.some((example) => example.id === 'image/basic') ||
    !imageExamples.every((example) => example.sourcePath.endsWith('/react.tsx') &&
      example.source.includes("'@vyrnforge/react/image'") &&
      example.source.includes("'@vyrnforge/web/styles/image.css'"))) {
  throw new Error('React Image requires a public component, canonical Web CSS and four owned examples');
}
const imagePublicSourcePath = path.join(root,
  path.dirname(path.dirname(image.frameworkSourcePath)), 'index.ts');
const imagePublicSource = await readFile(imagePublicSourcePath, 'utf8');
const imageTypeStart = imagePublicSource.indexOf('export type ImageProps');
const imageTypeEnd = imagePublicSource.indexOf('export const Image =', imageTypeStart);
if (imageTypeStart < 0 || imageTypeEnd < 0 ||
    !imagePublicSource.includes('forwardRef<HTMLImageElement, ImageProps>')) {
  throw new Error('React Image public type contract changed; review its API reference');
}
const publicImageTypes = imagePublicSource.slice(imageTypeStart, imageTypeEnd).trim();
// A distinct, nonsemantic visual Divider; the retired Separator API stays absent.
const divider = reactModel.componentCatalog.find((entry) => entry.id === 'divider');
const dividerExamples = divider?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!divider?.showcaseAvailable || !divider.apiAvailable ||
    !divider.sharedContent || !divider.frameworkContent ||
    !divider.publicEntrypoints.includes('@vyrnforge/react/divider') ||
    !webModel.packageManifest.exports?.['./styles/divider.css'] ||
    dividerExamples.length !== 5 ||
    !dividerExamples.some((example) => example.id === 'divider/basic') ||
    !dividerExamples.some((example) => example.id === 'divider/vertical') ||
    !dividerExamples.some((example) => example.id === 'divider/labeled-horizontal') ||
    !dividerExamples.some((example) => example.id === 'divider/labeled-vertical') ||
    !dividerExamples.some((example) => example.id === 'divider/text-direction') ||
    !dividerExamples.every((example) => example.sourcePath.endsWith('/react.tsx') &&
      example.source.includes("'@vyrnforge/react/divider'") &&
      example.source.includes("'@vyrnforge/web/styles/divider.css'"))) {
  throw new Error('React Divider requires plain, labeled and text-direction examples with shared CSS');
}
const dividerPublicSourcePath = path.join(root,
  path.dirname(path.dirname(divider.frameworkSourcePath)), 'index.ts');
const dividerPublicSource = await readFile(dividerPublicSourcePath, 'utf8');
const dividerTypeStart = dividerPublicSource.indexOf('export type DividerOrientation');
const dividerTypeEnd = dividerPublicSource.indexOf('export const Divider =', dividerTypeStart);
if (dividerTypeStart < 0 || dividerTypeEnd < 0 ||
    !dividerPublicSource.includes('forwardRef<HTMLSpanElement, DividerProps>')) {
  throw new Error('React Divider source does not match the expected native span public contract');
}
const publicDividerTypes = dividerPublicSource.slice(dividerTypeStart, dividerTypeEnd).trim();

const shellStyles = documentationShellStyleSpecifiers.map((specifier) =>
  resolvePublicWebStyleAsset(webModel.packageManifest, specifier).assetPath);
// The Color studio alone needs these public controls; other docs pages do not
// pay for unrelated component styles or invent docs-specific component skins.
const themeStudioStyles = [
  '@vyrnforge/web/styles/color-picker.css',
  '@vyrnforge/web/styles/segmented-control.css',
  '@vyrnforge/web/styles/checkbox.css',
  '@vyrnforge/web/styles/slider.css',
].map((specifier) =>
  resolvePublicWebStyleAsset(webModel.packageManifest, specifier).assetPath);

const iconExplorerStyles = ['@vyrnforge/web/styles/icon.css'].map((specifier) =>
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
    tokens: relative(dir, react + 'foundations/tokens/', true),
    themes: relative(dir, react + 'foundations/themes/', true),
    color: relative(dir, react + 'foundations/color/', true),
    builder: relative(dir, react + 'foundations/theme-builder/', true),
    darkMode: relative(dir, react + 'foundations/dark-mode/', true),
    rtl: relative(dir, react + 'foundations/right-to-left/', true),
    styling: relative(dir, react + 'foundations/styling/', true),
    self: relative(dir, react + route, true),
    guide: relative(dir, react + 'components/button/', true),
    api: relative(dir, react + 'api/components/button/', true),
    example: relative(dir, react + 'examples/button-basic/', true),
    buttonExamples: Object.fromEntries(buttonExamples.map((entry) => {
      const slug = entry.id.slice('button/'.length);
      return [slug, relative(dir, react + (slug === 'basic'
        ? 'examples/button-basic/' : 'examples/button/' + slug + '/'), true)];
    })),
    layout: relative(dir, react + layout.showcaseRoute, true),
    layoutApi: relative(dir, react + layout.apiRoute, true),
    layoutExampleBase: relative(dir, react + 'examples/layout/', true),
    icon: {
      guide: relative(dir, react + icon.showcaseRoute, true),
      api: relative(dir, react + icon.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/icon/', true),
    },
    image: {
      guide: relative(dir, react + image.showcaseRoute, true),
      api: relative(dir, react + image.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/image/', true),
    },
    badge: {
      guide: relative(dir, react + badge.showcaseRoute, true),
      api: relative(dir, react + badge.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/badge/', true),
    },
    avatar: {
      guide: relative(dir, react + avatar.showcaseRoute, true),
      api: relative(dir, react + avatar.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/avatar/', true),
    },
    divider: {
      guide: relative(dir, react + divider.showcaseRoute, true),
      api: relative(dir, react + divider.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/divider/', true),
    },
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
    native: relative(dir, native + (route.startsWith('foundations/') &&
      !nativeModel.foundationPages.some((page) => page.route === route) ? '' : route), true),
  };
}
async function verifyStyles(dir, extra = []) {
  for (const name of [...shellStyles, ...extra, '/assets/docs.css']) {
    const target = path.resolve(outRoot, dir, relative(dir, name));
    const info = await stat(target).catch(() => null);
    if (!info?.isFile()) throw new Error('React documentation stylesheet missing: ' + name);
  }
}
async function writePage(route, page) {
  const dir = directory(route);
  await verifyStyles(dir, route === icon.showcaseRoute ? iconExplorerStyles :
    route === 'foundations/color/' ? themeStudioStyles : []);
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
  jsx: 'automatic',
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
      '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
    const extracted = relative(dir, 'assets/' + asset + '.css');
    await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>React ' + escapeHtml(example.title) + ' example · VyrnForge</title>' +
      styles + '<link rel="stylesheet" href="' + escapeHtml(extracted) + '">' +
      '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
      '#root{min-width:0}</style>' +
      '</head><body><div id="root"></div><script src="' +
      escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
  }
}

// Compile the checked-in React icon TSX with its canonical extracted CSS.
for (const example of iconExamples) {
  const slug = example.id.slice('icon/'.length);
  const asset = 'react-icon-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/icon/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(example.title) + ' · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}</style></head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}

// Product Graph-owned Image TSX examples extract the shared Web stylesheet.
for (const example of imageExamples) {
  const slug = example.id.slice('image/'.length);
  const asset = 'react-image-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/image/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(example.title) + ' · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}</style></head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}

for (const example of badgeExamples) {
  const slug = example.id.slice('badge/'.length);
  const asset = 'react-badge-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/badge/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(example.title) + ' · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}</style></head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}


for (const example of avatarExamples) {
  const slug = example.id.slice('avatar/'.length);
  const asset = 'react-avatar-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/avatar/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(example.title) + ' · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}</style></head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}

for (const example of dividerExamples) {
  const slug = example.id.slice('divider/'.length);
  const asset = 'react-divider-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/divider/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(example.title) + ' · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}</style></head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}

const exampleDir = directory('examples/button-basic/');
const exampleStyles = shellStyles.map((asset) =>
  '  <link rel="stylesheet" href="' + escapeHtml(relative(exampleDir, asset)) + '">').join('\n');
await writePage('examples/button-basic/', '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>React Button example · VyrnForge</title>\n' + exampleStyles +
  '\n<style>body{margin:0;padding:1rem;min-width:0}</style>' +
  '</head><body><div id="root"></div><script src="' +
  escapeHtml(relative(exampleDir, 'assets/react-button-basic.js')) + '"></script></body></html>');

// Keep the original Button basic route, then bundle remaining checked-in
// examples through the same public React entrypoint and extracted Web CSS.
for (const entry of buttonExamples.filter((example) => example.id !== 'button/basic')) {
  const slug = entry.id.slice('button/'.length);
  const asset = 'react-button-' + slug;
  await build({
    entryPoints: [path.join(root, entry.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + entry.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/button/' + slug + '/';
  const dir = directory(route);
  const styles = shellStyles.map((file) =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('\n');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(entry.title) + ' example · VyrnForge</title>' +
    styles + '<link rel="stylesheet" href="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}' +
    '#root{min-width:0}input{max-width:100%;box-sizing:border-box}</style>' +
    '</head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
}

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
  { route: 'foundations/tokens/', view: 'tokens', title: 'React design tokens',
    description: 'Shared semantic tokens, color roles and foundation scales in React' },
  { route: 'foundations/themes/', view: 'themes', title: 'React theming',
    description: 'Scoped themes and custom branded semantic tokens in React' },
  { route: 'foundations/color/', view: 'color', title: 'React Theme Studio',
    description: 'Interactive color palette studio with real VyrnForge component previews' },
  { route: 'foundations/theme-builder/', view: 'builder', title: 'React Theme Builder',
    description: 'Build and export light/dark semantic themes with the public Web theme API' },
  { route: 'foundations/dark-mode/', view: 'dark-mode', title: 'React dark mode',
    description: 'Light, dark and system theme scopes with a live preview' },
  { route: 'foundations/right-to-left/', view: 'rtl', title: 'React right-to-left',
    description: 'Native direction, mixed content and bidirectional component preview' },
  { route: 'foundations/styling/', view: 'styling', title: 'React styling and CSS',
    description: 'Shared stylesheet loading, overrides and CSS customization in React' },
  { route: button.showcaseRoute, view: 'guide', title: 'React Button', description: 'Shared Button semantics and React usage' },
  { route: button.apiRoute, view: 'api', title: 'React Button API', description: 'Verified public React Button API' },
  { route: layout.showcaseRoute, view: 'layout', title: 'React Layout', description: 'Flow and AutoGrid usage in React with shared Web CSS' },
  { route: layout.apiRoute, view: 'layout-api', title: 'React Layout API', description: 'Public React Flow and AutoGrid props and stylesheet' },
  { route: divider.showcaseRoute, view: 'divider', title: 'React Divider', description: 'Horizontal and vertical visual-only lines in React' },
  { route: divider.apiRoute, view: 'divider-api', title: 'React Divider API', description: 'Source-backed React Divider props and orientation' },
  ...typographyIds.flatMap((id) => [
    { route: typography[id].showcaseRoute, view: 'typography', topic: id,
      title: 'React ' + typography[id].title,
      description: 'Live checked-in React ' + typography[id].title + ' example and shared typography semantics' },
    { route: typography[id].apiRoute, view: 'typography-api', topic: id,
      title: 'React ' + typography[id].title + ' API',
      description: 'Source-backed React ' + typography[id].title + ' API reference' },
  ]),
  { route: icon.showcaseRoute, view: 'icon', title: 'React Icon',
    description: 'React SVG icon examples and shared artwork semantics' },
  { route: icon.apiRoute, view: 'icon-api', title: 'React Icon API',
    description: 'Source-backed React Icon props and public entrypoints' },
  { route: image.showcaseRoute, view: 'image', title: 'React Image',
    description: 'Native image semantics and source-backed React examples' },
  { route: image.apiRoute, view: 'image-api', title: 'React Image API',
    description: 'Source-backed React Image props and public entrypoints' },
  { route: badge.showcaseRoute, view: 'badge', title: 'React Badge',
    description: 'Noninteractive text, count and dot Badge examples' },
  { route: badge.apiRoute, view: 'badge-api', title: 'React Badge API',
    description: 'Source-backed React Badge props and appearance' },
  { route: avatar.showcaseRoute, view: 'avatar', title: 'React Avatar',
    description: 'Image and initials fallback in one native-backed React Avatar' },
  { route: avatar.apiRoute, view: 'avatar-api', title: 'React Avatar API',
    description: 'Source-backed React Avatar props and sizing' },];
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
  examples: buttonExamples,
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
const iconData = {
  id: icon.id, title: icon.title,
  sharedContent: icon.sharedContent, frameworkContent: icon.frameworkContent,
  standardReferences: icon.standardReferences,
  publicEntrypoints: icon.publicEntrypoints,
  publicIconTypes, examples: iconExamples,
};
const dividerData = {
  id: divider.id, title: divider.title,
  sharedContent: divider.sharedContent, frameworkContent: divider.frameworkContent,
  standardReferences: divider.standardReferences,
  publicEntrypoints: divider.publicEntrypoints,
  publicDividerTypes, examples: dividerExamples,
};
const badgeData = {
  id: badge.id, title: badge.title,
  sharedContent: badge.sharedContent, frameworkContent: badge.frameworkContent,
  standardReferences: badge.standardReferences,
  publicEntrypoints: badge.publicEntrypoints,
  publicBadgeTypes, examples: badgeExamples,
};
const avatarData = {
  id: avatar.id, title: avatar.title,
  sharedContent: avatar.sharedContent, frameworkContent: avatar.frameworkContent,
  standardReferences: avatar.standardReferences,
  publicEntrypoints: avatar.publicEntrypoints,
  publicAvatarTypes, examples: avatarExamples,
};
const imageData = {
  id: image.id, title: image.title,
  sharedContent: image.sharedContent, frameworkContent: image.frameworkContent,
  standardReferences: image.standardReferences,
  publicEntrypoints: image.publicEntrypoints,
  publicImageTypes, examples: imageExamples,
};
for (const page of pageViews) {
  const dir = directory(page.route);
  const props = { view: page.view, links: linksFor(page.route), button: pageData,
    layout: (page.view === 'layout' || page.view === 'layout-api') ? layoutData : null,
    typography: page.topic ? typography[page.topic] : null,
    icon: page.view === 'icon' || page.view === 'icon-api' ? iconData : null,
    image: page.view === 'image' || page.view === 'image-api' ? imageData : null,
    avatar: page.view === 'avatar' || page.view === 'avatar-api' ? avatarData : null,
    badge: page.view === 'badge' || page.view === 'badge-api' ? badgeData : null,
    divider: page.view === 'divider' || page.view === 'divider-api' ? dividerData : null,
    requestedTopic: page.requestedTopic ?? null };
  const initialHtml = renderToString(createElement(ReactReferencePage, props));
  const serialized = JSON.stringify(props).replaceAll('<', '\\u003c');
  const styles = [...shellStyles, ...(['color', 'builder'].includes(page.view) ? themeStudioStyles : []),
    ...(page.view === 'icon' ? iconExplorerStyles : [])]
    .map((asset) => '  <link rel="stylesheet" href="' +
      escapeHtml(relative(dir, asset)) + '">').join('\n');
  const pageHtml = '<!doctype html><html lang="en" data-vf-theme="light" data-vf-density="comfortable"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="description" content="' + escapeHtml(page.description) + '">' +
    '<meta name="color-scheme" content="light dark">' +
    '<title>' + escapeHtml(page.title) + ' · VyrnForge</title>' +
    '<script>try{const v=localStorage.getItem("vf-docs-theme");if(v==="light"||v==="dark")document.documentElement.dataset.vfTheme=v}catch{}</script>\n' +
    styles + '\n<link rel="stylesheet" href="' + escapeHtml(relative(dir, 'assets/docs.css')) + '">' +
    '<style>.vf-docs-react-example-frame{box-sizing:border-box;display:block;inline-size:100%;min-block-size:10rem;border:1px solid var(--vf-color-border);border-radius:var(--vf-control-radius)}' +
    '.vf-docs-react-example-frame[data-vf-docs-example-id="text/basic"]{min-block-size:20rem}' +
    '.vf-docs-react-example-frame[data-vf-docs-example-id="text/type-scale"]{min-block-size:86rem}' +
    '.vf-docs-react-example-frame[data-vf-docs-example-id="text/semantic-composition"]{min-block-size:24rem}</style>' +
    '</head><body><div id="vf-react-root">' + initialHtml + '</div>' +
    '<script type="application/json" id="vf-react-page-data">' + serialized + '</script>' +
    '<script type="module" src="' + escapeHtml(relative(dir, 'assets/react-reference.js')) + '"></script>' +
    '</body></html>';
  await writePage(page.route, pageHtml);
}
await writeFile(path.join(reactRoot, 'site-manifest.json'), JSON.stringify({
  channel, framework: 'react', status: 'button-layout-typography-icon-image-divider-avatar-badge-pilot',
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
  icon: {
    guideRoute: icon.showcaseRoute, apiRoute: icon.apiRoute,
    publicEntrypoints: icon.publicEntrypoints,
    sharedSourcePath: icon.sharedSourcePath,
    frameworkSourcePath: icon.frameworkSourcePath,
    publicSourcePath: path.relative(root, iconPublicSourcePath).replaceAll('\\', '/'),
    examples: iconExamples.map((example) => ({ id: example.id,
      sourcePath: example.sourcePath, title: example.title })),
  },
  divider: {
    guideRoute: divider.showcaseRoute, apiRoute: divider.apiRoute,
    publicEntrypoints: divider.publicEntrypoints,
    sharedSourcePath: divider.sharedSourcePath,
    frameworkSourcePath: divider.frameworkSourcePath,
    publicSourcePath: path.relative(root, dividerPublicSourcePath).replaceAll('\\', '/'),
    examples: dividerExamples.map((example) => ({ id: example.id,
      sourcePath: example.sourcePath, title: example.title })),
  },
  badge: {
    guideRoute: badge.showcaseRoute, apiRoute: badge.apiRoute,
    publicEntrypoints: badge.publicEntrypoints,
    sharedSourcePath: badge.sharedSourcePath,
    frameworkSourcePath: badge.frameworkSourcePath,
    publicSourcePath: path.relative(root, badgePublicSourcePath).replaceAll('\\', '/'),
    examples: badgeExamples.map((example) => ({ id: example.id,
      sourcePath: example.sourcePath, title: example.title })),
  },
  avatar: {
    guideRoute: avatar.showcaseRoute, apiRoute: avatar.apiRoute,
    publicEntrypoints: avatar.publicEntrypoints,
    sharedSourcePath: avatar.sharedSourcePath,
    frameworkSourcePath: avatar.frameworkSourcePath,
    publicSourcePath: path.relative(root, avatarPublicSourcePath).replaceAll('\\', '/'),
    examples: avatarExamples.map((example) => ({ id: example.id,
      sourcePath: example.sourcePath, title: example.title })),
  },
  image: {
    guideRoute: image.showcaseRoute, apiRoute: image.apiRoute,
    publicEntrypoints: image.publicEntrypoints,
    sharedSourcePath: image.sharedSourcePath,
    frameworkSourcePath: image.frameworkSourcePath,
    publicSourcePath: path.relative(root, imagePublicSourcePath).replaceAll('\\', '/'),
    examples: imageExamples.map((example) => ({ id: example.id,
      sourcePath: example.sourcePath, title: example.title })),
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
    examples: buttonExamples.map((example) => ({ id: example.id, sourcePath: example.sourcePath })),
  },
}, null, 2) + '\n');
process.stdout.write('React Button, Layout, Typography, Icon, Image and Divider documentation pilot -> ' + path.relative(root, reactRoot) + '\n');

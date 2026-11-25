import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { compileFrameworkDocumentation, parseMarkdownDocument } from '../../tooling/docs/framework-documentation.mjs';
import { discoverProductGraph } from '../../tooling/product/discover-product-graph.mjs';
import { compileNativeDocumentation } from '../../tooling/docs/native-documentation.mjs';
import { documentationShellStyleSpecifiers, resolvePublicWebStyleAsset } from '../../tooling/docs/public-shell-styles.mjs';
import { ReactReferencePage } from './react-reference.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const outRoot = path.join(root, 'dist/docs');
const channel = process.env.VYRNFORGE_DOCS_CHANNEL || 'next';
const reactRoot = path.join(outRoot, channel, 'react');
const productGraph = discoverProductGraph(root);
const reactModel = compileFrameworkDocumentation('react', root);
const webModel = compileFrameworkDocumentation('native-web', root);
const nativeModel = compileNativeDocumentation(root);
const overlayGuide = parseMarkdownDocument(await readFile(path.join(root, 'documentation/utilities/overlay.md'), 'utf8'));
const motionGuide = parseMarkdownDocument(await readFile(path.join(root, 'documentation/utilities/motion.md'), 'utf8'));
const motionTokenNames = ['--vf-control-motion-duration', '--vf-motion-duration-enter', '--vf-motion-easing-standard',
  '--vf-motion-duration-loading-spin', '--vf-motion-duration-loading-shimmer', '--vf-motion-easing-loading'];
const motionTokenCSS = await readFile(path.join(root, 'packages/web/src/styles/tokens.css'), 'utf8');
for (const name of motionTokenNames) {
  if (!motionTokenCSS.includes(name + ':')) throw new Error('Motion utility references missing public runtime token: ' + name);
}
const motionComponentIds = ['button', 'switch', 'disclosure', 'tabs', 'toast'];
for (const id of motionComponentIds) {
  if (!reactModel.componentCatalog.find((entry) => entry.id === id)?.apiAvailable) {
    throw new Error('Motion utility requires real public React component: ' + id);
  }
}
const motionStyles = motionComponentIds.filter((id) => id !== 'button').map((id) =>
  resolvePublicWebStyleAsset(webModel.packageManifest, '@vyrnforge/web/styles/' + id + '.css').assetPath);
const overlayComponentIds = ['popover', 'tooltip', 'preview-card', 'dialog', 'alert-dialog', 'drawer'];
for (const id of overlayComponentIds) {
  if (!reactModel.componentCatalog.find((entry) => entry.id === id)?.apiAvailable ||
      !webModel.packageManifest.exports?.['./styles/' + id + '.css']) {
    throw new Error('Overlay utility requires a real public React component and canonical Web CSS: ' + id);
  }
}
const overlayStyles = ['popover', 'tooltip', 'preview-card', 'dialog', 'drawer'].map((id) =>
  resolvePublicWebStyleAsset(webModel.packageManifest, '@vyrnforge/web/styles/' + id + '.css').assetPath);
const button = reactModel.componentCatalog.find((entry) => entry.id === 'button');
if (!button?.showcaseAvailable || !button.apiAvailable || !button.frameworkContent) {
  throw new Error('React documentation pilot requires real public Button API, shared and React-authored content');
}
const buttonExamples = button.examples.slice().sort((a, b) => a.id.localeCompare(b.id));
const basicExample = buttonExamples.find((entry) => entry.id === 'button/basic');
if (buttonExamples.length !== 7 ||
    !buttonExamples.every((entry) => entry.sourcePath.endsWith('/react.tsx') &&
      entry.source.includes("'@vyrnforge/react/button'"))) {
  throw new Error('React Button guide needs seven standalone product-owned runnable examples');
}
if (!basicExample?.sourcePath.endsWith('/react.tsx')) {
  throw new Error('React documentation requires the checked-in executable Button example');
}
const toggle = reactModel.componentCatalog.find((entry) => entry.id === 'toggle-button');
const toggleExamples = toggle?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!toggle?.showcaseAvailable || !toggle.apiAvailable || !toggle.sharedContent ||
    !toggle.frameworkContent || toggleExamples.length !== 7 ||
    !toggle.publicEntrypoints.includes('@vyrnforge/react/toggle-button') ||
    !webModel.packageManifest.exports?.['./styles/toggle-button.css'] ||
    toggleExamples[0]?.id !== 'toggle-button/basic' ||
    !toggleExamples.every((entry) => entry.sourcePath.endsWith('/react.tsx') &&
      entry.source.includes("'@vyrnforge/react/toggle-button'")))
  throw new Error('React ToggleButton needs public API, canonical CSS and runnable source');

const toggleGroup = reactModel.componentCatalog.find((entry) => entry.id === 'toggle-group');
if (!toggleGroup?.showcaseAvailable || !toggleGroup.apiAvailable || !toggleGroup.frameworkContent ||
    toggleGroup.examples.length !== 4 || !toggleGroup.publicEntrypoints.includes('@vyrnforge/react/toggle-group')) {
  throw new Error('React ToggleGroup requires its real public API and four product-owned examples');
}
const toggleGroupSourcePath = path.join(root, path.dirname(path.dirname(toggleGroup.frameworkSourcePath)), 'index.ts');
const toggleGroupSource = await readFile(toggleGroupSourcePath, 'utf8');
const groupRootStart = toggleGroupSource.indexOf('export interface ToggleGroupRootProps');
const groupRootEnd = toggleGroupSource.indexOf('function normalize(', groupRootStart);
const groupItemStart = toggleGroupSource.indexOf('export interface ToggleGroupItemProps');
const groupItemEnd = toggleGroupSource.indexOf('export const ToggleGroupItem', groupItemStart);
if ([groupRootStart, groupRootEnd, groupItemStart, groupItemEnd].some((index) => index < 0)) {
  throw new Error('React ToggleGroup public props are missing');
}
const toggleGroupTypes = toggleGroupSource.slice(groupRootStart, groupRootEnd).trim() + '\n\n' +
  toggleGroupSource.slice(groupItemStart, groupItemEnd).trim();

const buttonGroup = reactModel.patternCatalog.find((entry) => entry.id === 'button-group');
if (!buttonGroup?.showcaseAvailable || !buttonGroup.guideOnly || buttonGroup.apiAvailable ||
    buttonGroup.examples.length !== 6) throw new Error('Button Group requires a guide-only pattern with six real examples');

const selectionIds = ['checkbox', 'radio', 'checkbox-group', 'radio-group'];
const selection = Object.fromEntries(await Promise.all(selectionIds.map(async (id) => {
  const group = id.endsWith('-group');
  const owner = (group ? reactModel.patternCatalog : reactModel.componentCatalog).find(entry => entry.id === id);
  if (!owner?.showcaseAvailable || !owner.sharedContent || !owner.examples.length ||
      (group ? !owner.guideOnly || owner.apiAvailable : !owner.apiAvailable || !owner.frameworkContent))
    throw new Error('Missing native selection documentation contract for ' + id);
  const publicSource = group ? null : await readFile(path.join(root,
    path.dirname(path.dirname(owner.frameworkSourcePath)), 'index.ts'), 'utf8');
  const publicTypes = group ? null : publicSource.match(/export (?:interface|type) (?:Checkbox|Radio)Props[\s\S]*?(?=\nexport const)/)?.[0].trim();
  if (!group && !publicTypes) throw new Error('Missing public selection props for ' + id);
  return [id, { ...owner, publicTypes }];
})));

const togglePublicSourcePath = path.join(root,
  path.dirname(path.dirname(toggle.frameworkSourcePath)), 'index.ts');
const togglePublicSource = await readFile(togglePublicSourcePath, 'utf8');
const toggleTypeStart = togglePublicSource.indexOf('export interface ToggleButtonProps');
const toggleTypeEnd = togglePublicSource.indexOf('export const ToggleButton', toggleTypeStart);
if (toggleTypeStart < 0 || toggleTypeEnd < 0 ||
    !togglePublicSource.includes('forwardRef<HTMLButtonElement, ToggleButtonProps>'))
  throw new Error('React ToggleButton public contract changed');
const publicToggleTypes = togglePublicSource.slice(toggleTypeStart, toggleTypeEnd).trim();

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
// List owns rich semantic rows; Listbox owns collection selection.
const list = reactModel.componentCatalog.find((entry) => entry.id === 'list');
const listExamples = list?.examples.slice().sort((a, b) => a.id.localeCompare(b.id)) ?? [];
if (!list?.showcaseAvailable || !list.apiAvailable || !list.sharedContent ||
    !list.frameworkContent || listExamples.length !== 8 ||
    !list.publicEntrypoints.includes('@vyrnforge/react/list') ||
    !webModel.packageManifest.exports?.['./styles/list.css'] ||
    !['list/rich', 'list/markers', 'list/actions', 'list/gutters', 'list/density',
      'list/nested', 'list/grouped', 'list/interactive'].every((id) =>
      listExamples.some((example) => example.id === id)) ||
    !listExamples.every((example) =>
      example.sourcePath.endsWith('/react.tsx') &&
      example.source.includes("'@vyrnforge/react/list'") &&
      example.source.includes("'@vyrnforge/web/styles/list.css'"))) {
  throw new Error('React List needs public source, canonical Web CSS, and eight runnable examples');
}
const listPublicSourcePath = path.join(root,
  path.dirname(path.dirname(list.frameworkSourcePath)), 'index.ts');
const listPublicSource = await readFile(listPublicSourcePath, 'utf8');
const listTypeStart = listPublicSource.indexOf('export type ListElement');
const listTypeEnd = listPublicSource.indexOf('/** React List:', listTypeStart);
if (listTypeStart < 0 || listTypeEnd < 0 ||
    !listPublicSource.includes('forwardRef<HTMLLIElement, ListItemProps>')) {
  throw new Error('React List public contract changed: review the API');
}
const publicListTypes = listPublicSource.slice(listTypeStart, listTypeEnd).trim();

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
      example.source.includes("'@vyrnforge/web/styles/badge.css'") &&
      example.source.includes("import { Button } from '@vyrnforge/react/button';") &&
      example.source.includes("import { Flow } from '@vyrnforge/react/layout';") &&
      example.source.includes("'@vyrnforge/web/styles/button.css'") &&
      example.source.includes("'@vyrnforge/web/styles/layout.css'") &&
      !/<(?:button|div|span)(?:\s|>)/u.test(example.source))) {
  throw new Error('React Badge requires five public-component compositions (Badge, Button, Flow), shared CSS and source-backed examples');
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
    overlay: relative(dir, react + 'utilities/overlay/', true),
    motion: relative(dir, react + 'utilities/motion/', true),
    motionButton: relative(dir, react + 'components/button/', true),
    overlayComponentSource: Object.fromEntries(overlayComponentIds.map((id) => {
      const documented = reactModel.componentCatalog.find((entry) => entry.id === id);
      const owner = productGraph.components.find((entry) => entry.unitId === id);
      const authoringRoot = owner?.surfaces?.react?.authoringPaths?.[0];
      if (!documented?.apiAvailable || !authoringRoot) {
        throw new Error('Missing public React overlay implementation for ' + id);
      }
      return [id, 'https://github.com/vyrnforge/vyrnforge-ui/blob/main/' +
        path.posix.join(authoringRoot, 'index.ts')];
    })),
    self: relative(dir, react + route, true),
    guide: relative(dir, react + 'components/button/', true),
    toggle: {
      guide: relative(dir, react + toggle.showcaseRoute, true),
      api: relative(dir, react + toggle.apiRoute, true),
      example: relative(dir, react + 'examples/toggle-button/basic/', true),
      examples: Object.fromEntries(toggleExamples.map((entry) => [entry.id, relative(dir, react + 'examples/' + entry.id + '/', true)])),
    },
    toggleGroup: {
      guide: relative(dir, react + toggleGroup.showcaseRoute, true),
      api: relative(dir, react + toggleGroup.apiRoute, true),
      examples: Object.fromEntries(toggleGroup.examples.map((entry) => [entry.id, relative(dir, react + 'examples/' + entry.id + '/', true)])),
    },
    selection: Object.fromEntries(selectionIds.map(id => [id, {
      guide: relative(dir, react + selection[id].showcaseRoute, true),
      api: selection[id].apiRoute ? relative(dir, react + selection[id].apiRoute, true) : null,
      examples: Object.fromEntries(selection[id].examples.map(entry => [entry.id, relative(dir, react + 'examples/' + entry.id + '/', true)])),
    }])),
    buttonGroup: {
      guide: relative(dir, react + buttonGroup.showcaseRoute, true),
      examples: Object.fromEntries(buttonGroup.examples.map((entry) => [entry.id, relative(dir, react + 'examples/' + entry.id + '/', true)])),
    },
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
      library: relative(dir, react + 'icons/', true),
      guide: relative(dir, react + icon.showcaseRoute, true),
      api: relative(dir, react + icon.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/icon/', true),
    },
    image: {
      guide: relative(dir, react + image.showcaseRoute, true),
      api: relative(dir, react + image.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/image/', true),
    },
    list: {
      guide: relative(dir, react + list.showcaseRoute, true),
      api: relative(dir, react + list.apiRoute, true),
      exampleBase: relative(dir, react + 'examples/list/', true),
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
    // The standalone React gallery has no Native Web gallery view. Route to
    // the Native Web gateway instead of constructing a nonexistent page.
    native: relative(dir, native + (route === toggleGroup.showcaseRoute && !nativeModel.showcasePages.some((page) => page.route === route) ? toggleGroup.apiRoute : ((route === 'icons/' ||
      (route.startsWith('foundations/') &&
      !nativeModel.foundationPages.some((page) => page.route === route))) ? '' : route)), true),
  };
}
async function verifyStyles(dir, extra = [], { docsChrome = true } = {}) {
  for (const name of [...shellStyles, ...extra, ...(docsChrome ? ['/assets/docs.css'] : [])]) {
    const target = path.resolve(outRoot, dir, relative(dir, name));
    const info = await stat(target).catch(() => null);
    if (!info?.isFile()) throw new Error('React documentation stylesheet missing: ' + name);
  }
}
async function writePage(route, page) {
  const dir = directory(route);
  const docsChrome = !route.startsWith('examples/');
  if (!docsChrome && page.includes('docs.css')) {
    throw new Error('Standalone React component examples must not depend on documentation CSS');
  }
  await verifyStyles(dir, docsChrome && route === 'icons/' ? iconExplorerStyles :
    docsChrome && route === 'foundations/color/' ? themeStudioStyles : [], { docsChrome });
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

for (const example of listExamples) {
  const slug = example.id.slice('list/'.length);
  const asset = 'react-list-' + slug;
  await build({
    entryPoints: [path.join(root, example.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile()) {
    throw new Error('React ' + example.id + ' must extract canonical browser CSS');
  }
  const route = 'examples/list/' + slug + '/';
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

// Render the checked-in ToggleButton React example with its canonical Web CSS.
for (const entry of [...toggleExamples, ...toggleGroup.examples, ...buttonGroup.examples, ...selectionIds.flatMap(id => selection[id].examples)]) {
  const asset = 'react-' + entry.id.replace('/', '-');
  await build({
    entryPoints: [path.join(root, entry.sourcePath)],
    bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
    jsx: 'automatic', logLevel: 'silent',
    outfile: path.join(outRoot, 'assets', asset + '.js'),
  });
  if (!(await stat(path.join(outRoot, 'assets', asset + '.css')).catch(() => null))?.isFile())
    throw new Error('React ' + entry.id + ' must extract canonical Web CSS');
  const route = 'examples/' + entry.id + '/';
  const dir = directory(route);
  const styles = shellStyles.map(file =>
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, file)) + '">').join('');
  await writePage(route, '<!doctype html><html lang="en" data-vf-theme="light"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>React ' + escapeHtml(entry.title) + ' example · VyrnForge</title>' + styles +
    '<link rel="stylesheet" href="' + escapeHtml(relative(dir, 'assets/' + asset + '.css')) + '">' +
    '<style>body{margin:0;padding:1rem;min-width:0;overflow-wrap:anywhere}#root{min-width:0}</style>' +
    '</head><body><div id="root"></div><script src="' +
    escapeHtml(relative(dir, 'assets/' + asset + '.js')) + '"></script></body></html>');
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
  { route: 'utilities/overlay/', view: 'overlay', title: 'Overlay utility',
    description: 'Shared overlay usage, customization and public React playground' },
  { route: 'utilities/motion/', view: 'motion', title: 'Motion utility',
    description: 'Shared motion, timing, easing, loading cadence and reduced-motion guidance' },
  { route: 'foundations/styling/', view: 'styling', title: 'React styling and CSS',
    description: 'Shared stylesheet loading, overrides and CSS customization in React' },
  { route: button.showcaseRoute, view: 'guide', title: 'React Button', description: 'Shared Button semantics and React usage' },
  { route: button.apiRoute, view: 'api', title: 'React Button API', description: 'Verified public React Button API' },
  { route: buttonGroup.showcaseRoute, view: 'button-group', title: 'React Button Group', description: 'Compose independent related Button actions' },
  { route: toggle.showcaseRoute, view: 'toggle', title: 'React ToggleButton',
    description: 'Native pressed-state button and independently controlled state' },
  { route: toggle.apiRoute, view: 'toggle-api', title: 'React ToggleButton API',
    description: 'Source-backed ToggleButton types and pressed state' },
  { route: toggleGroup.showcaseRoute, view: 'toggle-group', title: 'React ToggleGroup', description: 'Exclusive and multiple pressed choices' },
  { route: toggleGroup.apiRoute, view: 'toggle-group-api', title: 'React ToggleGroup API', description: 'Source-backed ToggleGroup props' },
  ...selectionIds.flatMap(id => [
    { route: selection[id].showcaseRoute, view: 'selection-' + id, selectionTopic: id,
      title: 'React ' + selection[id].title, description: 'Native selection and practical React composition' },
    ...(selection[id].apiAvailable ? [{ route: selection[id].apiRoute, view: 'selection-' + id + '-api',
      selectionTopic: id, title: 'React ' + selection[id].title + ' API', description: 'Source-backed native control API' }] : []),
  ]),
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
  { route: 'icons/', view: 'icon-library', title: 'VyrnForge Icons',
    description: 'Explore all implemented VyrnForge SVG icons, artwork variants, sizes and colors' },
  { route: icon.showcaseRoute, view: 'icon', title: 'React Icon',
    description: 'React SVG icon examples and shared artwork semantics' },
  { route: icon.apiRoute, view: 'icon-api', title: 'React Icon API',
    description: 'Source-backed React Icon props and public entrypoints' },
  { route: image.showcaseRoute, view: 'image', title: 'React Image',
    description: 'Native image semantics and source-backed React examples' },
  { route: image.apiRoute, view: 'image-api', title: 'React Image API',
    description: 'Source-backed React Image props and public entrypoints' },
  { route: list.showcaseRoute, view: 'list', title: 'React List',
    description: 'Rich semantic lists, native markers and composed actions' },
  { route: list.apiRoute, view: 'list-api', title: 'React List API',
    description: 'Source-backed React List and ListItem public props' },
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
const toggleData = {
  id: toggle.id, title: toggle.title,
  sharedContent: toggle.sharedContent, frameworkContent: toggle.frameworkContent,
  standardReferences: toggle.standardReferences,
  publicEntrypoints: toggle.publicEntrypoints,
  publicToggleTypes, examples: toggleExamples,
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
const listData = {
  id: list.id, title: list.title,
  sharedContent: list.sharedContent, frameworkContent: list.frameworkContent,
  standardReferences: list.standardReferences,
  publicEntrypoints: list.publicEntrypoints,
  publicListTypes, examples: listExamples,
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
    toggle: page.view === 'toggle' || page.view === 'toggle-api' ? toggleData : null,
    buttonGroup: page.view === 'button-group' ? buttonGroup : null,
    selection: page.selectionTopic ? selection[page.selectionTopic] : null,
    toggleGroup: ['toggle-group', 'toggle-group-api'].includes(page.view) ? { ...toggleGroup, publicTypes: toggleGroupTypes } : null,
    layout: (page.view === 'layout' || page.view === 'layout-api') ? layoutData : null,
    typography: page.topic ? typography[page.topic] : null,
    icon: page.view === 'icon' || page.view === 'icon-api' ? iconData : null,
    image: page.view === 'image' || page.view === 'image-api' ? imageData : null,
    avatar: page.view === 'avatar' || page.view === 'avatar-api' ? avatarData : null,
    list: page.view === 'list' || page.view === 'list-api' ? listData : null,
    badge: page.view === 'badge' || page.view === 'badge-api' ? badgeData : null,
    divider: page.view === 'divider' || page.view === 'divider-api' ? dividerData : null,
    overlayGuide: page.view === 'overlay' ? overlayGuide : null,
    motionGuide: page.view === 'motion' ? motionGuide : null,
    requestedTopic: page.requestedTopic ?? null };
  const initialHtml = renderToString(createElement(ReactReferencePage, props));
  const serialized = JSON.stringify(props).replaceAll('<', '\\u003c');
  const styles = [...shellStyles, ...(['color', 'builder'].includes(page.view) ? themeStudioStyles : []),
    ...(page.view === 'icon-library' ? iconExplorerStyles : []),
    ...(page.view === 'overlay' ? overlayStyles : []),
    ...(page.view === 'motion' ? motionStyles : [])]
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
  channel, framework: 'react', status: 'button-layout-typography-icon-image-divider-avatar-badge-list-pilot',
  source: 'Product Graph public React surface',
  routes: pageViews.map(({ route, view }) => ({ route, view })),
  utilities: [
    { id: 'overlay', route: 'utilities/overlay/',
      source: 'documentation/utilities/overlay.md', publicComponents: overlayComponentIds },
    { id: 'motion', route: 'utilities/motion/',
      source: 'documentation/utilities/motion.md', publicComponents: motionComponentIds,
      tokens: motionTokenNames },
  ],
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
    libraryRoute: 'icons/', guideRoute: icon.showcaseRoute, apiRoute: icon.apiRoute,
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
  list: {
    guideRoute: list.showcaseRoute, apiRoute: list.apiRoute,
    publicEntrypoints: list.publicEntrypoints,
    sharedSourcePath: list.sharedSourcePath,
    frameworkSourcePath: list.frameworkSourcePath,
    publicSourcePath: path.relative(root, listPublicSourcePath).replaceAll('\\', '/'),
    examples: listExamples.map((example) => ({
      id: example.id, sourcePath: example.sourcePath, title: example.title,
    })),
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
  selection: Object.fromEntries(selectionIds.map(id => [id, {
    guideRoute: selection[id].showcaseRoute, apiRoute: selection[id].apiRoute, guideOnly: selection[id].guideOnly,
    publicEntrypoints: selection[id].publicEntrypoints, sharedSourcePath: selection[id].sharedSourcePath,
    examples: selection[id].examples.map(({ id, sourcePath, documentationSection }) => ({ id, sourcePath, documentationSection })),
  }])),
  buttonGroup: {
    guideRoute: buttonGroup.showcaseRoute, apiRoute: null, guideOnly: true,
    publicEntrypoints: buttonGroup.publicEntrypoints, sharedSourcePath: buttonGroup.sharedSourcePath,
    examples: buttonGroup.examples.map(({ id, sourcePath }) => ({ id, sourcePath })),
  },
  toggleGroup: {
    guideRoute: toggleGroup.showcaseRoute, apiRoute: toggleGroup.apiRoute,
    publicEntrypoints: toggleGroup.publicEntrypoints, sharedSourcePath: toggleGroup.sharedSourcePath,
    examples: toggleGroup.examples.map(({ id, sourcePath }) => ({ id, sourcePath })),
  },
  toggle: {
    guideRoute: toggle.showcaseRoute, apiRoute: toggle.apiRoute,
    publicEntrypoints: toggle.publicEntrypoints,
    sharedSourcePath: toggle.sharedSourcePath,
    frameworkSourcePath: toggle.frameworkSourcePath,
    publicSourcePath: path.relative(root, togglePublicSourcePath).replaceAll('\\', '/'),
    examples: toggleExamples.map(example => ({ id: example.id, sourcePath: example.sourcePath })),
  },
  button: {
    publicEntrypoints: button.publicEntrypoints,
    sharedSourcePath: button.sharedSourcePath,
    frameworkSourcePath: button.frameworkSourcePath,
    executableExampleSource: basicExample.sourcePath,
    examples: buttonExamples.map((example) => ({ id: example.id, sourcePath: example.sourcePath })),
  },
}, null, 2) + '\n');
process.stdout.write('React Button, Layout, Typography, Icon, Image and Divider documentation pilot -> ' + path.relative(root, reactRoot) + '\n');

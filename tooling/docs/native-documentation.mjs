import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverProductGraph } from '../product/discover-product-graph.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const nativeShellStyleSpecifiers = [
  '@vyrnforge/web/styles/tokens.css',
  '@vyrnforge/web/styles/reset.css',
  '@vyrnforge/web/styles/foundation.css',
  '@vyrnforge/web/styles/app-shell.css',
  '@vyrnforge/web/styles/side-nav.css',
  '@vyrnforge/web/styles/input.css',
  '@vyrnforge/web/styles/native-select.css',
  '@vyrnforge/web/styles/link.css',
  '@vyrnforge/web/styles/surface.css',
  '@vyrnforge/web/styles/button.css',
];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function walkFiles(root, relativePath) {
  if (!relativePath) return [];
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) return [];
  const files = [];
  const stack = [absolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else files.push(path.relative(root, target).replaceAll('\\', '/'));
    }
  }
  return files.sort();
}

function flushParagraph(lines, blocks) {
  if (!lines.length) return;
  blocks.push({ type: 'paragraph', text: lines.join(' ') });
  lines.length = 0;
}

export function parseMarkdownDocument(source) {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  let title = null;
  const intro = [];
  const sections = [];
  let currentBlocks = intro;
  const paragraph = [];
  let list = null;

  const flushList = () => {
    if (!list) return;
    currentBlocks.push({ type: 'list', items: list });
    list = null;
  };
  const flush = () => {
    flushParagraph(paragraph, currentBlocks);
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const titleMatch = /^#\s+(.+)$/.exec(line);
    if (titleMatch) {
      flush();
      title = titleMatch[1].trim();
      continue;
    }
    const sectionMatch = /^##\s+(.+)$/.exec(line);
    if (sectionMatch) {
      flush();
      const section = { heading: sectionMatch[1].trim(), blocks: [] };
      sections.push(section);
      currentBlocks = section.blocks;
      continue;
    }
    const listMatch = /^-\s+(.+)$/.exec(line);
    if (listMatch) {
      flushParagraph(paragraph, currentBlocks);
      list ??= [];
      list.push(listMatch[1].trim());
      continue;
    }
    if (!line) {
      flush();
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flush();

  if (!title) throw new Error('Component documentation must start with a level-one Markdown heading');
  return { title, intro, sections };
}

function nativeExamples(root, component) {
  const manifests = walkFiles(root, component.facets.examples)
    .filter((file) => file.endsWith('/example.json'));
  return manifests.flatMap((manifestPath) => {
    const manifest = readJson(root, manifestPath);
    const native = manifest.frameworks?.['native-web'];
    if (!native?.source) return [];
    const sourcePath = path.posix.join(path.posix.dirname(manifestPath), native.source);
    return [{
      id: manifest.id,
      title: manifest.title,
      description: manifest.description ?? '',
      language: native.language ?? 'html',
      sourcePath,
      source: readFileSync(path.join(root, sourcePath), 'utf8').trim(),
    }];
  });
}

function resolvePublicStyleAsset(webPackage, specifier) {
  const packagePrefix = `${webPackage.name}/`;
  if (!specifier.startsWith(packagePrefix)) {
    throw new Error(`Native documentation stylesheet must use ${webPackage.name}: ${specifier}`);
  }
  const exportName = `./${specifier.slice(packagePrefix.length)}`;
  const exportTarget = webPackage.manifest.exports?.[exportName];
  if (typeof exportTarget !== 'string') {
    throw new Error(`Native documentation requires ${exportName} in ${webPackage.manifestPath}`);
  }
  const relativeAssetPath = exportTarget.replace(/^\.\/dist\//, '');
  if (relativeAssetPath === exportTarget) {
    throw new Error(`Native Web stylesheet export ${exportName} must resolve beneath @vyrnforge/web dist`);
  }
  return {
    specifier,
    assetPath: `/assets/vyrnforge-web/${relativeAssetPath}`,
  };
}

export function compileNativeDocumentation(root = repoRoot) {
  const graph = discoverProductGraph(root);
  const webPackage = graph.packages.find((entry) => entry.id === 'web');
  if (!webPackage?.manifest) throw new Error('Native documentation requires the @vyrnforge/web package');

  const shellStyles = nativeShellStyleSpecifiers.map((specifier) => resolvePublicStyleAsset(webPackage, specifier));
  const pages = graph.components
    .flatMap((component) => {
      if (!component.surfaces.web || !component.facets.docs) return [];
      const sourcePath = `${component.facets.docs}index.md`;
      if (!existsSync(path.join(root, sourcePath))) return [];

      const styleSpecifier = `${webPackage.name}/styles/${component.unitId}.css`;
      if (!component.surfaces.web.publicEntrypoints.includes(styleSpecifier)) {
        throw new Error(`${component.unitId} Native Web documentation requires public entrypoint ${styleSpecifier}`);
      }
      const styleAsset = resolvePublicStyleAsset(webPackage, styleSpecifier);

      const accessibilityPath = `${component.facets.root}accessibility.json`;
      if (!existsSync(path.join(root, accessibilityPath))) {
        throw new Error(`${component.unitId} Native Web documentation requires ${accessibilityPath}`);
      }
      const examples = nativeExamples(root, component);
      if (!examples.length) {
        throw new Error(`${component.unitId} Native Web documentation requires at least one executable native-web example`);
      }

      return [{
        id: component.unitId,
        title: component.name,
        group: component.documentationGroup,
        route: `components/${component.unitId}/`,
        sourcePath,
        content: parseMarkdownDocument(readFileSync(path.join(root, sourcePath), 'utf8')),
        styleSpecifier,
        styleAssetPath: styleAsset.assetPath,
        accessibility: readJson(root, accessibilityPath),
        examples,
      }];
    })
    .sort((left, right) => left.title.localeCompare(right.title));

  return {
    framework: 'native-web',
    frameworkLabel: 'Native Web',
    packageName: webPackage.name,
    shellStyles,
    pages,
  };
}

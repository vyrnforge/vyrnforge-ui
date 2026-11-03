import { readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits, repoRoot } from '../testing/discover-product-units.mjs';

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
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
  let paragraph = [];
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
  return component.exampleManifests.flatMap((manifestPath) => {
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

export function compileNativeDocumentation(root = repoRoot) {
  const graph = discoverProductUnits(root);
  const webPackage = graph.packages.find((entry) => entry.name === 'web');
  if (!webPackage?.manifest) throw new Error('Native documentation requires the @vyrnforge/web package');

  const pages = graph.components
    .filter((component) => component.ports.web && component.documentationSource?.endsWith('/index.md'))
    .map((component) => {
      const metadata = readJson(root, component.metadataPath);
      const exportName = `./styles/${component.component}.css`;
      const exportTarget = webPackage.manifest.exports?.[exportName];
      if (typeof exportTarget !== 'string') {
        throw new Error(`${component.component} Native Web documentation requires ${webPackage.manifest.name}/${exportName.slice(2)} to be publicly exported`);
      }
      const relativeAssetPath = exportTarget.replace(/^\.\/dist\//, '');
      if (relativeAssetPath === exportTarget) {
        throw new Error(`${component.component} Native Web stylesheet export must resolve beneath @vyrnforge/web dist`);
      }
      const accessibility = readJson(root, component.accessibilityPath);
      return {
        id: component.component,
        title: metadata.name,
        group: component.documentationGroup,
        route: `components/${component.component}/`,
        sourcePath: component.documentationSource,
        content: parseMarkdownDocument(readFileSync(path.join(root, component.documentationSource), 'utf8')),
        styleSpecifier: `${webPackage.manifest.name}/styles/${component.component}.css`,
        styleAssetPath: `/assets/vyrnforge-web/${relativeAssetPath}`,
        accessibility,
        examples: nativeExamples(root, component),
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));

  return {
    framework: 'native-web',
    frameworkLabel: 'Native Web',
    packageName: webPackage.manifest.name,
    pages,
  };
}

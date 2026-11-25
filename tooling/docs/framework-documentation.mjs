import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverProductGraph } from '../product/discover-product-graph.mjs';
import { deriveAccessibilityReferences } from './standard-references.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

export const documentationFrameworks = Object.freeze({
  'native-web': Object.freeze({
    id: 'native-web',
    label: 'Native Web',
    surface: 'web',
    packageId: 'web',
    exampleKey: 'native-web',
  }),
  react: Object.freeze({ id: 'react', label: 'React', surface: 'react', packageId: 'react', exampleKey: 'react' }),
  angular: Object.freeze({ id: 'angular', label: 'Angular', surface: 'angular', packageId: 'angular', exampleKey: 'angular' }),
  vue: Object.freeze({ id: 'vue', label: 'Vue', surface: 'vue', packageId: 'vue', exampleKey: 'vue' }),
  elements: Object.freeze({ id: 'elements', label: 'Elements', surface: 'elements', packageId: 'elements', exampleKey: 'elements' }),
});

function exists(root, relativePath) {
  return Boolean(relativePath) && existsSync(path.join(root, relativePath));
}

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
  let codeFence = null;

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
    const fence = /^\x60\x60\x60([a-zA-Z0-9+#-]*)\s*$/.exec(line);
    if (codeFence) {
      if (fence) {
        currentBlocks.push({ type: 'code', language: codeFence.language, text: codeFence.lines.join('\n') });
        codeFence = null;
      } else {
        codeFence.lines.push(rawLine);
      }
      continue;
    }
    if (fence) {
      flush();
      codeFence = { language: fence[1], lines: [] };
      continue;
    }
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
  if (codeFence) throw new Error('Unclosed fenced code block in documentation');
  flush();

  if (!title) throw new Error('Documentation content must start with a level-one Markdown heading');
  return { title, intro, sections };
}

function sharedContent(root, component) {
  const sourcePath = component.facets.docs ? `${component.facets.docs}index.md` : null;
  if (!exists(root, sourcePath)) return { sourcePath: null, content: null };
  return {
    sourcePath,
    content: parseMarkdownDocument(readFileSync(path.join(root, sourcePath), 'utf8')),
  };
}

function frameworkContent(root, component, surface) {
  if (!surface || surface.authoringMode !== 'product-unit') return { sourcePath: null, content: null };
  const authoringRoot = surface.authoringPaths[0];
  if (!authoringRoot) return { sourcePath: null, content: null };
  const candidates = [`${authoringRoot}docs/index.md`, `${authoringRoot}docs.md`];
  const sourcePath = candidates.find((candidate) => exists(root, candidate)) ?? null;
  if (!sourcePath) return { sourcePath: null, content: null };
  return {
    sourcePath,
    content: parseMarkdownDocument(readFileSync(path.join(root, sourcePath), 'utf8')),
  };
}

function frameworkExamples(root, component, framework) {
  const manifests = walkFiles(root, component.facets.examples).filter((file) => file.endsWith('/example.json'));
  return manifests.flatMap((manifestPath) => {
    const manifest = readJson(root, manifestPath);
    const adaptation = manifest.frameworks?.[framework.exampleKey];
    if (!adaptation?.source) return [];
    const documentationSection = manifest.documentationSection ?? null;
    if (documentationSection !== null && (
      typeof documentationSection !== 'string' ||
      !documentationSection.trim() ||
      documentationSection.trim() !== documentationSection
    )) {
      throw new Error(`${component.unitId} example ${manifest.id} has an invalid documentationSection`);
    }
    const sourcePath = path.posix.join(path.posix.dirname(manifestPath), adaptation.source);
    if (!exists(root, sourcePath)) {
      throw new Error(`${component.unitId} ${framework.label} example ${manifest.id} points to missing source ${sourcePath}`);
    }
    return [{
      id: manifest.id,
      title: manifest.title,
      description: manifest.description ?? '',
      documentationSection,
      language: adaptation.language ?? 'text',
      sourcePath,
      source: readFileSync(path.join(root, sourcePath), 'utf8').trim(),
    }];
  });
}

function accessibilityEvidence(root, component) {
  const sourcePath = `${component.facets.root}accessibility.json`;
  if (!exists(root, sourcePath)) return { sourcePath: null, value: null };
  return { sourcePath, value: readJson(root, sourcePath) };
}

function normalizeOwner(root, component, framework) {
  const surface = component.surfaces[framework.surface];
  const apiAvailable = Boolean(surface?.publicEntrypoints.length);
  // Framework-authored examples may consume shared Web CSS directly even
  // when another framework also offers a thin authoring component adapter.
  // Never invent a package API in a framework that has no real public export.
  const cssEntrypoint = `@vyrnforge/web/styles/${component.unitId}.css`;
  const cssRecipeStyle = component.kind === 'component' &&
    component.surfaces.web?.publicEntrypoints.includes(cssEntrypoint)
      ? cssEntrypoint : null;
  const shared = sharedContent(root, component);
  const adaptation = frameworkContent(root, component, surface);
  const examples = frameworkExamples(root, component, framework);
  const patternGuide = component.kind === 'pattern' && !Object.keys(component.surfaces).length &&
    component.documentationAvailable && (framework.id === 'native-web' || examples.length > 0);
  const cssOnlyGuide = !apiAvailable && Boolean(cssRecipeStyle && shared.content && examples.length);
  const guideOnly = patternGuide || cssOnlyGuide;
  if (!apiAvailable && !guideOnly) return null;
  const headings = new Set(shared.content?.sections.map((section) => section.heading) ?? []);
  for (const example of examples) {
    if (example.documentationSection && !headings.has(example.documentationSection)) {
      throw new Error(`${component.unitId} example ${example.id} references missing shared documentation section ${example.documentationSection}`);
    }
  }
  const accessibility = accessibilityEvidence(root, component);
  const group = component.documentationGroup ?? 'components';

  return {
    id: component.unitId,
    title: component.name,
    group,
    kind: component.kind,
    responsibility: component.responsibility ?? null,
    family: component.family ?? null,
    framework: framework.id,
    frameworkLabel: framework.label,
    surface: framework.surface,
    status: component.status,
    publicEntrypoints: surface?.publicEntrypoints ?? [],
    authoringMode: surface?.authoringMode ?? 'product-unit',
    guideOnly,
    cssRecipeStyle: cssOnlyGuide ? cssRecipeStyle : null,
    exampleReferences: component.exampleReferences ?? [],
    sharedSourcePath: shared.sourcePath,
    sharedContent: shared.content,
    frameworkSourcePath: adaptation.sourcePath,
    frameworkContent: adaptation.content,
    examples,
    accessibilityPath: accessibility.sourcePath,
    accessibility: accessibility.value,
    standardReferences: deriveAccessibilityReferences(accessibility.value),
    showcaseAvailable: Boolean(shared.content && (guideOnly || examples.length)),
    apiAvailable,
    showcaseRoute: component.kind === 'pattern'
      ? `patterns/${component.unitId}/`
      : `components/${component.unitId}/`,
    apiRoute: apiAvailable ? (component.kind === 'pattern'
      ? `api/patterns/${component.unitId}/`
      : `api/components/${component.unitId}/`) : null,
  };
}

export function compileFrameworkDocumentation(frameworkId, root = repoRoot) {
  const framework = documentationFrameworks[frameworkId];
  if (!framework) throw new Error(`Unknown documentation framework: ${frameworkId}`);

  const graph = discoverProductGraph(root);
  const packageEntry = graph.packages.find((entry) => entry.id === framework.packageId);
  if (!packageEntry?.manifest) {
    throw new Error(`${framework.label} documentation requires package @vyrnforge/${framework.packageId}`);
  }

  const publicCatalog = [...graph.components, ...graph.patterns]
    .map((owner) => normalizeOwner(root, owner, framework))
    .filter(Boolean)
    .sort((left, right) => left.title.localeCompare(right.title));

  const componentCatalog = publicCatalog.filter((owner) => owner.kind === 'component');
  const patternCatalog = publicCatalog.filter((owner) => owner.kind === 'pattern');

  const showcasePages = publicCatalog
    .filter((owner) => owner.showcaseAvailable)
    .map((owner) => ({ ...owner, route: owner.showcaseRoute, pageKind: 'showcase' }));

  const apiPages = publicCatalog.filter((owner) => owner.apiAvailable).map((owner) => ({
    ...owner,
    route: owner.apiRoute,
    pageKind: 'api',
  }));

  return {
    framework: framework.id,
    frameworkLabel: framework.label,
    frameworkSurface: framework.surface,
    packageId: framework.packageId,
    packageName: packageEntry.name,
    packageManifest: packageEntry.manifest,
    publicCatalog,
    componentCatalog,
    patternCatalog,
    showcasePages,
    apiPages,
    componentShowcasePages: showcasePages.filter((page) => page.kind === 'component'),
    patternShowcasePages: showcasePages.filter((page) => page.kind === 'pattern'),
    componentApiPages: apiPages.filter((page) => page.kind === 'component'),
    patternApiPages: apiPages.filter((page) => page.kind === 'pattern'),
    // Compatibility alias while the Native renderer is migrated to the shared model.
    pages: showcasePages,
  };
}

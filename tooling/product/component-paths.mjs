import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Internal source ownership; neither component IDs nor public exports depend on it.
export const componentResponsibilityDefinitions = Object.freeze([
  { id: 'elemental-primitives', families: Object.freeze(['typography', 'media']) },
  { id: 'interactive-controls', families: Object.freeze([]) },
  { id: 'composition-primitives', families: Object.freeze([]) },
  { id: 'composite-widgets', families: Object.freeze([
    'disclosure-view-switching', 'transient-surfaces', 'commands-actions',
    'collection-selection', 'choice-value', 'compound-fields',
    'content-navigation', 'interactive-layout', 'feedback',
  ]) },
  { id: 'application-structures', families: Object.freeze([]) },
].map(Object.freeze));
const responsibilities = new Map(componentResponsibilityDefinitions.map((entry) => [entry.id, entry]));
const validName = /^[a-z][a-z0-9-]*$/;

function childDirectories(absolute) {
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => {
      if (!entry.isDirectory() || !validName.test(entry.name)) {
        throw new Error('Invalid component ownership directory: ' + path.join(absolute, entry.name));
      }
      return entry.name;
    })
    .sort();
}

function assertNoNestedOwners(absolute) {
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(absolute, entry.name);
    if (existsSync(path.join(child, 'component.json'))) {
      throw new Error('Nested component ownership is not allowed: ' + child);
    }
    assertNoNestedOwners(child);
  }
}

export function discoverComponentRoots(root) {
  const relativeRoot = 'product/components';
  const absoluteRoot = path.join(root, relativeRoot);
  const components = new Map();

  const add = (responsibility, family, id) => {
    const canonicalRoot = [relativeRoot, responsibility, family, id].filter(Boolean).join('/');
    const absolute = path.join(root, canonicalRoot);
    const metadataPath = path.join(absolute, 'component.json');
    if (!existsSync(metadataPath)) {
      throw new Error('Missing component metadata: ' + canonicalRoot + '/component.json');
    }
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new Error('Invalid component metadata: ' + canonicalRoot);
    }
    if (Object.hasOwn(metadata, 'id') && metadata.id !== id) {
      throw new Error('Component ID must match its final folder: ' + metadata.id + ' != ' + id);
    }
    if (components.has(id)) {
      throw new Error('Duplicate component owner for ' + id + ': ' + components.get(id).root + ' and ' + canonicalRoot);
    }
    assertNoNestedOwners(absolute);
    components.set(id, { id, root: canonicalRoot, responsibility, family });
  };

  const assertGrouping = (absolute) => {
    if (existsSync(path.join(absolute, 'component.json'))) {
      throw new Error('Ownership grouping must not be a component: ' + absolute);
    }
  };

  for (const responsibility of childDirectories(absoluteRoot)) {
    const definition = responsibilities.get(responsibility);
    if (!definition) throw new Error('Unknown component responsibility: ' + responsibility);
    const responsibilityRoot = path.join(absoluteRoot, responsibility);
    assertGrouping(responsibilityRoot);
    for (const name of childDirectories(responsibilityRoot)) {
      const candidate = path.join(responsibilityRoot, name);
      if (definition.families.includes(name)) {
        assertGrouping(candidate);
        for (const id of childDirectories(candidate)) add(responsibility, name, id);
      } else {
        // Only declared families may introduce an additional ownership level.
        // A direct component must declare its own metadata.
        add(responsibility, null, name);
      }
    }
  }
  return components;
}

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// A path taxonomy for source ownership; component IDs and public exports remain stable.
export const componentLayerDefinitions = Object.freeze([
  { id: 'elemental-primitives', label: 'L1 — Elemental Primitives' },
  { id: 'interactive-controls', label: 'L2 — Interactive Controls' },
  { id: 'composition-primitives', label: 'L3 — Composition Primitives' },
  { id: 'behavioral-infrastructure', label: 'L4 — Behavioral Infrastructure' },
  { id: 'composite-components', label: 'L5 — Composite Components' },
  { id: 'complex-components', label: 'L6 — Complex Components' },
]);
const layerNames = new Set(componentLayerDefinitions.map((layer) => layer.id));
const validName = /^[a-z][a-z0-9-]*$/;

function childDirectories(absolute) {
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && validName.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

// Descend approved layer/category folders until finding unit metadata.
// Legacy flat component owners are no longer an accepted authoring model.
export function discoverComponentRoots(root) {
  const relativeRoot = 'product/components';
  const absoluteRoot = path.join(root, relativeRoot);
  const components = new Map();

  const walk = (segments) => {
    const absolute = path.join(absoluteRoot, ...segments);
    const metadataPath = path.join(absolute, 'component.json');
    const isLayerDirectory = segments.length === 1 && layerNames.has(segments[0]);
    const hasMetadata = existsSync(metadataPath);

    if (hasMetadata) {
      if (isLayerDirectory) {
        throw new Error('Layer folder must not be a component: ' + relativeRoot + '/' + segments[0]);
      }
      if (!layerNames.has(segments[0])) {
        throw new Error('Component owner must use an approved layer: ' + relativeRoot + '/' + segments.join('/'));
      }
      const id = segments[segments.length - 1];
      const metadata = hasMetadata ? JSON.parse(readFileSync(metadataPath, 'utf8')) : null;
      if (metadata?.id && metadata.id !== id) {
        throw new Error('Component ID must match its final folder: ' + metadata.id + ' != ' + id);
      }
      const canonicalRoot = relativeRoot + '/' + segments.join('/');
      if (components.has(id)) {
        throw new Error('Duplicate component owner for ' + id + ': ' + components.get(id).root + ' and ' + canonicalRoot);
      }
      components.set(id, {
        id,
        root: canonicalRoot,
        layer: segments[0],
        category: segments.length > 2 ? segments.slice(1, -1).join('/') : null,
        flat: false,
      });
      return;
    }
    if (segments.length >= 5) {
      throw new Error('Component grouping is too deep: ' + relativeRoot + '/' + segments.join('/'));
    }
    for (const name of childDirectories(absolute)) walk([...segments, name]);
  };

  for (const name of childDirectories(absoluteRoot)) {
    if (!layerNames.has(name)) {
      throw new Error('Component owner must use an approved layer: ' + relativeRoot + '/' + name);
    }
    walk([name]);
  }
  return components;
}

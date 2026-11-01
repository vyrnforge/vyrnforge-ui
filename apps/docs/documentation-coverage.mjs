import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductGraph } from '../../tooling/product/discover-product-graph.mjs';

export const documentationFrameworkSurfaces = Object.freeze({
  'native-web': 'web',
  react: 'react',
  angular: 'angular',
  vue: 'vue',
  elements: 'elements',
});

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function referencedExampleIds(html) {
  return [...html.matchAll(/data-vf-example="([^"]+)"/g)].map((match) => match[1]);
}

function exampleManifestPath(root, component, exampleId) {
  if (!component.facets.examples || !exampleId.startsWith(`${component.unitId}/`)) return null;
  const relativeId = exampleId.slice(component.unitId.length + 1);
  return path.join(root, component.facets.examples, relativeId, 'example.json');
}

export function documentationCoverage(root, graph = discoverProductGraph(root)) {
  const cells = [];
  const problems = [];
  const legacyComponents = [];

  for (const component of graph.components) {
    if (!component.facets.canonicalRoot) {
      if (component.facets.docs) legacyComponents.push(component.unitId);
      continue;
    }

    const docsPath = component.facets.docs
      ? path.join(root, component.facets.docs, 'index.html')
      : path.join(root, component.facets.canonicalRoot, 'docs', 'index.html');

    if (!existsSync(docsPath)) {
      problems.push(`${component.unitId}: canonical component is missing docs/index.html`);
      continue;
    }

    const html = readFileSync(docsPath, 'utf8');
    if (!html.includes('<div data-vf-framework-content></div>')) {
      problems.push(`${component.unitId}: shared documentation is missing data-vf-framework-content`);
    }

    const manifests = [];
    for (const exampleId of referencedExampleIds(html)) {
      const manifestPath = exampleManifestPath(root, component, exampleId);
      if (!manifestPath || !existsSync(manifestPath)) {
        problems.push(`${component.unitId}: referenced executable example ${exampleId} has no manifest`);
        continue;
      }
      manifests.push(readJson(manifestPath));
    }

    for (const [framework, surfaceTarget] of Object.entries(documentationFrameworkSurfaces)) {
      const surface = component.surfaces?.[surfaceTarget];
      if (!surface) continue;

      const overlayPath = path.join(root, component.facets.canonicalRoot, 'docs', 'frameworks', `${framework}.html`);
      const overlayExists = existsSync(overlayPath);
      const exampleExists = manifests.some((manifest) => Boolean(manifest.frameworks?.[framework]));
      const entrypointExists = (surface.publicEntrypoints?.length ?? 0) > 0;

      cells.push({
        component: component.unitId,
        framework,
        surface: surfaceTarget,
        overlay: overlayExists,
        example: exampleExists,
        publicEntrypoint: entrypointExists,
      });

      if (!entrypointExists) {
        problems.push(`${component.unitId}/${framework}: Product Graph surface has no public entrypoint`);
      }
      if (!overlayExists) {
        problems.push(`${component.unitId}/${framework}: missing docs/frameworks/${framework}.html`);
      } else {
        const overlay = readFileSync(overlayPath, 'utf8');
        if (!overlay.includes(`data-vf-framework-adaptation="${framework}"`)) {
          problems.push(`${component.unitId}/${framework}: adaptation file is missing its framework marker`);
        }
      }
      if (!exampleExists) {
        problems.push(`${component.unitId}/${framework}: no referenced executable example supports this framework`);
      }
    }
  }

  return {
    cells,
    problems,
    legacyComponents: legacyComponents.sort(),
  };
}

export function assertDocumentationCoverage(root, graph = discoverProductGraph(root)) {
  const coverage = documentationCoverage(root, graph);
  if (coverage.problems.length) {
    throw new Error(`Documentation framework coverage failed:\n- ${coverage.problems.join('\n- ')}`);
  }
  return coverage;
}

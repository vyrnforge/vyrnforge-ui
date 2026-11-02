import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductGraph } from '../../tooling/product/discover-product-graph.mjs';
import {
  assertDocumentationContentModel,
  referencedDocumentationExamples,
} from './content-model.mjs';

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

function referencedHtmlExampleIds(html) {
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

    const docsRoot = component.facets.docs
      ? path.join(root, component.facets.docs)
      : path.join(root, component.facets.canonicalRoot, 'docs');
    const modelPath = path.join(docsRoot, 'index.json');
    const htmlPath = path.join(docsRoot, 'index.html');
    const modelNative = existsSync(modelPath);

    if (!modelNative && !existsSync(htmlPath)) {
      problems.push(`${component.unitId}: canonical component is missing docs/index.json or docs/index.html`);
      continue;
    }

    let exampleIds = [];
    let model = null;
    if (modelNative) {
      try {
        model = assertDocumentationContentModel(readJson(modelPath), modelPath);
        exampleIds = referencedDocumentationExamples(model);
      } catch (error) {
        problems.push(`${component.unitId}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    } else {
      const html = readFileSync(htmlPath, 'utf8');
      if (!html.includes('<div data-vf-framework-content></div>')) {
        problems.push(`${component.unitId}: shared documentation is missing data-vf-framework-content`);
      }
      exampleIds = referencedHtmlExampleIds(html);
    }

    const manifests = [];
    for (const exampleId of exampleIds) {
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

      const adaptationExists = modelNative
        ? Boolean(model?.frameworks?.[framework])
        : existsSync(path.join(docsRoot, 'frameworks', `${framework}.html`));
      const exampleExists = manifests.some((manifest) => Boolean(manifest.frameworks?.[framework]));
      const entrypointExists = (surface.publicEntrypoints?.length ?? 0) > 0;

      cells.push({
        component: component.unitId,
        framework,
        surface: surfaceTarget,
        overlay: adaptationExists,
        example: exampleExists,
        publicEntrypoint: entrypointExists,
        sourceFormat: modelNative ? 'model' : 'html',
      });

      if (!entrypointExists) {
        problems.push(`${component.unitId}/${framework}: Product Graph surface has no public entrypoint`);
      }
      if (!adaptationExists) {
        problems.push(`${component.unitId}/${framework}: missing framework adaptation content`);
      } else if (!modelNative) {
        const overlayPath = path.join(docsRoot, 'frameworks', `${framework}.html`);
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

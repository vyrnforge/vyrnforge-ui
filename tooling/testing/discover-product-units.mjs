import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  repoRoot,
  discoverProductUnits as discoverBaseProductUnits,
  productPreparationProblems as baseProductPreparationProblems,
} from './discover-product-units-base.mjs';

export { repoRoot };

function documentationMode(root) {
  const registryPath = path.join(root, 'documentation/site/registry.json');
  if (!existsSync(registryPath)) return null;
  try {
    return JSON.parse(readFileSync(registryPath, 'utf8')).mode ?? null;
  } catch {
    return null;
  }
}

function withMarkdownDocumentation(root, discovery) {
  return {
    ...discovery,
    components: discovery.components.map((component) => {
      const docsRoot = component.documentationPaths[0];
      const markdownSource = `${docsRoot}index.md`;
      if (!existsSync(path.join(root, markdownSource))) return component;
      const documentationSources = [markdownSource, ...component.documentationSources];
      return {
        ...component,
        documentationSource: documentationSources[0],
        documentationSources,
        documentationCandidates: [markdownSource, ...component.documentationCandidates],
      };
    }),
  };
}

export function discoverProductUnits(root = repoRoot) {
  return withMarkdownDocumentation(root, discoverBaseProductUnits(root));
}

export function productPreparationProblems(root = repoRoot) {
  const mode = documentationMode(root);
  const problems = baseProductPreparationProblems(root);

  if (mode === 'native-html-first-reset') {
    const filtered = problems.filter((problem) => !problem.includes('is public but missing component documentation: expected '));
    for (const component of discoverProductUnits(root).components) {
      if (component.documentationSources.length) {
        filtered.push(`${component.component} retains component documentation during native-html-first-reset: ${component.documentationSources.join(', ')}`);
      }
    }
    return filtered;
  }

  if (mode === 'native-html-first') {
    const filtered = problems.filter((problem) => !problem.includes('is public but missing component documentation: expected '));
    for (const component of discoverProductUnits(root).components) {
      const legacySources = component.documentationSources.filter((source) => !source.endsWith('/index.md'));
      if (legacySources.length) {
        filtered.push(`${component.component} retains unsupported legacy component documentation during native-html-first: ${legacySources.join(', ')}`);
      }
      if (component.documentationSources.length > 1) {
        filtered.push(`${component.component} has competing primary component documentation sources: ${component.documentationSources.join(', ')}`);
      }
    }
    return filtered;
  }

  return problems;
}

export function assertProductPreparation(root = repoRoot) {
  const problems = productPreparationProblems(root);
  if (problems.length) throw new Error(`Product-unit preparation failed:\n- ${problems.join('\n- ')}`);
  return discoverProductUnits(root);
}

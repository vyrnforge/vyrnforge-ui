import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  repoRoot,
  discoverProductUnits,
  productPreparationProblems as baseProductPreparationProblems,
} from './discover-product-units-base.mjs';

export { repoRoot, discoverProductUnits };

function nativeHtmlDocsResetActive(root) {
  const registryPath = path.join(root, 'documentation/site/registry.json');
  if (!existsSync(registryPath)) return false;
  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
    return registry.mode === 'native-html-first-reset'
      && Array.isArray(registry.pages)
      && registry.pages.length === 0;
  } catch {
    return false;
  }
}

export function productPreparationProblems(root = repoRoot) {
  const problems = baseProductPreparationProblems(root);
  if (!nativeHtmlDocsResetActive(root)) return problems;

  const filtered = problems.filter((problem) => !problem.includes('is public but missing component documentation: expected '));
  for (const component of discoverProductUnits(root).components) {
    if (component.documentationSources.length) {
      filtered.push(`${component.component} retains legacy component documentation during native-html-first-reset: ${component.documentationSources.join(', ')}`);
    }
  }
  return filtered;
}

export function assertProductPreparation(root = repoRoot) {
  const problems = productPreparationProblems(root);
  if (problems.length) throw new Error(`Product-unit preparation failed:\n- ${problems.join('\n- ')}`);
  return discoverProductUnits(root);
}

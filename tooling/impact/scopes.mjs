const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export const scopeDefinitions = {
  structure: { command: ['node', 'tooling/verify/workspace-structure.mjs'], requires: [] },
  boundaries: { command: ['node', 'tooling/verify/package-boundaries.mjs'], requires: [] },
  'architecture-rules': { command: ['node', 'tooling/verify/architecture-rules.mjs'], requires: [] },
  'legacy-isolation': { command: ['node', 'tooling/verify/legacy-isolation.mjs'], requires: [] },
  'impact-engine': { command: ['node', '--test', 'tooling/tests/impact-plan.test.mjs', 'tooling/tests/impact-executor.test.mjs', 'tooling/tests/impact-tiers.test.mjs'], requires: [] },
  compatibility: { command: ['node', 'tooling/verify/compatibility.mjs'], requires: [] },
  'package-contracts': { command: ['node', 'tooling/verify/package-contracts.mjs'], requires: [] },
  'docs-source': { command: ['node', 'tooling/verify/documentation-structure.mjs'], requires: [] },
  'build-core': { command: [npm, 'run', 'build:core'], requires: [] },
  'build-web': { command: [npm, 'run', 'build:web'], requires: ['build-core'] },
  'build-react': { command: [npm, 'run', 'build:react'], requires: ['build-core', 'build-web'] },
  'build-angular': { command: [npm, 'run', 'build:angular'], requires: ['build-core', 'build-web'] },
  'build-vue': { command: [npm, 'run', 'build:vue'], requires: ['build-core', 'build-web'] },
  'build-elements': { command: [npm, 'run', 'build:elements'], requires: ['build-core', 'build-web'] },
  'pack-core': { command: ['node', 'tooling/verify/package-smoke.mjs', 'core'], requires: ['build-core'] },
  'pack-web': { command: ['node', 'tooling/verify/package-smoke.mjs', 'web'], requires: ['build-web'] },
  'pack-react': { command: ['node', 'tooling/verify/package-smoke.mjs', 'react'], requires: ['build-react'] },
  'pack-angular': { command: ['node', 'tooling/verify/package-smoke.mjs', 'angular'], requires: ['build-angular'] },
  'pack-vue': { command: ['node', 'tooling/verify/package-smoke.mjs', 'vue'], requires: ['build-vue'] },
  'pack-elements': { command: ['node', 'tooling/verify/package-smoke.mjs', 'elements'], requires: ['build-elements'] },
  'docs-build': { command: [npm, 'run', 'build:docs'], requires: ['docs-source', 'compatibility', 'package-contracts'] },
  'docs-site': { command: ['node', 'tooling/verify/docs-site.mjs'], requires: ['docs-build'] },
  'consumer-packages': { command: ['node', 'tooling/verify/consumer-packages.mjs'], requires: ['build-core', 'build-web', 'build-react', 'build-angular', 'build-vue', 'build-elements'] },
  'release-readiness': { command: ['node', 'tooling/verify/release-readiness.mjs'], requires: ['consumer-packages', 'docs-site'] }
};

export function expandScopes(selectedScopes) {
  const selected = new Set(selectedScopes);
  const ordered = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(scope) {
    if (visited.has(scope)) return;
    if (visiting.has(scope)) throw new Error(`Validation scope prerequisite cycle at ${scope}`);
    const definition = scopeDefinitions[scope];
    if (!definition) throw new Error(`No executor registered for validation scope ${scope}`);
    visiting.add(scope);
    for (const prerequisite of definition.requires) visit(prerequisite);
    visiting.delete(scope);
    visited.add(scope);
    ordered.push({ scope, selected: selected.has(scope), command: definition.command });
  }

  for (const scope of selectedScopes) visit(scope);
  return ordered;
}

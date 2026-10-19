import { readFileSync } from 'node:fs';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const registry = JSON.parse(readFileSync(new URL('../../testing/components/registry.json', import.meta.url), 'utf8'));

const baseScopeDefinitions = {
  structure: { command: ['node', 'tooling/verify/workspace-structure.mjs'], requires: [] },
  'testing-structure': { command: ['node', 'tooling/verify/testing-structure.mjs'], requires: [] },
  'repository-guidance': { command: ['node', 'tooling/verify/repository-guidance.mjs'], requires: [] },
  boundaries: { command: ['node', 'tooling/verify/package-boundaries.mjs'], requires: [] },
  'architecture-rules': { command: ['node', 'tooling/verify/architecture-rules.mjs'], requires: [] },
  'workflow-contracts': { command: ['node', 'tooling/verify/workflows.mjs'], requires: [] },
  'legacy-isolation': { command: ['node', 'tooling/verify/legacy-isolation.mjs'], requires: [] },
  'impact-engine': { command: ['node', '--test', 'tooling/tests/impact-plan.test.mjs', 'tooling/tests/impact-executor.test.mjs', 'tooling/tests/impact-tiers.test.mjs', 'tooling/tests/actions-retention.test.mjs'], requires: [] },
  'foundation-readiness': { command: ['node', 'tooling/verify/foundation-readiness.mjs'], requires: [] },
  'lint-tooling': { command: [npm, 'run', 'lint:tooling'], requires: [] },
  'lint-web-css': { command: [npm, 'run', 'lint:web-css'], requires: [] },
  'lint-docs': { command: [npm, 'run', 'lint:docs'], requires: [] },
  'lint-core': { command: [npm, 'run', 'lint:core'], requires: [] },
  'lint-web': { command: [npm, 'run', 'lint:web'], requires: [] },
  'lint-react': { command: [npm, 'run', 'lint:react'], requires: [] },
  'lint-angular': { command: [npm, 'run', 'lint:angular'], requires: [] },
  'lint-vue': { command: [npm, 'run', 'lint:vue'], requires: [] },
  'lint-elements': { command: [npm, 'run', 'lint:elements'], requires: [] },
  compatibility: { command: ['node', 'tooling/verify/compatibility.mjs'], requires: [] },
  'package-contracts': { command: ['node', 'tooling/verify/package-contracts.mjs'], requires: [] },
  'docs-source': { command: ['node', 'tooling/verify/documentation-structure.mjs'], requires: [] },
  'build-core': { command: [npm, 'run', 'build:core'], requires: ['lint-core'] },
  'build-web': { command: [npm, 'run', 'build:web'], requires: ['lint-web', 'build-core'] },
  'build-react': { command: [npm, 'run', 'build:react'], requires: ['lint-react', 'build-core', 'build-web'] },
  'build-angular': { command: [npm, 'run', 'build:angular'], requires: ['lint-angular', 'build-core', 'build-web'] },
  'build-vue': { command: [npm, 'run', 'build:vue'], requires: ['lint-vue', 'build-core', 'build-web'] },
  'build-elements': { command: [npm, 'run', 'build:elements'], requires: ['lint-elements', 'build-core', 'build-web'] },
  'pack-core': { command: ['node', 'tooling/verify/package-smoke.mjs', 'core'], requires: ['build-core'] },
  'pack-web': { command: ['node', 'tooling/verify/package-smoke.mjs', 'web'], requires: ['build-web'] },
  'pack-react': { command: ['node', 'tooling/verify/package-smoke.mjs', 'react'], requires: ['build-react'] },
  'pack-angular': { command: ['node', 'tooling/verify/package-smoke.mjs', 'angular'], requires: ['build-angular'] },
  'pack-vue': { command: ['node', 'tooling/verify/package-smoke.mjs', 'vue'], requires: ['build-vue'] },
  'pack-elements': { command: ['node', 'tooling/verify/package-smoke.mjs', 'elements'], requires: ['build-elements'] },
  'consumer-core': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'core'], requires: ['build-core'] },
  'consumer-web': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'web'], requires: ['build-web'] },
  'consumer-react': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'react'], requires: ['build-react'] },
  'consumer-angular': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'angular'], requires: ['build-angular'] },
  'consumer-vue': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'vue'], requires: ['build-vue'] },
  'consumer-elements': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'elements'], requires: ['build-elements'] },
  'docs-build': { command: [npm, 'run', 'build:docs'], requires: ['docs-source', 'compatibility', 'package-contracts'] },
  'docs-site': { command: ['node', 'tooling/verify/docs-site.mjs'], requires: ['docs-build'] },
  'browser-docs-chromium': { command: [npm, 'run', 'test:browser:docs'], requires: ['docs-site'] },
  'browser-docs-cross': { command: [npm, 'run', 'test:browser:docs:cross'], requires: ['docs-site'] },
  'consumer-all': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'all'], requires: ['build-core', 'build-web', 'build-react', 'build-angular', 'build-vue', 'build-elements'] },
  'release-readiness': { command: ['node', 'tooling/verify/release-readiness.mjs'], requires: ['consumer-all', 'docs-site', 'browser-docs-cross'] }
};

function componentEntry(componentId) {
  return registry.components.find((entry) => entry.component === componentId);
}

function componentPrerequisite(port) {
  return port === 'web' ? 'build-web' : `build-${port}`;
}

export function resolveScopeDefinition(scope) {
  if (baseScopeDefinitions[scope]) return baseScopeDefinitions[scope];

  const match = /^component:([^:]+):(.+)$/.exec(scope);
  if (!match) return null;
  const [, componentId, suffix] = match;
  const component = componentEntry(componentId);
  if (!component) return null;

  if (suffix === 'types' && component.types) {
    const buildPrerequisites = Object.keys(component.ports).filter((port) => port !== 'web').map(componentPrerequisite);
    return {
      command: ['node', 'tooling/types/check-component.mjs', componentId],
      requires: [...new Set(buildPrerequisites)]
    };
  }

  const evidenceMatch = /^([^:]+):(ssr|browser|browser-cross)$/.exec(suffix);
  if (!evidenceMatch) return null;
  const [, port, evidence] = evidenceMatch;
  const portConfig = component.ports?.[port];
  if (!portConfig) return null;

  if (evidence === 'ssr' && portConfig.ssr) {
    return {
      command: ['node', 'tooling/tests/run-component-ssr.mjs', componentId, port],
      requires: [componentPrerequisite(port)]
    };
  }

  if ((evidence === 'browser' || evidence === 'browser-cross') && portConfig.browser) {
    return {
      command: ['node', 'tooling/browser/run-component.mjs', componentId, port, evidence === 'browser-cross' ? 'all' : 'chromium'],
      requires: ['docs-site', componentPrerequisite(port)]
    };
  }

  return null;
}

export function expandScopes(selectedScopes) {
  const selected = new Set(selectedScopes);
  const ordered = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(scope) {
    if (visited.has(scope)) return;
    if (visiting.has(scope)) throw new Error(`Validation scope prerequisite cycle at ${scope}`);
    const definition = resolveScopeDefinition(scope);
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

import { discoverProductUnits } from '../testing/discover-product-units.mjs';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const discovery = discoverProductUnits();
const baseScopeDefinitions = {
  structure: { command: ['node', 'tooling/verify/workspace-structure.mjs'], requires: [] },
  'testing-structure': { command: ['node', 'tooling/verify/testing-structure.mjs'], requires: [] },
  'change-fragments': { command: ['node', 'tooling/verify/change-fragments.mjs'], requires: [] },
  'changes-preview': { command: ['node', 'tooling/changes/render.mjs'], requires: ['change-fragments'] },
  'repository-guidance': { command: ['node', 'tooling/verify/repository-guidance.mjs'], requires: [] },
  boundaries: { command: ['node', 'tooling/verify/package-boundaries.mjs'], requires: [] },
  'architecture-rules': { command: ['node', 'tooling/verify/architecture-rules.mjs'], requires: [] },
  'workflow-contracts': { command: ['node', 'tooling/verify/workflows.mjs'], requires: [] },
  'legacy-isolation': { command: ['node', 'tooling/verify/legacy-isolation.mjs'], requires: [] },
  'impact-engine': { command: ['node', '--test', 'tooling/impact/plan.test.mjs', 'tooling/impact/executor.test.mjs', 'tooling/impact/tiers.test.mjs', 'tooling/impact/local.test.mjs', 'tooling/testing/discovery.test.mjs', 'tooling/actions/retention.test.mjs'], requires: [] },
  'foundation-readiness': { command: ['node', 'tooling/verify/foundation-readiness.mjs'], requires: [] },
  'lint-tooling': { command: [npm, 'run', 'lint:tooling'], requires: [] },
  'lint-web-css': { command: [npm, 'run', 'lint:web-css'], requires: [] },
  'lint-docs': { command: [npm, 'run', 'lint:docs'], requires: [] },
  'lint-core': { command: [npm, 'run', 'lint:core'], requires: [] },
  'lint-web': { command: [npm, 'run', 'lint:web'], requires: [] },
  'lint-icons': { command: [npm, 'run', 'lint:icons'], requires: [] },
  'lint-react': { command: [npm, 'run', 'lint:react'], requires: [] },
  'lint-angular': { command: [npm, 'run', 'lint:angular'], requires: [] },
  'lint-vue': { command: [npm, 'run', 'lint:vue'], requires: [] },
  'lint-elements': { command: [npm, 'run', 'lint:elements'], requires: [] },
  compatibility: { command: ['node', 'tooling/verify/compatibility.mjs'], requires: [] },
  'package-contracts': { command: ['node', 'tooling/verify/package-contracts.mjs'], requires: [] },
  'docs-source': { command: ['node', 'tooling/verify/documentation-structure.mjs'], requires: [] },
  'build-core': { command: [npm, 'run', 'build:core'], requires: ['lint-core'] },
  'build-web': { command: [npm, 'run', 'build:web'], requires: ['lint-web', 'build-core'] },
  'build-icons': { command: [npm, 'run', 'build:icons'], requires: ['lint-icons', 'build-web'] },
  'build-react': { command: [npm, 'run', 'build:react'], requires: ['lint-react', 'build-core', 'build-web'] },
  'build-angular': { command: [npm, 'run', 'build:angular'], requires: ['lint-angular', 'build-core', 'build-web'] },
  'build-vue': { command: [npm, 'run', 'build:vue'], requires: ['lint-vue', 'build-core', 'build-web'] },
  'build-elements': { command: [npm, 'run', 'build:elements'], requires: ['lint-elements', 'build-core', 'build-web'] },
  'pack-core': { command: ['node', 'tooling/verify/package-smoke.mjs', 'core'], requires: ['build-core'] },
  'pack-web': { command: ['node', 'tooling/verify/package-smoke.mjs', 'web'], requires: ['build-web'] },
  'pack-icons': { command: ['node', 'tooling/verify/package-smoke.mjs', 'icons'], requires: ['build-icons'] },
  'pack-react': { command: ['node', 'tooling/verify/package-smoke.mjs', 'react'], requires: ['build-react'] },
  'pack-angular': { command: ['node', 'tooling/verify/package-smoke.mjs', 'angular'], requires: ['build-angular'] },
  'pack-vue': { command: ['node', 'tooling/verify/package-smoke.mjs', 'vue'], requires: ['build-vue'] },
  'pack-elements': { command: ['node', 'tooling/verify/package-smoke.mjs', 'elements'], requires: ['build-elements'] },
  'consumer-core': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'core'], requires: ['build-core'] },
  'consumer-web': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'web'], requires: ['build-web'] },
  'consumer-icons': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'icons'], requires: ['build-icons'] },
  'consumer-react': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'react'], requires: ['build-react'] },
  'consumer-angular': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'angular'], requires: ['build-angular'] },
  'consumer-vue': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'vue'], requires: ['build-vue'] },
  'consumer-elements': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'elements'], requires: ['build-elements'] },
  'docs-build': { command: [npm, 'run', 'build:docs'], requires: ['docs-source', 'compatibility', 'package-contracts'] },
  'docs-site': { command: ['node', 'tooling/verify/docs-site.mjs'], requires: ['docs-build'] },
  'browser-docs-chromium': { command: [npm, 'run', 'test:browser:docs'], requires: ['docs-site'] },
  'browser-docs-cross': { command: [npm, 'run', 'test:browser:docs:cross'], requires: ['docs-site'] },
  'consumer-all': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'all'], requires: ['build-core', 'build-web', 'build-icons', 'build-react', 'build-angular', 'build-vue', 'build-elements'] },
  'bundle-baselines': { command: ['node', 'tooling/performance/measure-representative-bundles.mjs', '--check'], requires: ['build-web', 'build-icons', 'build-react', 'build-angular', 'build-vue', 'build-elements'] },
  'release-readiness': { command: ['node', 'tooling/verify/release-readiness.mjs'], requires: ['consumer-all', 'docs-site', 'browser-docs-cross', 'changes-preview', 'bundle-baselines'] }
};
function componentEntry(componentId) { return discovery.components.find((entry) => entry.component === componentId); }
function componentPrerequisite(port) { return port === 'web' ? 'build-web' : `build-${port}`; }
export function resolveScopeDefinition(scope) {
  if (baseScopeDefinitions[scope]) return baseScopeDefinitions[scope];
  const unitMatch = /^unit:([^:]+):([^:]+):([^:]+):test$/.exec(scope);
  if (unitMatch) {
    const [, packageName, kind, id] = unitMatch;
    const unit = discovery.ownedUnits.find((entry) => entry.package === packageName && entry.kind === kind && entry.id === id);
    if (!unit) return null;
    return { command: ['node', 'tooling/testing/run-owned-unit.mjs', packageName, kind, id], requires: [`build-${packageName}`] };
  }
  const match = /^component:([^:]+):(.+)$/.exec(scope);
  if (!match) return null;
  const [, componentId, suffix] = match;
  const component = componentEntry(componentId);
  if (!component) return null;
  if (suffix === 'docs') return { command: ['node', 'tooling/docs/check-component.mjs', componentId], requires: [] };
  if (suffix === 'conformance:types' && component.conformanceTypes) {
    const requires = Object.keys(component.ports).filter((port) => port !== 'web').map(componentPrerequisite);
    if (componentId === 'icon') requires.push('build-icons');
    return { command: ['node', 'tooling/testing/check-component-types.mjs', componentId, 'conformance'], requires: [...new Set(requires)] };
  }
  const typed = /^([^:]+):types$/.exec(suffix);
  if (typed && component.ports?.[typed[1]]?.types) {
    const requires = [componentPrerequisite(typed[1])];
    if (componentId === 'icon') requires.push('build-icons');
    return { command: ['node', 'tooling/testing/check-component-types.mjs', componentId, typed[1]], requires: [...new Set(requires)] };
  }
  const evidenceMatch = /^([^:]+):(ssr|browser|browser-cross)$/.exec(suffix);
  if (!evidenceMatch) return null;
  const [, port, evidence] = evidenceMatch;
  const portConfig = component.ports?.[port];
  if (!portConfig) return null;
  if (evidence === 'ssr' && portConfig.ssr) {
    const requires = [componentPrerequisite(port)];
    if (componentId === 'icon') requires.push('build-icons');
    return { command: ['node', 'tooling/testing/run-component-ssr.mjs', componentId, port], requires: [...new Set(requires)] };
  }
  if ((evidence === 'browser' || evidence === 'browser-cross') && portConfig.browser) {
    const requires = [componentPrerequisite(port)];
    if (componentId === 'icon') requires.push('build-icons');
    return { command: ['node', 'tooling/testing/run-component-browser.mjs', componentId, port, evidence === 'browser-cross' ? 'all' : 'chromium'], requires: [...new Set(requires)] };
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

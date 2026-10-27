import { discoverProductUnits } from '../testing/discover-product-units.mjs';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const discovery = discoverProductUnits();
const packageNames = discovery.packages.map(({ name }) => name);
const packageNameSet = new Set(packageNames);
const packageDependencies = new Map(discovery.packages.map(({ name, manifest }) => [
  name,
  Object.keys(manifest.dependencies ?? {})
    .filter((dependency) => dependency.startsWith('@vyrnforge/'))
    .map((dependency) => dependency.slice('@vyrnforge/'.length))
    .filter((dependency) => packageNameSet.has(dependency)),
]));
const allPackageBuilds = packageNames.map((name) => `build-${name}`);
const baseScopeDefinitions = {
  structure: { command: ['node', 'tooling/verify/workspace-structure.mjs'], requires: [] },
  'testing-structure': { command: ['node', 'tooling/verify/testing-structure.mjs'], requires: [] },
  'change-fragments': { command: ['node', 'tooling/verify/change-fragments.mjs'], requires: [] },
  'changes-preview': { command: ['node', 'tooling/release/render.mjs'], requires: ['change-fragments'] },
  boundaries: { command: ['node', 'tooling/verify/package-boundaries.mjs'], requires: [] },
  'architecture-rules': { command: ['node', 'tooling/verify/architecture-rules.mjs'], requires: [] },
  'workflow-contracts': { command: ['node', 'tooling/verify/workflows.mjs'], requires: [] },
  'impact-engine': { command: [npm, 'run', 'test:impact'], requires: [] },
  'testing-tooling': { command: [npm, 'run', 'test:testing-tooling'], requires: [] },
  'accessibility-tooling': { command: [npm, 'run', 'test:accessibility-tooling'], requires: [] },
  'ci-tooling': { command: [npm, 'run', 'test:ci-tooling'], requires: [] },
  'component-types-all': { command: ['node', 'tooling/testing/check-component-types-batch.mjs'], requires: allPackageBuilds },
  'component-ssr-all': { command: ['node', 'tooling/testing/run-component-ssr-batch.mjs'], requires: allPackageBuilds },
  'lint-tooling': { command: [npm, 'run', 'lint:tooling'], requires: [] },
  'lint-web-css': { command: [npm, 'run', 'lint:web-css'], requires: [] },
  'lint-docs': { command: [npm, 'run', 'lint:docs'], requires: [] },
  compatibility: { command: ['node', 'tooling/verify/compatibility.mjs'], requires: [] },
  'package-contracts': { command: ['node', 'tooling/verify/package-contracts.mjs'], requires: [] },
  'docs-source': { command: ['node', 'tooling/verify/documentation-structure.mjs'], requires: [] },
  'browser-foundation-visual': { command: [npm, 'run', 'test:visual:foundation'], requires: ['build-web'] },
  'browser-elemental-primitives': { command: ['node', 'tooling/testing/run-component-browser.mjs', 'elemental-primitives', 'web', 'chromium'], requires: ['build-web'] },
  'docs-build': { command: [npm, 'run', 'build:docs'], requires: ['docs-source', 'compatibility', 'package-contracts', ...allPackageBuilds] },
  'docs-site': { command: ['node', 'tooling/verify/docs-site.mjs'], requires: ['docs-build'] },
  'browser-docs-chromium': { command: [npm, 'run', 'test:browser:docs'], requires: ['docs-site'] },
  'browser-docs-cross': { command: [npm, 'run', 'test:browser:docs:cross'], requires: ['docs-site'] },
  'consumer-all': { command: ['node', 'tooling/verify/consumer-packages.mjs', 'all'], requires: allPackageBuilds },
  'bundle-baselines': { command: ['node', 'tooling/testing/performance/measure-representative-bundles.mjs', '--check'], requires: packageNames.filter((name) => name !== 'core').map((name) => `build-${name}`) },
  'release-readiness': { command: ['node', 'tooling/verify/release-readiness.mjs'], requires: ['consumer-all', 'docs-site', 'browser-docs-cross', 'browser-foundation-visual', 'browser-elemental-primitives', 'changes-preview', 'bundle-baselines'] },
};
for (const packageName of packageNames) {
  baseScopeDefinitions[`lint-${packageName}`] = { command: [npm, 'run', `lint:${packageName}`], requires: [] };
  baseScopeDefinitions[`build-${packageName}`] = {
    command: [npm, 'run', `build:${packageName}`],
    requires: [`lint-${packageName}`, ...(packageDependencies.get(packageName) ?? []).map((dependency) => `build-${dependency}`)],
  };
  baseScopeDefinitions[`consumer-${packageName}`] = {
    command: ['node', 'tooling/verify/consumer-packages.mjs', packageName],
    requires: [`build-${packageName}`],
  };
}
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
  const definitions = new Map();
  const requiredBy = new Map();
  function visit(scope, parent = null) {
    if (parent) {
      const parents = requiredBy.get(scope) ?? new Set();
      parents.add(parent);
      requiredBy.set(scope, parents);
    }
    if (visited.has(scope)) return;
    if (visiting.has(scope)) throw new Error(`Validation scope prerequisite cycle at ${scope}`);
    const definition = resolveScopeDefinition(scope);
    if (!definition) throw new Error(`No executor registered for validation scope ${scope}`);
    definitions.set(scope, definition);
    visiting.add(scope);
    for (const prerequisite of definition.requires) visit(prerequisite, scope);
    visiting.delete(scope);
    visited.add(scope);
    ordered.push(scope);
  }
  for (const scope of selectedScopes) visit(scope);
  return ordered.map((scope) => ({ scope, selected: selected.has(scope), requiredBy: [...(requiredBy.get(scope) ?? [])].sort(), command: definitions.get(scope).command }));
}

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';
const impact = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'));
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
function matchesPath(filePath, pattern) { return pattern.endsWith('/') ? filePath.startsWith(pattern) : filePath === pattern; }
function componentScope(component, suffix) { return `component:${component}:${suffix}`; }
function packageEvidence(port) { return ['package-contracts', `consumer-${port}`]; }
function compileTargets() {
  const targets = structuredClone(impact.targets);
  for (const { name } of discovery.packages) {
    if (targets[name]) targets[name].aggregate = true;
    targets[`package:${name}:public-surface`] = {
      paths: [`packages/${name}/package.json`, `packages/${name}/src/index.ts`],
      dependsOn: [],
      evidence: packageEvidence(name),
    };
  }
  targets['web:aggregate-style'] = {
    paths: ['packages/web/src/styles.css'],
    dependsOn: [],
    evidence: ['lint-web-css', ...packageEvidence('web')],
  };
  targets['performance:bundle-baselines'] = {
    paths: ['tooling/testing/performance/representative-bundle-baselines.json'],
    dependsOn: [],
    evidence: ['bundle-baselines'],
  };
  for (const unit of discovery.ownedUnits) targets[unit.node] = { paths: [unit.sourcePath, unit.testPath, unit.metadataPath], dependsOn: [unit.package, ...unit.dependencies], evidence: [`${unit.node}:test`] };
  for (const component of discovery.components) {
    const webNode = component.ports.web ? `component:${component.component}:web` : null;
    const webStyleNode = component.ports.web?.stylePaths?.length ? `component:${component.component}:web-style` : null;
    for (const [port, config] of Object.entries(component.ports)) {
      const node = `component:${component.component}:${port}`;
      const evidence = [];
      if (config.types) evidence.push(componentScope(component.component, `${port}:types`));
      if (config.ssr) evidence.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) evidence.push(componentScope(component.component, `${port}:browser`));
      targets[node] = { paths: config.paths, dependsOn: [...new Set([port, ...config.dependencies, ...(port !== 'web' && webNode ? [webNode] : [])])], evidence, ...(port === 'web' && webStyleNode ? { aggregate: true } : {}) };
      if (port !== 'web' && webStyleNode && config.browser) {
        targets[`component:${component.component}:${port}:style-impact`] = {
          paths: [],
          dependsOn: [webStyleNode],
          evidence: [componentScope(component.component, `${port}:browser`)],
        };
      }
    }
    if (webStyleNode) {
      targets[webStyleNode] = {
        paths: component.ports.web.stylePaths,
        dependsOn: ['web'],
        evidence: ['lint-web-css', componentScope(component.component, 'web:browser')],
      };
    }
    const conformanceNode = `component:${component.component}:conformance`;
    const conformanceEvidence = [];
    if (component.conformanceTypes) conformanceEvidence.push(componentScope(component.component, 'conformance:types'));
    for (const [port, config] of Object.entries(component.ports)) if (config.browser) conformanceEvidence.push(componentScope(component.component, `${port}:browser`));
    targets[conformanceNode] = { paths: [...(component.conformanceTypes ? [component.conformanceTypes] : []), ...component.browser.paths], dependsOn: webNode ? [webNode] : [], evidence: conformanceEvidence };
    const documentationNode = `component:${component.component}:documentation`;
    targets[documentationNode] = { paths: component.documentationPaths, dependsOn: [conformanceNode], evidence: ['docs-source', componentScope(component.component, 'docs')] };
    targets[`component:${component.component}:changes`] = { paths: [component.changesPath], dependsOn: [], evidence: ['change-fragments'] };
  }
  return targets;
}
const targets = compileTargets();
export function classifyPath(filePath) {
  const matches = Object.entries(targets).filter(([, config]) => (config.paths ?? []).some((pattern) => matchesPath(filePath, pattern)));
  const specific = matches.filter(([, config]) => !config.aggregate && !config.broad);
  const selectedMatches = specific.length ? specific : matches;
  const matchedNodes = selectedMatches.map(([node]) => node).sort();
  const explicitlyBroad = impact.broadPaths.some((pattern) => matchesPath(filePath, pattern));
  const broad = explicitlyBroad || matchedNodes.length === 0 || (selectedMatches.some(([, config]) => config.broad) && !selectedMatches.some(([, config]) => !config.broad));
  return { nodes: matchedNodes, broad };
}
function reverseClosure(initialNodes) {
  const selected = new Set(initialNodes);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [node, config] of Object.entries(targets)) {
      if (selected.has(node)) continue;
      if ((config.dependsOn ?? []).some((dependency) => selected.has(dependency))) {
        selected.add(node);
        changed = true;
      }
    }
  }
  return selected;
}
function dynamicPrScopes() {
  const scopes = discovery.ownedUnits.map((unit) => `${unit.node}:test`);
  for (const component of discovery.components) {
    if (component.conformanceTypes) scopes.push(componentScope(component.component, 'conformance:types'));
    for (const [port, config] of Object.entries(component.ports)) {
      if (config.types) scopes.push(componentScope(component.component, `${port}:types`));
      if (config.ssr) scopes.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) scopes.push(componentScope(component.component, `${port}:browser`));
    }
  }
  return scopes;
}
function dynamicTierScopes(mode) {
  const scopes = [
    ...discovery.ownedUnits.map((unit) => `${unit.node}:test`),
    'component-types-all',
    'component-ssr-all',
  ];
  for (const component of discovery.components) {
    for (const [port, config] of Object.entries(component.ports)) if (config.browser) scopes.push(componentScope(component.component, `${port}:browser`));
    if ((mode === 'scheduled' || mode === 'release') && component.ports.web?.browser) scopes.push(componentScope(component.component, 'web:browser-cross'));
  }
  return scopes;
}
function batchBroadComponentEvidence(selectedScopes) {
  let hasTypes = false;
  let hasSsr = false;
  for (const scope of [...selectedScopes]) {
    if (/^component:[^:]+:[^:]+:types$/.test(scope)) {
      selectedScopes.delete(scope);
      hasTypes = true;
    } else if (/^component:[^:]+:[^:]+:ssr$/.test(scope)) {
      selectedScopes.delete(scope);
      hasSsr = true;
    }
  }
  if (hasTypes) selectedScopes.add('component-types-all');
  if (hasSsr) selectedScopes.add('component-ssr-all');
}
function batchFullPackageConsumerEvidence(selectedScopes) {
  const requested = [...selectedScopes]
    .map((scope) => /^consumer-([a-z][a-z0-9-]*)$/.exec(scope)?.[1] ?? null)
    .filter((name) => packageNameSet.has(name));
  if (requested.length < 2) return false;
  const closure = new Set();
  function include(name) {
    if (closure.has(name)) return;
    for (const dependency of packageDependencies.get(name) ?? []) include(dependency);
    closure.add(name);
  }
  for (const name of requested) include(name);
  if (closure.size !== packageNames.length) return false;
  for (const name of requested) selectedScopes.delete(`consumer-${name}`);
  selectedScopes.add('consumer-all');
  return true;
}
export function allKnownScopes() { return [...new Set([...impact.scopeOrder, ...(impact.tierBase ?? []), 'component-types-all', 'component-ssr-all', ...dynamicPrScopes(), ...dynamicTierScopes('release'), ...discovery.components.map((component) => componentScope(component.component, 'docs'))])]; }
function orderedScopes(scopes) { const order = new Map(allKnownScopes().map((scope, index) => [scope, index])); return [...scopes].sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b)); }
function scopeReasonsFor(affectedNodes, selectedScopes, broad = false, batchedConsumers = false) {
  const reasons = new Map();
  for (const scope of impact.globalSentinels) reasons.set(scope, ['global sentinel']);
  for (const node of affectedNodes) {
    for (const scope of targets[node]?.evidence ?? []) {
      if (!selectedScopes.has(scope)) continue;
      const values = reasons.get(scope) ?? [];
      values.push(`evidence for ${node}`);
      reasons.set(scope, values);
    }
  }
  if (broad && selectedScopes.has('component-types-all')) reasons.set('component-types-all', ['batched exhaustive type evidence for broadened PR']);
  if (broad && selectedScopes.has('component-ssr-all')) reasons.set('component-ssr-all', ['batched exhaustive SSR evidence for broadened PR']);
  if (batchedConsumers && selectedScopes.has('consumer-all')) reasons.set('consumer-all', ['single packed-consumer pass for the full affected package closure']);
  return Object.fromEntries(orderedScopes(selectedScopes).map((scope) => [scope, reasons.get(scope) ?? ['selected by tier']]));
}
export function createPlan(paths) {
  const directNodes = new Set();
  let broad = false;
  for (const filePath of paths) {
    const classification = classifyPath(filePath);
    for (const node of classification.nodes) directNodes.add(node);
    broad ||= classification.broad;
  }
  const affectedNodes = broad ? new Set(Object.keys(targets)) : reverseClosure(directNodes);
  const selectedScopes = new Set(impact.globalSentinels);
  for (const node of affectedNodes) for (const scope of targets[node]?.evidence ?? []) selectedScopes.add(scope);
  if (broad) batchBroadComponentEvidence(selectedScopes);
  const batchedConsumers = batchFullPackageConsumerEvidence(selectedScopes);
  const ordered = orderedScopes(selectedScopes);
  return { mode: 'pr', changedPaths: [...paths].sort(), directNodes: [...directNodes].sort(), affectedNodes: [...affectedNodes].sort(), validationScopes: ordered, scopeReasons: scopeReasonsFor(affectedNodes, selectedScopes, broad, batchedConsumers), skippedValidationScopes: allKnownScopes().filter((scope) => !selectedScopes.has(scope)), broadened: broad };
}
export function createTierPlan(mode) {
  const tierScopes = impact.tiers?.[mode];
  if (!tierScopes) throw new Error(`Unknown validation tier: ${mode}`);
  const scopes = [...new Set([...(impact.tierBase ?? []), ...tierScopes, ...dynamicTierScopes(mode)])];
  const selected = new Set(scopes);
  const affectedNodes = Object.keys(targets).sort();
  return { mode, changedPaths: [], directNodes: [], affectedNodes, validationScopes: orderedScopes(scopes), scopeReasons: Object.fromEntries(orderedScopes(scopes).map((scope) => [scope, [`${mode} tier`]])), skippedValidationScopes: allKnownScopes().filter((scope) => !selected.has(scope)), broadened: true };
}
export function parseArg(name, argv = process.argv) { const direct = argv.find((value) => value.startsWith(`${name}=`)); if (direct) return direct.slice(name.length + 1); const index = argv.indexOf(name); return index >= 0 ? argv[index + 1] : undefined; }
export function changedPathsFromGit(base, head) { if (!base || !head) throw new Error('Both --base and --head are required when --files is not provided'); return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' }).split('\n').map((value) => value.trim()).filter(Boolean); }
export function pathsFromArgs(argv = process.argv) { const filesArg = parseArg('--files', argv); if (filesArg !== undefined) return filesArg.split(',').map((value) => value.trim()).filter(Boolean); return changedPathsFromGit(parseArg('--base', argv), parseArg('--head', argv)); }
if (fileURLToPath(import.meta.url) === process.argv[1]) { const mode = parseArg('--mode') || 'pr'; const plan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode); process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`); }

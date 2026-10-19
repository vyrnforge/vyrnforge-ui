import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const impact = JSON.parse(readFileSync(new URL('../../testing/impact.json', import.meta.url), 'utf8'));
const discovery = discoverProductUnits();

function matchesPath(filePath, pattern) {
  if (pattern.endsWith('/')) return filePath.startsWith(pattern);
  return filePath === pattern;
}

function componentScope(component, suffix) {
  return `component:${component}:${suffix}`;
}

function compileTargets() {
  const targets = structuredClone(impact.targets);
  for (const { name } of discovery.packages) if (targets[name]) targets[name].aggregate = true;
  const componentDocumentationTargets = [];

  for (const unit of discovery.ownedUnits) {
    targets[unit.node] = {
      paths: [unit.sourcePath, unit.testPath, unit.metadataPath],
      dependsOn: [unit.package, ...unit.dependencies],
      evidence: [`${unit.node}:test`]
    };
  }

  for (const component of discovery.components) {
    const portNodes = [];
    const webNode = component.ports.web ? `component:${component.component}:web` : null;
    for (const [port, config] of Object.entries(component.ports)) {
      const node = `component:${component.component}:${port}`;
      const evidence = [];
      if (config.types) evidence.push(componentScope(component.component, `${port}:types`));
      if (config.ssr) evidence.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) evidence.push(componentScope(component.component, `${port}:browser`));
      targets[node] = {
        paths: config.paths,
        dependsOn: [...new Set([port, ...config.dependencies, ...(port !== 'web' && webNode ? [webNode] : [])])],
        evidence
      };
      portNodes.push(node);
    }

    const conformanceNode = `component:${component.component}:conformance`;
    const conformanceEvidence = [];
    if (component.conformanceTypes) conformanceEvidence.push(componentScope(component.component, 'conformance:types'));
    for (const [port, config] of Object.entries(component.ports)) if (config.browser) conformanceEvidence.push(componentScope(component.component, `${port}:browser`));
    targets[conformanceNode] = {
      paths: [...(component.conformanceTypes ? [component.conformanceTypes] : []), ...component.browser.paths],
      dependsOn: portNodes,
      evidence: conformanceEvidence
    };

    const documentationNode = `component:${component.component}:documentation`;
    targets[documentationNode] = {
      paths: component.documentationPaths,
      dependsOn: [conformanceNode],
      evidence: ['lint-docs', 'docs-source', 'docs-build', 'docs-site', 'browser-docs-chromium']
    };
    componentDocumentationTargets.push(documentationNode);

    targets[`component:${component.component}:changes`] = {
      paths: [component.changesPath],
      dependsOn: [],
      evidence: ['change-fragments']
    };
  }

  targets.documentation.dependsOn = [...new Set([...targets.documentation.dependsOn, ...componentDocumentationTargets])];
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

function dynamicTierScopes(mode) {
  const scopes = discovery.ownedUnits.map((unit) => `${unit.node}:test`);
  for (const component of discovery.components) {
    if (component.conformanceTypes) scopes.push(componentScope(component.component, 'conformance:types'));
    for (const [port, config] of Object.entries(component.ports)) {
      if (config.types) scopes.push(componentScope(component.component, `${port}:types`));
      if (config.ssr) scopes.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) scopes.push(componentScope(component.component, `${port}:browser`));
    }
    if ((mode === 'scheduled' || mode === 'release') && component.ports.web?.browser) scopes.push(componentScope(component.component, 'web:browser-cross'));
  }
  return scopes;
}

export function allKnownScopes() {
  return [...new Set([...impact.scopeOrder, ...dynamicTierScopes('release')])];
}

function orderedScopes(scopes) {
  const order = new Map(allKnownScopes().map((scope, index) => [scope, index]));
  return [...scopes].sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b));
}

export function createPlan(paths) {
  const directNodes = new Set();
  let broad = false;
  for (const filePath of paths) {
    const classification = classifyPath(filePath);
    for (const node of classification.nodes) directNodes.add(node);
    broad ||= classification.broad;
  }
  const nonLegacyTargets = Object.entries(targets).filter(([, config]) => !config.legacy).map(([node]) => node);
  const affectedNodes = broad ? new Set(nonLegacyTargets) : reverseClosure(directNodes);
  if (directNodes.has('legacy')) affectedNodes.add('legacy');
  const selectedScopes = new Set(impact.globalSentinels);
  for (const node of affectedNodes) for (const scope of targets[node]?.evidence ?? []) selectedScopes.add(scope);
  return {
    mode: 'pr', changedPaths: [...paths].sort(), directNodes: [...directNodes].sort(), affectedNodes: [...affectedNodes].sort(),
    validationScopes: orderedScopes(selectedScopes), skippedValidationScopes: allKnownScopes().filter((scope) => !selectedScopes.has(scope)), broadened: broad
  };
}

export function createTierPlan(mode) {
  const tierScopes = impact.tiers?.[mode];
  if (!tierScopes) throw new Error(`Unknown validation tier: ${mode}`);
  const scopes = [...new Set([...tierScopes, ...dynamicTierScopes(mode)])];
  const selected = new Set(scopes);
  return {
    mode, changedPaths: [], directNodes: [], affectedNodes: Object.entries(targets).filter(([, config]) => !config.legacy).map(([node]) => node).sort(),
    validationScopes: orderedScopes(scopes), skippedValidationScopes: allKnownScopes().filter((scope) => !selected.has(scope)), broadened: true
  };
}

export function parseArg(name, argv = process.argv) {
  const direct = argv.find((value) => value.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

export function changedPathsFromGit(base, head) {
  if (!base || !head) throw new Error('Both --base and --head are required when --files is not provided');
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' }).split('\n').map((value) => value.trim()).filter(Boolean);
}

export function pathsFromArgs(argv = process.argv) {
  const filesArg = parseArg('--files', argv);
  if (filesArg !== undefined) return filesArg.split(',').map((value) => value.trim()).filter(Boolean);
  return changedPathsFromGit(parseArg('--base', argv), parseArg('--head', argv));
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = parseArg('--mode') || 'pr';
  const plan = mode === 'pr' ? createPlan(pathsFromArgs(process.argv)) : createTierPlan(mode);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

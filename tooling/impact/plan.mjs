import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discoverComponents } from '../testing/discover-components.mjs';

const impact = JSON.parse(readFileSync(new URL('../../testing/impact.json', import.meta.url), 'utf8'));
const registry = { components: discoverComponents().components };

function matchesPath(path, pattern) {
  if (pattern.endsWith('/')) return path.startsWith(pattern);
  return path === pattern;
}

function componentScope(component, suffix) {
  return `component:${component}:${suffix}`;
}

function compileTargets() {
  const targets = structuredClone(impact.targets);
  const componentDocumentationTargets = [];

  for (const component of registry.components) {
    const portNodes = [];
    const webNode = component.ports.web ? `component:${component.component}:web` : null;
    const sharedBrowserPaths = component.browser?.paths ?? [];

    for (const [port, config] of Object.entries(component.ports)) {
      const node = `component:${component.component}:${port}`;
      const evidence = [];
      if (component.types && port !== 'web') evidence.push(componentScope(component.component, 'types'));
      if (config.ssr) evidence.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) evidence.push(componentScope(component.component, `${port}:browser`));
      targets[node] = {
        paths: [...new Set([
          ...config.paths,
          ...(component.types && port !== 'web' ? [component.types] : []),
          ...(config.ssr ? [config.ssr] : []),
          ...(config.browser ? sharedBrowserPaths : [])
        ])],
        dependsOn: [...new Set([port, ...(port !== 'web' && webNode ? [webNode] : [])])],
        evidence
      };
      portNodes.push(node);
    }

    const documentationNode = `component:${component.component}:documentation`;
    targets[documentationNode] = {
      paths: component.documentationPaths ?? [],
      dependsOn: portNodes,
      evidence: ['lint-docs', 'docs-source', 'docs-build', 'docs-site', 'browser-docs-chromium']
    };
    componentDocumentationTargets.push(documentationNode);
  }

  targets.documentation.dependsOn = [...new Set([...targets.documentation.dependsOn, ...componentDocumentationTargets])];
  return targets;
}

const targets = compileTargets();

export function classifyPath(path) {
  const matchedNodes = [];
  const matchedConfigs = [];
  for (const [node, config] of Object.entries(targets)) {
    if ((config.paths ?? []).some((pattern) => matchesPath(path, pattern))) {
      matchedNodes.push(node);
      matchedConfigs.push(config);
    }
  }
  const explicitlyBroad = impact.broadPaths.some((pattern) => matchesPath(path, pattern));
  const hasSpecificOwner = matchedConfigs.some((config) => !config.broad);
  const broad = explicitlyBroad || matchedNodes.length === 0 || (matchedConfigs.some((config) => config.broad) && !hasSpecificOwner);
  return { nodes: matchedNodes.sort(), broad };
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
  const scopes = [];
  for (const component of registry.components) {
    if (component.types) scopes.push(componentScope(component.component, 'types'));
    for (const [port, config] of Object.entries(component.ports)) {
      if (config.ssr) scopes.push(componentScope(component.component, `${port}:ssr`));
      if (config.browser) scopes.push(componentScope(component.component, `${port}:browser`));
    }
    if ((mode === 'scheduled' || mode === 'release') && component.ports.web?.browser) {
      scopes.push(componentScope(component.component, 'web:browser-cross'));
    }
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
  for (const path of paths) {
    const classification = classifyPath(path);
    for (const node of classification.nodes) directNodes.add(node);
    broad ||= classification.broad;
  }

  const nonLegacyTargets = Object.entries(targets).filter(([, config]) => !config.legacy).map(([node]) => node);
  const affectedNodes = broad ? new Set(nonLegacyTargets) : reverseClosure(directNodes);
  if (directNodes.has('legacy')) affectedNodes.add('legacy');

  const selectedScopes = new Set(impact.globalSentinels);
  for (const node of affectedNodes) {
    for (const scope of targets[node]?.evidence ?? []) selectedScopes.add(scope);
  }

  const validationScopes = orderedScopes(selectedScopes);
  return {
    mode: 'pr',
    changedPaths: [...paths].sort(),
    directNodes: [...directNodes].sort(),
    affectedNodes: [...affectedNodes].sort(),
    validationScopes,
    skippedValidationScopes: allKnownScopes().filter((scope) => !selectedScopes.has(scope)),
    broadened: broad
  };
}

export function createTierPlan(mode) {
  const tierScopes = impact.tiers?.[mode];
  if (!tierScopes) throw new Error(`Unknown validation tier: ${mode}`);
  const scopes = [...new Set([...tierScopes, ...dynamicTierScopes(mode)])];
  const selected = new Set(scopes);
  return {
    mode,
    changedPaths: [],
    directNodes: [],
    affectedNodes: Object.entries(targets).filter(([, config]) => !config.legacy).map(([node]) => node).sort(),
    validationScopes: orderedScopes(scopes),
    skippedValidationScopes: allKnownScopes().filter((scope) => !selected.has(scope)),
    broadened: true
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

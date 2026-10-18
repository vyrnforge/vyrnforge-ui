import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const productGraph = JSON.parse(readFileSync(new URL('./product-graph.json', import.meta.url), 'utf8'));
const validationGraph = JSON.parse(readFileSync(new URL('./validation-graph.json', import.meta.url), 'utf8'));

const scopedPrefixes = [
  ['packages/core/', 'core'],
  ['packages/web/', 'web'],
  ['packages/react/', 'react'],
  ['packages/angular/', 'angular'],
  ['packages/vue/', 'vue'],
  ['packages/elements/', 'elements'],
  ['packages/legacy/', 'legacy'],
  ['documentation/', 'documentation'],
  ['examples/', 'documentation']
];

const broadPrefixes = [
  '.github/',
  'fixtures/',
  'tooling/',
  'package.json',
  'package-lock.json',
  'tsconfig.base.json',
  '.node-version',
  '.nvmrc',
  '.gitignore'
];

export function classifyPath(path) {
  for (const [prefix, node] of scopedPrefixes) {
    if (path.startsWith(prefix)) return { node, broad: false };
  }
  if (path === 'README.md' || path.startsWith('docs/')) return { node: 'documentation', broad: false };
  if (broadPrefixes.some((prefix) => path === prefix || path.startsWith(prefix))) {
    return { node: 'tooling', broad: true };
  }
  return { node: null, broad: true };
}

function reverseClosure(initialNodes) {
  const selected = new Set(initialNodes);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [node, config] of Object.entries(productGraph.nodes)) {
      if (selected.has(node)) continue;
      if (config.dependsOn.some((dependency) => selected.has(dependency))) {
        selected.add(node);
        changed = true;
      }
    }
  }
  return selected;
}

function orderedScopes(scopes) {
  const order = new Map(validationGraph.scopeOrder.map((scope, index) => [scope, index]));
  return [...scopes].sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b));
}

export function createPlan(paths) {
  const directNodes = new Set();
  let broad = false;
  for (const path of paths) {
    const classification = classifyPath(path);
    if (classification.node) directNodes.add(classification.node);
    broad ||= classification.broad;
  }

  const affectedNodes = broad
    ? new Set(Object.keys(productGraph.nodes).filter((node) => node !== 'legacy'))
    : reverseClosure(directNodes);

  if (directNodes.has('legacy')) affectedNodes.add('legacy');

  const selectedScopes = new Set(validationGraph.globalSentinels);
  for (const node of affectedNodes) {
    for (const scope of validationGraph.evidence[node] ?? []) selectedScopes.add(scope);
  }
  const validationScopes = orderedScopes(selectedScopes);
  const skippedValidationScopes = validationGraph.scopeOrder.filter((scope) => !selectedScopes.has(scope));

  return {
    changedPaths: [...paths].sort(),
    directNodes: [...directNodes].sort(),
    affectedNodes: [...affectedNodes].sort(),
    validationScopes,
    skippedValidationScopes,
    broadened: broad
  };
}

export function parseArg(name, argv = process.argv) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

export function changedPathsFromGit(base, head) {
  if (!base || !head) throw new Error('Both --base and --head are required when --files is not provided');
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function pathsFromArgs(argv = process.argv) {
  const filesArg = parseArg('--files', argv);
  if (filesArg !== undefined) return filesArg.split(',').map((value) => value.trim()).filter(Boolean);
  return changedPathsFromGit(parseArg('--base', argv), parseArg('--head', argv));
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const plan = createPlan(pathsFromArgs(process.argv));
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

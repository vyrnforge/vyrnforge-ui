import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const productGraph = JSON.parse(readFileSync(new URL('./product-graph.json', import.meta.url), 'utf8'));
const validationGraph = JSON.parse(readFileSync(new URL('./validation-graph.json', import.meta.url), 'utf8'));

const packagePathToNode = new Map([
  ['packages/core/', 'core'],
  ['packages/web/', 'web'],
  ['packages/react/', 'react'],
  ['packages/angular/', 'angular'],
  ['packages/vue/', 'vue'],
  ['packages/elements/', 'elements'],
  ['packages/legacy/', 'legacy'],
  ['documentation/', 'documentation'],
  ['examples/', 'documentation'],
  ['fixtures/', 'tooling'],
  ['tooling/', 'tooling']
]);

const broadPaths = ['.github/', 'package.json', 'tsconfig.base.json', '.node-version', '.nvmrc'];

export function classifyPath(path) {
  for (const [prefix, node] of packagePathToNode) {
    if (path.startsWith(prefix)) return { node, broad: false };
  }
  if (broadPaths.some((prefix) => path === prefix || path.startsWith(prefix))) {
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

  const validationScopes = new Set(validationGraph.globalSentinels);
  for (const node of affectedNodes) {
    for (const scope of validationGraph.evidence[node] ?? []) validationScopes.add(scope);
  }

  return {
    changedPaths: [...paths].sort(),
    directNodes: [...directNodes].sort(),
    affectedNodes: [...affectedNodes].sort(),
    validationScopes: [...validationScopes].sort(),
    broadened: broad
  };
}

function parseArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function changedPathsFromGit(base, head) {
  if (!base || !head) return [];
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' })
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const filesArg = parseArg('--files');
  const paths = filesArg
    ? filesArg.split(',').map((value) => value.trim()).filter(Boolean)
    : changedPathsFromGit(parseArg('--base'), parseArg('--head'));
  const plan = createPlan(paths);
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

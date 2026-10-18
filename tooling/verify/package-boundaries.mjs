import { readFileSync } from 'node:fs';

const graph = JSON.parse(readFileSync('tooling/architecture/package-graph.json', 'utf8')).packages;
const manifestByName = new Map();
for (const packageName of Object.keys(graph)) {
  const directory = packageName.replace('@vyrnforge/', '');
  const manifest = JSON.parse(readFileSync(`packages/${directory}/package.json`, 'utf8'));
  manifestByName.set(packageName, manifest);
}

for (const [packageName, manifest] of manifestByName) {
  const allowed = new Set(graph[packageName]);
  const declared = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
    ...(manifest.peerDependencies ?? {})
  };
  for (const dependency of Object.keys(declared).filter((name) => name.startsWith('@vyrnforge/'))) {
    if (!allowed.has(dependency)) {
      throw new Error(`${packageName} may not depend on ${dependency}`);
    }
  }
}

console.log('package boundaries: ok');

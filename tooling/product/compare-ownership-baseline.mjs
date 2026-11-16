import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const oldPrefix = 'product/components/complex-ui/';
const newPrefix = 'product/components/application-structures/';
const frameworks = ['native-web', 'react', 'angular', 'vue', 'elements'];

function normalize(value, root, baseline = false, retiredRoots = new Map()) {
  if (typeof value === 'string') {
    if (value === root) return '<checkout>';
    if (!baseline) return value;
    // v2 fabricated flat fallback paths for absent facets. No such paths are
    // tracked in the baseline; compare their new canonical diagnostic paths.
    for (const [prefix, canonical] of retiredRoots) {
      if (value.startsWith(prefix)) return canonical + value.slice(prefix.length);
    }
    return value.replaceAll(oldPrefix, newPrefix);
  }
  if (Array.isArray(value)) return value.map((entry) => normalize(entry, root, baseline, retiredRoots));
  if (value instanceof Map) return new Map([...value].map(([key, entry]) => [normalize(key, root, baseline, retiredRoots), normalize(entry, root, baseline, retiredRoots)]));
  if (value instanceof Set) return new Set([...value].map((entry) => normalize(entry, root, baseline, retiredRoots)));
  if (!value || typeof value !== 'object') return value;

  const result = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalize(entry, root, baseline, retiredRoots)]));
  // Only component/pattern ownership fields change; independent schemas,
  // consumer documentation groups and other category fields must compare exactly.
  if (baseline && ['component', 'pattern'].includes(value.kind) && Object.hasOwn(value, 'layer') && Object.hasOwn(value, 'category')) {
    result.responsibility = value.layer === 'complex-ui' ? 'application-structures' : value.layer;
    result.family = value.category;
    delete result.layer;
    delete result.category;
  }
  return result;
}

async function load(root, relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

async function snapshot(root) {
  const { discoverProductGraph, productGraphProblems } = await load(root, 'tooling/product/discover-product-graph.mjs');
  const { packageProjectionPlan } = await load(root, 'tooling/product/package-projection.mjs');
  const { compileFrameworkDocumentation } = await load(root, 'tooling/docs/framework-documentation.mjs');
  const { impactProductView } = await load(root, 'tooling/product/product-graph-view.mjs');
  const { createSemanticImpact } = await load(root, 'tooling/impact/classify.mjs');
  const graph = discoverProductGraph(root);
  assert.deepEqual(productGraphProblems(root), [], root + ': graph problems');
  const impactView = impactProductView(graph);
  return {
    graph,
    projections: Object.fromEntries(graph.packages.map(({ id }) => [id, packageProjectionPlan(root, id, graph)])),
    docs: Object.fromEntries(frameworks.map((id) => [id, compileFrameworkDocumentation(id, root)])),
    impactView,
    impact: (files) => createSemanticImpact(files, { mode: 'local', discovery: impactView }),
  };
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function tracked(root) {
  return new Map(git(root, ['ls-tree', '-r', 'HEAD']).split('\n').map((line) => {
    const [metadata, file] = line.split('\t');
    return [file, metadata];
  }));
}

const [baselineArg, candidateArg] = process.argv.slice(2);
if (!baselineArg || !candidateArg) throw new Error('Usage: compare-ownership-baseline.mjs BASELINE_CHECKOUT CANDIDATE_CHECKOUT');
const baselineRoot = path.resolve(baselineArg);
const candidateRoot = path.resolve(candidateArg);
for (const root of [baselineRoot, candidateRoot]) {
  assert.equal(git(root, ['status', '--porcelain']), '', root + ': comparison requires clean checkouts');
}

const baseline = await snapshot(baselineRoot);
const candidate = await snapshot(candidateRoot);
assert.equal(baseline.graph.schemaVersion, 2);
assert.equal(candidate.graph.schemaVersion, 3);
const beforeFiles = tracked(baselineRoot);
const afterFiles = tracked(candidateRoot);
const retiredRoots = new Map(baseline.graph.components.map((component) => {
  const prefix = `product/${component.unitId}/`;
  assert.ok(![...beforeFiles.keys()].some((file) => file.startsWith(prefix)), 'baseline contains real flat ownership: ' + prefix);
  return [prefix, component.facets.canonicalRoot.replace(oldPrefix, newPrefix)];
}));
const beforeGraph = normalize(baseline.graph, baselineRoot, true, retiredRoots);
beforeGraph.schemaVersion = 3;
assert.deepEqual(normalize(candidate.graph, candidateRoot), beforeGraph, 'Product Graph changed beyond approved ownership fields/paths');
for (const key of ['projections', 'docs', 'impactView']) {
  assert.deepEqual(normalize(candidate[key], candidateRoot), normalize(baseline[key], baselineRoot, true, retiredRoots), key + ' changed beyond approved ownership');
}

const moved = [...beforeFiles.keys()].filter((file) => file.startsWith(oldPrefix));
const approvedEdits = new Set([
  oldPrefix + 'README.md',
  oldPrefix + 'app-shell/test/browser/fixtures.mjs',
]);
assert.ok(moved.length, 'baseline has no shell subtree');
for (const file of moved) {
  const destination = file.replace(oldPrefix, newPrefix);
  assert.ok(afterFiles.has(destination), 'missing moved path: ' + destination);
  assert.ok(!afterFiles.has(file), 'retired path still tracked: ' + file);
  if (!approvedEdits.has(file)) assert.equal(afterFiles.get(destination), beforeFiles.get(file), 'moved blob changed: ' + destination);
  assert.deepEqual(normalize(candidate.impact([destination]), candidateRoot), normalize(baseline.impact([file]), baselineRoot, true, retiredRoots), 'impact changed: ' + file);
}
for (const file of afterFiles.keys()) {
  if (file.startsWith(newPrefix)) assert.ok(beforeFiles.has(file.replace(newPrefix, oldPrefix)), 'unexpected new shell file: ' + file);
}
console.log(JSON.stringify({
  baseline: git(baselineRoot, ['rev-parse', 'HEAD']),
  candidate: git(candidateRoot, ['rev-parse', 'HEAD']),
  result: 'PASS',
  units: candidate.graph.units.length,
  components: candidate.graph.components.length,
  packages: candidate.graph.packages.length,
  projections: Object.values(candidate.projections).reduce((count, entries) => count + entries.length, 0),
  catalogs: Object.fromEntries(frameworks.map((id) => [id, {
    public: candidate.docs[id].publicCatalog.length,
    showcase: candidate.docs[id].showcasePages.length,
    api: candidate.docs[id].apiPages.length,
  }])),
  movedPaths: moved.length,
  unchangedMovedBlobs: moved.length - approvedEdits.size,
  impactPlansCompared: moved.length,
}, null, 2));

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const modes = new Set(['local', 'pr', 'main', 'scheduled', 'release']);
const broadModes = new Set(['scheduled', 'release']);
const broadInfrastructure = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'nx.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  'stylelint.config.mjs',
  'playwright.config.mjs',
  'vitest.config.mjs',
  'prettier.config.mjs',
  '.node-version',
  '.nvmrc',
]);
const publicSurfaceBasenames = new Set([
  'package.json',
  'project.json',
  'tsconfig.json',
  'tsconfig.lib.json',
  'ng-package.json',
]);
const evidenceOrder = ['architecture', 'impact', 'release', 'package-artifacts', 'docs', 'browser', 'visual'];
const preferredPortOrder = ['web', 'react', 'angular', 'vue', 'elements'];
const docsProject = JSON.parse(readFileSync(fileURLToPath(new URL('../../apps/docs/project.json', import.meta.url)), 'utf8'));
const docsPackageDependencies = new Set(
  (docsProject.implicitDependencies ?? [])
    .map((dependency) => /^@vyrnforge\/([^/]+)$/.exec(dependency)?.[1])
    .filter(Boolean),
);

function pathWithin(filePath, root) {
  const normalized = root.endsWith('/') ? root : `${root}/`;
  return filePath === root.replace(/\/$/, '') || filePath.startsWith(normalized);
}

function packageFromPath(filePath) {
  return /^packages\/([^/]+)\//.exec(filePath)?.[1] ?? null;
}

function addReason(reasons, scope, because, filePath = null) {
  const key = `${scope}\u0000${because}\u0000${filePath ?? ''}`;
  if (!reasons.has(key)) reasons.set(key, { scope, because, ...(filePath ? { path: filePath } : {}) });
}

function ordered(values, preferred = []) {
  const rank = new Map(preferred.map((value, index) => [value, index]));
  return [...values].sort((a, b) => (rank.get(a) ?? preferred.length) - (rank.get(b) ?? preferred.length) || a.localeCompare(b));
}

function actualBrowserPorts(discovery) {
  const ports = new Set();
  for (const component of discovery.components) {
    for (const [port, config] of Object.entries(component.ports)) if (config.browser) ports.add(port);
  }
  return ordered(ports, preferredPortOrder);
}

function componentPorts(component) {
  return ordered(Object.entries(component.ports).filter(([, config]) => config.browser).map(([port]) => port), preferredPortOrder);
}

function componentForOwnedPath(discovery, filePath) {
  for (const component of discovery.components) {
    if (pathWithin(filePath, component.root)) return { component, port: 'shared', area: 'product' };
    for (const [port, config] of Object.entries(component.ports)) {
      if ((config.paths ?? []).some((ownedPath) => pathWithin(filePath, ownedPath))) {
        return { component, port, area: 'implementation' };
      }
    }
  }
  return null;
}

function ownedUnitForPath(discovery, filePath) {
  return discovery.ownedUnits.find((unit) => [unit.sourcePath, unit.testPath, unit.metadataPath].some((ownedPath) => pathWithin(filePath, ownedPath))) ?? null;
}

function isPackagePublicSurface(filePath) {
  const match = /^packages\/([^/]+)\/(.+)$/.exec(filePath);
  if (!match) return false;
  const relative = match[2];
  if (publicSurfaceBasenames.has(relative)) return true;
  if (/^(?:src\/)?index\.(?:ts|tsx|mts|cts)$/.test(relative)) return true;
  if (/^(?:public-api|index)\.(?:ts|tsx|mts|cts)$/.test(relative)) return true;
  return false;
}

function tokenOrThemePath(filePath) {
  return filePath === 'packages/web/src/styles.css'
    || /^packages\/web\/src\/styles\/(?:tokens|foundation)\.css$/.test(filePath)
    || filePath.startsWith('tooling/tokens/');
}

function addEvidence(state, evidence, because, filePath = null) {
  state.evidence.add(evidence);
  addReason(state.reasons, `evidence:${evidence}`, because, filePath);
}

function addPort(state, port, because, filePath = null) {
  state.browserPorts.add(port);
  addReason(state.reasons, `port:${port}`, because, filePath);
}

function addComponent(state, component, ports, because, filePath = null) {
  state.components.add(component.component);
  addReason(state.reasons, `component:${component.component}`, because, filePath);
  for (const port of ports) addPort(state, port, because, filePath);
  addEvidence(state, 'browser', because, filePath);
}

function broaden(state, discovery, because, filePath = null) {
  state.repositoryWide = true;
  for (const packageInfo of discovery.packages) state.packages.add(packageInfo.name);
  for (const component of discovery.components) state.components.add(component.component);
  for (const port of actualBrowserPorts(discovery)) state.browserPorts.add(port);
  for (const evidence of evidenceOrder) addEvidence(state, evidence, because, filePath);
  addReason(state.reasons, 'repository', because, filePath);
}

function reverseDependents(discovery, unit) {
  const affected = [];
  for (const component of discovery.components) {
    for (const [port, config] of Object.entries(component.ports)) {
      if ((config.dependencies ?? []).includes(unit.node)) affected.push({ component, port });
    }
  }
  return affected;
}

export function createSemanticImpact(paths, options = {}) {
  const mode = options.mode ?? 'pr';
  if (!modes.has(mode)) throw new Error(`Unsupported impact mode: ${mode}`);
  const discovery = options.discovery ?? discoverProductUnits();
  const state = {
    components: new Set(),
    packages: new Set(),
    ownedUnits: new Set(),
    browserPorts: new Set(),
    evidence: new Set(['architecture']),
    reasons: new Map(),
    unknownPaths: new Set(),
    repositoryWide: false,
  };
  addReason(state.reasons, 'evidence:architecture', 'repository invariants are always part of validation');

  if (broadModes.has(mode)) {
    broaden(state, discovery, `${mode} is an explicit broad safety-net tier`);
    return finishImpact(paths, mode, discovery, state);
  }

  for (const filePath of paths) {
    let classified = false;

    if (broadInfrastructure.has(filePath) || filePath.startsWith('.github/workflows/')) {
      broaden(state, discovery, 'shared workspace or CI infrastructure can affect every validation surface', filePath);
      classified = true;
    }

    if (filePath.startsWith('tooling/impact/')) {
      broaden(state, discovery, 'semantic-impact infrastructure changes require self-validation and conservative broad evidence', filePath);
      addEvidence(state, 'impact', 'semantic-impact infrastructure changed', filePath);
      classified = true;
    } else if (filePath.startsWith('tooling/testing/')) {
      for (const port of actualBrowserPorts(discovery)) addPort(state, port, 'shared browser/test infrastructure changed', filePath);
      addEvidence(state, 'browser', 'shared browser/test infrastructure changed', filePath);
      classified = true;
    } else if (filePath.startsWith('tooling/release/') || filePath.startsWith('.changeset/')) {
      addEvidence(state, 'release', 'release intent or release tooling changed', filePath);
      if (filePath.startsWith('tooling/release/')) addEvidence(state, 'package-artifacts', 'release tooling must remain compatible with packed package evidence', filePath);
      classified = true;
    } else if (filePath.startsWith('tooling/verify/')) {
      addEvidence(state, 'architecture', 'repository verifier changed', filePath);
      if (/\/(?:api-reports|package-artifacts|package-contracts|package-boundaries)\.mjs$/.test(filePath)) {
        addEvidence(state, 'package-artifacts', 'package/public-contract verifier changed', filePath);
      }
      classified = true;
    } else if (filePath.startsWith('tooling/build/') || filePath.startsWith('tooling/ci/')) {
      broaden(state, discovery, 'shared build/CI infrastructure can affect repository execution', filePath);
      classified = true;
    }

    if (tokenOrThemePath(filePath)) {
      state.packages.add('web');
      for (const component of discovery.components.filter((candidate) => candidate.ports.web)) {
        addComponent(state, component, componentPorts(component), 'shared token/theme styling can affect every Web-backed component', filePath);
      }
      addEvidence(state, 'visual', 'shared token/theme styling changed', filePath);
      classified = true;
    }

    const owned = componentForOwnedPath(discovery, filePath);
    if (owned) {
      const { component, port, area } = owned;
      if (area === 'product') {
        const relative = filePath.slice(component.root.length);
        if (relative.startsWith('changes/')) {
          addEvidence(state, 'architecture', 'historical owner-local change provenance changed', filePath);
        } else if (relative.startsWith('docs/') || relative.startsWith('examples/')) {
          state.components.add(component.component);
          addReason(state.reasons, `component:${component.component}`, 'component documentation/example changed', filePath);
          addEvidence(state, 'docs', 'component documentation/example changed', filePath);
        } else {
          addComponent(state, component, componentPorts(component), 'shared component contract/conformance evidence changed', filePath);
          if (relative.includes('__screenshots__') || filePath.endsWith('.css')) addEvidence(state, 'visual', 'component visual contract evidence changed', filePath);
        }
      } else {
        state.packages.add(port);
        if (port === 'web') {
          addComponent(state, component, componentPorts(component), 'shared Web component implementation/styling changed', filePath);
          if (filePath.endsWith('.css')) addEvidence(state, 'visual', 'component CSS changed', filePath);
        } else {
          addComponent(state, component, [port], `${port}-local component implementation/evidence changed`, filePath);
        }
      }
      classified = true;
    }

    const unit = ownedUnitForPath(discovery, filePath);
    if (unit) {
      state.ownedUnits.add(unit.node);
      state.packages.add(unit.package);
      addReason(state.reasons, `unit:${unit.node}`, 'reusable owned unit changed', filePath);
      for (const dependent of reverseDependents(discovery, unit)) {
        const ports = dependent.port === 'web' ? componentPorts(dependent.component) : [dependent.port];
        addComponent(state, dependent.component, ports, `${unit.node} is a discovered dependency of this component/port`, filePath);
      }
      classified = true;
    }

    const packageName = packageFromPath(filePath);
    if (packageName && docsPackageDependencies.has(packageName)) {
      addEvidence(state, 'docs', `${packageName} is a declared dependency of the Reference docs application`, filePath);
      classified = true;
    }

    if (packageName && isPackagePublicSurface(filePath)) {
      state.packages.add(packageName);
      addReason(state.reasons, `package:${packageName}`, 'package manifest/public entrypoint/build contract changed', filePath);
      addEvidence(state, 'package-artifacts', 'package manifest/public entrypoint/build contract changed', filePath);
      classified = true;
    }

    if (packageName && !classified) {
      state.packages.add(packageName);
      if (/^packages\/(?:core|web)\/src\//.test(filePath)) {
        for (const component of discovery.components) addComponent(state, component, componentPorts(component), `${packageName} shared implementation changed outside a narrower discovered owner`, filePath);
      } else if (/^packages\/(?:react|angular|vue|elements)\/src\//.test(filePath)) {
        const port = packageName;
        for (const component of discovery.components.filter((candidate) => candidate.ports[port])) {
          addComponent(state, component, [port], `${port} shared implementation changed outside a narrower component owner`, filePath);
        }
      } else {
        addEvidence(state, 'architecture', 'package-owned non-runtime evidence changed', filePath);
      }
      classified = true;
    }

    if (filePath.startsWith('documentation/') || filePath.startsWith('apps/docs/')) {
      addEvidence(state, 'docs', 'documentation source or application changed', filePath);
      classified = true;
    }

    if (/^(?:README|CONTRIBUTING|CHANGELOG|SECURITY|AGENTS)\.md$/.test(filePath) || filePath === 'LICENSE') {
      addEvidence(state, 'architecture', 'repository documentation/policy changed', filePath);
      classified = true;
    }

    if (!classified) {
      state.unknownPaths.add(filePath);
      broaden(state, discovery, 'unclassified path fails closed to broad validation', filePath);
    }
  }

  return finishImpact(paths, mode, discovery, state);
}

function finishImpact(paths, mode, discovery, state) {
  const semanticEvidence = ordered(state.evidence, evidenceOrder);
  const browserPorts = ordered(state.browserPorts, preferredPortOrder);
  return {
    mode,
    changedPaths: [...new Set(paths)].sort(),
    components: [...state.components].sort(),
    packages: [...state.packages].sort(),
    ownedUnits: [...state.ownedUnits].sort(),
    browserPorts,
    unknownPaths: [...state.unknownPaths].sort(),
    repositoryWide: state.repositoryWide,
    semanticEvidence,
    selectors: {
      packageArtifactsRequired: state.evidence.has('package-artifacts'),
      browserRequired: state.evidence.has('browser') || state.evidence.has('visual'),
      docsRequired: state.evidence.has('docs'),
      releaseRequired: state.evidence.has('release'),
    },
    reasons: [...state.reasons.values()].sort((a, b) => a.scope.localeCompare(b.scope) || (a.path ?? '').localeCompare(b.path ?? '') || a.because.localeCompare(b.because)),
    orchestration: 'nx',
    availableBrowserPorts: actualBrowserPorts(discovery),
  };
}

export function changedPathsFromGit(base, head) {
  if (!base || !head) throw new Error('Both --base and --head are required');
  return execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' })
    .split('\n').map((value) => value.trim()).filter(Boolean);
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function resolvableRef(ref) {
  try { git(['rev-parse', '--verify', ref]); return true; } catch { return false; }
}

export function changedPathsFromLocal(baseRef = process.env.NX_BASE) {
  const base = baseRef || (resolvableRef('origin/main') ? 'origin/main' : resolvableRef('main') ? 'main' : null);
  if (!base) throw new Error('Local impact planning requires a reachable main/origin/main base or NX_BASE');
  const mergeBase = git(['merge-base', base, 'HEAD']);
  const commands = [
    ['diff', '--name-only', `${mergeBase}...HEAD`],
    ['diff', '--name-only'],
    ['diff', '--name-only', '--cached'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const paths = new Set();
  for (const args of commands) for (const value of git(args).split('\n').map((entry) => entry.trim()).filter(Boolean)) paths.add(value);
  return [...paths].sort();
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function emitGithubOutputs(plan, outputPath) {
  const lines = [
    `package_artifacts_required=${plan.selectors.packageArtifactsRequired}`,
    `browser_required=${plan.selectors.browserRequired}`,
    `browser_ports=${JSON.stringify(plan.browserPorts)}`,
    `docs_required=${plan.selectors.docsRequired}`,
    `release_required=${plan.selectors.releaseRequired}`,
    `repository_wide=${plan.repositoryWide}`,
  ];
  appendFileSync(outputPath, `${lines.join('\n')}\n`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = arg('--mode') ?? 'local';
  if (!modes.has(mode)) throw new Error(`Unsupported --mode ${mode}`);
  const filesArg = arg('--files');
  let paths;
  if (filesArg !== undefined) paths = filesArg.split(',').map((value) => value.trim()).filter(Boolean);
  else if (broadModes.has(mode) && !arg('--base') && !arg('--head')) paths = [];
  else if (mode === 'local' && !arg('--base') && !arg('--head')) paths = changedPathsFromLocal(arg('--local-base'));
  else paths = changedPathsFromGit(arg('--base'), arg('--head'));

  const plan = createSemanticImpact(paths, { mode });
  const serialized = `${JSON.stringify(plan, null, 2)}\n`;
  const output = arg('--output');
  if (output) writeFileSync(output, serialized);
  else process.stdout.write(serialized);
  const githubOutput = arg('--github-output') || (hasArg('--emit-github-outputs') ? process.env.GITHUB_OUTPUT : undefined);
  if (githubOutput) emitGithubOutputs(plan, githubOutput);
}
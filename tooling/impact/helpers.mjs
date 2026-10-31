import { packageDefinition } from '../package-model.mjs';
import {
  evidenceOrder,
  logicalScopeOrder,
  preferredPortOrder,
  publicSurfaceBasenames,
} from './policy.mjs';

export function pathWithin(filePath, root) {
  const normalized = root.endsWith('/') ? root : `${root}/`;
  return filePath === root.replace(/\/$/, '') || filePath.startsWith(normalized);
}

export function packageFromPath(filePath) {
  return /^packages\/([^/]+)\//.exec(filePath)?.[1] ?? null;
}

export function addReason(reasons, scope, because, filePath = null) {
  const key = `${scope}\u0000${because}\u0000${filePath ?? ''}`;
  if (!reasons.has(key)) reasons.set(key, { scope, because, ...(filePath ? { path: filePath } : {}) });
}

export function ordered(values, preferred = []) {
  const rank = new Map(preferred.map((value, index) => [value, index]));
  return [...values].sort(
    (a, b) => (rank.get(a) ?? preferred.length) - (rank.get(b) ?? preferred.length) || a.localeCompare(b),
  );
}

export function actualBrowserPorts(discovery) {
  const ports = new Set();
  for (const component of discovery.components) {
    for (const [port, config] of Object.entries(component.ports)) if (config.browser) ports.add(port);
  }
  return ordered(ports, preferredPortOrder);
}

export function componentPorts(component) {
  return ordered(
    Object.entries(component.ports).filter(([, config]) => config.browser).map(([port]) => port),
    preferredPortOrder,
  );
}

export function componentForOwnedPath(discovery, filePath) {
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

export function ownedUnitForPath(discovery, filePath) {
  return discovery.ownedUnits.find(
    (unit) => [unit.sourcePath, unit.testPath, unit.metadataPath]
      .some((ownedPath) => pathWithin(filePath, ownedPath)),
  ) ?? null;
}

export function isPackagePublicSurface(filePath) {
  const match = /^packages\/([^/]+)\/(.+)$/.exec(filePath);
  if (!match) return false;
  const relative = match[2];
  if (publicSurfaceBasenames.has(relative)) return true;
  if (/^(?:src\/)?index\.(?:ts|tsx|mts|cts)$/.test(relative)) return true;
  if (/^(?:public-api|index)\.(?:ts|tsx|mts|cts)$/.test(relative)) return true;
  return false;
}

export function tokenOrThemePath(filePath) {
  return filePath === 'packages/web/src/styles.css'
    || /^packages\/web\/src\/styles\/(?:tokens|foundation)\.css$/.test(filePath)
    || filePath.startsWith('tooling/tokens/');
}

export function isRetentionTooling(filePath) {
  if (!filePath.startsWith('tooling/ci/')) return false;
  const name = filePath.slice('tooling/ci/'.length);
  return /^(?:README(?:\.branch-retention)?\.md|(?:branch-)?retention(?:-cleanup|-policy)?\.(?:mjs|json)|retention-policy\.json)$/.test(name);
}

export function addEvidence(state, evidence, because, filePath = null) {
  state.evidence.add(evidence);
  addReason(state.reasons, `evidence:${evidence}`, because, filePath);
}

export function addPort(state, port, because, filePath = null) {
  state.browserPorts.add(port);
  addReason(state.reasons, `port:${port}`, because, filePath);
}

export function addBrowserScope(state, port, component, because, filePath = null) {
  if (!state.browserScopes.has(port)) state.browserScopes.set(port, new Set());
  state.browserScopes.get(port).add(component);
  addPort(state, port, because, filePath);
}

export function addComponent(state, component, ports, because, filePath = null) {
  state.components.add(component.component);
  addReason(state.reasons, `component:${component.component}`, because, filePath);
  for (const port of ports) addBrowserScope(state, port, component.component, because, filePath);
  addEvidence(state, 'browser', because, filePath);
}

export function addPackageArtifactEvidence(state, packageNames, because, filePath = null) {
  for (const packageName of packageNames) state.packageArtifactPackages.add(packageName);
  addEvidence(state, 'package-artifacts', because, filePath);
}

export function broaden(state, discovery, because, filePath = null) {
  state.repositoryWide = true;
  for (const packageInfo of discovery.packages) {
    state.packages.add(packageInfo.name);
    state.packageArtifactPackages.add(packageInfo.name);
  }
  for (const component of discovery.components) {
    state.components.add(component.component);
    for (const port of componentPorts(component)) {
      addBrowserScope(state, port, component.component, because, filePath);
    }
  }
  for (const evidence of evidenceOrder) addEvidence(state, evidence, because, filePath);
  addReason(state.reasons, 'repository', because, filePath);
}

export function reverseDependents(discovery, unit) {
  const affected = [];
  for (const component of discovery.components) {
    for (const [port, config] of Object.entries(component.ports)) {
      if ((config.dependencies ?? []).includes(unit.node)) affected.push({ component, port });
    }
  }
  return affected;
}

export function logicalValidationScopes(state, discovery, browserScopes, packageArtifactPackages) {
  const selected = new Map();
  const choose = (scope, because, owner = null) => {
    const key = `${scope}\u0000${owner ?? ''}`;
    if (!selected.has(key)) selected.set(key, { scope, selected: true, ...(owner ? { owner } : {}), because });
  };

  choose('architecture', 'repository invariants are always validated');
  for (const unitNode of state.ownedUnits) {
    const unit = discovery.ownedUnits.find((candidate) => candidate.node === unitNode);
    if (unit?.package === 'core') choose('pure-core', `${unit.node} is renderer-neutral Core-owned evidence`, unit.node);
  }
  for (const packageName of state.packages) {
    const definition = packageDefinition(packageName);
    if (definition?.role === 'framework-port') {
      choose('port-integration', `${packageName} framework-port surface is affected`, packageName);
      choose('type-level', `${packageName} public/package-local typing is part of generic affected validation`, packageName);
      if (definition.ssr) choose('csr-ssr-hydration', `${packageName} declares SSR support`, packageName);
    }
  }
  for (const component of state.components) {
    choose('component-contract', `${component} is in the affected product closure`, component);
  }

  const componentPortCounts = new Map();
  for (const scope of browserScopes) {
    choose('browser-behavior', `${scope.port}/${scope.components.join(',')} requires real-browser evidence`, scope.port);
    for (const component of scope.components) {
      componentPortCounts.set(component, (componentPortCounts.get(component) ?? 0) + 1);
    }
  }
  for (const [component, count] of componentPortCounts) {
    if (count > 1) choose('cross-port-conformance', `${component} spans ${count} selected browser ports`, component);
  }

  if (state.evidence.has('visual')) choose('visual-regression', 'visual/styling contract can be affected');
  if (state.evidence.has('package-artifacts')) {
    for (const packageName of packageArtifactPackages) {
      choose('package-public-entrypoint', `${packageName} packed/public surface requires verification`, packageName);
      choose('consumer-validation', `${packageName} requires installed packed-consumer evidence`, packageName);
    }
  }
  if (state.evidence.has('docs')) choose('docs-validation', 'deployable/reference documentation can be affected');
  if (state.evidence.has('release')) choose('release-intent', 'release metadata or release tooling can be affected');
  if (state.evidence.has('impact')) choose('impact-engine', 'semantic impact infrastructure changed');

  const byScope = new Map();
  for (const item of selected.values()) {
    if (!byScope.has(item.scope)) byScope.set(item.scope, []);
    byScope.get(item.scope).push(item);
  }
  return logicalScopeOrder.flatMap((scope) => {
    const items = byScope.get(scope);
    if (items?.length) return items.sort((a, b) => (a.owner ?? '').localeCompare(b.owner ?? ''));
    return [{ scope, selected: false, because: 'not selected by the affected product/evidence closure' }];
  });
}

export function executionPrerequisites(state, browserScopes, packageArtifactPackages) {
  const prerequisites = new Set(['dependencies']);
  for (const scope of browserScopes) {
    prerequisites.add('browser-runtime');
    prerequisites.add(`build:${scope.port}`);
    for (const component of scope.components) prerequisites.add(`fixture:${scope.port}:${component}`);
  }
  for (const packageName of packageArtifactPackages) prerequisites.add(`build:${packageName}`);
  if (state.evidence.has('docs')) prerequisites.add('docs-build-inputs');
  return [...prerequisites].sort();
}

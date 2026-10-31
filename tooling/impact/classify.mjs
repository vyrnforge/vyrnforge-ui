import { packageDefinition } from '../package-model.mjs';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';
import {
  broadInfrastructure,
  broadModes,
  broadWorkflowPaths,
  docsPackageDependencies,
  evidenceOrder,
  modes,
  narrowWorkflowEvidence,
  preferredPortOrder,
} from './policy.mjs';
import {
  actualBrowserPorts,
  addBrowserScope,
  addComponent,
  addEvidence,
  addPackageArtifactEvidence,
  addReason,
  broaden,
  componentForOwnedPath,
  componentPorts,
  executionPrerequisites,
  isPackagePublicSurface,
  isRetentionTooling,
  logicalValidationScopes,
  ordered,
  ownedUnitForPath,
  packageFromPath,
  reverseDependents,
  tokenOrThemePath,
} from './helpers.mjs';

export function createSemanticImpact(paths, options = {}) {
  const mode = options.mode ?? 'pr';
  if (!modes.has(mode)) throw new Error(`Unsupported impact mode: ${mode}`);
  const discovery = options.discovery ?? discoverProductUnits();
  const state = {
    components: new Set(),
    packages: new Set(),
    ownedUnits: new Set(),
    browserPorts: new Set(),
    browserScopes: new Map(),
    packageArtifactPackages: new Set(),
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

  for (const filePath of paths) classifyPath(state, discovery, filePath);
  return finishImpact(paths, mode, discovery, state);
}

function classifyPath(state, discovery, filePath) {
  let classified = false;

  if (broadInfrastructure.has(filePath) || broadWorkflowPaths.has(filePath)) {
    broaden(state, discovery, 'shared workspace or validation orchestration can affect every validation surface', filePath);
    classified = true;
  } else if (narrowWorkflowEvidence.has(filePath)) {
    addEvidence(state, 'architecture', 'known workflow has explicit narrow ownership', filePath);
    for (const evidence of narrowWorkflowEvidence.get(filePath)) {
      addEvidence(state, evidence, 'known workflow has explicit narrow ownership', filePath);
    }
    classified = true;
  } else if (filePath.startsWith('.github/workflows/')) {
    state.unknownPaths.add(filePath);
    broaden(state, discovery, 'unclassified workflow fails closed to broad validation', filePath);
    classified = true;
  }

  if (filePath.startsWith('tooling/impact/')) {
    broaden(state, discovery, 'semantic-impact infrastructure changes require self-validation and conservative broad evidence', filePath);
    addEvidence(state, 'impact', 'semantic-impact infrastructure changed', filePath);
    classified = true;
  } else if (filePath.startsWith('tooling/testing/')) {
    for (const component of discovery.components) {
      for (const port of componentPorts(component)) {
        addBrowserScope(state, port, component.component, 'shared browser/test infrastructure changed', filePath);
      }
    }
    addEvidence(state, 'browser', 'shared browser/test infrastructure changed', filePath);
    classified = true;
  } else if (filePath.startsWith('tooling/release/') || filePath.startsWith('.changeset/')) {
    addEvidence(state, 'release', 'release intent or release tooling changed', filePath);
    if (filePath.startsWith('tooling/release/')) {
      addPackageArtifactEvidence(
        state,
        discovery.packages.map((item) => item.name),
        'release tooling must remain compatible with packed package evidence',
        filePath,
      );
    }
    classified = true;
  } else if (filePath.startsWith('tooling/verify/')) {
    addEvidence(state, 'architecture', 'repository verifier changed', filePath);
    if (/\/(?:api-reports|package-artifacts|package-contracts|package-boundaries)\.mjs$/.test(filePath)) {
      addPackageArtifactEvidence(
        state,
        discovery.packages.map((item) => item.name),
        'package/public-contract verifier changed',
        filePath,
      );
    }
    classified = true;
  } else if (filePath.startsWith('tooling/validation/')) {
    addEvidence(state, 'architecture', 'validation reporting infrastructure changed', filePath);
    classified = true;
  } else if (filePath.startsWith('tooling/build/')) {
    broaden(state, discovery, 'shared build infrastructure can affect repository execution', filePath);
    classified = true;
  } else if (isRetentionTooling(filePath)) {
    addEvidence(state, 'architecture', 'repository retention tooling has narrow maintenance ownership', filePath);
    classified = true;
  } else if (filePath.startsWith('tooling/ci/')) {
    broaden(state, discovery, 'unclassified CI infrastructure fails closed to broad repository execution', filePath);
    classified = true;
  }

  if (tokenOrThemePath(filePath)) {
    state.packages.add('web');
    for (const component of discovery.components.filter((candidate) => candidate.ports.web)) {
      addComponent(
        state,
        component,
        componentPorts(component),
        'shared token/theme styling can affect every Web-backed component',
        filePath,
      );
    }
    addEvidence(state, 'visual', 'shared token/theme styling changed', filePath);
    classified = true;
  }

  const owned = componentForOwnedPath(discovery, filePath);
  if (owned) {
    classifyOwnedComponent(state, filePath, owned);
    classified = true;
  }

  const unit = ownedUnitForPath(discovery, filePath);
  if (unit) {
    state.ownedUnits.add(unit.node);
    state.packages.add(unit.package);
    addReason(state.reasons, `unit:${unit.node}`, 'reusable owned unit changed', filePath);
    for (const dependent of reverseDependents(discovery, unit)) {
      const ports = dependent.port === 'web' ? componentPorts(dependent.component) : [dependent.port];
      addComponent(
        state,
        dependent.component,
        ports,
        `${unit.node} is a discovered dependency of this component/port`,
        filePath,
      );
    }
    classified = true;
  }

  const packageName = packageFromPath(filePath);
  if (packageName && docsPackageDependencies.has(packageName)) {
    addEvidence(state, 'docs', `${packageName} is a declared dependency of the Reference docs application`, filePath);
  }
  if (packageName && isPackagePublicSurface(filePath)) {
    state.packages.add(packageName);
    addReason(state.reasons, `package:${packageName}`, 'package manifest/public entrypoint/build contract changed', filePath);
    addPackageArtifactEvidence(
      state,
      [packageName],
      'package manifest/public entrypoint/build contract changed',
      filePath,
    );
    classified = true;
  }
  if (packageName && !classified) {
    classifyPackageFallback(state, discovery, packageName, filePath);
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

function classifyOwnedComponent(state, filePath, owned) {
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
      addComponent(
        state,
        component,
        componentPorts(component),
        'shared component contract/conformance evidence changed',
        filePath,
      );
      if (relative.includes('__screenshots__') || filePath.endsWith('.css')) {
        addEvidence(state, 'visual', 'component visual contract evidence changed', filePath);
      }
    }
    return;
  }

  state.packages.add(port);
  if (port === 'web') {
    addComponent(
      state,
      component,
      componentPorts(component),
      'shared Web component implementation/styling changed',
      filePath,
    );
    if (filePath.endsWith('.css')) addEvidence(state, 'visual', 'component CSS changed', filePath);
  } else {
    addComponent(state, component, [port], `${port}-local component implementation/evidence changed`, filePath);
  }
}

function classifyPackageFallback(state, discovery, packageName, filePath) {
  state.packages.add(packageName);
  const definition = packageDefinition(packageName);
  if (definition?.changeFanout === 'all-components' && filePath.startsWith(`packages/${packageName}/src/`)) {
    for (const component of discovery.components) {
      addComponent(
        state,
        component,
        componentPorts(component),
        `${packageName} shared implementation changed outside a narrower discovered owner`,
        filePath,
      );
    }
  } else if (definition?.changeFanout === 'port-components' && filePath.startsWith(`packages/${packageName}/src/`)) {
    for (const component of discovery.components.filter((candidate) => candidate.ports[packageName])) {
      addComponent(
        state,
        component,
        [packageName],
        `${packageName} shared implementation changed outside a narrower component owner`,
        filePath,
      );
    }
  } else {
    addEvidence(state, 'architecture', 'package-owned non-runtime evidence changed', filePath);
  }
}

function finishImpact(paths, mode, discovery, state) {
  const semanticEvidence = ordered(state.evidence, evidenceOrder);
  const browserPorts = ordered(state.browserPorts, preferredPortOrder);
  const browserScopes = browserPorts.map((port) => ({
    port,
    components: [...(state.browserScopes.get(port) ?? [])].sort(),
  }));
  const packageArtifactPackages = state.evidence.has('package-artifacts')
    ? [...(state.packageArtifactPackages.size
      ? state.packageArtifactPackages
      : discovery.packages.map((item) => item.name))].sort()
    : [];

  return {
    mode,
    changedPaths: [...new Set(paths)].sort(),
    components: [...state.components].sort(),
    packages: [...state.packages].sort(),
    ownedUnits: [...state.ownedUnits].sort(),
    browserPorts,
    browserScopes,
    packageArtifactPackages,
    unknownPaths: [...state.unknownPaths].sort(),
    repositoryWide: state.repositoryWide,
    semanticEvidence,
    validationScopes: logicalValidationScopes(state, discovery, browserScopes, packageArtifactPackages),
    executionPrerequisites: executionPrerequisites(state, browserScopes, packageArtifactPackages),
    selectors: {
      packageArtifactsRequired: state.evidence.has('package-artifacts'),
      browserRequired: state.evidence.has('browser') || state.evidence.has('visual'),
      docsRequired: state.evidence.has('docs'),
      releaseRequired: state.evidence.has('release'),
    },
    reasons: [...state.reasons.values()].sort(
      (a, b) => a.scope.localeCompare(b.scope)
        || (a.path ?? '').localeCompare(b.path ?? '')
        || a.because.localeCompare(b.because),
    ),
    orchestration: 'nx',
    availableBrowserPorts: actualBrowserPorts(discovery),
  };
}

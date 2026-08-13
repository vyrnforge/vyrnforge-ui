import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseGroup, readReleaseGroups } from "./release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const outputPath = "docs/metadata/non-grid-beta-scope.json";

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function countBy(values, keyOf) {
  return Object.fromEntries(
    [
      ...values
        .reduce((counts, value) => {
          const key = keyOf(value);
          counts.set(key, (counts.get(key) ?? 0) + 1);
          return counts;
        }, new Map())
        .entries(),
    ].sort(([left], [right]) => left.localeCompare(right)),
  );
}

function betaComponent(component) {
  return {
    id: component.id,
    displayName: component.displayName,
    package: component.package,
    category: component.category,
    maturity: component.maturity,
    decision: "included",
    decisionRationale:
      "Public non-grid React export with a current native-renderer mapping and GMF4-verified Angular/Vue consumption.",
    react: {
      package: component.frameworkParity.react.package,
      export: component.frameworkParity.react.export,
      status: component.frameworkParity.react.status,
    },
    native: {
      package: component.frameworkParity.native.package,
      strategy: component.frameworkParity.native.strategy,
      target: component.frameworkParity.native.target,
      status: component.frameworkParity.native.status,
      evidence: component.frameworkParity.native.evidence,
    },
    angular: {
      status: component.frameworkParity.angular.status,
      consumes: component.frameworkParity.angular.consumes,
      evidence: component.frameworkParity.angular.evidence,
    },
    vue: {
      status: component.frameworkParity.vue.status,
      consumes: component.frameworkParity.vue.consumes,
      evidence: component.frameworkParity.vue.evidence,
    },
    documentation: {
      path: component.docsPath,
      playgroundPath: component.playgroundPath,
    },
    maturityEvidence: {
      key: component.evidence?.maturityEvidenceKey ?? null,
      status: component.evidence?.status ?? "requires-verification",
    },
    knownLimitations: component.knownLimitations ?? [],
  };
}

function excludedComponent(component, reason) {
  return {
    id: component.id,
    displayName: component.displayName,
    package: component.package,
    category: component.category,
    maturity: component.maturity,
    publicExport: component.publicExport,
    decision: component.publicExport ? "deferred" : "excluded",
    reason,
  };
}

export function buildBetaScope({ root = repositoryRoot } = {}) {
  const catalog = readJson(root, "docs/metadata/components.json");
  const packages = readJson(root, "docs/metadata/packages.json");

  const releaseGroups = readReleaseGroups({ root });
  const betaReleaseGroup = getReleaseGroup("non-grid-beta", {
    root,
    manifest: releaseGroups,
  });
  const gmf4 = readJson(root, "docs/metadata/gmf4-closure.json");
  const customElements = readJson(
    root,
    "packages/ui-elements/custom-elements.json",
  );

  const components = catalog.components ?? [];
  const publicNonGrid = components
    .filter(
      (component) =>
        component.package === "@vyrnforge/ui-components" &&
        component.publicExport === true,
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const publicGrid = components
    .filter(
      (component) =>
        component.package === "@vyrnforge/ui-data-grid" &&
        component.publicExport === true,
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const plannedNonPublic = components
    .filter(
      (component) =>
        component.package === "@vyrnforge/ui-components" &&
        component.publicExport === false &&
        component.maturity === "planned",
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const internalNonPublic = components
    .filter(
      (component) =>
        component.package === "@vyrnforge/ui-components" &&
        component.publicExport === false &&
        component.maturity === "internal",
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const nativeTags = (customElements.modules ?? [])
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement && declaration.tagName)
    .map((declaration) => declaration.tagName)
    .sort();

  return {
    schemaVersion: 1,
    sourceOfTruth: {
      canonical: true,
      task: "BT-8001",
      sprint: "S8",
      qualityGate: "GBETA",
      documentation: "docs/quality/s8-non-grid-beta-scope-audit.md",
      generatedFrom: [
        "docs/metadata/components.json",
        "docs/metadata/packages.json",
        "docs/metadata/gmf4-closure.json",
        "packages/ui-elements/custom-elements.json",
      ],
    },
    program: {
      name: "VyrnForge non-grid multi-framework beta",
      task: {
        id: "BT-8001",
        title: "Audit non-grid beta component scope",
        status: "done",
      },
      status: "scope-frozen",
      targetVersion: betaReleaseGroup.version,
      unlocks: ["BT-8002"],
      scopeOnly: true,
      releaseStatus: "not-release-ready",
    },
    releaseGroup: {
      includedPackages: gmf4.releaseGroup.includedPackages,
      excludedPackages: gmf4.releaseGroup.deferredPackages,
      packageMetadataReleaseGroups: packages.releaseGroups,
      firstClassRenderers: gmf4.supportModel.firstClassRenderers,
      verifiedConsumers: gmf4.supportModel.verifiedConsumers,
      excludedPlatforms: gmf4.releaseGroup.excludedPlatforms,
    },
    scopePolicy: {
      componentDefinition:
        "Every package-root public export classified in docs/metadata/components.json under @vyrnforge/ui-components.",
      inclusionRule:
        "Include every public non-grid React component/API that has current frameworkParity metadata for React and the native renderer.",
      maturityRule:
        "Scope inclusion does not promote component maturity. Canonical maturity remains owned by docs/metadata/components.json and its maturity evidence policy.",
      angularVueRule:
        "Angular and Vue are verified consumers of @vyrnforge/ui-elements; they are not separate component implementations or published renderer packages.",
      gridRule:
        "All @vyrnforge/ui-data-grid public exports remain on the independent React alpha track and are deferred from this beta release group.",
    },
    summary: {
      catalogEntries: components.length,
      publicNonGridComponents: publicNonGrid.length,
      includedComponents: publicNonGrid.length,
      deferredNonGridComponents: 0,
      publicGridComponentsDeferred: publicGrid.length,
      plannedNonPublicComponentsExcluded: plannedNonPublic.length,
      internalNonPublicComponentsExcluded: internalNonPublic.length,
      nativeCustomElementTags: nativeTags.length,
      categoryCounts: countBy(publicNonGrid, (component) => component.category),
      maturityCounts: countBy(publicNonGrid, (component) => component.maturity),
      nativeStrategyCounts: countBy(
        publicNonGrid,
        (component) => component.frameworkParity.native.strategy,
      ),
    },
    components: publicNonGrid.map(betaComponent),
    exclusions: {
      publicGridComponents: publicGrid.map((component) =>
        excludedComponent(
          component,
          "Deferred with @vyrnforge/ui-data-grid on the independent React alpha release track.",
        ),
      ),
      plannedNonPublicComponents: plannedNonPublic.map((component) =>
        excludedComponent(
          component,
          "Planned and not exported from the package root; no beta public-contract claim is made.",
        ),
      ),
      internalNonPublicComponents: internalNonPublic.map((component) =>
        excludedComponent(
          component,
          "Internal implementation surface and not part of the public beta contract.",
        ),
      ),
      platforms: gmf4.releaseGroup.excludedPlatforms.map((platform) => ({
        id: platform,
        decision: "excluded",
        reason: "Outside the first web multi-framework beta program.",
      })),
    },
    crossCuttingReleaseGaps: [
      {
        area: "internationalization-and-rtl",
        status: "documentation-gap",
        releaseDisposition: "BT-8012",
        note: "The current component catalog has no canonical per-component internationalization or RTL evidence field. Beta documentation must state ownership and known limitations without inventing support claims.",
      },
      {
        area: "responsive-and-reflow",
        status: "evidence-gap",
        releaseDisposition: "BT-8005,BT-8009,BT-8010",
        note: "The current scope is frozen, but final compatibility and application canaries must validate responsive and integration assumptions before publication.",
      },
      {
        area: "maturity-promotion",
        status: "not-performed",
        releaseDisposition: "component-maturity-policy",
        note: "BT-8001 records scope only. No component is promoted to beta-stable by this audit.",
      },
    ],
    downstreamReleaseTasks: [
      "BT-8002",
      "BT-8003",
      "BT-8004",
      "BT-8005",
      "BT-8006",
      "BT-8007",
      "BT-8008",
      "BT-8009",
      "BT-8010",
      "BT-8011",
      "BT-8012",
      "BT-8013",
      "BT-8014",
    ],
    scopeBlockers: [],
    acceptedLimitations: gmf4.acceptedLimitations,
  };
}

export function writeBetaScope({ root = repositoryRoot } = {}) {
  const output = path.join(root, outputPath);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(
    output,
    `${JSON.stringify(buildBetaScope({ root }), null, 2)}\n`,
  );
  return output;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = writeBetaScope();
  console.log(`Generated ${path.relative(repositoryRoot, output)}.`);
}

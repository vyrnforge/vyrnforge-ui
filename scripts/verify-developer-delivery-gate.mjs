import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  deliveryFoundationManifestPath,
  repositoryRoot,
  verifyDeveloperDeliveryFoundation,
} from "./developer-delivery-foundation.mjs";

const requiredClosedGaps = [
  "reference-portal-unification",
  "cross-framework-examples",
  "pr-reference-preview",
  "release-reference-refresh",
];

const requiredFiles = [
  "docs/metadata/reference-portal.json",
  "docs/metadata/executable-examples.json",
  "docs/generated/framework-api-reference.json",
  "docs/generated/consumer-knowledge.json",
  "scripts/generate-framework-api-reference.mjs",
  "scripts/verify-executable-example-contract.mjs",
  "apps/docs/src/ComponentReferencePage.tsx",
  "examples/basic-playground/src/components/ComponentDemoPage.tsx",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function requireMarkers(text, relativePath, markers, failures) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${relativePath}: missing ${marker}`);
    }
  }
}

export function verifyGateManifest(manifest) {
  const failures = [];

  if (
    manifest.program?.id !== "developer-delivery-foundation" ||
    manifest.program?.status !== "complete"
  ) {
    failures.push(
      "developer delivery foundation program must be recorded as complete for G17",
    );
  }

  const gaps = new Map((manifest.gaps ?? []).map((gap) => [gap.id, gap]));
  for (const gapId of requiredClosedGaps) {
    if (gaps.get(gapId)?.status !== "closed") {
      failures.push(`G17 requires ${gapId} to be closed`);
    }
  }

  const readerAuthority = gaps.get("reader-api-authority");
  if (
    !readerAuthority ||
    !["closed", "deferred"].includes(readerAuthority.status) ||
    (readerAuthority.status === "deferred" &&
      readerAuthority.gateBlocking !== false)
  ) {
    failures.push(
      "reader API authority must be closed or explicitly deferred as non-blocking after generated reference authority is established",
    );
  }

  if (
    manifest.gate?.id !== "G17" ||
    manifest.gate?.status !== "enforced" ||
    manifest.gate?.blocksComponentExpansion !== true
  ) {
    failures.push(
      "G17 must be recorded as enforced and continue blocking component expansion until external gate evidence is accepted",
    );
  }

  const requiredBeforeClose = new Set(manifest.gate?.requiredBeforeClose ?? []);
  for (const requirement of [
    "generated API reference is reader-facing and drift-checked",
    "docs and playground share one version/framework/reference contract",
    "representative examples are verified across Native HTML, React, Angular, and Vue",
    "PR reference preview artifact is available without deployment permissions",
    "current-main reference deployment consumes immutable artifacts only",
    "successful release refreshes the exact tagged reference snapshot without another source commit",
    "full delivery-foundation validation passes",
  ]) {
    if (!requiredBeforeClose.has(requirement)) {
      failures.push(`G17 requiredBeforeClose is missing: ${requirement}`);
    }
  }

  return failures.sort();
}

export function verifyDeveloperDeliveryGate({ root = repositoryRoot } = {}) {
  const failures = [...verifyDeveloperDeliveryFoundation({ root })];

  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`G17 required file is missing: ${relativePath}`);
    }
  }
  if (failures.length) return failures.sort();

  const manifest = JSON.parse(read(root, deliveryFoundationManifestPath));
  failures.push(...verifyGateManifest(manifest));

  const docsReference = read(root, "apps/docs/src/ComponentReferencePage.tsx");
  requireMarkers(
    docsReference,
    "apps/docs/src/ComponentReferencePage.tsx",
    [
      "docs/generated/framework-api-reference.json?raw",
      "Generated API reference",
      'label: "Native HTML"',
      'label: "React"',
      'label: "Angular"',
      'label: "Vue"',
      "API context slice".replace("API", "AI"),
    ],
    failures,
  );

  const playgroundReference = read(
    root,
    "examples/basic-playground/src/components/ComponentDemoPage.tsx",
  );
  requireMarkers(
    playgroundReference,
    "examples/basic-playground/src/components/ComponentDemoPage.tsx",
    [
      "executableExamples[frameworkId]",
      "Verified consumer example",
      "executableExampleSourceOfTruth",
    ],
    failures,
  );

  const referencePortal = JSON.parse(
    read(root, "docs/metadata/reference-portal.json"),
  );
  if (referencePortal.schemaVersion !== 1) {
    failures.push("reference portal schemaVersion must be 1");
  }
  const portalFrameworks = Object.keys(referencePortal.frameworks ?? {}).sort();
  const expectedFrameworks = ["angular", "native-html", "react", "vue"];
  if (JSON.stringify(portalFrameworks) !== JSON.stringify(expectedFrameworks)) {
    failures.push(
      `reference portal must expose exactly ${expectedFrameworks.join(", ")}`,
    );
  }
  if (referencePortal.versionCatalog !== "vyrnforge-versions.json") {
    failures.push("reference portal must use vyrnforge-versions.json");
  }

  const executableExamples = JSON.parse(
    read(root, "docs/metadata/executable-examples.json"),
  );
  if (executableExamples.sourceOfTruth !== "tests/consumers/manifest.json") {
    failures.push(
      "executable example contract must remain bound to tests/consumers/manifest.json",
    );
  }
  for (const framework of expectedFrameworks) {
    const example = executableExamples.frameworks?.[framework];
    if (!example) {
      failures.push(`executable example contract is missing ${framework}`);
      continue;
    }
    for (const verification of ["typecheck", "build", "runtime"]) {
      if (!example.verification?.includes(verification)) {
        failures.push(
          `${framework} executable example is missing ${verification} verification`,
        );
      }
    }
  }

  return failures.sort();
}

function isMainModule() {
  return Boolean(
    process.argv[1] &&
      path.resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isMainModule()) {
  const failures = verifyDeveloperDeliveryGate();
  if (failures.length) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("G17 developer delivery foundation repository contract passed.");
  }
}

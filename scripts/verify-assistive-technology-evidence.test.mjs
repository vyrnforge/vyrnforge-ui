import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyAssistiveTechnologyEvidence } from "./verify-assistive-technology-evidence.mjs";

const componentIds = new Set(["dialog"]);
const fixtureInventory = new Map([
  [
    "dialog-focus",
    {
      componentMetadataId: "dialog",
      route: "/fixtures/dialog/focus",
    },
  ],
]);

function pendingEvidence() {
  return {
    schemaVersion: 1,
    sourceOfTruth: { canonical: true },
    environments: {
      "windows-nvda-chrome": {
        status: "pending",
        operatingSystem: { name: "Windows", version: "pending" },
        browser: { name: "Chrome", version: "pending" },
        assistiveTechnology: { name: "NVDA", version: "pending" },
        inputModes: ["keyboard", "screen-reader"],
        rationale: "Manual session is pending.",
      },
    },
    scenarios: [
      {
        id: "AT-001",
        title: "Dialog focus",
        componentIds: ["dialog"],
        fixtureIds: ["dialog-focus"],
        contracts: ["Dialog role and focus are announced."],
        environmentIds: ["windows-nvda-chrome"],
        status: "pending",
        rationale: "Manual session is pending.",
        results: [],
      },
    ],
  };
}

function verify(evidence, options = {}) {
  return verifyAssistiveTechnologyEvidence(evidence, {
    componentIds,
    fixtureInventory,
    root: process.cwd(),
    ...options,
  });
}

test("pending manual evidence is valid for non-release verification", () => {
  assert.deepEqual(verify(pendingEvidence()), []);
});

test("release verification rejects pending environments and scenarios", () => {
  const failures = verify(pendingEvidence(), { requireComplete: true });

  assert(
    failures.some((failure) =>
      failure.includes("release verification requires a complete environment"),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes("release verification requires a complete scenario"),
    ),
  );
});

test("unknown components and fixtures are rejected", () => {
  const evidence = pendingEvidence();
  evidence.scenarios[0].componentIds = ["unknown-component"];
  evidence.scenarios[0].fixtureIds = ["unknown-fixture"];

  const failures = verify(evidence);
  assert(failures.some((failure) => failure.includes("unknown component id")));
  assert(failures.some((failure) => failure.includes("unknown fixture id")));
});

test("complete scenarios require one result for every environment", () => {
  const evidence = pendingEvidence();
  evidence.environments["windows-nvda-chrome"] = {
    status: "complete",
    operatingSystem: { name: "Windows", version: "11 24H2" },
    browser: { name: "Chrome", version: "128" },
    assistiveTechnology: { name: "NVDA", version: "2026.1" },
    inputModes: ["keyboard", "screen-reader"],
    reviewer: "Accessibility reviewer",
    testedAt: "2026-07-22",
  };
  evidence.scenarios[0].status = "complete";
  delete evidence.scenarios[0].rationale;

  assert(
    verify(evidence).some((failure) =>
      failure.includes("complete scenario is missing result"),
    ),
  );
});

test("fixture ownership must be represented by the scenario component list", () => {
  const evidence = pendingEvidence();
  evidence.scenarios[0].componentIds = ["dialog"];
  const mismatchedFixtures = new Map([
    [
      "dialog-focus",
      {
        componentMetadataId: "another-component",
        route: "/fixtures/dialog/focus",
      },
    ],
  ]);

  assert(
    verifyAssistiveTechnologyEvidence(evidence, {
      componentIds,
      fixtureInventory: mismatchedFixtures,
      root: process.cwd(),
    }).some((failure) => failure.includes("belongs to unlisted component")),
  );
});

function createCompletedEvidence(root, outcome = "passed") {
  const evidence = pendingEvidence();
  const reference =
    "docs/quality/assistive-technology-results/2026-07-22-test-review.md";
  mkdirSync(path.dirname(path.join(root, reference)), { recursive: true });
  writeFileSync(path.join(root, reference), "# Test review\n", "utf8");

  evidence.environments["windows-nvda-chrome"] = {
    status: "complete",
    operatingSystem: { name: "Windows", version: "11 24H2" },
    browser: { name: "Chrome", version: "128" },
    assistiveTechnology: { name: "NVDA", version: "2026.1" },
    inputModes: ["keyboard", "screen-reader"],
    reviewer: "Accessibility reviewer",
    testedAt: "2026-07-22",
  };
  evidence.scenarios[0] = {
    ...evidence.scenarios[0],
    status: "complete",
    results: [
      {
        environmentId: "windows-nvda-chrome",
        outcome,
        reviewer: "Accessibility reviewer",
        testedAt: "2026-07-22",
        reference,
        notes: "Observed the declared contract.",
      },
    ],
  };
  delete evidence.scenarios[0].rationale;

  return evidence;
}

test("release verification rejects completed evidence with a failed outcome", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "vyrnforge-at-"));

  try {
    const failures = verifyAssistiveTechnologyEvidence(
      createCompletedEvidence(root, "failed"),
      {
        componentIds,
        fixtureInventory,
        requireComplete: true,
        root,
      },
    );

    assert(
      failures.some((failure) =>
        failure.includes("release verification requires a passed result"),
      ),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("completed passing evidence satisfies the strict release contract", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "vyrnforge-at-"));

  try {
    assert.deepEqual(
      verifyAssistiveTechnologyEvidence(createCompletedEvidence(root), {
        componentIds,
        fixtureInventory,
        requireComplete: true,
        root,
      }),
      [],
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("result records must use a declared environment and canonical directory", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "vyrnforge-at-"));

  try {
    const evidence = createCompletedEvidence(root);
    evidence.environments["windows-nvda-firefox"] = {
      ...evidence.environments["windows-nvda-chrome"],
      browser: { name: "Firefox", version: "129" },
    };
    evidence.scenarios[0].results[0].environmentId = "windows-nvda-firefox";
    evidence.scenarios[0].results[0].reference =
      "docs/metadata/component-schema.md";

    const failures = verifyAssistiveTechnologyEvidence(evidence, {
      componentIds,
      fixtureInventory,
      root,
    });

    assert(
      failures.some((failure) =>
        failure.includes("is not declared by the scenario"),
      ),
    );
    assert(
      failures.some((failure) =>
        failure.includes("canonical assistive-technology results directory"),
      ),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

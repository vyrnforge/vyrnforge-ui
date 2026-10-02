import assert from "node:assert/strict";
import test from "node:test";

import {
  filterVersionsForFramework,
  getFrameworkReadiness,
  isDocumentationReadyStatus,
  resolveFrameworkSwitch,
} from "../docs/reference/documentationAvailability.ts";

const versions = [
  {
    id: "v3.2",
    frameworkReadiness: {
      "native-html": "preview",
      react: "stable",
      angular: "stable",
      vue: "stable",
    },
  },
  {
    id: "v4.0-rc",
    frameworkReadiness: {
      "native-html": "preview",
      react: "preview",
      angular: "internal-not-ready",
      vue: "unavailable",
    },
  },
];

test("framework version filtering excludes unavailable and internal-not-ready combinations", () => {
  assert.deepEqual(
    filterVersionsForFramework(versions, "react").map((version) => version.id),
    ["v3.2", "v4.0-rc"],
  );
  assert.deepEqual(
    filterVersionsForFramework(versions, "vue").map((version) => version.id),
    ["v3.2"],
  );
  assert.deepEqual(
    filterVersionsForFramework(versions, "angular").map(
      (version) => version.id,
    ),
    ["v3.2"],
  );
});

test("documentation readiness distinguishes published availability from docs readiness", () => {
  assert.equal(isDocumentationReadyStatus("stable"), true);
  assert.equal(isDocumentationReadyStatus("preview"), true);
  assert.equal(isDocumentationReadyStatus("maintenance"), true);
  assert.equal(isDocumentationReadyStatus("deprecated"), true);
  assert.equal(isDocumentationReadyStatus("unavailable"), false);
  assert.equal(isDocumentationReadyStatus("internal-not-ready"), false);
  assert.equal(getFrameworkReadiness(versions[1], "vue"), "unavailable");
});

test("framework switching preserves version identity instead of silently substituting", () => {
  assert.deepEqual(resolveFrameworkSwitch("v4.0-rc", "vue", versions), {
    frameworkId: "vue",
    versionId: "v4.0-rc",
    status: "unavailable",
    alternatives: ["v3.2"],
  });
});

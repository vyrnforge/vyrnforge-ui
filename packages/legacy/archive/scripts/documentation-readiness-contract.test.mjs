import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  filterVersionsForFramework,
  getFrameworkReadiness,
  isDocumentationReadyStatus,
  resolveFrameworkSwitch,
} from "../docs/reference/documentationAvailability.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function json(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

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

test("generated registry carries truthful release-line and document availability", () => {
  const registry = json("docs/generated/documentation-registry.json");
  assert.equal(registry.schemaVersion, 2);

  const nonGrid = registry.releaseLines.find(
    (releaseLine) => releaseLine.id === "non-grid-beta",
  );
  const dataGrid = registry.releaseLines.find(
    (releaseLine) => releaseLine.id === "data-grid-alpha",
  );
  assert(nonGrid);
  assert(dataGrid);
  assert.equal(nonGrid.versioningMode, "synchronized");
  assert.equal(dataGrid.versioningMode, "independent");
  assert.equal(dataGrid.readiness.react, "preview");
  assert.equal(dataGrid.readiness.vue, "unavailable");

  const gridPage = registry.pages.find((page) => page.id === "data-grid");
  assert(gridPage);
  assert.equal(gridPage.releaseLine, "data-grid-alpha");
  assert.deepEqual(
    Object.fromEntries(
      gridPage.availability.map((entry) => [entry.framework, entry.status]),
    ),
    {
      react: "preview",
      "native-html": "unavailable",
      angular: "unavailable",
      vue: "unavailable",
    },
  );

  const overview = registry.pages.find((page) => page.id === "overview");
  assert(overview);
  assert.equal(overview.releaseLine, "non-grid-beta");
  assert(
    overview.availability.every(
      (entry) =>
        entry.version === nonGrid.version && entry.status === "preview",
    ),
  );
});

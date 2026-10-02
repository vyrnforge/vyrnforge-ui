import assert from "node:assert/strict";
import test from "node:test";

import {
  validateDocumentationArchitecture,
  verifyDocumentationArchitecture,
} from "./verify-documentation-architecture.mjs";

function registryFixture() {
  const availability = [
    {
      framework: "native-html",
      releaseLine: "non-grid-beta",
      version: "0.2.0-beta.2",
      status: "preview",
    },
    {
      framework: "react",
      releaseLine: "non-grid-beta",
      version: "0.2.0-beta.2",
      status: "preview",
    },
    {
      framework: "angular",
      releaseLine: "non-grid-beta",
      version: "0.2.0-beta.2",
      status: "preview",
    },
    {
      framework: "vue",
      releaseLine: "non-grid-beta",
      version: "0.2.0-beta.2",
      status: "preview",
    },
  ];
  const page = {
    id: "overview",
    title: "Overview",
    section: "start",
    group: "Start",
    order: 0,
    type: "guide",
    template: "guide",
    renderer: "markdown",
    releaseLine: "non-grid-beta",
    sourcePath: "docs/README.md",
    route: "/overview",
    availability,
  };

  return {
    schemaVersion: 2,
    releaseLines: [
      {
        id: "non-grid-beta",
        version: "0.2.0-beta.2",
        readiness: {
          "native-html": "preview",
          react: "preview",
          angular: "preview",
          vue: "preview",
        },
      },
    ],
    pages: [page],
    examples: [],
    recordDomains: [
      { id: "components" },
      { id: "packages" },
      { id: "tokens" },
      { id: "patterns" },
      { id: "examples" },
      { id: "accessibility" },
    ],
    searchRecords: [
      {
        id: "page:overview",
        kind: "page",
        documentId: "overview",
        route: "/overview",
      },
    ],
    indexes: {
      bySection: [
        { id: "start", label: "Start", documentIds: ["overview"] },
      ],
      byType: [{ type: "guide", documentIds: ["overview"] }],
    },
    sitemap: availability.map((entry) => ({
      id: `page:${entry.framework}:${entry.version}:overview`,
      documentId: "overview",
      route: "/overview",
      framework: entry.framework,
      version: entry.version,
      status: entry.status,
    })),
    relatedContentInputs: [
      { documentId: "overview", type: "guide", section: "start", tags: [] },
    ],
  };
}

const routeSource = [
  'import documentationRegistryRaw from "../../../docs/generated/documentation-registry.json?raw";',
  "const registry = JSON.parse(documentationRegistryRaw);",
  "export const docsRoutes = registry.pages.map(routeFromRegistryPage);",
].join("\n");

const navSource = [
  "docsRoutes",
  "publicDocsSections",
  "documentationSearchRecords",
  "routeIsAvailable",
].join("\n");

test("accepts the current generated documentation architecture", () => {
  assert.deepEqual(verifyDocumentationArchitecture(), []);
});

test("rejects stale discovery and deep-link outputs", () => {
  const registry = registryFixture();
  registry.searchRecords = [];
  registry.sitemap = [];

  const failures = validateDocumentationArchitecture({
    registry,
    routeSource,
    navSource,
    fileExists: () => true,
  });

  assert(
    failures.some((failure) =>
      failure.includes("generated page search record is missing or stale"),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes("canonical page deep link is missing"),
    ),
  );
});

test("rejects framework/version availability contradictions", () => {
  const registry = registryFixture();
  registry.pages[0].availability[1].status = "unavailable";

  const failures = validateDocumentationArchitecture({
    registry,
    routeSource,
    navSource,
    fileExists: () => true,
  });

  assert(
    failures.some((failure) =>
      failure.includes("react availability contradicts release line"),
    ),
  );
});

test("rejects documentation-ready claims without source artifacts", () => {
  const registry = registryFixture();
  registry.examples.push({
    id: "overview-example",
    documentId: "overview",
    implementations: [
      {
        framework: "react",
        version: "0.2.0-beta.2",
        status: "preview",
        sourcePath: "docs/examples/missing.tsx",
      },
    ],
  });

  const failures = validateDocumentationArchitecture({
    registry,
    routeSource,
    navSource,
    fileExists: (sourcePath) => sourcePath === "docs/README.md",
  });

  assert(
    failures.some((failure) =>
      failure.includes("ready example source is missing"),
    ),
  );
});

test("rejects manual public route authority and missing capability domains", () => {
  const registry = registryFixture();
  registry.recordDomains = registry.recordDomains.filter(
    (domain) => domain.id !== "components",
  );

  const failures = validateDocumentationArchitecture({
    registry,
    routeSource: `${routeSource}\nconst docs: DocsRoute[] = [];`,
    navSource,
    fileExists: () => true,
  });

  assert(
    failures.some((failure) =>
      failure.includes("manual public route authority"),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes("missing public capability domain components"),
    ),
  );
});

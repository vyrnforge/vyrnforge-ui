import assert from "node:assert/strict";
import test from "node:test";

import {
  validateDocumentationArchitecture,
  verifyDocumentationArchitecture,
} from "./verify-documentation-architecture.mjs";

function fixture() {
  return {
    registry: {
      releaseLines: [
        {
          id: "non-grid-beta",
          version: "1.0.0",
          readiness: {
            "native-html": "stable",
            react: "stable",
            angular: "stable",
            vue: "stable",
          },
        },
      ],
      pages: [
        {
          id: "component-reference",
          releaseLine: "non-grid-beta",
          availability: ["native-html", "react", "angular", "vue"].map(
            (framework) => ({
              framework,
              releaseLine: "non-grid-beta",
              version: "1.0.0",
              status: "stable",
            }),
          ),
        },
      ],
      recordDomains: [{ id: "components" }],
      examples: [],
      searchRecords: [
        {
          id: "page:component-reference",
          kind: "page",
          documentId: "component-reference",
        },
        {
          id: "api:react:button:property:disabled",
          kind: "api-member",
          documentId: "component-reference",
          framework: "react",
          version: "1.0.0",
          status: "stable",
        },
      ],
      sitemap: [
        ...["native-html", "react", "angular", "vue"].map((framework) => ({
          id: `page:${framework}:1.0.0:component-reference`,
        })),
        { id: "api:react:button:property:disabled" },
      ],
      relatedContentInputs: [{ documentId: "component-reference" }],
    },
    componentCatalog: {
      components: [
        {
          id: "button",
          publicExport: true,
          maturity: "stable",
          frameworkParity: { betaScope: "included" },
        },
      ],
    },
    consumerKnowledge: {
      components: [{ id: "button" }],
    },
    referenceRoutesSource:
      "const registry = JSON.parse(documentationRegistryRaw); export const docsRoutes = registry.pages;",
    docsNavSource:
      "import { documentationSearchRecords } from './referenceRoutes';",
  };
}

test("documentation architecture accepts canonical generated discovery", () => {
  assert.deepEqual(validateDocumentationArchitecture(fixture()), []);
});

test("documentation architecture rejects missing public capability coverage", () => {
  const input = fixture();
  input.consumerKnowledge.components = [];

  assert.deepEqual(validateDocumentationArchitecture(input), [
    "button: public beta-scope component is missing generated documentation knowledge",
  ]);
});

test("documentation architecture rejects framework/version contradictions", () => {
  const input = fixture();
  input.registry.pages[0].availability.find(
    (entry) => entry.framework === "vue",
  ).status = "unavailable";

  assert(
    validateDocumentationArchitecture(input).some((failure) =>
      failure.includes(
        "component-reference: vue readiness unavailable contradicts release-line readiness stable",
      ),
    ),
  );
});

test("documentation architecture rejects orphaned search, sitemap, and related records", () => {
  const input = fixture();
  input.registry.searchRecords.push({
    id: "page:orphan",
    kind: "page",
    documentId: "missing",
  });
  input.registry.relatedContentInputs.push({ documentId: "missing" });
  input.registry.sitemap = input.registry.sitemap.filter(
    (entry) => entry.id !== "page:react:1.0.0:component-reference",
  );

  const failures = validateDocumentationArchitecture(input);
  assert(
    failures.includes(
      "page:orphan: search record references unknown document missing",
    ),
  );
  assert(
    failures.includes(
      "missing: related-content input references unknown document",
    ),
  );
  assert(
    failures.includes(
      "component-reference: sitemap is missing page:react:1.0.0:component-reference",
    ),
  );
});

test("documentation architecture rejects manual Docs discovery authorities", () => {
  const input = fixture();
  input.referenceRoutesSource = "const docsRoutes = [{ id: 'manual' }];";
  input.docsNavSource =
    "import api from '../../../docs/generated/framework-api-reference.json?raw'; const x = componentReferenceRecords;";

  const failures = validateDocumentationArchitecture(input);
  assert(
    failures.includes(
      "referenceRoutes.ts contains a manual public route array; use the generated Documentation Registry",
    ),
  );
  assert(
    failures.includes(
      "DocsNav.tsx reads generated API facts directly; search must come from the Documentation Registry",
    ),
  );
  assert(
    failures.includes(
      "DocsNav.tsx rebuilds component discovery outside the Documentation Registry",
    ),
  );
});

test("current repository passes documentation architecture verification", () => {
  assert.deepEqual(verifyDocumentationArchitecture(), []);
});

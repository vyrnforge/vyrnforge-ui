import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDocumentationRegistry,
  validateDocumentationPagesMetadata,
} from "./generate-documentation-registry.mjs";

test("Documentation Registry is generated from canonical page and Reference metadata", () => {
  const registry = buildDocumentationRegistry();

  assert.equal(registry.schemaVersion, 2);
  assert(registry.pages.length > 20);
  assert(registry.sections.length >= 7);
  assert(registry.recordDomains.some((domain) => domain.id === "components"));
  assert(registry.recordDomains.some((domain) => domain.id === "packages"));
  assert(registry.recordDomains.some((domain) => domain.id === "tokens"));
  assert(registry.recordDomains.some((domain) => domain.id === "patterns"));
  assert(registry.searchRecords.some((record) => record.kind === "page"));
  assert(registry.searchRecords.some((record) => record.kind === "api-member"));
  assert(registry.indexes.bySection.length === registry.sections.length);
  assert(registry.indexes.byType.length === registry.documentTypes.length);
  assert(registry.sitemap.length > registry.pages.length);
  assert.equal(
    registry.relatedContentInputs.length,
    registry.pages.length,
  );

  const ids = registry.pages.map((page) => page.id);
  assert.equal(new Set(ids).size, ids.length);
  assert(registry.pages.some((page) => page.id === "component-reference"));
  assert(registry.pages.some((page) => page.id === "releases"));
});

test("Documentation page metadata rejects duplicate page identities", () => {
  const metadata = {
    schemaVersion: 1,
    sections: [{ id: "start", label: "Start", order: 0 }],
    templates: [
      {
        id: "guide",
        label: "Guide",
        documentTypes: ["guide"],
        sections: ["summary"],
      },
    ],
    pages: [
      {
        id: "duplicate",
        title: "One",
        section: "start",
        group: "Start",
        order: 0,
        type: "guide",
        renderer: "markdown",
        sourcePath: "docs/README.md",
      },
      {
        id: "duplicate",
        title: "Two",
        section: "start",
        group: "Start",
        order: 1,
        type: "guide",
        renderer: "markdown",
        sourcePath: "docs/README.md",
      },
    ],
  };

  assert.throws(
    () => validateDocumentationPagesMetadata(metadata),
    /Duplicate documentation page id: duplicate/u,
  );
});

test("Documentation page metadata rejects unknown sections", () => {
  const metadata = {
    schemaVersion: 1,
    sections: [{ id: "start", label: "Start", order: 0 }],
    templates: [
      {
        id: "guide",
        label: "Guide",
        documentTypes: ["guide"],
        sections: ["summary"],
      },
    ],
    pages: [
      {
        id: "broken",
        title: "Broken",
        section: "missing",
        group: "Start",
        order: 0,
        type: "guide",
        renderer: "markdown",
        sourcePath: "docs/README.md",
      },
    ],
  };

  assert.throws(
    () => validateDocumentationPagesMetadata(metadata),
    /references unknown section missing/u,
  );
});


test("Documentation Registry discovery records stay framework/version scoped", () => {
  const registry = buildDocumentationRegistry();
  const reactApi = registry.searchRecords.find(
    (record) =>
      record.kind === "api-member" &&
      record.framework === "react" &&
      record.documentId === "component-reference",
  );

  assert(reactApi);
  assert(reactApi.version);
  assert(reactApi.route.startsWith("/components/"));
  assert(reactApi.member.startsWith("api-"));
  assert(
    registry.sitemap.some(
      (entry) =>
        entry.id === reactApi.id &&
        entry.framework === reactApi.framework &&
        entry.version === reactApi.version,
    ),
  );
});

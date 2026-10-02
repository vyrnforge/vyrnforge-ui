import assert from "node:assert/strict";
import test from "node:test";

import * as resolver from "../docs/reference/documentationResolver.ts";

const page = {
  id: "button",
  title: "Button",
  description: "Shared",
  sourcePath: "docs/button.md",
  renderer: "markdown",
  releaseLine: "non-grid-beta",
  availability: [
    {
      framework: "react",
      releaseLine: "non-grid-beta",
      version: "3.2.0",
      status: "stable",
    },
    {
      framework: "vue",
      releaseLine: "non-grid-beta",
      version: "3.2.0",
      status: "unavailable",
    },
  ],
  layers: {
    frameworks: {
      react: { description: "React usage" },
    },
    versions: {
      "3.2.0": { sourcePath: "docs/button-3.2.md" },
    },
    frameworkVersions: {
      "react@3.2.0": { description: "React 3.2 usage" },
    },
  },
};

test("composes documentation layers in precedence order", () => {
    const result = resolver.resolveDocumentationPage(page, {
      frameworkId: "react",
      releaseLine: "non-grid-beta",
      version: "3.2.0",
      versionId: "3.2",
    });
    assert.equal(result.kind, "resolved");
    assert.equal(result.document.title, "Button");
    assert.equal(result.document.sourcePath, "docs/button-3.2.md");
    assert.equal(result.document.description, "React 3.2 usage");
});

test("does not fall back across frameworks", () => {
    const result = resolver.resolveDocumentationPage(page, {
      frameworkId: "vue",
      releaseLine: "non-grid-beta",
      version: "3.2.0",
      versionId: "3.2",
    });
    assert.equal(result.kind, "unavailable");
  assert.equal(result.status, "unavailable");
  const frameworks = result.alternatives.map((entry) => entry.framework);
  assert.deepEqual(frameworks, ["react"]);
});

test("next resolves against the document's own current release line", () => {
  const grid = {
    ...page,
    id: "data-grid",
    releaseLine: "data-grid-alpha",
    availability: [
      {
        framework: "react",
        releaseLine: "data-grid-alpha",
        version: "0.1.0-alpha.2",
        status: "preview",
      },
    ],
  };
  const result = resolver.resolveDocumentationPage(grid, {
    frameworkId: "react",
    releaseLine: "non-grid-beta",
    version: "0.2.0-beta.2",
    versionId: "next",
  });
  assert.equal(result.kind, "resolved");
  assert.equal(result.availability.releaseLine, "data-grid-alpha");
});

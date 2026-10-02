import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveDocumentationDocument,
} from "../docs/reference/documentationResolver.ts";

const basePage = {
  id: "button",
  title: "Button",
  section: "components",
  group: "Components",
  order: 0,
  type: "component",
  renderer: "markdown",
  description: "Base description",
  sourcePath: "docs/base.md",
  tags: ["base"],
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
      status: "preview",
    },
    {
      framework: "react",
      releaseLine: "non-grid-beta",
      version: "3.1.0",
      status: "maintenance",
    },
  ],
  contentLayers: {
    shared: {
      description: "Shared description",
      tags: ["shared"],
    },
    frameworks: {
      react: {
        description: "React description",
        sourcePath: "docs/react.md",
      },
    },
    versions: {
      "3.2.0": {
        title: "Button 3.2",
        description: "Version description",
      },
    },
    frameworkVersions: {
      "react@3.2.0": {
        description: "React 3.2 description",
        sourcePath: "docs/react-3.2.md",
      },
    },
  },
};

test(
  "documentation resolver applies layers in deterministic precedence order",
  () => {
    const resolution = resolveDocumentationDocument(basePage, {
      frameworkId: "react",
      version: "3.2.0",
    });

    assert.equal(resolution.available, true);
    assert.equal(resolution.status, "stable");
    assert.equal(resolution.document.title, "Button 3.2");
    assert.equal(resolution.document.description, "React 3.2 description");
    assert.equal(resolution.document.sourcePath, "docs/react-3.2.md");
    assert.deepEqual(resolution.document.resolution.appliedLayers, [
      "base",
      "shared",
      "framework",
      "version",
      "framework-version",
    ]);
  },
);

test("documentation resolver never substitutes another framework layer", () => {
  const resolution = resolveDocumentationDocument(basePage, {
    frameworkId: "vue",
    version: "3.2.0",
  });

  assert.equal(resolution.available, true);
  assert.equal(resolution.status, "preview");
  assert.equal(resolution.document.description, "Version description");
  assert.equal(resolution.document.sourcePath, "docs/base.md");
  assert.deepEqual(resolution.document.resolution.appliedLayers, [
    "base",
    "shared",
    "version",
  ]);
});

test(
  "documentation resolver returns an explicit unavailable state for an invalid pair",
  () => {
    const resolution = resolveDocumentationDocument(basePage, {
      frameworkId: "angular",
      version: "3.2.0",
    });

    assert.equal(resolution.available, false);
    assert.equal(resolution.status, "internal-not-ready");
    assert.equal(resolution.document, null);
    assert.deepEqual(
      resolution.alternatives.map(
        (alternative) =>
          `${alternative.frameworkId}@${alternative.version}:${alternative.status}`,
      ),
      [
        "react@3.2.0:stable",
        "vue@3.2.0:preview",
        "react@3.1.0:maintenance",
      ],
    );
  },
);

test(
  "documentation resolver does not silently fall back to another version",
  () => {
    const resolution = resolveDocumentationDocument(basePage, {
      frameworkId: "react",
      version: "4.0.0",
    });

    assert.equal(resolution.available, false);
    assert.equal(resolution.status, "internal-not-ready");
    assert.equal(resolution.document, null);
    assert(
      resolution.alternatives.some(
        (alternative) =>
          alternative.frameworkId === "react" &&
          alternative.version === "3.2.0",
      ),
    );
  },
);

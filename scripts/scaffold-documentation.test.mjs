import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { scaffoldDocumentationRegistration } from "./scaffold-documentation.mjs";

function writeJson(root, relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "vyrnforge-doc-scaffold-"));
  writeJson(root, "docs/metadata/documentation-pages.json", {
    schemaVersion: 1,
    templates: [
      {
        id: "guide",
        label: "Guide",
        documentTypes: ["guide"],
        sections: ["summary", "usage", "accessibility", "related"],
      },
      {
        id: "component",
        label: "Component",
        documentTypes: ["component"],
        sections: [
          "summary",
          "usage",
          "behavior",
          "accessibility",
          "api",
          "styling",
          "related",
        ],
      },
    ],
    sections: [{ id: "components", label: "Components", order: 0 }],
    pages: [
      {
        id: "existing",
        title: "Existing",
        section: "components",
        group: "Components",
        order: 0,
        type: "guide",
        renderer: "markdown",
        description: "Existing documentation.",
        releaseLine: "non-grid-beta",
        sourcePath: "docs/existing.md",
      },
    ],
  });
  writeJson(root, "docs/metadata/release-groups.json", {
    schemaVersion: 2,
    releaseLines: {
      "non-grid-beta": {
        version: "0.2.0-beta.2",
        channel: "beta",
        documentation: {
          readiness: {
            "native-html": "preview",
            react: "preview",
            angular: "preview",
            vue: "preview",
          },
        },
      },
    },
  });
  writeFileSync(path.join(root, "docs/existing.md"), "# Existing\n", "utf8");
  return root;
}

test("documentation scaffolder registers a new capability in canonical metadata", () => {
  const root = fixture();
  try {
    const result = scaffoldDocumentationRegistration({
      root,
      id: "command-palette",
      title: "Command Palette",
      description: "Reusable command discovery and execution guidance.",
      type: "component",
      section: "components",
      releaseLine: "non-grid-beta",
      sourcePath: "docs/components/command-palette.md",
      tags: ["commands", "navigation"],
    });

    assert.equal(result.page.id, "command-palette");
    assert.equal(result.page.order, 1);
    assert.equal(result.page.renderer, "markdown");
    assert.equal(result.template, "component");

    const metadata = JSON.parse(
      readFileSync(
        path.join(root, "docs/metadata/documentation-pages.json"),
        "utf8",
      ),
    );
    const page = metadata.pages.find(
      (candidate) => candidate.id === "command-palette",
    );
    assert(page);
    assert.equal(page.sourcePath, "docs/components/command-palette.md");
    assert.deepEqual(page.tags, ["commands", "navigation"]);

    const source = readFileSync(
      path.join(root, "docs/components/command-palette.md"),
      "utf8",
    );
    assert.match(source, /^# Command Palette/mu);
    assert.match(source, /^## Accessibility/mu);
    assert.match(source, /^## Api/mu);
    assert.match(source, /^## Styling/mu);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("documentation scaffolder rejects missing canonical ownership", () => {
  const root = fixture();
  try {
    assert.throws(
      () =>
        scaffoldDocumentationRegistration({
          root,
          id: "broken",
          title: "Broken",
          description: "Invalid release line.",
          type: "component",
          section: "components",
          releaseLine: "missing",
          sourcePath: "docs/components/broken.md",
        }),
      /Unknown documentation release line: missing/u,
    );

    assert.throws(
      () =>
        scaffoldDocumentationRegistration({
          root,
          id: "outside-docs",
          title: "Outside Docs",
          description: "Invalid source ownership.",
          type: "component",
          section: "components",
          releaseLine: "non-grid-beta",
          sourcePath: "apps/docs/src/Outside.tsx",
        }),
      /repository-relative path under docs/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("documentation scaffolder requires explicit example registration facts", () => {
  const root = fixture();
  try {
    assert.throws(
      () =>
        scaffoldDocumentationRegistration({
          root,
          id: "example",
          title: "Example",
          description: "Example metadata must be explicit.",
          type: "component",
          section: "components",
          releaseLine: "non-grid-beta",
          sourcePath: "docs/components/example.md",
          renderer: "example",
        }),
      /require exampleId and exampleCategory/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

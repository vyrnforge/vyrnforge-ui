import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  scaffoldDocumentationRegistration,
  scaffoldOwnedComponentDocumentation,
} from "./scaffold-documentation.mjs";

function writeJson(root, relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(root, relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, value, "utf8");
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
  writeText(root, "docs/existing.md", "# Existing\n");
  return root;
}

function ownedFixture() {
  const root = fixture();
  writeJson(root, "docs/metadata/components.json", {
    schemaVersion: 2,
    sourceOfTruth: { canonical: true },
    components: [
      {
        id: "command-palette",
        displayName: "CommandPalette",
        purpose: "Search and execute application commands.",
        useWhen: "Use when many commands need fast keyboard discovery.",
        avoidWhen: "Avoid when a small visible action group is clearer.",
        aiUsageNotes: "Prefer the shared command behavior and visible fallback actions.",
        knownLimitations: ["Requires application-owned command definitions."],
        relatedComponents: [],
        accessibilityNotes: "Expose a labelled dialog and preserve predictable keyboard focus.",
        cssClasses: ["vf-command-palette"],
        cssVariables: ["--vf-command-palette-max-height"],
      },
    ],
  });
  writeJson(root, "packages/ui-elements/package.json", {
    name: "@vyrnforge/ui-elements",
  });
  writeText(
    root,
    "packages/ui-elements/src/components/commands.ts",
    "export class CommandPalette {}\n",
  );
  writeJson(root, "packages/ui-components/package.json", {
    name: "@vyrnforge/ui-components",
  });
  writeText(
    root,
    "packages/ui-components/src/components/CommandPalette.tsx",
    "export const CommandPalette = () => null;\n",
  );
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

test("owned component scaffolder seeds package-owned human guidance without registering another page", () => {
  const root = ownedFixture();
  try {
    const metadataBefore = readFileSync(
      path.join(root, "docs/metadata/documentation-pages.json"),
      "utf8",
    );
    const result = scaffoldOwnedComponentDocumentation({
      root,
      componentId: "command-palette",
      ownerSource: "packages/ui-elements/src/components/commands.ts",
      sourcePath:
        "packages/ui-elements/src/components/command-palette.docs.json",
    });

    assert.equal(result.componentId, "command-palette");
    assert.equal(result.ownerPackage, "@vyrnforge/ui-elements");
    assert.equal(
      result.ownerSource,
      "packages/ui-elements/src/components/commands.ts",
    );

    const document = JSON.parse(
      readFileSync(path.join(root, result.sourcePath), "utf8"),
    );
    assert.equal(document.schemaVersion, 1);
    assert.equal(document.componentId, "command-palette");
    assert.equal(document.owner.package, "@vyrnforge/ui-elements");
    assert.equal(document.purpose, "Search and execute application commands.");
    assert.equal(
      document.guidance.useWhen,
      "Use when many commands need fast keyboard discovery.",
    );
    assert.deepEqual(document.limitations, [
      "Requires application-owned command definitions.",
    ]);
    assert.deepEqual(document.theming.classes, ["vf-command-palette"]);
    assert.deepEqual(document.examples, []);
    assert.deepEqual(document.releaseNotes, []);
    assert.match(
      document.$schema,
      /docs\/metadata\/component-documentation\.schema\.json$/u,
    );

    const metadataAfter = readFileSync(
      path.join(root, "docs/metadata/documentation-pages.json"),
      "utf8",
    );
    assert.equal(metadataAfter, metadataBefore);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("owned component scaffolder enforces physical package ownership", () => {
  const root = ownedFixture();
  try {
    const sourcePath =
      "packages/ui-elements/src/components/command-palette.docs.json";
    assert.throws(
      () =>
        scaffoldOwnedComponentDocumentation({
          root,
          componentId: "command-palette",
          ownerSource:
            "packages/ui-components/src/components/CommandPalette.tsx",
          sourcePath,
        }),
      /same VyrnForge package/u,
    );
    assert.equal(existsSync(path.join(root, sourcePath)), false);

    assert.throws(
      () =>
        scaffoldOwnedComponentDocumentation({
          root,
          componentId: "command-palette",
          ownerSource: "packages/ui-elements/src/components/commands.ts",
          sourcePath: "docs/components/command-palette.docs.json",
        }),
      /packages\/\*\*\/\*\.docs\.json/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("owned component scaffolder rolls back duplicate owned component truth", () => {
  const root = ownedFixture();
  try {
    scaffoldOwnedComponentDocumentation({
      root,
      componentId: "command-palette",
      ownerSource: "packages/ui-elements/src/components/commands.ts",
      sourcePath:
        "packages/ui-elements/src/components/command-palette.docs.json",
    });

    const duplicatePath =
      "packages/ui-elements/src/components/command-palette-copy.docs.json";
    assert.throws(
      () =>
        scaffoldOwnedComponentDocumentation({
          root,
          componentId: "command-palette",
          ownerSource: "packages/ui-elements/src/components/commands.ts",
          sourcePath: duplicatePath,
        }),
      /already has an owned documentation source/u,
    );
    assert.equal(existsSync(path.join(root, duplicatePath)), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("owned component scaffolder refuses to invent missing migration guidance", () => {
  const root = ownedFixture();
  try {
    const catalogPath = path.join(root, "docs/metadata/components.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    delete catalog.components[0].purpose;
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

    const sourcePath =
      "packages/ui-elements/src/components/command-palette.docs.json";
    assert.throws(
      () =>
        scaffoldOwnedComponentDocumentation({
          root,
          componentId: "command-palette",
          ownerSource: "packages/ui-elements/src/components/commands.ts",
          sourcePath,
        }),
      /requires purpose in docs\/metadata\/components\.json/u,
    );
    assert.equal(existsSync(path.join(root, sourcePath)), false);
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

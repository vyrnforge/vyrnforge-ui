import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const metadataPath = "docs/metadata/react-batch-6-catalog-convergence.json";
const registryPath = "packages/ui-elements/src/registry.ts";

type SurfaceRecord = {
  name: string;
  canonicalTag: string;
  status: "canonical-backed" | "blocked-by-parity";
  blocker?: "native-host-contract" | "rich-composition";
  sourcePath: string;
  reason: string;
};

type CatalogConvergence = {
  schemaVersion: number;
  task: string;
  deliverable: string;
  policy: string;
  canonicalCutovers: string[];
  surfaces: SurfaceRecord[];
  exitCriteria: Record<string, string>;
};

function read(relativePath: string): string {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

describe("MFD-1414 React non-grid catalog convergence", () => {
  const convergence = readJson<CatalogConvergence>(metadataPath);

  it("has no unclassified eligible legacy surface in the reviewed Batch-6 catalog", () => {
    expect(convergence).toMatchObject({
      schemaVersion: 1,
      task: "MFD-1414",
      deliverable: "React batch 6",
      canonicalCutovers: [],
    });
    expect(convergence.surfaces.map(({ name }) => name)).toEqual([
      "Card",
      "Stack",
      "Inline",
      "Panel",
      "Section",
      "AppShell",
      "Page",
      "PageHeader",
      "PageToolbar",
    ]);
    expect(
      convergence.surfaces.every(({ status }) =>
        ["canonical-backed", "blocked-by-parity"].includes(status),
      ),
    ).toBe(true);
  });

  it("ties every blocked surface to an existing React source and canonical registration", () => {
    const registry = read(registryPath);
    for (const surface of convergence.surfaces) {
      expect(existsSync(path.join(repositoryRoot, surface.sourcePath))).toBe(
        true,
      );
      expect(registry).toContain(`tagName: "${surface.canonicalTag}"`);
      expect(surface.reason.length).toBeGreaterThan(100);
      if (surface.status === "blocked-by-parity") {
        expect(surface.blocker).toBeDefined();
        expect(
          convergence.exitCriteria[surface.blocker!]?.length,
        ).toBeGreaterThan(100);
      }
    }
  });

  it("keeps native-host and rich-composition blockers explicit instead of changing React DOM contracts", () => {
    const blockers = new Set(
      convergence.surfaces.map(({ blocker }) => blocker).filter(Boolean),
    );
    expect([...blockers].sort()).toEqual([
      "native-host-contract",
      "rich-composition",
    ]);
    expect(convergence.policy).toContain("eligible-legacy is forbidden");
  });
});

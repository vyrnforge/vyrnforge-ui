import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(path.join(repositoryRoot, relativePath), "utf8"),
  ) as T;
}

type MigrationMatrix = {
  schemaVersion: number;
  task: { sprint: string; id: string; status: string };
  strategies: Array<{ id: string; reason: string; exports: string[] }>;
  nonComponentExports: Array<{
    name: string;
    strategy: string;
    reason: string;
  }>;
  dedicatedRendererExceptions: string[];
};

type ReactAdoption = {
  publicValueExports: string[];
  nonComponentExports: Array<{ name: string; kind: string }>;
};

describe("MFD-1402 React migration matrix", () => {
  const matrix = readJson<MigrationMatrix>(
    "docs/metadata/react-migration-matrix.json",
  );
  const adoption = readJson<ReactAdoption>(
    "docs/metadata/react-behavior-adoption.json",
  );

  it("classifies every public React component exactly once", () => {
    const nonComponents = new Set(
      adoption.nonComponentExports.map(({ name }) => name),
    );
    const expectedComponents = adoption.publicValueExports
      .filter((name) => !nonComponents.has(name))
      .sort();
    const classified = matrix.strategies.flatMap(
      (strategy) => strategy.exports,
    );

    expect(new Set(classified).size).toBe(classified.length);
    expect([...classified].sort()).toEqual(expectedComponents);
  });

  it("keeps generated facade as the default migration strategy", () => {
    expect(matrix.schemaVersion).toBe(1);
    expect(matrix.task).toMatchObject({
      sprint: "S14",
      id: "MFD-1402",
      status: "classified",
    });
    expect(matrix.strategies[0]?.id).toBe("generated-facade");
    for (const strategy of matrix.strategies) {
      expect(strategy.reason.length).toBeGreaterThan(20);
      expect(strategy.exports.length).toBeGreaterThan(0);
    }
  });

  it("does not invent dedicated-renderer exceptions", () => {
    const dedicated = matrix.strategies.find(
      ({ id }) => id === "dedicated-renderer-exception",
    );
    expect(dedicated?.exports ?? []).toEqual([]);
    expect(matrix.dedicatedRendererExceptions).toEqual([]);
  });

  it("tracks public React integration APIs outside component renderer coverage", () => {
    expect(matrix.nonComponentExports).toEqual([
      expect.objectContaining({
        name: "useToast",
        strategy: "react-integration-api",
      }),
    ]);
    expect(matrix.nonComponentExports[0]?.reason.length).toBeGreaterThan(20);
  });
});

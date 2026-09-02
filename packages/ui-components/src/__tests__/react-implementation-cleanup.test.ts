import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

type Cleanup = {
  schemaVersion: number;
  task: string;
  deliverable: string;
  cleanupResult: string;
  removedDuplicateFiles: string[];
  auditedCanonicalBacked: Array<{
    component: string;
    sourcePath: string;
    canonicalTag: string;
  }>;
  exceptionBacked: Array<{ scope: string; exceptionId: string }>;
  staleTransitionMetadataCleaned: string[];
  forbiddenDuplicateSuffixes: string[];
};

type ExceptionRegistry = {
  exceptions: Array<{
    id: string;
    framework: string;
    state: string;
    exitCriteria: string;
  }>;
};

type Batch1 = {
  task: { status: string };
  resolutions: Array<{ strategy: string; exceptionId?: string }>;
};

type Matrix = {
  strategies: Array<{ id: string }>;
  dedicatedRendererExceptions: string[];
};

type ExceptionCatalog = {
  approvedFrameworkIntegrations: Array<{
    export: string;
    exceptionId: string;
  }>;
};

describe("MFD-1416 React implementation cleanup", () => {
  const cleanup = readJson<Cleanup>(
    "docs/metadata/react-implementation-cleanup.json",
  );
  const registry = readJson<ExceptionRegistry>(
    "docs/metadata/framework-exceptions.json",
  );

  it("records in-place cleanup without rollback copies", () => {
    expect(cleanup).toMatchObject({
      schemaVersion: 1,
      task: "MFD-1416",
      deliverable: "Reduced React implementation duplication",
      cleanupResult: "in-place-replacement",
      removedDuplicateFiles: [],
    });
    expect(cleanup.auditedCanonicalBacked.length).toBeGreaterThan(10);
  });

  it("keeps one canonical-backed implementation for migrated surfaces", () => {
    for (const surface of cleanup.auditedCanonicalBacked) {
      expect(existsSync(path.join(root, surface.sourcePath))).toBe(true);
      expect(read(surface.sourcePath)).toContain(surface.canonicalTag);

      const extension = path.extname(surface.sourcePath);
      const stem = surface.sourcePath.slice(0, -extension.length);
      for (const suffix of cleanup.forbiddenDuplicateSuffixes) {
        expect(existsSync(path.join(root, `${stem}${suffix}`))).toBe(false);
      }
    }
  });

  it("allows non-canonical renderers only behind live exceptions", () => {
    const live = new Map(
      registry.exceptions
        .filter(
          ({ framework, state }) =>
            framework === "react" && ["active", "retiring"].includes(state),
        )
        .map((entry) => [entry.id, entry]),
    );

    for (const retained of cleanup.exceptionBacked) {
      const exception = live.get(retained.exceptionId);
      expect(exception).toBeDefined();
      expect(exception?.exitCriteria.length).toBeGreaterThan(40);
    }
  });

  it("contains no stale transition strategy or status", () => {
    const batch1 = readJson<Batch1>(
      "docs/metadata/react-batch-1-readiness.json",
    );
    const matrix = readJson<Matrix>(
      "docs/metadata/react-migration-matrix.json",
    );
    const catalog = readJson<ExceptionCatalog>(
      "docs/metadata/react-exception-catalog.json",
    );

    expect(batch1.task.status).toBe("complete");
    expect(
      batch1.resolutions.some(({ strategy }) =>
        /temporary|legacy/.test(strategy),
      ),
    ).toBe(false);
    expect(
      matrix.strategies.some(({ id }) => /temporary|legacy/.test(id)),
    ).toBe(false);
    expect(matrix.dedicatedRendererExceptions).toEqual([]);
    expect(catalog.approvedFrameworkIntegrations).toEqual([
      expect.objectContaining({
        export: "ToastProvider",
        exceptionId: "MFD-EX-REACT-TOAST-PROVIDER",
      }),
    ]);

    for (const metadataPath of cleanup.staleTransitionMetadataCleaned) {
      expect(existsSync(path.join(root, metadataPath))).toBe(true);
    }
  });
});

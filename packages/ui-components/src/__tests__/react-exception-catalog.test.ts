import { existsSync, readFileSync } from "node:fs";
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

type FrameworkException = {
  id: string;
  framework: string;
  scope: string | string[];
  exceptionClass: string;
  reason: string;
  owner: string;
  sourcePaths: string[];
  evidence: string[];
  exitCriteria: string;
  state: string;
  reviewMilestone: string;
};

type ExceptionRegistry = {
  requiredFields: string[];
  exceptions: FrameworkException[];
};

type MigrationMatrix = {
  strategies: Array<{ id: string; exports: string[] }>;
  dedicatedRendererExceptions: string[];
};

type Batch5 = {
  task: string;
  surfaces: Array<{
    status: string;
    reason: string;
    sourcePaths: string[];
    exitCriteria: string;
  }>;
};

type Batch6 = {
  task: string;
  surfaces: Array<{
    status: string;
    blocker?: string;
    reason: string;
    sourcePath: string;
  }>;
  exitCriteria: Record<string, string>;
};

type ReactExceptionCatalog = {
  schemaVersion: number;
  task: string;
  deliverable: string;
  policy: string;
  owner: string;
  sources: Array<{
    kind: string;
    path: string;
    evidence: string;
    allowedStates?: string[];
    requiredFields?: string[];
  }>;
  resolvedTemporaryLegacy: Array<{
    export: string;
    strategy: string;
    exceptionId: string;
  }>;
  nonRendererIntegrationApis: Array<{
    export: string;
    exceptionId: string;
  }>;
  rules: string[];
};

describe("MFD-1415 React exception catalog", () => {
  const catalog = readJson<ReactExceptionCatalog>(
    "docs/metadata/react-exception-catalog.json",
  );
  const registry = readJson<ExceptionRegistry>(
    "docs/metadata/framework-exceptions.json",
  );
  const matrix = readJson<MigrationMatrix>(
    "docs/metadata/react-migration-matrix.json",
  );
  const batch5 = readJson<Batch5>(
    "docs/metadata/react-batch-5-overlay-convergence.json",
  );
  const batch6 = readJson<Batch6>(
    "docs/metadata/react-batch-6-catalog-convergence.json",
  );

  it(
    "resolves temporary legacy without inventing a duplicate renderer exception",
    () => {
      expect(catalog).toMatchObject({
        schemaVersion: 1,
        task: "MFD-1415",
        deliverable: "React exception catalog",
        owner: "UI Platform",
      });
      expect(catalog.policy).toContain(
        "Historical existence is never sufficient",
      );
      expect(matrix.strategies.some(({ id }) => id === "temporary-legacy")).toBe(
        false,
      );
      expect(
        matrix.strategies.find(
          ({ id }) => id === "approved-framework-integration",
        )?.exports,
      ).toEqual(["ToastProvider"]);
      expect(catalog.resolvedTemporaryLegacy).toEqual([
        expect.objectContaining({
          export: "ToastProvider",
          strategy: "approved-framework-integration",
          exceptionId: "MFD-EX-REACT-TOAST-PROVIDER",
        }),
      ]);
      expect(matrix.dedicatedRendererExceptions).toEqual([]);
    },
  );

  it(
    "requires current ownership, evidence, source paths, and exit criteria for every live React ADR-008 exception",
    () => {
      const registrySource = catalog.sources.find(
        ({ kind }) => kind === "adr-008-exceptions",
      );
      expect(registrySource?.requiredFields).toEqual(registry.requiredFields);

      const allowedStates = new Set(registrySource?.allowedStates ?? []);
      const reactExceptions = registry.exceptions.filter(
        ({ framework, state }) =>
          framework === "react" && allowedStates.has(state),
      );
      expect(reactExceptions.length).toBeGreaterThan(0);

      for (const exception of reactExceptions) {
        for (const field of registry.requiredFields) {
          expect(exception[field as keyof FrameworkException]).toBeDefined();
        }
        expect(exception.owner.length).toBeGreaterThan(2);
        expect(exception.reason.length).toBeGreaterThan(40);
        expect(exception.evidence.length).toBeGreaterThan(0);
        expect(exception.exitCriteria.length).toBeGreaterThan(40);
        expect(exception.sourcePaths.length).toBeGreaterThan(0);
        for (const sourcePath of exception.sourcePaths) {
          expect(existsSync(path.join(repositoryRoot, sourcePath))).toBe(true);
        }
        expect(exception.reason.toLowerCase()).not.toMatch(
          /historical existence|because it existed|legacy only/,
        );
      }

      for (const retained of catalog.resolvedTemporaryLegacy) {
        expect(
          reactExceptions.some(({ id }) => id === retained.exceptionId),
        ).toBe(true);
      }
      for (const integrationApi of catalog.nonRendererIntegrationApis) {
        expect(
          reactExceptions.some(({ id }) => id === integrationApi.exceptionId),
        ).toBe(true);
      }
    },
  );

  it(
    "keeps Batch-5 and Batch-6 handwritten renderers only behind explicit parity blockers",
    () => {
      expect(batch5.task).toBe("MFD-1413");
      for (const surface of batch5.surfaces) {
        expect(surface.status).toBe("blocked-by-parity");
        expect(surface.reason.length).toBeGreaterThan(100);
        expect(surface.exitCriteria.length).toBeGreaterThan(80);
        for (const sourcePath of surface.sourcePaths) {
          expect(existsSync(path.join(repositoryRoot, sourcePath))).toBe(true);
        }
      }

      expect(batch6.task).toBe("MFD-1414");
      for (const surface of batch6.surfaces) {
        expect(surface.status).toBe("blocked-by-parity");
        expect(surface.reason.length).toBeGreaterThan(100);
        expect(surface.blocker).toBeDefined();
        expect(batch6.exitCriteria[surface.blocker!]?.length).toBeGreaterThan(
          100,
        );
        expect(
          existsSync(path.join(repositoryRoot, surface.sourcePath)),
        ).toBe(true);
      }
    },
  );

  it("points every catalog evidence source at a real repository file", () => {
    for (const source of catalog.sources) {
      expect(existsSync(path.join(repositoryRoot, source.path))).toBe(true);
      expect(existsSync(path.join(repositoryRoot, source.evidence))).toBe(true);
    }
    expect(catalog.rules.join(" ")).toContain(
      "No exception may be justified by historical existence",
    );
  });
});

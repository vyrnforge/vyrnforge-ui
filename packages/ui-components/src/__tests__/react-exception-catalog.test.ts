import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8")) as T;
}

function expectFile(relativePath: string): void {
  expect(existsSync(path.join(root, relativePath))).toBe(true);
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

type Catalog = {
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
  const catalog = readJson<Catalog>(
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

  it("resolves temporary legacy", () => {
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
    const integration = matrix.strategies.find(
      ({ id }) => id === "approved-framework-integration",
    );
    expect(integration?.exports).toEqual(["ToastProvider"]);
    expect(catalog.resolvedTemporaryLegacy).toEqual([
      expect.objectContaining({
        export: "ToastProvider",
        strategy: "approved-framework-integration",
        exceptionId: "MFD-EX-REACT-TOAST-PROVIDER",
      }),
    ]);
    expect(matrix.dedicatedRendererExceptions).toEqual([]);
  });

  it("verifies live ADR-008 React exceptions", () => {
    const source = catalog.sources.find(
      ({ kind }) => kind === "adr-008-exceptions",
    );
    expect(source?.requiredFields).toEqual(registry.requiredFields);

    const allowedStates = new Set(source?.allowedStates ?? []);
    const live = registry.exceptions.filter(
      ({ framework, state }) =>
        framework === "react" && allowedStates.has(state),
    );
    expect(live.length).toBeGreaterThan(0);

    for (const exception of live) {
      for (const field of registry.requiredFields) {
        expect(exception[field as keyof FrameworkException]).toBeDefined();
      }
      expect(exception.owner.length).toBeGreaterThan(2);
      expect(exception.reason.length).toBeGreaterThan(40);
      expect(exception.evidence.length).toBeGreaterThan(0);
      expect(exception.exitCriteria.length).toBeGreaterThan(40);
      expect(exception.sourcePaths.length).toBeGreaterThan(0);
      exception.sourcePaths.forEach(expectFile);
      expect(exception.reason.toLowerCase()).not.toMatch(
        /historical existence|because it existed|legacy only/,
      );
    }

    for (const retained of catalog.resolvedTemporaryLegacy) {
      expect(live.some(({ id }) => id === retained.exceptionId)).toBe(true);
    }
    for (const api of catalog.nonRendererIntegrationApis) {
      expect(live.some(({ id }) => id === api.exceptionId)).toBe(true);
    }
  });

  it("verifies batch parity blockers", () => {
    expect(batch5.task).toBe("MFD-1413");
    for (const surface of batch5.surfaces) {
      expect(surface.status).toBe("blocked-by-parity");
      expect(surface.reason.length).toBeGreaterThan(100);
      expect(surface.exitCriteria.length).toBeGreaterThan(80);
      surface.sourcePaths.forEach(expectFile);
    }

    expect(batch6.task).toBe("MFD-1414");
    for (const surface of batch6.surfaces) {
      expect(surface.status).toBe("blocked-by-parity");
      expect(surface.reason.length).toBeGreaterThan(100);
      expect(surface.blocker).toBeDefined();
      const exit = batch6.exitCriteria[surface.blocker!];
      expect(exit?.length).toBeGreaterThan(100);
      expectFile(surface.sourcePath);
    }
  });

  it("uses auditable catalog sources", () => {
    for (const source of catalog.sources) {
      expectFile(source.path);
      expectFile(source.evidence);
    }
    expect(catalog.rules.join(" ")).toContain(
      "No exception may be justified by historical existence",
    );
  });
});

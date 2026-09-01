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

type Gate = {
  schemaVersion: number;
  task: { id: string; status: string };
  baseline: string;
  evidence: {
    parity: string[];
    accessibility: string[];
    performance: { budgetSource: string; package: string };
    compatibility: { matrix: string; requiredCases: string[] };
    consumer: string;
    ssr: string;
    cleanup: string;
  };
  regressionPolicy: {
    materialRegressionRequiresExplicitException: boolean;
    regressionExceptions: unknown[];
    noDormantDuplicateImplementation: boolean;
  };
};

type Compatibility = {
  supportPolicy: { react: string[] };
  cases: Array<{ id: string; fixture: string }>;
};

type Budgets = {
  packages: Array<{
    name: string;
    budgets: Record<string, number>;
  }>;
  waivers: unknown[];
};

describe("MFD-1418 React convergence gate", () => {
  const gate = readJson<Gate>("docs/metadata/react-convergence-gate.json");
  const compatibility = readJson<Compatibility>(
    gate.evidence.compatibility.matrix,
  );
  const budgets = readJson<Budgets>(gate.evidence.performance.budgetSource);
  const workflow = read(".github/workflows/ci.yml");

  it("binds the final gate to existing source-of-truth evidence", () => {
    expect(gate).toMatchObject({
      schemaVersion: 1,
      task: { id: "MFD-1418", status: "enforced" },
      regressionPolicy: {
        materialRegressionRequiresExplicitException: true,
        regressionExceptions: [],
        noDormantDuplicateImplementation: true,
      },
    });

    for (const evidencePath of [
      gate.baseline,
      ...gate.evidence.parity,
      ...gate.evidence.accessibility.filter(
        (entry) => !entry.startsWith("test-results/"),
      ),
      gate.evidence.performance.budgetSource,
      gate.evidence.compatibility.matrix,
      gate.evidence.consumer,
      gate.evidence.ssr,
      gate.evidence.cleanup,
    ]) {
      expect(existsSync(path.join(root, evidencePath))).toBe(true);
    }
  });

  it("covers every supported React major through canonical packed cases", () => {
    const reactCases = compatibility.cases.filter(
      ({ fixture }) => fixture === "react",
    );
    expect(reactCases.map(({ id }) => id).sort()).toEqual(
      [...gate.evidence.compatibility.requiredCases].sort(),
    );
    expect(reactCases).toHaveLength(compatibility.supportPolicy.react.length);
  });

  it("keeps ui-components inside governed package budgets without waivers", () => {
    const packageBudget = budgets.packages.find(
      ({ name }) => name === gate.evidence.performance.package,
    );
    expect(packageBudget).toBeDefined();
    expect(
      Object.values(packageBudget?.budgets ?? {}).every((value) => value > 0),
    ).toBe(true);
    expect(budgets.waivers).toEqual([]);
  });

  it("makes supported React compatibility a protected React-lane CI dependency", () => {
    for (const marker of [
      "react-compatibility-plan:",
      "react-compatibility-${{ matrix.id }}",
      "docs/metadata/compatibility-release-matrix.json",
      "npm run verify:compatibility-release-case -- --case ${{ matrix.id }}",
      "REACT_COMPATIBILITY_REQUIRED",
      "REACT_COMPATIBILITY_RESULT",
      "- react-compatibility-plan",
      "- react-compatibility",
    ]) {
      expect(workflow).toContain(marker);
    }
  });
});

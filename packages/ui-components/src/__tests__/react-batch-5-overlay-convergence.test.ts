import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const metadataPath = "docs/metadata/react-batch-5-overlay-convergence.json";

type SurfaceRecord = {
  name: string;
  canonicalTag: string;
  status: "blocked-by-parity";
  reason: string;
  sourcePaths: string[];
  exitCriteria: string;
};

type OverlayConvergence = {
  schemaVersion: number;
  task: string;
  deliverable: string;
  paritySuite: string;
  canonicalCutovers: string[];
  surfaces: SurfaceRecord[];
};

function read(relativePath: string): string {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

describe("MFD-1413 React overlay and feedback convergence", () => {
  const convergence = readJson<OverlayConvergence>(metadataPath);

  it("classifies every Batch-5 overlay surface without forcing an unsafe cutover", () => {
    expect(convergence).toMatchObject({
      schemaVersion: 1,
      task: "MFD-1413",
      deliverable: "React batch 5",
      canonicalCutovers: [],
    });
    expect(convergence.surfaces.map(({ name }) => name)).toEqual([
      "Dialog",
      "Drawer",
      "Popover",
      "Tooltip",
      "Toast",
      "ConfirmDialog",
    ]);
    expect(
      convergence.surfaces.every(
        ({ status }) => status === "blocked-by-parity",
      ),
    ).toBe(true);
  });

  it("keeps executable overlay parity evidence and every inspected source auditable", () => {
    expect(existsSync(path.join(repositoryRoot, convergence.paritySuite))).toBe(
      true,
    );
    const paritySuite = read(convergence.paritySuite);
    for (const surface of convergence.surfaces) {
      expect(surface.canonicalTag).toMatch(/^vf-/);
      expect(surface.reason.length).toBeGreaterThan(80);
      expect(surface.exitCriteria.length).toBeGreaterThan(80);
      for (const sourcePath of surface.sourcePaths) {
        expect(existsSync(path.join(repositoryRoot, sourcePath))).toBe(true);
      }
      expect(paritySuite).toContain(surface.name);
    }
  });

  it("retains focus, dismissal, relationship, and toast-controller runtime evidence", () => {
    const paritySuite = read(convergence.paritySuite);
    for (const marker of [
      "onDialogOpenChange",
      "onDrawerOpenChange",
      "aria-controls",
      "aria-describedby",
      "Escape",
      "ConfirmDialog",
      "ToastProvider",
      "useToast",
    ]) {
      expect(paritySuite).toContain(marker);
    }
  });
});

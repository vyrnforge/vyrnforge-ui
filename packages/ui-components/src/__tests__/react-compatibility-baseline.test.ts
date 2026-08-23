import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const baselinePath = "docs/metadata/react-compatibility-baseline.json";

type BaselineFingerprint = {
  path: string;
  kind: "blob" | "tree";
  sha1: string;
};

type ReactCompatibilityBaseline = {
  schemaVersion: number;
  task: {
    sprint: string;
    id: string;
    status: string;
  };
  package: {
    name: string;
    version: string;
    manifest: string;
    publicEntry: string;
    cssEntrypoints: string[];
    peerDependencies: Record<string, string>;
  };
  testedReactVersions: string[];
  fingerprints: BaselineFingerprint[];
  runtimeEvidence: string[];
  compatibilityInvariants: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(path.join(repositoryRoot, relativePath), "utf8"),
  ) as T;
}

function gitObjectHash(kind: "blob" | "tree", body: Buffer): string {
  return createHash("sha1")
    .update(Buffer.from(`${kind} ${body.length}\0`))
    .update(body)
    .digest("hex");
}

function gitBlobHash(absolutePath: string): string {
  return gitObjectHash("blob", readFileSync(absolutePath));
}

function gitTreeHash(absolutePath: string): string {
  const entries = readdirSync(absolutePath, { withFileTypes: true })
    .map((entry) => {
      const entryPath = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) {
        return {
          mode: "40000",
          name: entry.name,
          sortName: `${entry.name}/`,
          sha1: gitTreeHash(entryPath),
        };
      }

      if (entry.isSymbolicLink()) {
        return {
          mode: "120000",
          name: entry.name,
          sortName: entry.name,
          sha1: gitObjectHash("blob", Buffer.from(readlinkSync(entryPath))),
        };
      }

      const mode = (lstatSync(entryPath).mode & 0o111) === 0 ? "100644" : "100755";
      return {
        mode,
        name: entry.name,
        sortName: entry.name,
        sha1: gitBlobHash(entryPath),
      };
    })
    .sort((left, right) =>
      Buffer.compare(Buffer.from(left.sortName), Buffer.from(right.sortName)),
    );

  const body = Buffer.concat(
    entries.flatMap((entry) => [
      Buffer.from(`${entry.mode} ${entry.name}\0`),
      Buffer.from(entry.sha1, "hex"),
    ]),
  );
  return gitObjectHash("tree", body);
}

function fingerprint(relativePath: string, kind: "blob" | "tree"): string {
  const absolutePath = path.join(repositoryRoot, relativePath);
  return kind === "tree" ? gitTreeHash(absolutePath) : gitBlobHash(absolutePath);
}

describe("MFD-1401 React compatibility baseline", () => {
  const baseline = readJson<ReactCompatibilityBaseline>(baselinePath);
  const packageJson = readJson<{
    name: string;
    version: string;
    exports: Record<string, unknown>;
    peerDependencies: Record<string, string>;
  }>(baseline.package.manifest);
  const compatibilityMatrix = readJson<{
    supportPolicy: { react: string[] };
  }>("docs/metadata/compatibility-release-matrix.json");
  const behaviorAdoption = readJson<{
    compatibilityInvariants: string[];
  }>("docs/metadata/react-behavior-adoption.json");

  it("records the S14 React package contract", () => {
    expect(baseline.schemaVersion).toBe(1);
    expect(baseline.task).toMatchObject({
      sprint: "S14",
      id: "MFD-1401",
      status: "captured",
    });
    expect(packageJson.name).toBe(baseline.package.name);
    expect(packageJson.version).toBe(baseline.package.version);
    expect(packageJson.peerDependencies).toEqual(
      baseline.package.peerDependencies,
    );
    expect(baseline.testedReactVersions).toEqual(
      compatibilityMatrix.supportPolicy.react,
    );
  });

  it("locks public package and CSS entrypoints", () => {
    expect(packageJson.exports["."]).toEqual({
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
      require: "./dist/index.cjs",
    });
    for (const cssEntrypoint of baseline.package.cssEntrypoints) {
      expect(packageJson.exports[cssEntrypoint]).toBe("./dist/index.css");
    }
    expect(baseline.package.publicEntry).toBe(
      "packages/ui-components/src/index.ts",
    );
  });

  it("fails when captured React API, types, refs, callbacks, behavior, or styles drift", () => {
    for (const record of baseline.fingerprints) {
      expect(
        existsSync(path.join(repositoryRoot, record.path)),
        `${record.path} must exist`,
      ).toBe(true);
      expect(
        fingerprint(record.path, record.kind),
        `${record.path} changed; review and intentionally recapture the MFD-1401 baseline with matching parity evidence`,
      ).toBe(record.sha1);
    }
  });

  it("keeps runtime evidence and behavior invariants explicit", () => {
    for (const relativePath of baseline.runtimeEvidence) {
      expect(
        existsSync(path.join(repositoryRoot, relativePath)),
        `${relativePath} must remain part of the React compatibility evidence`,
      ).toBe(true);
    }
    expect(baseline.compatibilityInvariants).toEqual(
      behaviorAdoption.compatibilityInvariants,
    );
  });
});

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  readArgument,
  readReleaseArtifactManifest,
  releaseArtifactDirectory,
  resolveReleaseSelection,
  validateReleaseArtifactManifest,
  verifyReleaseArtifactFiles,
} from "./release-artifact.mjs";
import { repositoryRoot } from "./release-groups.mjs";

const npmCliPath = process.env.npm_execpath;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function runNpm(args, options = {}) {
  if (npmCliPath) {
    return run(process.execPath, [npmCliPath, ...args], options);
  }
  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function lockedVersion(lockfile, packageName) {
  const version = lockfile.packages?.[`node_modules/${packageName}`]?.version;
  if (!version) throw new Error(`package-lock.json is missing ${packageName}`);
  return version;
}

function consumerSource(releaseGroupId) {
  if (releaseGroupId === "data-grid-alpha") {
    return `import React from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";
import type { DataGridColumnDef } from "@vyrnforge/ui-data-grid";

type Row = { id: string; name: string };

const rows: Row[] = [{ id: "row-1", name: "Release artifact" }];
const columns: DataGridColumnDef<Row>[] = [
  { id: "id", header: "ID", accessorKey: "id" },
  { id: "name", header: "Name", accessorKey: "name" },
];

createRoot(document.getElementById("root") as HTMLElement).render(
  <UniversalDataGrid
    tableId="release-artifact-grid"
    rows={rows}
    columns={columns}
    getRowId={(row) => row.id}
  />,
);
`;
  }

  return `import React from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";
import { createBehaviorEvent } from "@vyrnforge/ui-behaviors";
import { Button, Card, Stack } from "@vyrnforge/ui-components";
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

registerVyrnForgeElements();
const event = createBehaviorEvent(
  "release-artifact",
  { package: "@vyrnforge/ui-behaviors" },
  "programmatic",
);

createRoot(document.getElementById("root") as HTMLElement).render(
  <Card data-reason={event.reason}>
    <Stack gap="sm">
      <Button>Release artifact</Button>
      {React.createElement("vf-button", null, "Native release artifact")}
    </Stack>
  </Card>,
);
`;
}

function verifyConsumer({
  releaseGroupId,
  artifactManifest,
  artifactDir,
  releaseGroup,
}) {
  const lockfile = JSON.parse(
    readFileSync(path.join(repositoryRoot, "package-lock.json"), "utf8"),
  );
  const consumerDirectory = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-release-artifact-"),
  );

  try {
    for (const file of ["index.html", "tsconfig.json", "vite.config.ts"]) {
      copyFileSync(
        path.join(repositoryRoot, "tests/package-consumer", file),
        path.join(consumerDirectory, file),
      );
    }
    mkdirSync(path.join(consumerDirectory, "src"), { recursive: true });
    writeFileSync(
      path.join(consumerDirectory, "src/main.tsx"),
      consumerSource(releaseGroupId),
    );
    writeFileSync(
      path.join(consumerDirectory, "src/vite-env.d.ts"),
      '/// <reference types="vite/client" />\n',
    );

    const packageJson = {
      name: "vyrnforge-release-artifact-consumer",
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        typecheck: "tsc --noEmit",
        build: "tsc -b && vite build",
      },
      dependencies: {
        react: lockedVersion(lockfile, "react"),
        "react-dom": lockedVersion(lockfile, "react-dom"),
      },
      devDependencies: {
        "@types/react": lockedVersion(lockfile, "@types/react"),
        "@types/react-dom": lockedVersion(lockfile, "@types/react-dom"),
        typescript: lockedVersion(lockfile, "typescript"),
        vite: lockedVersion(lockfile, "vite"),
      },
    };
    writeFileSync(
      path.join(consumerDirectory, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
    );

    runNpm(
      [
        "install",
        "--no-package-lock",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
      ],
      { cwd: consumerDirectory, stdio: "inherit" },
    );

    const tarballs = artifactManifest.packages.map((packageInfo) =>
      path.resolve(
        repositoryRoot,
        artifactDir,
        "tarballs",
        packageInfo.filename,
      ),
    );
    const installArgs = [
      "install",
      ...(releaseGroupId === "non-grid-beta" ? ["--offline"] : []),
      "--no-package-lock",
      "--no-save",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      ...tarballs,
    ];
    runNpm(installArgs, { cwd: consumerDirectory, stdio: "inherit" });

    for (const packageInfo of releaseGroup.packages) {
      const installedPath = path.join(
        consumerDirectory,
        "node_modules",
        ...packageInfo.name.split("/"),
      );
      if (!existsSync(installedPath)) {
        throw new Error(`${packageInfo.name}: exact tarball was not installed`);
      }
      if (lstatSync(installedPath).isSymbolicLink()) {
        throw new Error(
          `${packageInfo.name}: tarball install became a symlink`,
        );
      }
      const installedPackage = JSON.parse(
        readFileSync(path.join(installedPath, "package.json"), "utf8"),
      );
      if (installedPackage.version !== releaseGroup.version) {
        throw new Error(`${packageInfo.name}: installed version mismatch`);
      }
    }

    runNpm(["run", "typecheck"], {
      cwd: consumerDirectory,
      stdio: "inherit",
    });
    runNpm(["run", "build"], {
      cwd: consumerDirectory,
      stdio: "inherit",
    });

    const assetsDirectory = path.join(consumerDirectory, "dist/assets");
    const cssText = readdirSync(assetsDirectory)
      .filter((file) => file.endsWith(".css"))
      .map((file) => readFileSync(path.join(assetsDirectory, file), "utf8"))
      .join("\n");
    if (!cssText.includes("--vf-")) {
      throw new Error(
        "release-artifact consumer CSS is missing --vf-* variables",
      );
    }
    if (releaseGroupId === "data-grid-alpha" && !cssText.includes("--udg-")) {
      throw new Error(
        "data-grid release-artifact CSS is missing --udg-* variables",
      );
    }
  } finally {
    rmSync(consumerDirectory, { recursive: true, force: true });
  }
}

const releaseGroupId = readArgument(process.argv, "--release-group");
const version = readArgument(process.argv, "--version");
const distTag = readArgument(process.argv, "--dist-tag");
const sourceCommit = readArgument(process.argv, "--source-commit");
const ciRunId = readArgument(process.argv, "--ci-run-id");
const artifactDir =
  readArgument(process.argv, "--artifact-dir") ?? releaseArtifactDirectory;
const skipConsumer = process.argv.includes("--skip-consumer");

const { releaseGroup } = resolveReleaseSelection({
  releaseGroupId,
  version,
  distTag,
});
const artifactManifest = readReleaseArtifactManifest({ artifactDir });
const failures = [
  ...validateReleaseArtifactManifest({
    artifactManifest,
    releaseGroupId,
    version,
    distTag,
    sourceCommit,
    ciRunId,
  }),
  ...verifyReleaseArtifactFiles({ artifactManifest, artifactDir }),
];

if (failures.length) {
  throw new Error(
    `release artifact verification failed:\n- ${failures.join("\n- ")}`,
  );
}

if (!skipConsumer) {
  verifyConsumer({
    releaseGroupId,
    artifactManifest,
    artifactDir,
    releaseGroup,
  });
}

console.log(
  `Release artifact verification passed: ${releaseGroupId} ${version} (${artifactManifest.packages.length} tarballs).`,
);

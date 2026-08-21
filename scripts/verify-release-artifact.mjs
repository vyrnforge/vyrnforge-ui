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

function consumerSource(releaseGroup) {
  const imports = releaseGroup.packages.map(
    (packageInfo, index) =>
      `import * as package${index} from "${packageInfo.name}";`,
  );
  const cssImports = releaseGroup.packages
    .filter((packageInfo) => packageInfo.policies?.hasCss === true)
    .map((packageInfo) => `import "${packageInfo.name}/styles/index.css";`);
  const references = releaseGroup.packages.map(
    (_packageInfo, index) => `void package${index};`,
  );
  return [...imports, ...cssImports, "", ...references, ""].join("\n");
}

function verifyConsumer({ artifactManifest, artifactDir, releaseGroup }) {
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
      consumerSource(releaseGroup),
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
    if (
      releaseGroup.packages.some(
        (packageInfo) => packageInfo.policies?.hasCss,
      ) &&
      cssText.length === 0
    ) {
      throw new Error(
        "release-artifact consumer did not bundle declared package CSS",
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
    artifactManifest,
    artifactDir,
    releaseGroup,
  });
}

console.log(
  `Release artifact verification passed: ${releaseGroupId} ${version} (${artifactManifest.packages.length} tarballs).`,
);

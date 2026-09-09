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
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function exportSpecifier(packageName, exportKey) {
  return exportKey === "."
    ? packageName
    : `${packageName}/${exportKey.replace(/^\.\//u, "")}`;
}

function stringTargets(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringTargets);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(stringTargets);
  }
  return [];
}

function exportEntries(packageName, exportsMap = {}) {
  return Object.entries(exportsMap)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exportKey, value]) => ({
      exportKey,
      specifier: exportSpecifier(packageName, exportKey),
      targets: stringTargets(value),
      value,
    }));
}

function sourcePackageJson(packageInfo) {
  return JSON.parse(
    readFileSync(
      path.join(repositoryRoot, packageInfo.directory, "package.json"),
      "utf8",
    ),
  );
}

function consumerSource(releaseGroup) {
  const imports = [];
  const references = [];
  let index = 0;

  for (const packageInfo of releaseGroup.packages) {
    const packageJson = sourcePackageJson(packageInfo);
    for (const entry of exportEntries(packageInfo.name, packageJson.exports)) {
      const targets = entry.targets;
      const isCss = targets.length > 0 && targets.every((target) => target.endsWith(".css"));
      const isJson = targets.length > 0 && targets.every((target) => target.endsWith(".json"));
      if (isCss) {
        imports.push(`import "${entry.specifier}";`);
        continue;
      }
      if (isJson) {
        imports.push(`import entry${index} from "${entry.specifier}";`);
      } else {
        imports.push(`import * as entry${index} from "${entry.specifier}";`);
      }
      references.push(`void entry${index};`);
      index += 1;
    }
  }

  return [...imports, "", ...references, ""].join("\n");
}

function resolveEsmEntries(consumerDirectory, specifiers) {
  const resolverPath = path.join(consumerDirectory, ".vyrnforge-resolve.mjs");
  writeFileSync(
    resolverPath,
    `const specifiers = ${JSON.stringify(specifiers)};\n` +
      "console.log(JSON.stringify(Object.fromEntries(specifiers.map((specifier) => [specifier, import.meta.resolve(specifier)]))));\n",
  );
  return JSON.parse(
    run(process.execPath, [resolverPath], { cwd: consumerDirectory }),
  );
}

function verifyInstalledEntryPoints({ consumerDirectory, releaseGroup }) {
  const consumerRequire = createRequire(path.join(consumerDirectory, "package.json"));
  const packageRecords = releaseGroup.packages.map((packageInfo) => {
    const installedPath = path.join(
      consumerDirectory,
      "node_modules",
      ...packageInfo.name.split("/"),
    );
    const packageJson = JSON.parse(
      readFileSync(path.join(installedPath, "package.json"), "utf8"),
    );
    return {
      packageInfo,
      installedPath,
      packageJson,
      entries: exportEntries(packageInfo.name, packageJson.exports),
    };
  });
  const specifiers = packageRecords.flatMap(({ entries }) =>
    entries.map(({ specifier }) => specifier),
  );
  const esmResolutions = resolveEsmEntries(consumerDirectory, specifiers);

  for (const { packageInfo, installedPath, entries } of packageRecords) {
    for (const entry of entries) {
      for (const target of entry.targets) {
        const targetPath = path.join(installedPath, target.replace(/^\.\//u, ""));
        if (!existsSync(targetPath)) {
          throw new Error(`${entry.specifier}: installed export target is missing (${target})`);
        }
      }

      const esmResolution = esmResolutions[entry.specifier];
      if (!esmResolution?.startsWith("file:")) {
        throw new Error(`${entry.specifier}: ESM package resolution failed`);
      }
      if (!fileURLToPath(esmResolution).startsWith(installedPath)) {
        throw new Error(`${entry.specifier}: ESM resolution escaped ${packageInfo.name}`);
      }

      if (
        entry.value &&
        typeof entry.value === "object" &&
        !Array.isArray(entry.value) &&
        typeof entry.value.require === "string"
      ) {
        const requireResolution = consumerRequire.resolve(entry.specifier);
        if (!requireResolution.startsWith(installedPath)) {
          throw new Error(`${entry.specifier}: CommonJS resolution escaped ${packageInfo.name}`);
        }
      }
    }
  }
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
    runNpm(
      [
        "install",
        "--offline",
        "--no-package-lock",
        "--no-save",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        ...tarballs,
      ],
      { cwd: consumerDirectory, stdio: "inherit" },
    );

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

    verifyInstalledEntryPoints({ consumerDirectory, releaseGroup });

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

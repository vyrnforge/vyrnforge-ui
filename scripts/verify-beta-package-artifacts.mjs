import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  betaPackageConsumerPath,
  betaPackageReportDirectory,
  buildBetaPackageContract,
  repositoryRoot,
  validatePackedFiles,
  verifyBetaPackageContract,
} from "./beta-package-artifacts.mjs";

const root = repositoryRoot;
const npmCliPath = process.env.npm_execpath;
const reportDirectory = path.join(root, betaPackageReportDirectory);
const tarballDirectory = path.join(reportDirectory, "tarballs");
const consumerDirectory = path.join(root, betaPackageConsumerPath);
const consumerLogPath = path.join(reportDirectory, "consumer.log");
const tarballReportPath = path.join(reportDirectory, "tarball-report.json");
const consumerReportPath = path.join(reportDirectory, "consumer-report.json");
const logLines = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function record(message = "") {
  logLines.push(message);
  console.log(message);
}

function run(command, args, options = {}) {
  const display = `${command} ${args.join(" ")}`;
  record(`$ ${display}`);
  try {
    const output = execFileSync(command, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    if (output?.trim()) record(output.trimEnd());
    return output;
  } catch (error) {
    if (error.stdout?.toString().trim()) record(error.stdout.toString().trimEnd());
    if (error.stderr?.toString().trim()) record(error.stderr.toString().trimEnd());
    throw error;
  }
}

function runNpm(args, options = {}) {
  if (npmCliPath) {
    return run(process.execPath, [npmCliPath, ...args], options);
  }
  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function cleanupConsumer() {
  for (const target of [
    "node_modules",
    "dist",
    "package-lock.json",
    ".tmp-resolve.mjs",
  ]) {
    rmSync(path.join(consumerDirectory, target), {
      force: true,
      recursive: true,
    });
  }
}

function prepareOutput() {
  rmSync(reportDirectory, { force: true, recursive: true });
  mkdirSync(tarballDirectory, { recursive: true });
  cleanupConsumer();
}

function buildAndPack(contract) {
  runNpm(["run", "clean:packages"]);
  for (const packageRecord of contract.packages) {
    runNpm(["run", "build", "--workspace", packageRecord.name]);
  }

  return contract.packages.map((packageRecord) => {
    const packageDirectory = path.join(root, packageRecord.directory);
    const output = runNpm(
      ["pack", "--pack-destination", tarballDirectory, "--json"],
      { cwd: packageDirectory },
    );
    const [packInfo] = JSON.parse(output);
    const tarballPath = path.join(tarballDirectory, packInfo.filename);
    assert(
      existsSync(tarballPath),
      `${packageRecord.name}: npm pack did not create ${packInfo.filename}`,
    );

    const failures = validatePackedFiles(packageRecord, packInfo.files ?? []);
    assert(!failures.length, failures.join("\n"));

    return {
      packageRecord,
      tarballPath,
      report: {
        name: packageRecord.name,
        version: packInfo.version,
        filename: packInfo.filename,
        integrity: packInfo.integrity,
        shasum: packInfo.shasum,
        packedSize: packInfo.size,
        unpackedSize: packInfo.unpackedSize,
        fileCount: packInfo.files?.length ?? 0,
        files: (packInfo.files ?? []).map((file) => file.path),
        entryPoints: packageRecord.entryPoints,
      },
    };
  });
}

function installConsumerDependencies() {
  record("Installing third-party fixture dependencies before offline package installation.");
  runNpm(
    [
      "install",
      "--no-package-lock",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    { cwd: consumerDirectory },
  );
}

function installTarballsOffline(tarballs) {
  record("Installing VyrnForge beta tarballs with npm offline mode.");
  runNpm(
    [
      "install",
      "--offline",
      "--no-package-lock",
      "--no-save",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      ...tarballs.map(({ tarballPath }) => tarballPath),
    ],
    { cwd: consumerDirectory },
  );
}

function resolveEsmEntries(specifiers) {
  const resolverPath = path.join(consumerDirectory, ".tmp-resolve.mjs");
  writeFileSync(
    resolverPath,
    `const specifiers = ${JSON.stringify(specifiers)};\n` +
      "console.log(JSON.stringify(Object.fromEntries(specifiers.map((specifier) => [specifier, import.meta.resolve(specifier)]))));\n",
  );
  return JSON.parse(run(process.execPath, [resolverPath], { cwd: consumerDirectory }));
}

function verifyInstalledPackages(contract) {
  const consumerRequire = createRequire(path.join(consumerDirectory, "package.json"));
  const esmSpecifiers = contract.packages.flatMap((packageRecord) =>
    packageRecord.entryPoints
      .filter((entryPoint) => entryPoint.targets?.import)
      .map((entryPoint) => entryPoint.specifier),
  );
  const esmResolutions = resolveEsmEntries(esmSpecifiers);
  const packageReports = [];

  for (const packageRecord of contract.packages) {
    const packagePath = path.join(
      consumerDirectory,
      "node_modules",
      ...packageRecord.name.split("/"),
    );
    const packageJson = readJson(path.join(packagePath, "package.json"));
    assert(existsSync(packagePath), `${packageRecord.name}: package is not installed`);
    assert(
      !lstatSync(packagePath).isSymbolicLink(),
      `${packageRecord.name}: offline install must not produce a workspace symlink`,
    );
    assert(
      packageJson.version === packageRecord.version,
      `${packageRecord.name}: installed version must be ${packageRecord.version}`,
    );

    const resolvedEntries = [];
    for (const entryPoint of packageRecord.entryPoints) {
      const targetRecords = entryPoint.target
        ? [[entryPoint.kind, entryPoint.target]]
        : Object.entries(entryPoint.targets ?? {});

      for (const [condition, target] of targetRecords) {
        const targetPath = path.join(packagePath, target.replace(/^\.\//u, ""));
        assert(
          existsSync(targetPath),
          `${entryPoint.specifier}: installed ${condition} target is missing`,
        );
      }

      let nodeResolution = null;
      if (entryPoint.target || entryPoint.targets?.require) {
        nodeResolution = consumerRequire.resolve(entryPoint.specifier);
        assert(
          nodeResolution.startsWith(packagePath),
          `${entryPoint.specifier}: CommonJS/package resolution escaped the installed package`,
        );
      }

      const esmResolution = esmResolutions[entryPoint.specifier] ?? null;
      if (entryPoint.targets?.import) {
        assert(
          esmResolution?.startsWith("file:"),
          `${entryPoint.specifier}: ESM entry did not resolve`,
        );
        assert(
          fileURLToPath(esmResolution).startsWith(packagePath),
          `${entryPoint.specifier}: ESM resolution escaped the installed package`,
        );
      }

      resolvedEntries.push({
        specifier: entryPoint.specifier,
        targets: entryPoint.target ?? entryPoint.targets,
        nodeResolution,
        esmResolution,
      });
    }

    packageReports.push({
      name: packageRecord.name,
      version: packageJson.version,
      installedPath: path.relative(consumerDirectory, packagePath).replaceAll("\\", "/"),
      symlink: false,
      resolvedEntries,
    });
  }

  return packageReports;
}

function verifyConsumerBuild() {
  runNpm(["run", "typecheck"], { cwd: consumerDirectory });
  runNpm(["run", "build"], { cwd: consumerDirectory });

  const assetsDirectory = path.join(consumerDirectory, "dist/assets");
  const cssFiles = readdirSync(assetsDirectory)
    .filter((file) => file.endsWith(".css"))
    .map((file) => path.join(assetsDirectory, file));
  const cssText = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert(cssFiles.length > 0, "beta consumer build did not emit CSS");
  assert(
    cssText.includes("--vf-"),
    "beta consumer build CSS is missing shared --vf-* variables",
  );
  return cssFiles.map((file) =>
    path.relative(consumerDirectory, file).replaceAll("\\", "/"),
  );
}

const startedAt = new Date().toISOString();
let finalStatus = "failed";
let finalError = null;
let tarballReports = [];
let installedPackageReports = [];
let cssAssets = [];

try {
  const contractFailures = verifyBetaPackageContract();
  assert(!contractFailures.length, contractFailures.join("\n"));
  const contract = buildBetaPackageContract();

  prepareOutput();
  record(
    `Verifying ${contract.releaseGroup.packageCount} packages from ${contract.releaseGroup.id}@${contract.releaseGroup.version}.`,
  );

  const tarballs = buildAndPack(contract);
  tarballReports = tarballs.map(({ report }) => report);
  writeJson(tarballReportPath, {
    schemaVersion: 1,
    task: "BT-8003",
    releaseGroup: contract.releaseGroup,
    generatedAt: new Date().toISOString(),
    packages: tarballReports,
  });

  installConsumerDependencies();
  installTarballsOffline(tarballs);
  installedPackageReports = verifyInstalledPackages(contract);
  cssAssets = verifyConsumerBuild();

  finalStatus = "passed";
  record("BT-8003 package artifact verification passed.");
} catch (error) {
  finalError = error instanceof Error ? error.message : String(error);
  record(`BT-8003 package artifact verification failed: ${finalError}`);
  process.exitCode = 1;
} finally {
  cleanupConsumer();
  rmSync(tarballDirectory, { force: true, recursive: true });
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(consumerLogPath, `${logLines.join("\n")}\n`);
  writeJson(consumerReportPath, {
    schemaVersion: 1,
    task: "BT-8003",
    status: finalStatus,
    startedAt,
    completedAt: new Date().toISOString(),
    releaseGroup: "non-grid-beta",
    offlineVyrnForgeInstall: true,
    workspaceLinks: false,
    typecheck: finalStatus === "passed" ? "passed" : "not-passed",
    productionBuild: finalStatus === "passed" ? "passed" : "not-passed",
    cssAssets,
    packages: installedPackageReports,
    cleanup: {
      consumerNodeModulesRemoved: !existsSync(
        path.join(consumerDirectory, "node_modules"),
      ),
      consumerDistRemoved: !existsSync(path.join(consumerDirectory, "dist")),
      generatedLockfileRemoved: !existsSync(
        path.join(consumerDirectory, "package-lock.json"),
      ),
      tarballsRemoved: !existsSync(tarballDirectory),
    },
    ...(finalError ? { error: finalError } : {}),
  });
}

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const consumerDir = path.join(root, "tests/package-consumer");
const tempPackageDir = path.join(consumerDir, ".tmp-packages");
const npmCliPath = process.env.npm_execpath;
const licenseValue = "SEE LICENSE IN LICENSE";

const packages = [
  { name: "@vyrnforge/ui-core", dir: "packages/ui-core", css: true },
  { name: "@vyrnforge/ui-behaviors", dir: "packages/ui-behaviors", css: false },
  {
    name: "@vyrnforge/ui-components",
    dir: "packages/ui-components",
    css: true,
  },
  { name: "@vyrnforge/ui-elements", dir: "packages/ui-elements", css: true },
  { name: "@vyrnforge/ui-data-grid", dir: "packages/ui-data-grid", css: true },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
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

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function removeGeneratedConsumerOutput() {
  for (const target of [
    "node_modules",
    "dist",
    "package-lock.json",
    ".tmp-packages",
  ]) {
    rmSync(path.join(consumerDir, target), { force: true, recursive: true });
  }
}

function scanForbiddenImports() {
  const sourceFiles = readdirSync(path.join(consumerDir, "src"), {
    recursive: true,
  })
    .filter((file) => /\.(ts|tsx|js|jsx|css)$/.test(file.toString()))
    .map((file) => path.join(consumerDir, "src", file.toString()));
  const forbiddenPatterns = [
    /packages\/[^"']*\/src/i,
    /\.\.\/\.\.\/packages/i,
    /@vyrnforge\/[^"']*\/src/i,
  ];

  for (const file of sourceFiles) {
    const text = readFileSync(file, "utf8");
    assert(
      !forbiddenPatterns.some((pattern) => pattern.test(text)),
      `consumer source uses forbidden package/source import in ${path.relative(root, file)}`,
    );
  }

  const tsconfig = readJson(path.join(consumerDir, "tsconfig.json"));
  assert(
    !tsconfig.compilerOptions?.paths,
    "consumer tsconfig must not use TypeScript path aliases",
  );
}

function packPackages() {
  mkdirSync(tempPackageDir, { recursive: true });

  return packages.map((packageInfo) => {
    const packageDir = path.join(root, packageInfo.dir);
    const output = runNpm(
      ["pack", "--pack-destination", tempPackageDir, "--json"],
      {
        cwd: packageDir,
      },
    );
    const [packInfo] = JSON.parse(output);
    const tarballPath = path.join(tempPackageDir, packInfo.filename);
    assert(
      existsSync(tarballPath),
      `${packageInfo.name}: tarball was not created`,
    );

    return {
      ...packageInfo,
      filename: packInfo.filename,
      tarballPath,
    };
  });
}

function verifyInstalledPackage(packageInfo) {
  const packagePath = path.join(
    consumerDir,
    "node_modules",
    ...packageInfo.name.split("/"),
  );
  const packageJsonPath = path.join(packagePath, "package.json");
  const packageJson = readJson(packageJsonPath);
  const packageStats = lstatSync(packagePath);
  const consumerRequire = createRequire(path.join(consumerDir, "package.json"));
  const resolvedRuntime = consumerRequire.resolve(packageInfo.name);
  const cssEntry = `${packageInfo.name}/styles/index.css`;
  const resolvedCss = packageInfo.css
    ? consumerRequire.resolve(cssEntry)
    : undefined;

  assert(
    !packageStats.isSymbolicLink(),
    `${packageInfo.name}: installed package must not be a symlink`,
  );
  assert(
    packagePath.startsWith(path.join(consumerDir, "node_modules")),
    `${packageInfo.name}: package is outside consumer node_modules`,
  );
  assert(
    packageJson.name === packageInfo.name,
    `${packageInfo.name}: installed package name mismatch`,
  );
  assert(
    packageJson.version ===
      readJson(path.join(root, packageInfo.dir, "package.json")).version,
    `${packageInfo.name}: installed version mismatch`,
  );
  assert(
    packageJson.license === licenseValue,
    `${packageInfo.name}: installed license mismatch`,
  );
  assert(
    packageJson.exports?.["."]?.types === "./dist/index.d.ts",
    `${packageInfo.name}: missing root type export`,
  );
  assert(
    packageJson.exports?.["."]?.import === "./dist/index.js",
    `${packageInfo.name}: missing root ESM export`,
  );
  assert(
    packageJson.exports?.["."]?.require === "./dist/index.cjs",
    `${packageInfo.name}: missing root CJS export`,
  );
  if (packageInfo.css)
    assert(
      packageJson.exports?.["./styles/index.css"] === "./dist/index.css",
      `${packageInfo.name}: missing CSS export`,
    );
  assert(
    Array.isArray(packageJson.files) &&
      packageJson.files.includes("dist") &&
      packageJson.files.includes("README.md"),
    `${packageInfo.name}: files whitelist mismatch`,
  );
  assert(
    existsSync(path.join(packagePath, "LICENSE")),
    `${packageInfo.name}: installed LICENSE missing`,
  );
  assert(
    existsSync(path.join(packagePath, "dist/index.js")),
    `${packageInfo.name}: runtime file missing`,
  );
  assert(
    existsSync(path.join(packagePath, "dist/index.cjs")),
    `${packageInfo.name}: CJS runtime file missing`,
  );
  assert(
    existsSync(path.join(packagePath, "dist/index.d.ts")),
    `${packageInfo.name}: declaration file missing`,
  );
  if (packageInfo.css)
    assert(
      existsSync(path.join(packagePath, "dist/index.css")),
      `${packageInfo.name}: CSS file missing`,
    );
  assert(
    resolvedRuntime.startsWith(packagePath),
    `${packageInfo.name}: runtime resolves outside installed package`,
  );
  if (resolvedCss)
    assert(
      resolvedCss.startsWith(packagePath),
      `${packageInfo.name}: CSS resolves outside installed package`,
    );

  console.log(`CONSUMER ${packageInfo.name}`);
  console.log(`  tarball: ${packageInfo.filename}`);
  console.log(`  installedPath: ${packagePath}`);
  console.log("  symlink: false");
  console.log(`  version: ${packageJson.version}`);
  console.log(`  license: ${packageJson.license}`);
  console.log(
    `  runtime: ${path.relative(consumerDir, resolvedRuntime).replaceAll("\\", "/")}`,
  );
  console.log(
    `  css: ${resolvedCss ? path.relative(consumerDir, resolvedCss).replaceAll("\\", "/") : "not-applicable"}`,
  );
  console.log("  LICENSE: present");
}

function verifyBuiltCss() {
  const assetsDir = path.join(consumerDir, "dist/assets");
  const cssFiles = readdirSync(assetsDir)
    .filter((file) => file.endsWith(".css"))
    .map((file) => path.join(assetsDir, file));
  const cssText = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assert(cssFiles.length > 0, "consumer build did not emit CSS assets");
  assert(
    cssText.includes("--vf-"),
    "consumer build CSS is missing shared --vf-* variables",
  );
  assert(
    cssText.includes("--udg-"),
    "consumer build CSS is missing grid --udg-* variables",
  );
}

try {
  assert(
    existsSync(path.join(consumerDir, "package.json")),
    "missing tests/package-consumer/package.json",
  );
  scanForbiddenImports();
  removeGeneratedConsumerOutput();

  console.log("Building and verifying publishable packages...");
  runNpm(["run", "verify:packages"], { stdio: "inherit" });

  console.log("Creating local package tarballs...");
  const tarballs = packPackages();

  console.log("Installing consumer dependencies...");
  runNpm(["install", "--no-package-lock"], {
    cwd: consumerDir,
    stdio: "inherit",
  });

  console.log("Installing VyrnForge packages from tarballs...");
  runNpm(
    [
      "install",
      "--no-package-lock",
      "--no-save",
      ...tarballs.map((tarball) => tarball.tarballPath),
    ],
    {
      cwd: consumerDir,
      stdio: "inherit",
    },
  );

  for (const packageInfo of tarballs) {
    verifyInstalledPackage(packageInfo);
  }

  console.log("Running consumer typecheck...");
  runNpm(["run", "typecheck"], { cwd: consumerDir, stdio: "inherit" });

  console.log("Running consumer production build...");
  runNpm(["run", "build"], { cwd: consumerDir, stdio: "inherit" });

  verifyBuiltCss();
  console.log("Consumer CSS contains --vf-* and --udg-* variables.");
  console.log("External consumer verification passed.");
} finally {
  removeGeneratedConsumerOutput();
}

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;

const packages = [
  {
    name: "@vyrnforge/ui-core",
    dir: "packages/ui-core",
    dependencies: []
  },
  {
    name: "@vyrnforge/ui-components",
    dir: "packages/ui-components",
    dependencies: ["@vyrnforge/ui-core"],
    peers: ["react", "react-dom"]
  },
  {
    name: "@vyrnforge/ui-data-grid",
    dir: "packages/ui-data-grid",
    dependencies: ["@vyrnforge/ui-core", "@vyrnforge/ui-components"],
    peers: ["react", "react-dom"]
  }
];

const requiredDistFiles = [
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
  "dist/index.css"
];

const forbiddenFilePatterns = [
  /^src\//,
  /\.test\./,
  /\.spec\./,
  /\.stories\./,
  /\.tsbuildinfo$/,
  /\.log$/,
  /\.env$/,
  /\.tgz$/,
  /\.zip$/
];

const forbiddenDependencyPatterns = [
  /@mui/,
  /tailwind/i,
  /radix/i,
  /tanstack/i,
  /redux/i,
  /zustand/i,
  /chakra/i,
  /antd/i,
  /mantine/i,
  /styled-components/i,
  /emotion/i
];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

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
    ...options
  });
}

function runNpm(args, options = {}) {
  if (npmCliPath) {
    return run(process.execPath, [npmCliPath, ...args], options);
  }

  return run("npm", args, {
    shell: process.platform === "win32",
    ...options
  });
}

console.log("Building packages from clean generated output...");
runNpm(["run", "build:packages"], {
  stdio: "inherit"
});

const packageByName = new Map(
  packages.map((packageInfo) => [
    packageInfo.name,
    readJson(path.join(root, packageInfo.dir, "package.json"))
  ])
);
const rootPackageJson = readJson(path.join(root, "package.json"));
const licenseValue = "SEE LICENSE IN LICENSE";
const releaseVersion =
  process.env.VYRNFORGE_RELEASE_VERSION ??
  packageByName.get("@vyrnforge/ui-core").version;
const rootLicensePath = path.join(root, "LICENSE");
const rootLicenseText = readFileSync(rootLicensePath, "utf8");
const conflictingSpdxLicenses = new Set(["MIT", "Apache-2.0", "GPL-2.0", "GPL-3.0", "AGPL-3.0", "ISC"]);
const localDependencySpecPattern = /^(?:workspace:|file:|link:|\.{1,2}(?:[\\/]|$)|[A-Za-z]:[\\/]|\/)/;
const unpublishedReadmePatterns = [
  /has not been published to npm/i,
  /is not yet published/i,
  /prepared as (?:the )?.*candidate,? but (?:it )?has not been published/i,
  /candidate,? but it has not been published/i
];

assert(rootPackageJson.license === licenseValue, `root package.json: license must be ${licenseValue}`);
assert(rootPackageJson.private === true, "root package.json: monorepo root must remain private");

for (const packageInfo of packages) {
  const packageDir = path.join(root, packageInfo.dir);
  const packageJson = packageByName.get(packageInfo.name);
  const packageLicensePath = path.join(packageDir, "LICENSE");

  assert(packageJson.name === packageInfo.name, `${packageInfo.name}: package name mismatch`);
  assert(packageJson.version === releaseVersion, `${packageInfo.name}: version must be ${releaseVersion}`);
  assert(!Object.hasOwn(packageJson, "private"), `${packageInfo.name}: publishable package must not declare private`);
  assert(typeof packageJson.description === "string" && packageJson.description.length > 0, `${packageInfo.name}: missing description`);
  assert(packageJson.license === licenseValue, `${packageInfo.name}: license must be ${licenseValue}`);
  assert(!conflictingSpdxLicenses.has(packageJson.license), `${packageInfo.name}: package uses conflicting SPDX license ${packageJson.license}`);
  assert(packageJson.main === "./dist/index.cjs", `${packageInfo.name}: unexpected main`);
  assert(packageJson.module === "./dist/index.js", `${packageInfo.name}: unexpected module`);
  assert(packageJson.types === "./dist/index.d.ts", `${packageInfo.name}: unexpected types`);
  assert(Array.isArray(packageJson.files) && packageJson.files.includes("dist") && packageJson.files.includes("README.md"), `${packageInfo.name}: files whitelist must include only dist and README.md`);
  assert(packageJson.files.length === 2, `${packageInfo.name}: files whitelist is too broad`);
  assert(Array.isArray(packageJson.sideEffects) && packageJson.sideEffects.includes("./dist/index.css"), `${packageInfo.name}: CSS sideEffects must include ./dist/index.css`);
  assert(packageJson.repository?.url === "git+https://github.com/vyrnforge/vyrnforge-ui.git", `${packageInfo.name}: missing repository URL`);
  assert(packageJson.repository?.directory === packageInfo.dir, `${packageInfo.name}: missing repository directory`);
  assert(packageJson.bugs?.url === "https://github.com/vyrnforge/vyrnforge-ui/issues", `${packageInfo.name}: missing bugs URL`);
  assert(packageJson.publishConfig?.access === "public", `${packageInfo.name}: missing public publishConfig access`);
  assert(packageJson.engines?.node === ">=22.12 <25", `${packageInfo.name}: node engine mismatch`);
  assert(packageJson.engines?.npm === ">=11.16 <12", `${packageInfo.name}: npm engine mismatch`);
  assert(existsSync(packageLicensePath), `${packageInfo.name}: missing top-level LICENSE`);
  assert(readFileSync(packageLicensePath, "utf8") === rootLicenseText, `${packageInfo.name}: package LICENSE must exactly match root LICENSE`);
  const readmeText = readFileSync(path.join(packageDir, "README.md"), "utf8");
  assert(
    !unpublishedReadmePatterns.some((pattern) => pattern.test(readmeText)),
    `${packageInfo.name}: README must not claim the package is unpublished`
  );

  for (const distFile of requiredDistFiles) {
    assert(existsSync(path.join(packageDir, distFile)), `${packageInfo.name}: missing ${distFile}`);
  }

  assert(!existsSync(path.join(packageDir, "dist/index.js.map")), `${packageInfo.name}: source maps are not part of the supported package artifact`);
  assert(!existsSync(path.join(packageDir, "dist/index.cjs.map")), `${packageInfo.name}: source maps are not part of the supported package artifact`);

  const exportsMap = packageJson.exports ?? {};
  assert(exportsMap["."]?.types === "./dist/index.d.ts", `${packageInfo.name}: root export types mismatch`);
  assert(exportsMap["."]?.import === "./dist/index.js", `${packageInfo.name}: root export import mismatch`);
  assert(exportsMap["."]?.require === "./dist/index.cjs", `${packageInfo.name}: root export require mismatch`);
  assert(exportsMap["./styles/index.css"] === "./dist/index.css", `${packageInfo.name}: styles export mismatch`);

  for (const [exportKey, exportValue] of Object.entries(exportsMap)) {
    const targets = typeof exportValue === "string" ? [exportValue] : Object.values(exportValue);
    for (const target of targets) {
      assert(typeof target === "string", `${packageInfo.name}: unsupported export target for ${exportKey}`);
      assert(!target.includes("/src/") && !target.startsWith("./src"), `${packageInfo.name}: public export points at src`);
      assert(existsSync(path.join(packageDir, target)), `${packageInfo.name}: export target missing ${target}`);
    }
  }

  const allDependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
    ...(packageJson.peerDependencies ?? {})
  };

  for (const dependencyName of Object.keys(allDependencies)) {
    assert(!forbiddenDependencyPatterns.some((pattern) => pattern.test(dependencyName)), `${packageInfo.name}: forbidden dependency ${dependencyName}`);
  }

  for (const dependencyGroup of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [dependencyName, dependencySpec] of Object.entries(packageJson[dependencyGroup] ?? {})) {
      assert(
        typeof dependencySpec === "string" && !localDependencySpecPattern.test(dependencySpec),
        `${packageInfo.name}: packed manifest dependency ${dependencyName} must not use workspace or local spec ${String(dependencySpec)}`
      );
    }
  }

  for (const dependencyName of packageInfo.dependencies) {
    assert(packageJson.dependencies?.[dependencyName] === packageByName.get(dependencyName).version, `${packageInfo.name}: internal dependency ${dependencyName} must match workspace version`);
  }

  for (const peerName of packageInfo.peers ?? []) {
    assert(packageJson.peerDependencies?.[peerName] === ">=18 <20", `${packageInfo.name}: peer dependency ${peerName} must be >=18 <20`);
    assert(packageJson.devDependencies?.[peerName], `${packageInfo.name}: missing dev copy for peer ${peerName}`);
  }

  const distFiles = ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/index.css"];
  for (const distFile of distFiles) {
    const text = readFileSync(path.join(packageDir, distFile), "utf8");
    assert(!/[A-Za-z]:\\\\|C:\\\\|D:\\\\|\/home\/runner|\/Users\//.test(text), `${packageInfo.name}: local absolute path leaked in ${distFile}`);
  }

  const packOutput = runNpm(["pack", "--dry-run", "--json"], { cwd: packageDir });
  const [packInfo] = JSON.parse(packOutput);
  const files = packInfo.files.map((file) => file.path);

  assert(packInfo.version === releaseVersion, `${packageInfo.name}: packed manifest version must be ${releaseVersion}`);

  for (const file of ["package.json", "README.md", "LICENSE", ...requiredDistFiles]) {
    assert(files.includes(file), `${packageInfo.name}: npm pack missing ${file}`);
  }

  for (const file of files) {
    assert(!forbiddenFilePatterns.some((pattern) => pattern.test(file)), `${packageInfo.name}: npm pack includes unexpected file ${file}`);
    const generatedDeclarationSupport = file.startsWith("dist/") && file.endsWith(".d.ts");
    assert(
      file === "LICENSE" || generatedDeclarationSupport || !/(legal|draft|internal|confidential)/i.test(file),
      `${packageInfo.name}: npm pack includes unexpected legal/internal file ${file}`
    );
  }

  console.log(`PACK ${packageInfo.name}`);
  console.log(`  version: ${packageJson.version}`);
  console.log(`  package: ${packInfo.filename}`);
  console.log(`  packedSize: ${packInfo.size}`);
  console.log(`  unpackedSize: ${packInfo.unpackedSize}`);
  console.log(`  files: ${files.join(", ")}`);
  console.log(`  license: ${packageJson.license}`);
}

console.log("Package verification passed.");

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;
const packageInfos = [
  { name: "@vyrnforge/ui-core", dependencies: [] },
  { name: "@vyrnforge/ui-components", dependencies: ["@vyrnforge/ui-core"] },
  {
    name: "@vyrnforge/ui-data-grid",
    dependencies: ["@vyrnforge/ui-core", "@vyrnforge/ui-components"]
  }
];
const requiredFiles = [
  "LICENSE",
  "README.md",
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
  "dist/index.css"
];
const rootLock = JSON.parse(readFileSync(path.join(root, "package-lock.json"), "utf8"));

function lockedVersion(packageName) {
  const key = `node_modules/${packageName}`;
  const version = rootLock.packages?.[key]?.version;
  assert(version, `package-lock.json is missing ${packageName}`);
  return version;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
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
  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

function npmJson(args, options = {}) {
  return JSON.parse(runNpm([...args, "--json", "--registry=https://registry.npmjs.org"], options));
}

function verifyBuiltCss(consumerDir) {
  const assetsDir = path.join(consumerDir, "dist/assets");
  const cssFiles = readdirSync(assetsDir)
    .filter((file) => file.endsWith(".css"))
    .map((file) => path.join(assetsDir, file));
  const cssText = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert(cssFiles.length > 0, "registry consumer build did not emit CSS");
  assert(cssText.includes("--vf-"), "registry consumer CSS is missing --vf-* variables");
  assert(cssText.includes("--udg-"), "registry consumer CSS is missing --udg-* variables");
}

const version = readArgument("--version");
const distTag = readArgument("--dist-tag");
assert(version, "missing --version");
assert(distTag, "missing --dist-tag");

const metadata = new Map();
for (const packageInfo of packageInfos) {
  const packageMetadata = npmJson(["view", `${packageInfo.name}@${version}`]);
  const tags = npmJson(["view", packageInfo.name, "dist-tags"]);
  assert(packageMetadata.name === packageInfo.name, `${packageInfo.name}: registry name mismatch`);
  assert(packageMetadata.version === version, `${packageInfo.name}: registry version mismatch`);
  assert(packageMetadata.license === "SEE LICENSE IN LICENSE", `${packageInfo.name}: registry license mismatch`);
  assert(
    packageMetadata.dist?.attestations?.url,
    `${packageInfo.name}: npm provenance attestation metadata is missing`
  );
  assert(tags[distTag] === version, `${packageInfo.name}: ${distTag} must resolve to ${version}`);
  for (const dependency of packageInfo.dependencies) {
    assert(
      packageMetadata.dependencies?.[dependency] === version,
      `${packageInfo.name}: ${dependency} must resolve exactly to ${version}`
    );
  }
  metadata.set(packageInfo.name, { packageMetadata, tags });
}

const tempRoot = mkdtempSync(path.join(tmpdir(), "vyrnforge-registry-consumer-"));
try {
  for (const target of ["src", "index.html", "tsconfig.json", "vite.config.ts"]) {
    cpSync(path.join(root, "tests/package-consumer", target), path.join(tempRoot, target), {
      recursive: true
    });
  }

  const fixturePackage = JSON.parse(
    readFileSync(path.join(root, "tests/package-consumer/package.json"), "utf8")
  );
  fixturePackage.dependencies = {
    ...(fixturePackage.dependencies ?? {}),
    react: lockedVersion("react"),
    "react-dom": lockedVersion("react-dom"),
    "@vyrnforge/ui-core": version,
    "@vyrnforge/ui-components": version,
    "@vyrnforge/ui-data-grid": version
  };
  fixturePackage.devDependencies = {
    ...(fixturePackage.devDependencies ?? {}),
    "@types/react": lockedVersion("@types/react"),
    "@types/react-dom": lockedVersion("@types/react-dom"),
    typescript: lockedVersion("typescript"),
    vite: lockedVersion("vite")
  };
  writeFileSync(path.join(tempRoot, "package.json"), `${JSON.stringify(fixturePackage, null, 2)}\n`);

  runNpm(["install"], { cwd: tempRoot, stdio: "inherit" });
  runNpm(["audit", "signatures", "--registry=https://registry.npmjs.org"], {
    cwd: tempRoot,
    stdio: "inherit"
  });

  const consumerRequire = createRequire(path.join(tempRoot, "package.json"));
  for (const packageInfo of packageInfos) {
    const installedPath = path.join(tempRoot, "node_modules", ...packageInfo.name.split("/"));
    const installedPackage = JSON.parse(readFileSync(path.join(installedPath, "package.json"), "utf8"));
    assert(!lstatSync(installedPath).isSymbolicLink(), `${packageInfo.name}: registry install is a symlink`);
    assert(installedPackage.version === version, `${packageInfo.name}: installed registry version mismatch`);
    for (const requiredFile of requiredFiles) {
      assert(existsSync(path.join(installedPath, requiredFile)), `${packageInfo.name}: missing ${requiredFile}`);
    }
    assert(
      consumerRequire.resolve(packageInfo.name).startsWith(installedPath),
      `${packageInfo.name}: runtime resolves outside registry package`
    );
    assert(
      consumerRequire.resolve(`${packageInfo.name}/styles/index.css`).startsWith(installedPath),
      `${packageInfo.name}: CSS resolves outside registry package`
    );
  }

  runNpm(["run", "typecheck"], { cwd: tempRoot, stdio: "inherit" });
  runNpm(["run", "build"], { cwd: tempRoot, stdio: "inherit" });
  verifyBuiltCss(tempRoot);

  console.log(`Registry signatures and provenance attestations passed: ${version}`);
  console.log(`Registry release verification passed: ${version} (${distTag})`);
  for (const packageInfo of packageInfos) {
    const tags = metadata.get(packageInfo.name).tags;
    console.log(`${packageInfo.name}: ${distTag}=${tags[distTag]}, latest=${tags.latest ?? "absent"}`);
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

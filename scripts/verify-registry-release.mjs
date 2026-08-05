import { execFileSync } from "node:child_process";
import {
  cpSync,
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
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
} from "./release-groups.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCliPath = process.env.npm_execpath;
const commonRequiredFiles = [
  "LICENSE",
  "README.md",
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
];
const rootLock = JSON.parse(
  readFileSync(path.join(root, "package-lock.json"), "utf8"),
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function lockedVersion(packageName) {
  const key = `node_modules/${packageName}`;
  const version = rootLock.packages?.[key]?.version;
  assert(version, `package-lock.json is missing ${packageName}`);
  return version;
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

function npmJson(args, options = {}) {
  return JSON.parse(
    runNpm(
      [...args, "--json", "--registry=https://registry.npmjs.org"],
      options,
    ),
  );
}

function dependencyClosure(releaseGroup, packageMap) {
  const names = new Set();
  const visit = (packageName) => {
    if (names.has(packageName)) return;
    names.add(packageName);
    const packageInfo = packageMap.get(packageName);
    for (const dependencyName of Object.keys(packageInfo?.dependencies ?? {})) {
      if (packageMap.has(dependencyName)) visit(dependencyName);
    }
  };
  for (const packageInfo of releaseGroup.packages) visit(packageInfo.name);
  return [...names].map((packageName) => packageMap.get(packageName));
}

function verifyBuiltCss(consumerDir, requireGridCss) {
  const assetsDir = path.join(consumerDir, "dist/assets");
  const cssFiles = readdirSync(assetsDir)
    .filter((file) => file.endsWith(".css"))
    .map((file) => path.join(assetsDir, file));
  const cssText = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert(cssFiles.length > 0, "registry consumer build did not emit CSS");
  assert(
    cssText.includes("--vf-"),
    "registry consumer CSS is missing --vf-* variables",
  );
  if (requireGridCss) {
    assert(
      cssText.includes("--udg-"),
      "registry consumer CSS is missing --udg-* variables",
    );
  }
}

function consumerSource(releaseGroupId) {
  if (releaseGroupId === "data-grid-alpha") {
    return `import React from "react";
import { createRoot } from "react-dom/client";
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
import { UniversalDataGrid } from "@vyrnforge/ui-data-grid";

const rows = [{ id: "row-1", name: "Registry verification" }];
const columns = [
  { id: "id", header: "ID", accessorKey: "id" },
  { id: "name", header: "Name", accessorKey: "name" },
];

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Registry consumer root element is missing.");
}

createRoot(rootElement).render(
  <UniversalDataGrid
    tableId="registry-grid"
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
  "registry-consumer",
  { package: "@vyrnforge/ui-behaviors" },
  "programmatic",
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Registry consumer root element is missing.");
}

createRoot(rootElement).render(
  <Card data-reason={event.reason}>
    <Stack gap="sm">
      <Button>Registry verification</Button>
      {React.createElement("vf-button", null, "Native verification")}
    </Stack>
  </Card>,
);
`;
}

const releaseGroupId = readArgument("--release-group");
const version = readArgument("--version");
const distTag = readArgument("--dist-tag");
assert(releaseGroupId, "missing --release-group");
assert(version, "missing --version");
assert(distTag, "missing --dist-tag");

const manifest = readReleaseGroups({ root });
const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
const packageMap = getReleasePackageMap(manifest);
assert(version === releaseGroup.version, `${releaseGroupId} version mismatch`);
assert(distTag === releaseGroup.distTag, `${releaseGroupId} dist-tag mismatch`);

const selectedNames = new Set(
  releaseGroup.packages.map((packageInfo) => packageInfo.name),
);
const closurePackages = dependencyClosure(releaseGroup, packageMap);
const metadata = new Map();
for (const packageInfo of closurePackages) {
  const packageMetadata = npmJson([
    "view",
    `${packageInfo.name}@${packageInfo.version}`,
  ]);
  const tags = npmJson(["view", packageInfo.name, "dist-tags"]);
  assert(
    packageMetadata.name === packageInfo.name,
    `${packageInfo.name}: registry name mismatch`,
  );
  assert(
    packageMetadata.version === packageInfo.version,
    `${packageInfo.name}: registry version mismatch`,
  );
  assert(
    packageMetadata.license === "SEE LICENSE IN LICENSE",
    `${packageInfo.name}: registry license mismatch`,
  );
  assert(
    packageMetadata.dist?.attestations?.url,
    `${packageInfo.name}: npm provenance attestation metadata is missing`,
  );
  if (selectedNames.has(packageInfo.name)) {
    assert(
      tags[distTag] === packageInfo.version,
      `${packageInfo.name}: ${distTag} must resolve to ${packageInfo.version}`,
    );
  }
  for (const [dependencyName, dependencyVersion] of Object.entries(
    packageInfo.dependencies ?? {},
  )) {
    assert(
      packageMetadata.dependencies?.[dependencyName] === dependencyVersion,
      `${packageInfo.name}: ${dependencyName} must resolve exactly to ${dependencyVersion}`,
    );
  }
  metadata.set(packageInfo.name, { packageMetadata, tags });
}

const tempRoot = mkdtempSync(
  path.join(tmpdir(), "vyrnforge-registry-consumer-"),
);
try {
  for (const target of ["index.html", "tsconfig.json", "vite.config.ts"]) {
    cpSync(
      path.join(root, "tests/package-consumer", target),
      path.join(tempRoot, target),
    );
  }
  mkdirSync(path.join(tempRoot, "src"), { recursive: true });
  writeFileSync(
    path.join(tempRoot, "src/main.tsx"),
    consumerSource(releaseGroupId),
  );
  writeFileSync(
    path.join(tempRoot, "src/vite-env.d.ts"),
    '/// <reference types="vite/client" />\n',
  );

  const fixturePackage = JSON.parse(
    readFileSync(
      path.join(root, "tests/package-consumer/package.json"),
      "utf8",
    ),
  );
  fixturePackage.dependencies = {
    react: lockedVersion("react"),
    "react-dom": lockedVersion("react-dom"),
    ...Object.fromEntries(
      closurePackages.map((packageInfo) => [
        packageInfo.name,
        packageInfo.version,
      ]),
    ),
  };
  fixturePackage.devDependencies = {
    ...(fixturePackage.devDependencies ?? {}),
    "@types/react": lockedVersion("@types/react"),
    "@types/react-dom": lockedVersion("@types/react-dom"),
    typescript: lockedVersion("typescript"),
    vite: lockedVersion("vite"),
  };
  writeFileSync(
    path.join(tempRoot, "package.json"),
    `${JSON.stringify(fixturePackage, null, 2)}\n`,
  );

  runNpm(["install"], { cwd: tempRoot, stdio: "inherit" });
  runNpm(["audit", "signatures", "--registry=https://registry.npmjs.org"], {
    cwd: tempRoot,
    stdio: "inherit",
  });

  const consumerRequire = createRequire(path.join(tempRoot, "package.json"));
  for (const packageInfo of closurePackages) {
    const installedPath = path.join(
      tempRoot,
      "node_modules",
      ...packageInfo.name.split("/"),
    );
    const installedPackage = JSON.parse(
      readFileSync(path.join(installedPath, "package.json"), "utf8"),
    );
    assert(
      !lstatSync(installedPath).isSymbolicLink(),
      `${packageInfo.name}: registry install is a symlink`,
    );
    assert(
      installedPackage.version === packageInfo.version,
      `${packageInfo.name}: installed registry version mismatch`,
    );
    for (const requiredFile of commonRequiredFiles) {
      assert(
        existsSync(path.join(installedPath, requiredFile)),
        `${packageInfo.name}: missing ${requiredFile}`,
      );
    }
    if (packageInfo.hasCss) {
      assert(
        existsSync(path.join(installedPath, "dist/index.css")),
        `${packageInfo.name}: missing dist/index.css`,
      );
      assert(
        consumerRequire
          .resolve(`${packageInfo.name}/styles/index.css`)
          .startsWith(installedPath),
        `${packageInfo.name}: CSS resolves outside registry package`,
      );
    }
    assert(
      consumerRequire.resolve(packageInfo.name).startsWith(installedPath),
      `${packageInfo.name}: runtime resolves outside registry package`,
    );
  }

  runNpm(["run", "typecheck"], { cwd: tempRoot, stdio: "inherit" });
  runNpm(["run", "build"], { cwd: tempRoot, stdio: "inherit" });
  verifyBuiltCss(tempRoot, releaseGroupId === "data-grid-alpha");

  console.log(
    `Registry signatures and provenance attestations passed: ${releaseGroupId} ${version}`,
  );
  console.log(
    `Registry release verification passed: ${releaseGroupId} ${version} (${distTag})`,
  );
  for (const packageInfo of releaseGroup.packages) {
    const tags = metadata.get(packageInfo.name).tags;
    console.log(
      `${packageInfo.name}: ${distTag}=${tags[distTag]}, latest=${tags.latest ?? "absent"}`,
    );
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

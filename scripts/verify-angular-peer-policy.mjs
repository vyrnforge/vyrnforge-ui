import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const ANGULAR_PEER_RANGE = ">=22 <23";
const RXJS_PEER_RANGE = "^6.5.3 || ^7.4.0";
const TSLIB_DEPENDENCY_RANGE = "^2.8.1";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));

const angularManifest = await readJson("packages/ui-angular/package.json");
const sharedManifests = await Promise.all(
  ["ui-core", "ui-behaviors", "ui-elements"].map((name) =>
    readJson(`packages/${name}/package.json`),
  ),
);

assert.equal(
  angularManifest.peerDependencies?.["@angular/core"],
  ANGULAR_PEER_RANGE,
  `@vyrnforge/ui-angular must declare @angular/core peer ${ANGULAR_PEER_RANGE}`,
);
assert.equal(
  angularManifest.peerDependencies?.["@angular/forms"],
  ANGULAR_PEER_RANGE,
  `@vyrnforge/ui-angular must declare @angular/forms peer ${ANGULAR_PEER_RANGE}`,
);
assert.equal(
  angularManifest.peerDependenciesMeta?.["@angular/forms"]?.optional,
  true,
  "@angular/forms must remain an optional peer until Forms integration is used",
);
assert.notEqual(
  angularManifest.peerDependenciesMeta?.["@angular/core"]?.optional,
  true,
  "@angular/core is a required peer for the Angular facade",
);
assert.equal(
  angularManifest.peerDependencies?.rxjs,
  RXJS_PEER_RANGE,
  `@vyrnforge/ui-angular must declare RxJS peer ${RXJS_PEER_RANGE}`,
);
assert.equal(
  angularManifest.dependencies?.tslib,
  TSLIB_DEPENDENCY_RANGE,
  `@vyrnforge/ui-angular must ship tslib ${TSLIB_DEPENDENCY_RANGE}`,
);

assert.deepEqual(
  angularManifest.exports?.["./forms"],
  {
    types: "./dist/forms.d.ts",
    import: "./dist/forms.js",
    default: "./dist/forms.js",
  },
  "@vyrnforge/ui-angular/forms must be a dedicated optional Forms entrypoint",
);

for (const runtimeName of ["@angular/core", "@angular/forms", "rxjs"]) {
  assert.equal(
    angularManifest.dependencies?.[runtimeName],
    undefined,
    `@vyrnforge/ui-angular must not ship ${runtimeName} as a runtime dependency`,
  );
}

for (const manifest of sharedManifests) {
  for (const runtimeName of ["@angular/core", "@angular/forms", "rxjs"]) {
    assert.equal(
      manifest.dependencies?.[runtimeName],
      undefined,
      `${manifest.name} must remain independent of ${runtimeName}`,
    );
    assert.equal(
      manifest.peerDependencies?.[runtimeName],
      undefined,
      `${manifest.name} must not acquire a ${runtimeName} peer dependency`,
    );
  }
}

const packResult = JSON.parse(
  execFileSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["pack", "--workspace", "@vyrnforge/ui-angular", "--dry-run", "--json"],
    { cwd: repositoryRoot, encoding: "utf8" },
  ),
);

assert.equal(
  packResult.length,
  1,
  "Angular workspace should produce one packed artifact",
);
assert.equal(packResult[0].name, "@vyrnforge/ui-angular");

console.log(
  `Angular peer policy verified: core/forms ${ANGULAR_PEER_RANGE}, RxJS ${RXJS_PEER_RANGE}, tslib ${TSLIB_DEPENDENCY_RANGE}; optional Forms subpath; packed artifact ${packResult[0].filename}`,
);

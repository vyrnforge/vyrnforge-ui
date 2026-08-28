import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const VUE_PEER_RANGE = ">=3.5 <4";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));

const vueManifest = await readJson("packages/ui-vue/package.json");
const sharedManifests = await Promise.all(
  ["ui-core", "ui-behaviors", "ui-elements"].map((name) =>
    readJson(`packages/${name}/package.json`),
  ),
);

assert.equal(
  vueManifest.peerDependencies?.vue,
  VUE_PEER_RANGE,
  `@vyrnforge/ui-vue must declare Vue peer ${VUE_PEER_RANGE}`,
);
assert.equal(
  vueManifest.dependencies?.vue,
  undefined,
  "@vyrnforge/ui-vue must not ship Vue as a runtime dependency",
);
assert.notEqual(
  vueManifest.peerDependenciesMeta?.vue?.optional,
  true,
  "Vue is a required peer for the Vue facade",
);

for (const manifest of sharedManifests) {
  assert.equal(
    manifest.dependencies?.vue,
    undefined,
    `${manifest.name} must remain Vue-independent`,
  );
  assert.equal(
    manifest.peerDependencies?.vue,
    undefined,
    `${manifest.name} must not acquire a Vue peer dependency`,
  );
}

const packResult = JSON.parse(
  execFileSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["pack", "--workspace", "@vyrnforge/ui-vue", "--dry-run", "--json"],
    { cwd: repositoryRoot, encoding: "utf8" },
  ),
);

assert.equal(
  packResult.length,
  1,
  "Vue workspace should produce one packed artifact",
);
assert.equal(packResult[0].name, "@vyrnforge/ui-vue");

console.log(
  `Vue peer policy verified: ${VUE_PEER_RANGE}; packed artifact ${packResult[0].filename}`,
);

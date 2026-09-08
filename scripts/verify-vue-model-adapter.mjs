import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedClaim = "vue-model-adapter-verified";
const requiredFiles = [
  "docs/metadata/vue-model-adapter.json",
  "docs/testing/vue-model-adapter-contract.md",
  "packages/ui-vue/src/model.ts",
  "packages/ui-vue/src/index.ts",
  "tests/consumers/vue/src/App.vue",
  "tests/consumers/vue/fixture.json",
  "tests/consumers/manifest.json",
  "scripts/verify-consumer-foundations-runtime.mjs",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}
function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}
function fail(failures, message) {
  failures.push(message);
}

export function verifyVueModelAdapter({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) fail(failures, `required Vue model integration file is missing: ${file}`);
  }
  if (failures.length > 0) return failures.sort();

  const metadata = readJson(root, "docs/metadata/vue-model-adapter.json");
  if (metadata.status !== "verified") fail(failures, "Vue model integration status must be verified");
  if (metadata.adapter?.supportClaim !== expectedClaim) fail(failures, `Vue model support claim must be ${expectedClaim}`);
  if (metadata.adapter?.location !== "packages/ui-vue/src/model.ts") fail(failures, "Vue model integration must be owned by @vyrnforge/ui-vue");
  if (metadata.adapter?.renderer !== "@vyrnforge/ui-vue") fail(failures, "Vue model public renderer must be @vyrnforge/ui-vue");
  if (metadata.adapter?.publishedPackage !== "@vyrnforge/ui-vue") fail(failures, "Vue model metadata must point to the public package");
  if ((metadata.referenceAdapters ?? []).includes("useVyrnForgeModel")) fail(failures, "Vue metadata must not present the old fixture composable as current");

  const model = read(root, "packages/ui-vue/src/model.ts");
  for (const marker of ["useVyrnForgeModel", "watch(", "addEventListener", "removeEventListener", "options.write", "options.emit", "defaultModelEquals"]) {
    if (!model.includes(marker)) fail(failures, `package-owned Vue model bridge is missing ${marker}`);
  }
  for (const forbidden of ["innerHTML", "attachShadow", "@vyrnforge/ui-components", "@vyrnforge/ui-data-grid"]) {
    if (model.includes(forbidden)) fail(failures, `Vue model integration must not contain ${forbidden}`);
  }

  const app = read(root, "tests/consumers/vue/src/App.vue");
  for (const marker of ["v-model=\"modelOwner\"", "v-model=\"modelNotifications\"", "data-vue-model-value", "data-vue-model-checked", "vue-model-programmatic"]) {
    if (!app.includes(marker)) fail(failures, `Vue application is missing package model marker ${marker}`);
  }
  if (app.includes("./adapters/") || app.includes("useVyrnForgeModel")) fail(failures, "Vue fixture must consume package-owned models without copied adapters");

  const fixture = readJson(root, "tests/consumers/vue/fixture.json");
  if (fixture.modelAdapterDecision !== "public-package-adapter-verified") fail(failures, "Vue fixture must record package-owned model integration");
  if (fixture.modelAdapter?.supportClaim !== expectedClaim || fixture.modelAdapter?.location !== "@vyrnforge/ui-vue") fail(failures, "Vue fixture model support metadata is invalid");

  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of ["data-vue-model-value", "data-vue-model-checked", "vue-model-programmatic", "Programmatic Vue"]) {
    if (!runtime.includes(marker)) fail(failures, `Vue model runtime evidence is missing ${marker}`);
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyVueModelAdapter();
  if (failures.length > 0) {
    console.error("Vue model integration verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Vue model integration verification passed.");
  }
}

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const expectedClaim = "vue-model-adapter-verified";
const requiredFiles = [
  "docs/metadata/vue-model-adapter.json",
  "docs/testing/vue-model-adapter-contract.md",
  "tests/consumers/vue/src/adapters/useVyrnForgeModel.ts",
  "tests/consumers/vue/src/adapters/VyrnForgeTextInputModel.vue",
  "tests/consumers/vue/src/adapters/VyrnForgeCheckboxModel.vue",
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
    if (!existsSync(path.join(root, file))) {
      fail(failures, `required Vue model adapter file is missing: ${file}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  const metadata = readJson(root, "docs/metadata/vue-model-adapter.json");
  if (metadata.status !== "verified") {
    fail(failures, "Vue model adapter status must be verified");
  }
  if (metadata.adapter?.supportClaim !== expectedClaim) {
    fail(
      failures,
      `Vue model adapter support claim must be ${expectedClaim}`,
    );
  }
  if (metadata.adapter?.publishedPackage !== null) {
    fail(failures, "Vue model adapter must not publish a framework package");
  }
  if (
    metadata.adapter?.duplicatesRendering !== false ||
    metadata.adapter?.duplicatesValidation !== false
  ) {
    fail(
      failures,
      "Vue model adapter must delegate rendering and validation to native elements",
    );
  }
  for (const contract of [
    "modelValue",
    "update:modelValue",
    "vf-value-change",
    "vf-checked-change",
    "value",
    "checked",
  ]) {
    if (!(metadata.contracts ?? []).includes(contract)) {
      fail(failures, `Vue model adapter metadata is missing ${contract}`);
    }
  }

  const composable = read(
    root,
    "tests/consumers/vue/src/adapters/useVyrnForgeModel.ts",
  );
  for (const marker of [
    "watch(",
    "addEventListener",
    "removeEventListener",
    "options.write",
    "options.emit",
  ]) {
    if (!composable.includes(marker)) {
      fail(failures, `Vue model composable is missing ${marker}`);
    }
  }

  const text = read(
    root,
    "tests/consumers/vue/src/adapters/VyrnForgeTextInputModel.vue",
  );
  for (const marker of [
    "modelValue",
    "update:modelValue",
    "vf-value-change",
    "target.value",
    "<vf-text-input",
  ]) {
    if (!text.includes(marker)) {
      fail(failures, `Vue text model adapter is missing ${marker}`);
    }
  }

  const checkbox = read(
    root,
    "tests/consumers/vue/src/adapters/VyrnForgeCheckboxModel.vue",
  );
  for (const marker of [
    "modelValue",
    "update:modelValue",
    "vf-checked-change",
    "target.checked",
    "<vf-checkbox",
  ]) {
    if (!checkbox.includes(marker)) {
      fail(failures, `Vue checkbox model adapter is missing ${marker}`);
    }
  }
  for (const source of [composable, text, checkbox]) {
    for (const forbidden of [
      "innerHTML",
      "attachShadow",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-data-grid",
    ]) {
      if (source.includes(forbidden)) {
        fail(failures, `Vue model adapter must not contain ${forbidden}`);
      }
    }
  }

  const app = read(root, "tests/consumers/vue/src/App.vue");
  for (const marker of [
    'v-model="modelOwner"',
    'v-model="modelNotifications"',
    "data-vue-model-value",
    "data-vue-model-checked",
    'id="vue-model-programmatic"',
  ]) {
    if (!app.includes(marker)) {
      fail(
        failures,
        `Vue application is missing model adapter marker ${marker}`,
      );
    }
  }

  const fixture = readJson(root, "tests/consumers/vue/fixture.json");
  if (fixture.modelAdapterDecision !== "reference-adapter-verified") {
    fail(failures, "Vue fixture must record the verified reference adapter");
  }
  if (fixture.modelAdapter?.supportClaim !== expectedClaim) {
    fail(failures, "Vue fixture model adapter support claim is invalid");
  }

  const manifest = readJson(root, "tests/consumers/manifest.json");
  const vue = (manifest.fixtures ?? []).find((item) => item.id === "vue");
  if (vue?.modelSupportClaim !== expectedClaim) {
    fail(failures, "consumer manifest Vue model support claim is invalid");
  }
  for (const file of vue?.exampleFiles ?? []) {
    if (!existsSync(path.join(root, "tests/consumers/vue", file))) {
      fail(failures, `Vue manifest example is missing ${file}`);
    }
  }

  const runtime = read(
    root,
    "scripts/verify-consumer-foundations-runtime.mjs",
  );
  for (const marker of [
    "data-vue-model-value",
    "data-vue-model-checked",
    "vue-model-programmatic",
    "Programmatic Vue",
  ]) {
    if (!runtime.includes(marker)) {
      fail(failures, `Vue model adapter runtime evidence is missing ${marker}`);
    }
  }
  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyVueModelAdapter();
  if (failures.length > 0) {
    console.error("Vue model adapter verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Vue model adapter verification passed.");
  }
}

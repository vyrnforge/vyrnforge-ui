import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vueVersion = "3.5.40";
const expectedFixtureClaim = "packed-vue-runtime-verified";

const requiredFiles = [
  "docs/metadata/vue-consumer.json",
  "docs/metadata/vue-support-evidence.json",
  "docs/testing/vue-consumer-contract.md",
  "packages/ui-vue/package.json",
  "packages/ui-vue/src/index.ts",
  "packages/ui-vue/src/model.ts",
  "tests/consumers/vue/README.md",
  "tests/consumers/vue/fixture.json",
  "tests/consumers/vue/package.json",
  "tests/consumers/vue/vite.config.ts",
  "tests/consumers/vue/src/main.ts",
  "tests/consumers/vue/src/App.vue",
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

export function verifyVueConsumer({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) fail(failures, `Vue consumer evidence is missing ${file}`);
  }
  if (failures.length > 0) return failures.sort();

  const metadata = readJson(root, "docs/metadata/vue-consumer.json");
  const framework = metadata.framework ?? {};
  if (framework.name !== "Vue" || framework.version !== vueVersion) fail(failures, `Vue framework version must be ${vueVersion}`);
  if (framework.supportLevel !== "first-class") fail(failures, "Vue support level must be first-class");
  if (framework.renderer !== "@vyrnforge/ui-vue") fail(failures, "Vue public renderer must be @vyrnforge/ui-vue");
  if (framework.workspaceIsolation !== true) fail(failures, "Vue fixture must remain workspace-isolated");
  if (metadata.fixture?.supportClaim !== expectedFixtureClaim) fail(failures, `Vue fixture claim must be ${expectedFixtureClaim}`);
  if (!metadata.fixture?.packedPackages?.includes("@vyrnforge/ui-vue")) fail(failures, "Vue fixture evidence must include the public facade package");
  if (metadata.modelAdapterDecision?.publishedPackage !== "@vyrnforge/ui-vue") fail(failures, "Vue model integration must be package-owned");

  const fixture = readJson(root, "tests/consumers/vue/fixture.json");
  if (fixture.supportClaim !== expectedFixtureClaim) fail(failures, `Vue fixture support claim must be ${expectedFixtureClaim}`);
  if (!fixture.rendererPackages?.includes("@vyrnforge/ui-vue")) fail(failures, "Vue runtime fixture must exercise @vyrnforge/ui-vue");
  if (fixture.modelAdapterDecision !== "public-package-adapter-verified") fail(failures, "Vue fixture must use package-owned model integration");

  const fixturePackage = readJson(root, "tests/consumers/vue/package.json");
  for (const dependencyName of Object.keys({ ...fixturePackage.dependencies, ...fixturePackage.devDependencies })) {
    if (dependencyName.startsWith("@vyrnforge/")) fail(failures, "Vue fixture must receive VyrnForge packages from runtime tarballs");
  }

  const packageJson = readJson(root, "packages/ui-vue/package.json");
  if (packageJson.dependencies?.["@vyrnforge/ui-elements"] === undefined) fail(failures, "@vyrnforge/ui-vue must delegate to @vyrnforge/ui-elements");
  if (packageJson.peerDependencies?.vue !== ">=3.5 <4") fail(failures, "@vyrnforge/ui-vue Vue peer range is invalid");

  const mainText = read(root, "tests/consumers/vue/src/main.ts");
  for (const marker of ["createApp", "VyrnForgeVue", "@vyrnforge/ui-vue"]) {
    if (!mainText.includes(marker)) fail(failures, `Vue entry point is missing ${marker}`);
  }
  if (mainText.includes("@vyrnforge/ui-elements/register")) fail(failures, "Vue normal setup must not require raw element registration");

  const appText = read(root, "tests/consumers/vue/src/App.vue");
  for (const marker of ["@vyrnforge/ui-vue", "VyrnForgeButton", "VyrnForgeTabs", "VyrnForgeTextInput", "VyrnForgeCheckbox", "v-model=\"modelOwner\"", "v-model=\"modelNotifications\""]) {
    if (!appText.includes(marker)) fail(failures, `Vue application is missing ${marker}`);
  }
  for (const stale of ["./adapters/", "useVyrnForgeModel"]) {
    if (appText.includes(stale)) fail(failures, `Vue fixture must not depend on copied adapter ${stale}`);
  }

  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const vue = (architecture.frameworks ?? []).find((item) => item.id === "vue");
  if (vue?.supportLevel !== "first-class" || vue?.renderer !== "@vyrnforge/ui-vue" || vue?.betaClaim !== "first-class-package-verified") fail(failures, "multi-framework Vue record must describe current first-class package support");

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyVueConsumer();
  if (failures.length > 0) {
    console.error("Vue consumer verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Vue consumer verification passed.");
  }
}

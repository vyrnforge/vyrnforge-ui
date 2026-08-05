import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isConsumerBatchAtLeast } from "./consumer-batch-progression.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const vueVersion = "3.5.40";
const viteVersion = "8.1.5";
const pluginVueVersion = "6.0.8";
const vueTscVersion = "3.3.8";
const fixtureTypeScriptVersion = "6.0.3";
const expectedFixtureClaim = "packed-vue-runtime-verified";
const expectedBetaClaim = "packed-consumer-verified";

const requiredFiles = [
  "docs/metadata/vue-consumer.json",
  "docs/testing/vue-consumer-contract.md",
  "tests/consumers/vue/README.md",
  "tests/consumers/vue/fixture.json",
  "tests/consumers/vue/package.json",
  "tests/consumers/vue/index.html",
  "tests/consumers/vue/tsconfig.json",
  "tests/consumers/vue/vite.config.ts",
  "tests/consumers/vue/architecture-probe.ts",
  "tests/consumers/vue/src/env.d.ts",
  "tests/consumers/vue/src/vyrnforge-elements.d.ts",
  "tests/consumers/vue/src/main.ts",
  "tests/consumers/vue/src/App.vue",
  "tests/consumers/vue/src/styles.css",
  "scripts/verify-consumer-foundations-runtime.mjs",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function addFailure(failures, message) {
  failures.push(message);
}

function verifyMetadata(root, failures) {
  const metadata = readJson(root, "docs/metadata/vue-consumer.json");
  const program = metadata.program ?? {};
  if (program.sprint !== "S7") {
    addFailure(failures, "Vue consumer sprint must be S7");
  }
  if (program.task !== "CF-7005") {
    addFailure(failures, "Vue consumer task must be CF-7005");
  }
  if (program.storyPoints !== 8) {
    addFailure(failures, "CF-7005 story points must be 8");
  }
  if (program.status !== "evidence-complete") {
    addFailure(failures, "CF-7005 status must be evidence-complete");
  }
  if (program.gate !== "GMF4" || program.gateStatus !== "passed") {
    addFailure(failures, "CF-7005 must record passed GMF4");
  }
  if (program.baseCommit !== "59201986b6b3d6255901ff1942cb3e347e6f30cc") {
    addFailure(failures, "CF-7005 base commit is invalid");
  }

  const framework = metadata.framework ?? {};
  if (framework.name !== "Vue" || framework.version !== vueVersion) {
    addFailure(failures, `Vue framework version must be ${vueVersion}`);
  }
  if (framework.supportLevel !== "verified-consumer") {
    addFailure(failures, "Vue support level must be verified-consumer");
  }
  if (framework.renderer !== "@vyrnforge/ui-elements") {
    addFailure(failures, "Vue must consume @vyrnforge/ui-elements");
  }
  if (framework.buildTool !== `Vite ${viteVersion}`) {
    addFailure(failures, `Vue build tool must be Vite ${viteVersion}`);
  }
  if (framework.compilerPlugin !== `@vitejs/plugin-vue ${pluginVueVersion}`) {
    addFailure(
      failures,
      `Vue compiler plugin must be @vitejs/plugin-vue ${pluginVueVersion}`,
    );
  }
  if (framework.templateTypecheck !== `vue-tsc ${vueTscVersion}`) {
    addFailure(
      failures,
      `Vue template typecheck must be vue-tsc ${vueTscVersion}`,
    );
  }
  if (framework.fixtureTypeScript !== fixtureTypeScriptVersion) {
    addFailure(
      failures,
      `Vue fixture TypeScript must be ${fixtureTypeScriptVersion}`,
    );
  }
  if (
    framework.templateTypeBridge !==
    "consumer-local Vue GlobalComponents augmentation"
  ) {
    addFailure(failures, "Vue template type bridge metadata is invalid");
  }
  if (framework.workspaceIsolation !== true) {
    addFailure(failures, "Vue fixture must remain workspace-isolated");
  }
  if (framework.customElementRecognition !== 'tag.startsWith("vf-")') {
    addFailure(failures, "Vue custom-element recognition contract is invalid");
  }

  if (metadata.fixture?.supportClaim !== expectedFixtureClaim) {
    addFailure(
      failures,
      `Vue metadata support claim must be ${expectedFixtureClaim}`,
    );
  }
  if (metadata.fixture?.templateTypeBridge !== "src/vyrnforge-elements.d.ts") {
    addFailure(failures, "Vue fixture template type bridge path is invalid");
  }
  if (metadata.fixture?.buildSystem !== "vite") {
    addFailure(failures, "Vue fixture must use Vite");
  }
  if (metadata.fixture?.previewPort !== 4184) {
    addFailure(failures, "Vue fixture preview port must be 4184");
  }
  if (metadata.modelAdapterDecision?.task !== "CF-7006") {
    addFailure(failures, "Vue model adapter decision must reference CF-7006");
  }
  if (
    !new Set(["required", "runtime-ready", "verified"]).has(
      metadata.modelAdapterDecision?.status,
    )
  ) {
    addFailure(failures, "Vue model adapter decision status is invalid");
  }
  if (metadata.modelAdapterDecision?.publishedPackage !== null) {
    addFailure(failures, "CF-7005 must not publish a Vue adapter package");
  }
  if ((metadata.unresolvedBlockers ?? []).length !== 0) {
    addFailure(failures, "CF-7005 unresolved blockers must be empty");
  }
  if ((metadata.pendingRuntimeEvidence ?? []).length !== 0) {
    addFailure(failures, "CF-7005 pending runtime evidence must be empty");
  }
  if ((metadata.completedRuntimeEvidence ?? []).length !== 5) {
    addFailure(failures, "CF-7005 completed runtime evidence is incomplete");
  }
  if ((metadata.completedStaticEvidence ?? []).length < 10) {
    addFailure(failures, "CF-7005 completed static evidence is incomplete");
  }
}

function verifyFixture(root, failures) {
  const fixtureDirectory = path.join(root, "tests/consumers/vue");
  const fixture = readJson(root, "tests/consumers/vue/fixture.json");
  const packageJson = readJson(root, "tests/consumers/vue/package.json");
  const tsconfig = readJson(root, "tests/consumers/vue/tsconfig.json");
  const manifest = readJson(root, "tests/consumers/manifest.json");

  if (fixture.task !== "CF-7005") {
    addFailure(failures, "Vue fixture task must be CF-7005");
  }
  if (fixture.supportClaim !== expectedFixtureClaim) {
    addFailure(
      failures,
      `Vue fixture support claim must be ${expectedFixtureClaim}`,
    );
  }
  if (fixture.frameworkRuntime !== `Vue ${vueVersion}`) {
    addFailure(failures, `Vue fixture runtime must be Vue ${vueVersion}`);
  }
  if (fixture.verificationStatus !== "runtime-verified") {
    addFailure(
      failures,
      "Vue fixture verification status must be runtime-verified",
    );
  }
  if (
    !new Set([
      "separate-cf-7006-adapter-required",
      "cf-7006-adapter-runtime-ready",
      "cf-7006-adapter-verified",
    ]).has(fixture.modelAdapterDecision)
  ) {
    addFailure(failures, "Vue fixture CF-7006 adapter status is invalid");
  }

  const manifestFixture = (manifest.fixtures ?? []).find(
    (entry) => entry.id === "vue",
  );
  if (!manifestFixture) {
    addFailure(failures, "consumer manifest is missing Vue");
  } else {
    if (manifestFixture.supportClaim !== expectedFixtureClaim) {
      addFailure(
        failures,
        `Vue manifest support claim must be ${expectedFixtureClaim}`,
      );
    }
    if (manifestFixture.directory !== "tests/consumers/vue") {
      addFailure(failures, "Vue manifest directory is invalid");
    }
    if (manifestFixture.verificationStatus !== "runtime-verified") {
      addFailure(
        failures,
        "Vue manifest verification status must be runtime-verified",
      );
    }
    for (const file of manifestFixture.exampleFiles ?? []) {
      if (!existsSync(path.join(fixtureDirectory, file))) {
        addFailure(failures, `Vue manifest example is missing ${file}`);
      }
    }
  }
  if (!isConsumerBatchAtLeast(manifest.currentBatch, "CF-7006-CF-7007")) {
    addFailure(failures, "consumer manifest currentBatch is invalid");
  }

  if (packageJson.dependencies?.vue !== vueVersion) {
    addFailure(failures, `Vue must be pinned to ${vueVersion}`);
  }
  const expectedDevDependencies = {
    "@vitejs/plugin-vue": pluginVueVersion,
    typescript: fixtureTypeScriptVersion,
    vite: viteVersion,
    "vue-tsc": vueTscVersion,
  };
  for (const [packageName, version] of Object.entries(
    expectedDevDependencies,
  )) {
    if (packageJson.devDependencies?.[packageName] !== version) {
      addFailure(failures, `${packageName} must be pinned to ${version}`);
    }
  }
  for (const script of ["typecheck", "build", "preview"]) {
    if (!packageJson.scripts?.[script]) {
      addFailure(failures, `Vue fixture is missing ${script} script`);
    }
  }
  for (const dependencyName of Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    if (dependencyName.startsWith("@vyrnforge/")) {
      addFailure(
        failures,
        "Vue fixture must receive VyrnForge packages from runtime tarballs",
      );
    }
  }

  if (tsconfig.compilerOptions?.strict !== true) {
    addFailure(failures, "Vue fixture must enable strict TypeScript");
  }
  if (tsconfig.vueCompilerOptions?.strictTemplates !== true) {
    addFailure(failures, "Vue strict template checking must be enabled");
  }
  if (!tsconfig.include?.includes("architecture-probe.ts")) {
    addFailure(failures, "Vue typecheck must include architecture-probe.ts");
  }
  if (!tsconfig.include?.includes("src/**/*.vue")) {
    addFailure(failures, "Vue typecheck must include Vue SFC files");
  }

  const viteText = read(root, "tests/consumers/vue/vite.config.ts");
  const mainText = read(root, "tests/consumers/vue/src/main.ts");
  const appText = read(root, "tests/consumers/vue/src/App.vue");
  const stylesText = read(root, "tests/consumers/vue/src/styles.css");
  const templateTypesText = read(
    root,
    "tests/consumers/vue/src/vyrnforge-elements.d.ts",
  );
  const probeText = read(root, "tests/consumers/vue/architecture-probe.ts");
  const readmeText = read(root, "tests/consumers/vue/README.md");

  for (const marker of [
    "@vitejs/plugin-vue",
    "isCustomElement",
    'tag.startsWith("vf-")',
  ]) {
    if (!viteText.includes(marker)) {
      addFailure(failures, `Vue compiler config is missing ${marker}`);
    }
  }
  for (const marker of [
    "createApp",
    "@vyrnforge/ui-elements/register",
    "@vyrnforge/ui-core/styles/index.css",
    "@vyrnforge/ui-elements/styles/index.css",
  ]) {
    if (!mainText.includes(marker)) {
      addFailure(failures, `Vue entry point is missing ${marker}`);
    }
  }
  for (const marker of [
    ':items.prop="tabs"',
    ':value.prop="owner"',
    '@vf-action="handleAction"',
    '@vf-value-change="handleOwnerValueChange"',
    'slot="status"',
    'slot="actions"',
    'for="vue-owner-preview"',
    'for="vue-form-owner"',
    'variant="default"',
    "VyrnForgeElementForTagName",
    "VyrnForgeActionDetail",
    "VyrnForgeValueChangeDetail",
    "new FormData",
    'data-consumer-ready", "true"',
  ]) {
    if (!appText.includes(marker)) {
      addFailure(failures, `Vue application is missing ${marker}`);
    }
  }
  for (const marker of [
    'declare module "vue"',
    "interface GlobalComponents",
    '"vf-page-header"',
    '"vf-button"',
    '"vf-tabs"',
    '"vf-text-input"',
    '"vf-action"',
    '"vf-value-change"',
    'declare module "@vue/runtime-dom"',
    "slot?: string",
    "data-${string}",
  ]) {
    if (!templateTypesText.includes(marker)) {
      addFailure(failures, `Vue template type bridge is missing ${marker}`);
    }
  }
  for (const forbidden of [
    'label="Owner"',
    'label="Form owner"',
    'variant="secondary"',
  ]) {
    if (appText.includes(forbidden)) {
      addFailure(
        failures,
        `Vue application uses unsupported markup ${forbidden}`,
      );
    }
  }
  for (const marker of [
    'document.createElement("vf-tabs")',
    'VyrnForgeElementForTagName<"vf-tabs">',
    'addEventListener("vf-action"',
    'addEventListener("vf-value-change"',
  ]) {
    if (!probeText.includes(marker)) {
      addFailure(failures, `Vue architecture probe is missing ${marker}`);
    }
  }
  for (const marker of ["--vf-bg", "--vf-space-5", "--vf-surface"]) {
    if (!stylesText.includes(marker)) {
      addFailure(failures, `Vue fixture styles are missing ${marker}`);
    }
  }
  if (stylesText.includes("--udg-")) {
    addFailure(failures, "Vue non-grid fixture must not use data-grid tokens");
  }
  if (!readmeText.includes("CF-7006")) {
    addFailure(failures, "Vue fixture README must record the CF-7006 boundary");
  }

  const consumerSource = [viteText, mainText, appText, probeText].join("\n");
  for (const forbidden of ["packages/ui-elements/src", "../../../packages/"]) {
    if (consumerSource.includes(forbidden)) {
      addFailure(failures, `Vue fixture must not import ${forbidden}`);
    }
  }
}

function verifyRepositoryIntegration(root, failures) {
  const rootPackageJson = readJson(root, "package.json");
  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const consumerFoundations = readJson(
    root,
    "docs/metadata/consumer-foundations.json",
  );
  const runtimeText = read(
    root,
    "scripts/verify-consumer-foundations-runtime.mjs",
  );
  const docsText = read(
    root,
    "docs/testing/multi-framework-consumer-fixtures.md",
  );

  for (const script of [
    "verify:vue-consumer",
    "test:vue-consumer",
    "verify:vue-consumer:runtime",
  ]) {
    if (!rootPackageJson.scripts?.[script]) {
      addFailure(failures, `root package scripts are missing ${script}`);
    }
  }

  const framework = (architecture.frameworks ?? []).find(
    (entry) => entry.id === "vue",
  );
  if (!(architecture.program?.verifiedConsumers ?? []).includes("vue")) {
    addFailure(failures, "Vue must be listed as a verified consumer");
  }
  if (
    (architecture.program?.runtimeVerificationCandidates ?? []).includes("vue")
  ) {
    addFailure(
      failures,
      "Vue must not remain a runtime verification candidate",
    );
  }
  if (framework?.betaClaim !== expectedBetaClaim) {
    addFailure(failures, `Vue beta claim must be ${expectedBetaClaim}`);
  }
  if (framework?.consumerFoundation !== "CF-7005") {
    addFailure(failures, "Vue framework metadata must reference CF-7005");
  }
  if (
    architecture.consumerFixturePolicy?.vueEvidence !==
    "docs/metadata/vue-consumer.json"
  ) {
    addFailure(
      failures,
      "multi-framework metadata must reference Vue evidence",
    );
  }

  const followOn = (consumerFoundations.followOnEvidence ?? []).find(
    (entry) => entry.task === "CF-7005",
  );
  if (
    followOn?.status !== "done" ||
    followOn?.claim !== expectedFixtureClaim ||
    followOn?.evidence !== "docs/metadata/vue-consumer.json"
  ) {
    addFailure(
      failures,
      "consumer foundation follow-on status is invalid for CF-7005",
    );
  }

  for (const marker of [
    'id: "vue"',
    'directory: "tests/consumers/vue"',
    "port: 4184",
    'fixture.id === "vue"',
  ]) {
    if (!runtimeText.includes(marker)) {
      addFailure(failures, `consumer runtime is missing Vue marker ${marker}`);
    }
  }
  if (!docsText.includes("packed-vue-runtime-verified")) {
    addFailure(
      failures,
      "consumer fixture documentation must record Vue runtime verification",
    );
  }
}

export function verifyVueConsumer({ root = repositoryRoot } = {}) {
  const failures = [];

  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      addFailure(
        failures,
        `required Vue consumer file is missing: ${relativePath}`,
      );
    }
  }
  if (failures.length > 0) return failures.sort();

  verifyMetadata(root, failures);
  verifyFixture(root, failures);
  verifyRepositoryIntegration(root, failures);

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

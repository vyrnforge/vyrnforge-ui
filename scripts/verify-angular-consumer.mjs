import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const angularVersion = "22.0.8";
const fixtureTypeScriptVersion = "6.0.2";
const expectedFixtureClaim = "packed-angular-runtime-verified";
const expectedBetaClaim = "packed-consumer-verified";

const requiredFiles = [
  "docs/metadata/angular-consumer.json",
  "docs/testing/angular-consumer-contract.md",
  "tests/consumers/angular/README.md",
  "tests/consumers/angular/fixture.json",
  "tests/consumers/angular/package.json",
  "tests/consumers/angular/angular.json",
  "tests/consumers/angular/tsconfig.json",
  "tests/consumers/angular/tsconfig.app.json",
  "tests/consumers/angular/preview.mjs",
  "tests/consumers/angular/architecture-probe.ts",
  "tests/consumers/angular/src/index.html",
  "tests/consumers/angular/src/main.ts",
  "tests/consumers/angular/src/styles.css",
  "tests/consumers/angular/src/app/app.component.ts",
  "tests/consumers/angular/src/app/app.component.html",
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
  const metadata = readJson(root, "docs/metadata/angular-consumer.json");
  const framework = metadata.framework ?? {};
  if (framework.name !== "Angular" || framework.version !== angularVersion) {
    addFailure(failures, `Angular framework version must be ${angularVersion}`);
  }
  if (framework.supportLevel !== "verified-consumer") {
    addFailure(failures, "Angular support level must be verified-consumer");
  }
  if (framework.renderer !== "@vyrnforge/ui-elements") {
    addFailure(failures, "Angular must consume @vyrnforge/ui-elements");
  }
  if (framework.fixtureTypeScript !== fixtureTypeScriptVersion) {
    addFailure(
      failures,
      `Angular fixture TypeScript must be ${fixtureTypeScriptVersion}`,
    );
  }
  if (framework.workspaceIsolation !== true) {
    addFailure(failures, "Angular fixture must remain workspace-isolated");
  }
  if (framework.schema !== "CUSTOM_ELEMENTS_SCHEMA") {
    addFailure(
      failures,
      "Angular fixture schema must be CUSTOM_ELEMENTS_SCHEMA",
    );
  }

  if (metadata.fixture?.supportClaim !== expectedFixtureClaim) {
    addFailure(
      failures,
      `Angular metadata support claim must be ${expectedFixtureClaim}`,
    );
  }
  if (metadata.fixture?.buildSystem !== "@angular/build:application") {
    addFailure(failures, "Angular fixture must use the application builder");
  }
  if (metadata.fixture?.previewPort !== 4183) {
    addFailure(failures, "Angular fixture preview port must be 4183");
  }
  if ((metadata.unresolvedBlockers ?? []).length !== 0) {
    addFailure(failures, "Angular unresolved blockers must be empty");
  }
}

function verifyFixture(root, failures) {
  const fixtureDirectory = path.join(root, "tests/consumers/angular");
  const fixture = readJson(root, "tests/consumers/angular/fixture.json");
  const packageJson = readJson(root, "tests/consumers/angular/package.json");
  const angularJson = readJson(root, "tests/consumers/angular/angular.json");
  const tsconfig = readJson(root, "tests/consumers/angular/tsconfig.json");
  const tsconfigApp = readJson(
    root,
    "tests/consumers/angular/tsconfig.app.json",
  );
  const manifest = readJson(root, "tests/consumers/manifest.json");

  if (fixture.supportClaim !== expectedFixtureClaim) {
    addFailure(
      failures,
      `Angular fixture support claim must be ${expectedFixtureClaim}`,
    );
  }
  if (fixture.frameworkRuntime !== `Angular ${angularVersion}`) {
    addFailure(
      failures,
      `Angular fixture runtime must be Angular ${angularVersion}`,
    );
  }

  const manifestFixture = (manifest.fixtures ?? []).find(
    (entry) => entry.id === "angular",
  );
  if (!manifestFixture) {
    addFailure(failures, "consumer manifest is missing Angular");
  } else {
    if (manifestFixture.supportClaim !== expectedFixtureClaim) {
      addFailure(
        failures,
        `Angular manifest support claim must be ${expectedFixtureClaim}`,
      );
    }
    if (manifestFixture.directory !== "tests/consumers/angular") {
      addFailure(failures, "Angular manifest directory is invalid");
    }
    for (const file of manifestFixture.exampleFiles ?? []) {
      if (!existsSync(path.join(fixtureDirectory, file))) {
        addFailure(failures, `Angular manifest example is missing ${file}`);
      }
    }
  }

  const expectedAngularPackages = [
    "@angular/common",
    "@angular/compiler",
    "@angular/core",
    "@angular/platform-browser",
    "@angular/forms",
  ];
  for (const packageName of expectedAngularPackages) {
    if (packageJson.dependencies?.[packageName] !== angularVersion) {
      addFailure(
        failures,
        `${packageName} must be pinned to ${angularVersion}`,
      );
    }
  }
  for (const packageName of ["@angular/build", "@angular/cli"]) {
    if (packageJson.devDependencies?.[packageName] !== angularVersion) {
      addFailure(
        failures,
        `${packageName} must be pinned to ${angularVersion}`,
      );
    }
  }
  if (packageJson.devDependencies?.typescript !== fixtureTypeScriptVersion) {
    addFailure(
      failures,
      `Angular fixture TypeScript must be pinned to ${fixtureTypeScriptVersion}`,
    );
  }
  for (const script of ["typecheck", "build", "preview"]) {
    if (!packageJson.scripts?.[script]) {
      addFailure(failures, `Angular fixture is missing ${script} script`);
    }
  }
  for (const dependencyName of Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    if (dependencyName.startsWith("@vyrnforge/")) {
      addFailure(
        failures,
        "Angular fixture must receive VyrnForge packages from runtime tarballs",
      );
    }
  }

  const project = angularJson.projects?.["vyrnforge-angular-consumer-fixture"];
  const build = project?.architect?.build;
  if (build?.builder !== "@angular/build:application") {
    addFailure(failures, "Angular fixture must use @angular/build:application");
  }
  if (build?.options?.browser !== "src/main.ts") {
    addFailure(failures, "Angular build browser entry must be src/main.ts");
  }
  if (build?.options?.tsConfig !== "tsconfig.app.json") {
    addFailure(failures, "Angular build must use tsconfig.app.json");
  }
  if (
    build?.options?.outputPath !== "dist/vyrnforge-angular-consumer-fixture"
  ) {
    addFailure(failures, "Angular build output path is invalid");
  }
  if (tsconfig.angularCompilerOptions?.strictTemplates !== true) {
    addFailure(failures, "Angular strict template checking must be enabled");
  }
  for (const deprecatedOption of ["baseUrl", "downlevelIteration"]) {
    if (Object.hasOwn(tsconfig.compilerOptions ?? {}, deprecatedOption)) {
      addFailure(
        failures,
        `Angular fixture must not use deprecated compiler option ${deprecatedOption}`,
      );
    }
  }
  if (!tsconfigApp.include?.includes("architecture-probe.ts")) {
    addFailure(
      failures,
      "Angular typecheck must include architecture-probe.ts",
    );
  }

  const mainText = read(root, "tests/consumers/angular/src/main.ts");
  const componentText = read(
    root,
    "tests/consumers/angular/src/app/app.component.ts",
  );
  const templateText = read(
    root,
    "tests/consumers/angular/src/app/app.component.html",
  );
  const stylesText = read(root, "tests/consumers/angular/src/styles.css");
  const probeText = read(root, "tests/consumers/angular/architecture-probe.ts");
  const previewText = read(root, "tests/consumers/angular/preview.mjs");

  for (const marker of [
    "@vyrnforge/ui-elements/register",
    "provideZonelessChangeDetection",
    "bootstrapApplication",
  ]) {
    if (!mainText.includes(marker)) {
      addFailure(failures, `Angular bootstrap is missing ${marker}`);
    }
  }
  for (const forbiddenStyleImport of [
    "@vyrnforge/ui-core/styles/index.css",
    "@vyrnforge/ui-elements/styles/index.css",
  ]) {
    if (mainText.includes(forbiddenStyleImport)) {
      addFailure(
        failures,
        `Angular bootstrap must load ${forbiddenStyleImport} through the global stylesheet`,
      );
    }
  }
  for (const marker of [
    "CUSTOM_ELEMENTS_SCHEMA",
    "schemas: [CUSTOM_ELEMENTS_SCHEMA]",
    'VyrnForgeElementForTagName<"vf-tabs">',
    "new FormData(form)",
    'data-consumer-property", "verified',
  ]) {
    if (!componentText.includes(marker)) {
      addFailure(failures, `Angular component is missing ${marker}`);
    }
  }
  for (const marker of [
    '(vf-action)="handleAction($event)"',
    '[items]="tabs"',
    '[value]="owner"',
    'slot="status"',
    'slot="actions"',
    '(submit)="handleSubmit($event)"',
  ]) {
    if (!templateText.includes(marker)) {
      addFailure(failures, `Angular template is missing ${marker}`);
    }
  }
  for (const marker of [
    '@import "@vyrnforge/ui-core/styles/index.css";',
    '@import "@vyrnforge/ui-elements/styles/index.css";',
    ".vf-consumer-angular",
    ".vf-consumer-angular-form",
  ]) {
    if (!stylesText.includes(marker)) {
      addFailure(failures, `Angular styles are missing ${marker}`);
    }
  }
  for (const marker of [
    'document.createElement("vf-tabs")',
    'addEventListener("vf-action"',
  ]) {
    if (!probeText.includes(marker)) {
      addFailure(failures, `Angular architecture probe is missing ${marker}`);
    }
  }
  if (
    !previewText.includes("dist/vyrnforge-angular-consumer-fixture/browser")
  ) {
    addFailure(
      failures,
      "Angular preview must serve the application browser output",
    );
  }

  const combinedSource = [
    mainText,
    componentText,
    templateText,
    probeText,
  ].join("\n");
  for (const forbidden of ["packages/ui-elements/src", "../../packages/"]) {
    if (combinedSource.includes(forbidden)) {
      addFailure(
        failures,
        `Angular consumer must not import repository source through ${forbidden}`,
      );
    }
  }
}

function verifyArchitecture(root, failures) {
  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const angular = (architecture.frameworks ?? []).find(
    (framework) => framework.id === "angular",
  );
  if (!angular) {
    addFailure(failures, "multi-framework metadata is missing Angular");
  } else {
    if (angular.supportLevel !== "verified-consumer") {
      addFailure(
        failures,
        "Angular support level must remain verified-consumer",
      );
    }
    if (angular.betaClaim !== expectedBetaClaim) {
      addFailure(failures, `Angular beta claim must be ${expectedBetaClaim}`);
    }
  }

  const policy = architecture.consumerFixturePolicy ?? {};
  if (
    policy.currentClaim !==
    "native-html-react-angular-vue-consumer-foundation-complete"
  ) {
    addFailure(failures, "consumer fixture policy must include Angular");
  }
  if (policy.angularEvidence !== "docs/metadata/angular-consumer.json") {
    addFailure(failures, "consumer fixture policy Angular evidence is invalid");
  }

  const angularConsumer = architecture.angularConsumer ?? {};
  if (
    angularConsumer.status !== "complete" ||
    angularConsumer.supportClaim !== expectedFixtureClaim
  ) {
    addFailure(
      failures,
      "multi-framework Angular consumer record is incomplete",
    );
  }

  const rootPackage = readJson(root, "package.json");
  for (const script of [
    "test:angular-consumer",
    "verify:angular-consumer",
    "verify:angular-consumer:runtime",
  ]) {
    if (!rootPackage.scripts?.[script]) {
      addFailure(failures, `root package scripts are missing ${script}`);
    }
  }
  if (
    (rootPackage.workspaces ?? []).some((workspace) =>
      workspace.includes("tests/consumers"),
    )
  ) {
    addFailure(failures, "Angular clean consumer must not be a root workspace");
  }

  const runtimeText = read(
    root,
    "scripts/verify-consumer-foundations-runtime.mjs",
  );
  for (const marker of [
    'id: "angular"',
    'directory: "tests/consumers/angular"',
    "port: 4183",
    'fixture.id === "angular"',
    'data-angular-slot="status"',
  ]) {
    if (!runtimeText.includes(marker)) {
      addFailure(failures, `consumer runtime verifier is missing ${marker}`);
    }
  }

  const packageDirectories = readdirSync(path.join(root, "packages"), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory());
  for (const directory of packageDirectories) {
    const packagePath = path.join(
      root,
      "packages",
      directory.name,
      "package.json",
    );
    if (!existsSync(packagePath)) continue;
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    const dependencyNames = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
      ...packageJson.optionalDependencies,
    });
    const angularDependency = dependencyNames.find(
      (dependency) =>
        dependency.startsWith("@angular/") || dependency === "zone.js",
    );
    if (angularDependency) {
      addFailure(
        failures,
        `${packageJson.name ?? directory.name} must not depend on ${angularDependency}`,
      );
    }
  }
}

export function verifyAngularConsumer({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      addFailure(failures, `Angular consumer evidence is missing ${file}`);
    }
  }
  if (failures.length > 0) return failures;

  try {
    verifyMetadata(root, failures);
    verifyFixture(root, failures);
    verifyArchitecture(root, failures);
  } catch (error) {
    addFailure(
      failures,
      `Angular consumer verification failed: ${error.message}`,
    );
  }

  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyAngularConsumer();
  if (failures.length > 0) {
    console.error("Angular consumer verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      "Angular consumer passed: Angular 22 clean-consumer packed-package, property/event, slot, native-form, build, and Chromium evidence is aligned.",
    );
  }
}

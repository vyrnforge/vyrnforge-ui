import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const angularVersion = "22.0.8";
const fixtureTypeScriptVersion = "6.0.2";
const expectedFixtureClaim = "packed-angular-runtime-verified";

const requiredFiles = [
  "docs/metadata/angular-consumer.json",
  "docs/metadata/angular-support-evidence.json",
  "docs/testing/angular-consumer-contract.md",
  "packages/ui-angular/package.json",
  "packages/ui-angular/src/index.ts",
  "packages/ui-angular/src/forms.ts",
  "tests/consumers/angular/README.md",
  "tests/consumers/angular/fixture.json",
  "tests/consumers/angular/package.json",
  "tests/consumers/angular/angular.json",
  "tests/consumers/angular/tsconfig.json",
  "tests/consumers/angular/tsconfig.app.json",
  "tests/consumers/angular/src/main.ts",
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
function fail(failures, message) {
  failures.push(message);
}

export function verifyAngularConsumer({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) fail(failures, `Angular consumer evidence is missing ${file}`);
  }
  if (failures.length > 0) return failures.sort();

  const metadata = readJson(root, "docs/metadata/angular-consumer.json");
  const framework = metadata.framework ?? {};
  if (framework.name !== "Angular" || framework.version !== angularVersion) fail(failures, `Angular framework version must be ${angularVersion}`);
  if (framework.supportLevel !== "first-class") fail(failures, "Angular support level must be first-class");
  if (framework.renderer !== "@vyrnforge/ui-angular") fail(failures, "Angular public renderer must be @vyrnforge/ui-angular");
  if (framework.fixtureTypeScript !== fixtureTypeScriptVersion) fail(failures, `Angular fixture TypeScript must be ${fixtureTypeScriptVersion}`);
  if (framework.workspaceIsolation !== true) fail(failures, "Angular fixture must remain workspace-isolated");
  if (metadata.fixture?.supportClaim !== expectedFixtureClaim) fail(failures, `Angular fixture claim must be ${expectedFixtureClaim}`);
  if (!metadata.fixture?.packedPackages?.includes("@vyrnforge/ui-angular")) fail(failures, "Angular fixture evidence must include the public facade package");
  if (metadata.formsAdapter?.publicEntrypoint !== "@vyrnforge/ui-angular/forms") fail(failures, "Angular Forms evidence must use the package Forms entrypoint");

  const support = readJson(root, "docs/metadata/angular-support-evidence.json");
  if (support.package?.name !== "@vyrnforge/ui-angular" || support.package?.published !== false) fail(failures, "Angular support evidence must identify the unpublished public facade package");

  const fixture = readJson(root, "tests/consumers/angular/fixture.json");
  if (fixture.supportClaim !== expectedFixtureClaim) fail(failures, `Angular fixture support claim must be ${expectedFixtureClaim}`);
  if (!fixture.rendererPackages?.includes("@vyrnforge/ui-angular")) fail(failures, "Angular runtime fixture must exercise @vyrnforge/ui-angular");

  const fixturePackage = readJson(root, "tests/consumers/angular/package.json");
  for (const dependencyName of Object.keys({ ...fixturePackage.dependencies, ...fixturePackage.devDependencies })) {
    if (dependencyName.startsWith("@vyrnforge/")) fail(failures, "Angular fixture must receive VyrnForge packages from runtime tarballs");
  }

  const packageJson = readJson(root, "packages/ui-angular/package.json");
  if (packageJson.dependencies?.["@vyrnforge/ui-elements"] === undefined) fail(failures, "@vyrnforge/ui-angular must delegate to @vyrnforge/ui-elements");
  if (packageJson.peerDependencies?.["@angular/core"] !== ">=22 <23") fail(failures, "@vyrnforge/ui-angular Angular peer range is invalid");
  if (packageJson.peerDependencies?.["@angular/forms"] !== ">=22 <23" || packageJson.peerDependenciesMeta?.["@angular/forms"]?.optional !== true) fail(failures, "@angular/forms must remain an optional Angular facade peer");
  if (!packageJson.exports?.["./forms"]) fail(failures, "@vyrnforge/ui-angular must expose the Forms entrypoint");

  const mainText = read(root, "tests/consumers/angular/src/main.ts");
  for (const marker of ["provideVyrnForge", "@vyrnforge/ui-angular", "provideZonelessChangeDetection", "bootstrapApplication"]) {
    if (!mainText.includes(marker)) fail(failures, `Angular bootstrap is missing ${marker}`);
  }
  for (const stale of ["CUSTOM_ELEMENTS_SCHEMA", "@vyrnforge/ui-elements/register"]) {
    if (mainText.includes(stale)) fail(failures, `Angular normal bootstrap must not require ${stale}`);
  }

  const componentText = read(root, "tests/consumers/angular/src/app/app.component.ts");
  for (const marker of ["@vyrnforge/ui-angular", "@vyrnforge/ui-angular/forms", "VfButton", "VfTabs", "VfTextInput", "VyrnForgeFormControlDirective", "VyrnForgeElementForTagName"]) {
    if (!componentText.includes(marker)) fail(failures, `Angular component is missing ${marker}`);
  }
  if (componentText.includes("CUSTOM_ELEMENTS_SCHEMA")) fail(failures, "Angular first-class fixture must remain schema-free");

  const templateText = read(root, "tests/consumers/angular/src/app/app.component.html");
  for (const marker of ["vfGeneratedButton", "vfGeneratedPageHeader", "vfFormControl", "formControlName", "[(ngModel)]", "slot=\"status\""]) {
    if (!templateText.includes(marker)) fail(failures, `Angular template is missing ${marker}`);
  }

  const combined = [mainText, componentText, templateText].join("\n");
  for (const forbidden of ["packages/ui-elements/src", "packages/ui-angular/src", "../../packages/"]) {
    if (combined.includes(forbidden)) fail(failures, `Angular consumer must not import repository source through ${forbidden}`);
  }

  const architecture = readJson(root, "docs/metadata/multi-framework.json");
  const angular = (architecture.frameworks ?? []).find((item) => item.id === "angular");
  if (angular?.supportLevel !== "first-class" || angular?.renderer !== "@vyrnforge/ui-angular" || angular?.betaClaim !== "first-class-package-verified") fail(failures, "multi-framework Angular record must describe current first-class package support");
  if (architecture.angularConsumer?.publishedPackage !== null) fail(failures, "Angular metadata must not claim external publication");

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyAngularConsumer();
  if (failures.length > 0) {
    console.error("Angular consumer verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Angular consumer verification passed.");
  }
}

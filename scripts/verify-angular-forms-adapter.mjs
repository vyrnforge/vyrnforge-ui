import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const angularVersion = "22.0.8";
const expectedSupportClaim = "angular-forms-adapter-verified";
const supportedTags = [
  "vf-autocomplete",
  "vf-checkbox",
  "vf-date-input",
  "vf-datetime-input",
  "vf-multi-select",
  "vf-number-input",
  "vf-rating",
  "vf-search-input",
  "vf-select",
  "vf-slider",
  "vf-switch",
  "vf-text-input",
  "vf-textarea",
  "vf-transfer-list",
];
const requiredFiles = [
  "docs/metadata/angular-forms-adapter.json",
  "docs/testing/angular-forms-adapter-contract.md",
  "tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts",
  "tests/consumers/angular/src/app/app.component.ts",
  "tests/consumers/angular/src/app/app.component.html",
  "tests/consumers/angular/fixture.json",
  "tests/consumers/angular/package.json",
  "tests/consumers/manifest.json",
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
  const metadata = readJson(root, "docs/metadata/angular-forms-adapter.json");
  const adapter = metadata.adapter ?? {};
  if (metadata.status !== "verified") {
    addFailure(failures, "Angular Forms adapter status must be verified");
  }
  if (adapter.framework !== "Angular" || adapter.version !== angularVersion) {
    addFailure(
      failures,
      `Angular Forms adapter version must be ${angularVersion}`,
    );
  }
  if (adapter.supportClaim !== expectedSupportClaim) {
    addFailure(
      failures,
      `Angular Forms support claim must be ${expectedSupportClaim}`,
    );
  }
  if (adapter.directive !== "VyrnForgeFormControlDirective") {
    addFailure(failures, "Angular Forms directive identity is invalid");
  }
  if (adapter.selectorAttribute !== "vfFormControl") {
    addFailure(
      failures,
      "Angular Forms selector attribute must be vfFormControl",
    );
  }
  if (adapter.renderer !== "@vyrnforge/ui-elements") {
    addFailure(failures, "Angular Forms adapter must target ui-elements");
  }
  if (adapter.publishedPackage !== null) {
    addFailure(
      failures,
      "Angular Forms adapter must not invent a published Angular package",
    );
  }
  if (adapter.location !== "tests/consumers/angular") {
    addFailure(
      failures,
      "Angular Forms adapter must remain in the isolated reference fixture",
    );
  }
  if (adapter.duplicatesRendering !== false) {
    addFailure(failures, "Angular Forms adapter must not duplicate rendering");
  }
  if (adapter.duplicatesValidation !== false) {
    addFailure(
      failures,
      "Angular Forms adapter must delegate validation to native elements",
    );
  }

  const actualTags = new Set(adapter.supportedTags ?? []);
  if (
    actualTags.size !== supportedTags.length ||
    !supportedTags.every((tag) => actualTags.has(tag))
  ) {
    addFailure(failures, "Angular Forms supported tag catalog is incomplete");
  }
  for (const contract of [
    "ControlValueAccessor",
    "Validator",
    "NG_VALUE_ACCESSOR",
    "NG_VALIDATORS",
    "vf-value-change",
    "vf-checked-change",
    "focusout",
    "validity",
    "validationMessage",
  ]) {
    if (!(metadata.contracts ?? []).includes(contract)) {
      addFailure(failures, `Angular Forms metadata is missing ${contract}`);
    }
  }
  if ((metadata.unresolvedBlockers ?? []).length !== 0) {
    addFailure(failures, "Angular Forms unresolved blockers must be empty");
  }
}

function verifyDirective(root, failures) {
  const directive = read(
    root,
    "tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts",
  );
  for (const marker of [
    "standalone: true",
    "implements ControlValueAccessor, OnDestroy, Validator",
    "provide: NG_VALUE_ACCESSOR",
    "provide: NG_VALIDATORS",
    "multi: true",
    "writeValue(value: unknown)",
    "registerOnChange",
    "registerOnTouched",
    "setDisabledState",
    "validate(_control: AbstractControl)",
    "registerOnValidatorChange",
    "private readonly listenerCleanup",
    "this.renderer.listen(",
    '"focusout"',
    '"vf-checked-change"',
    '"vf-invalid"',
    '"vf-value-change"',
    "ngOnDestroy(): void",
    "for (const cleanup of this.listenerCleanup) cleanup();",
    '"disabled"',
    '"checked"',
    '"value"',
    "element.validity.valid",
    "element.validationMessage",
    "queueMicrotask",
  ]) {
    if (!directive.includes(marker)) {
      addFailure(failures, `Angular Forms directive is missing ${marker}`);
    }
  }
  for (const tag of supportedTags) {
    if (!directive.includes(`${tag}[vfFormControl]`)) {
      addFailure(failures, `Angular Forms selector is missing ${tag}`);
    }
  }
  for (const forbidden of [
    "innerHTML",
    "attachShadow",
    "@vyrnforge/ui-components",
    "@vyrnforge/ui-data-grid",
    "VyrnForgeElementForTagName",
    "host: {",
  ]) {
    if (directive.includes(forbidden)) {
      addFailure(
        failures,
        `Angular Forms directive must not contain ${forbidden}`,
      );
    }
  }
}

function verifyFixture(root, failures) {
  const packageJson = readJson(root, "tests/consumers/angular/package.json");
  if (packageJson.dependencies?.["@angular/forms"] !== angularVersion) {
    addFailure(failures, `@angular/forms must be pinned to ${angularVersion}`);
  }

  const component = read(
    root,
    "tests/consumers/angular/src/app/app.component.ts",
  );
  for (const marker of [
    "FormsModule",
    "ReactiveFormsModule",
    "VyrnForgeFormControlDirective",
    "new FormGroup",
    "new FormControl",
    "disableOwner",
    "enableOwner",
  ]) {
    if (!component.includes(marker)) {
      addFailure(failures, `Angular Forms component is missing ${marker}`);
    }
  }
  const template = read(
    root,
    "tests/consumers/angular/src/app/app.component.html",
  );
  for (const marker of [
    "vfFormControl",
    'formControlName="owner"',
    '[(ngModel)]="notifications"',
    "data-reactive-value",
    "data-reactive-state",
    "data-template-value",
    'id="disable-reactive-owner"',
    'id="enable-reactive-owner"',
  ]) {
    if (!template.includes(marker)) {
      addFailure(failures, `Angular Forms template is missing ${marker}`);
    }
  }

  const fixture = readJson(root, "tests/consumers/angular/fixture.json");
  if (fixture.formsSupportClaim !== expectedSupportClaim) {
    addFailure(
      failures,
      `Angular fixture forms support claim must be ${expectedSupportClaim}`,
    );
  }
  const manifest = readJson(root, "tests/consumers/manifest.json");
  const angularFixture = (manifest.fixtures ?? []).find(
    (entry) => entry.id === "angular",
  );
  if (angularFixture?.formsSupportClaim !== expectedSupportClaim) {
    addFailure(
      failures,
      `consumer manifest Angular forms claim must be ${expectedSupportClaim}`,
    );
  }
  if (
    !(angularFixture?.exampleFiles ?? []).includes(
      "src/app/vyrnforge-form-control.directive.ts",
    )
  ) {
    addFailure(
      failures,
      "consumer manifest must index the Angular Forms directive",
    );
  }
}

function verifyRuntimeEvidence(root, failures) {
  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of [
    'vf-text-input[name="reactiveOwner"]',
    "data-reactive-value",
    "dirty=true",
    "touched=true",
    "disabled=true",
    "vyrnForgeError=true",
    "status=VALID",
    'vf-checkbox[name="notifications"]',
    "Angular ngModel did not receive vf-checked-change",
  ]) {
    if (!runtime.includes(marker)) {
      addFailure(
        failures,
        `Angular Forms runtime evidence is missing ${marker}`,
      );
    }
  }
}

function verifyPackageBoundary(root, failures) {
  const packageRoot = path.join(root, "packages");
  for (const directory of readdirSync(packageRoot, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const packagePath = path.join(packageRoot, directory.name, "package.json");
    if (!existsSync(packagePath)) continue;
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    const dependencyNames = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
      ...packageJson.optionalDependencies,
    });
    if (dependencyNames.some((name) => name.startsWith("@angular/"))) {
      addFailure(failures, `${packageJson.name} must not depend on Angular`);
    }
  }

  const packagesMetadata = readJson(root, "docs/metadata/packages.json");
  const nonGridBeta = packagesMetadata.releaseGroups?.nonGridBeta ?? [];
  if (
    nonGridBeta.length !== 4 ||
    ![
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-elements",
    ].every((packageName) => nonGridBeta.includes(packageName))
  ) {
    addFailure(
      failures,
      "Angular Forms adapter must not change the approved four-package beta release group",
    );
  }
}

export function verifyAngularFormsAdapter(root = repositoryRoot) {
  const failures = [];
  for (const relativePath of requiredFiles) {
    if (!existsSync(path.join(root, relativePath))) {
      addFailure(
        failures,
        `missing required Angular Forms file ${relativePath}`,
      );
    }
  }
  if (failures.length > 0) return failures;

  verifyMetadata(root, failures);
  verifyDirective(root, failures);
  verifyFixture(root, failures);
  verifyRuntimeEvidence(root, failures);
  verifyPackageBoundary(root, failures);
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyAngularFormsAdapter();
  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Angular Forms adapter verification passed.");
  }
}

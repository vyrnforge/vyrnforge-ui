import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const angularVersion = "22.0.8";
const expectedSupportClaim = "angular-forms-adapter-verified";
const directivePath = "packages/ui-angular/src/forms.ts";
const valueModelsPath = "packages/ui-angular/src/forms-value-models.ts";
const valueModelsTestPath =
  "packages/ui-angular/src/forms-value-models.test.ts";
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
const expectedValueModels = {
  value: [
    "vf-date-input",
    "vf-datetime-input",
    "vf-search-input",
    "vf-text-input",
    "vf-textarea",
  ],
  checked: ["vf-checkbox", "vf-switch"],
  numeric: ["vf-number-input", "vf-rating", "vf-slider"],
  collection: ["vf-multi-select", "vf-transfer-list"],
  selection: ["vf-autocomplete", "vf-select"],
};
const requiredFiles = [
  "docs/metadata/angular-forms-adapter.json",
  "docs/testing/angular-forms-adapter-contract.md",
  directivePath,
  valueModelsPath,
  valueModelsTestPath,
  "packages/ui-angular/package.json",
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

function sameSet(actual, expected) {
  const actualSet = new Set(actual ?? []);
  return (
    actualSet.size === expected.length &&
    expected.every((entry) => actualSet.has(entry))
  );
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
  if (adapter.location !== directivePath) {
    addFailure(
      failures,
      `Angular Forms adapter location must be ${directivePath}`,
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

  if (!sameSet(adapter.supportedTags, supportedTags)) {
    addFailure(failures, "Angular Forms supported tag catalog is incomplete");
  }

  const valueMapping = metadata.valueMapping ?? {};
  for (const [kind, tags] of Object.entries(expectedValueModels)) {
    if (!sameSet(valueMapping[kind], tags)) {
      addFailure(
        failures,
        `Angular Forms ${kind} value-model metadata is incomplete`,
      );
    }
  }
  if (valueMapping.coercionPolicy !== "reject-incompatible-runtime-values") {
    addFailure(
      failures,
      "Angular Forms value models must reject incompatible runtime values",
    );
  }
  if (valueMapping.nullSemantics?.mixedCheckedRead !== "null") {
    addFailure(failures, "mixed checked values must map to null");
  }
  if (valueMapping.nullSemantics?.emptyNumberInputRead !== "null") {
    addFailure(failures, "empty number-input values must map to null");
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
  const directive = read(root, directivePath);
  for (const marker of [
    "standalone: true",
    "implements ControlValueAccessor, OnDestroy, Validator",
    "provide: NG_VALUE_ACCESSOR",
    "provide: NG_VALIDATORS",
    "writeValue(value: unknown)",
    "registerOnChange",
    "registerOnTouched",
    "setDisabledState",
    "validate(_control: AbstractControl)",
    "registerOnValidatorChange",
    '"focusout"',
    '"vf-checked-change"',
    '"vf-invalid"',
    '"vf-value-change"',
    "convertAngularFormValueToElement(element.localName, value)",
    "convertElementValueToAngularForm(element.localName, detail.value)",
    "convertElementValueToAngularForm(element.localName, detail.checked)",
    "element.disabled || !element.willValidate || element.validity.valid",
    "message: element.validationMessage",
    "validity: serializeValidity(element.validity)",
    "this.onTouched();\n    this.requestValidatorRefresh();",
    "queueMicrotask(() => this.onValidatorChange())",
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
    "host: {",
    "value.map((entry) => String(entry))",
    "Number(value ?? 0)",
  ]) {
    if (directive.includes(forbidden)) {
      addFailure(
        failures,
        `Angular Forms directive must not contain ${forbidden}`,
      );
    }
  }
}

function verifyValueModels(root, failures) {
  const models = read(root, valueModelsPath);
  const tests = read(root, valueModelsTestPath);

  for (const [kind, tags] of Object.entries(expectedValueModels)) {
    for (const tag of tags) {
      const marker = `tagName: "${tag}",\n    kind: "${kind}"`;
      if (!models.includes(marker)) {
        addFailure(
          failures,
          `Angular Forms value-model table must map ${tag} to ${kind}`,
        );
      }
    }
  }

  for (const marker of [
    "convertAngularFormValueToElement",
    "convertElementValueToAngularForm",
    "Unsupported form control tag",
    'tagName === "vf-number-input" ? String(value) : value',
    'if (value === "mixed") return null',
    "Object.freeze([...value])",
  ]) {
    if (!models.includes(marker)) {
      addFailure(
        failures,
        `Angular Forms value-model source is missing ${marker}`,
      );
    }
  }

  for (const marker of [
    '"vf-number-input", 42.5',
    '"vf-checkbox", "mixed"',
    '"vf-multi-select", ["alpha", 2]',
    '"vf-autocomplete").kind',
    '"vf-select").kind',
    '"vf-radio"',
    "Number.POSITIVE_INFINITY",
  ]) {
    if (!tests.includes(marker)) {
      addFailure(
        failures,
        `Angular Forms conversion suite is missing ${marker}`,
      );
    }
  }
}

function verifyPackageEntrypoint(root, failures) {
  const packageJson = readJson(root, "packages/ui-angular/package.json");
  const formsExport = packageJson.exports?.["./forms"];
  if (
    formsExport?.types !== "./dist/forms.d.ts" ||
    formsExport?.import !== "./dist/forms.js" ||
    formsExport?.default !== "./dist/forms.js"
  ) {
    addFailure(
      failures,
      "@vyrnforge/ui-angular/forms package export is incomplete",
    );
  }
  if (packageJson.peerDependencies?.["@angular/forms"] !== ">=22 <23") {
    addFailure(failures, "@angular/forms peer range must remain >=22 <23");
  }
  if (packageJson.peerDependenciesMeta?.["@angular/forms"]?.optional !== true) {
    addFailure(failures, "@angular/forms peer must remain optional");
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
    'from "@vyrnforge/ui-angular/forms"',
    "VyrnForgeFormControlDirective",
    "ownerValidationMessage",
    "ownerValueMissing",
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
    "data-reactive-state",
    "vyrnForgeError=",
    "message={{ ownerValidationMessage }}",
    "valueMissing={{ ownerValueMissing }}",
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
    (angularFixture?.exampleFiles ?? []).some((entry) =>
      entry.includes("vyrnforge-form-control.directive.ts"),
    )
  ) {
    addFailure(
      failures,
      "consumer manifest must not index a copied Angular Forms directive",
    );
  }
}

function verifyRuntimeEvidence(root, failures) {
  const runtime = read(root, "scripts/verify-consumer-foundations-runtime.mjs");
  for (const marker of [
    'vf-text-input[name="reactiveOwner"]',
    "dirty=true",
    "touched=true",
    "disabled=true",
    "vyrnForgeError=true",
    "status=VALID",
    "checkValidity",
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
    if (!directory.isDirectory() || directory.name === "ui-angular") continue;
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
      addFailure(
        failures,
        `${packageJson.name} must remain Angular-independent`,
      );
    }
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
  verifyValueModels(root, failures);
  verifyPackageEntrypoint(root, failures);
  verifyFixture(root, failures);
  verifyRuntimeEvidence(root, failures);
  verifyPackageBoundary(root, failures);
  return failures.sort();
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

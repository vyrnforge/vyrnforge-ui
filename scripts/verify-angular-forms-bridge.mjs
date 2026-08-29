import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const readText = (relativePath) =>
  readFile(path.join(repositoryRoot, relativePath), "utf8");

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

const [
  formsSource,
  consumerSource,
  consumerTemplate,
  packageManifestSource,
] = await Promise.all([
  readText("packages/ui-angular/src/forms.ts"),
  readText("tests/consumers/angular/src/app/app.component.ts"),
  readText("tests/consumers/angular/src/app/app.component.html"),
  readText("packages/ui-angular/package.json"),
]);
const packageManifest = JSON.parse(packageManifestSource);

for (const tag of supportedTags) {
  assert.match(
    formsSource,
    new RegExp(`${tag}\\[vfFormControl\\]`),
    `Angular Forms bridge must support ${tag}`,
  );
}
assert.match(formsSource, /provide:\s*NG_VALUE_ACCESSOR/);
assert.match(formsSource, /provide:\s*NG_VALIDATORS/);
assert.match(
  formsSource,
  /implements ControlValueAccessor, OnDestroy, Validator/,
);
assert.match(formsSource, /"vf-value-change"/);
assert.match(formsSource, /"vf-checked-change"/);
assert.match(formsSource, /"focusout"/);
assert.match(formsSource, /"vf-invalid"/);

assert.deepEqual(packageManifest.exports?.["./forms"], {
  types: "./dist/forms.d.ts",
  import: "./dist/forms.js",
  default: "./dist/forms.js",
});
assert.equal(
  packageManifest.peerDependenciesMeta?.["@angular/forms"]?.optional,
  true,
  "Forms peer must remain optional for root-only consumers",
);

assert.match(
  consumerSource,
  /from "@vyrnforge\/ui-angular\/forms"/,
  "Angular consumer must import the supported package Forms bridge",
);
assert.match(consumerTemplate, /formControlName="owner"/);
assert.match(consumerTemplate, /\[\(ngModel\)\]="notifications"/);

try {
  await access(
    path.join(
      repositoryRoot,
      "tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts",
    ),
  );
  assert.fail("Angular consumer must not retain a copied CVA implementation");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

console.log(
  `Angular Forms bridge verified: ${supportedTags.length} package-owned form-associated selectors with reactive and template-driven consumer coverage.`,
);

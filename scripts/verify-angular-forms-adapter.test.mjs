import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyAngularFormsAdapter } from "./verify-angular-forms-adapter.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const directivePath = "packages/ui-angular/src/forms.ts";
const valueModelsPath = "packages/ui-angular/src/forms-value-models.ts";

function withRepositoryCopy(mutate, callback) {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "vyrnforge-angular-forms-"),
  );
  cpSync(repositoryRoot, temporaryRoot, {
    recursive: true,
    filter(source) {
      return !source.includes(`${path.sep}node_modules${path.sep}`);
    },
  });

  try {
    mutate(temporaryRoot);
    callback(temporaryRoot);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function replaceInFile(root, relativePath, current, replacement) {
  const target = path.join(root, relativePath);
  const text = readFileSync(target, "utf8");
  assert.ok(text.includes(current), `${relativePath} is missing ${current}`);
  writeFileSync(target, text.replace(current, replacement));
}

test("repository Angular Forms adapter evidence is internally complete", () => {
  assert.deepEqual(verifyAngularFormsAdapter(repositoryRoot), []);
});

test("rejects a missing Angular value-accessor provider", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        directivePath,
        "provide: NG_VALUE_ACCESSOR",
        'provide: Symbol.for("missing-value-accessor")',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("NG_VALUE_ACCESSOR"),
        ),
      ),
  );
});

test("rejects missing native validation-message mapping", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        directivePath,
        "message: element.validationMessage",
        'message: "adapter-owned message"',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("message: element.validationMessage"),
        ),
      ),
  );
});

test("rejects missing serialized native validity mapping", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        directivePath,
        "validity: serializeValidity(element.validity)",
        "validity: {}",
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("serializeValidity"),
        ),
      ),
  );
});

test("rejects touched propagation without validator refresh", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        directivePath,
        "this.onTouched();\n    this.requestValidatorRefresh();",
        "this.onTouched();",
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("requestValidatorRefresh"),
        ),
      ),
  );
});

test("rejects a missing numeric model for the string-backed number input", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        valueModelsPath,
        'tagName: "vf-number-input",\n    kind: "numeric"',
        'tagName: "vf-number-input",\n    kind: "value"',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("numeric") || failure.includes("value-model table"),
        ),
      ),
  );
});

test("rejects removal of strict runtime conversion policy", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        "docs/metadata/angular-forms-adapter.json",
        '"coercionPolicy": "reject-incompatible-runtime-values"',
        '"coercionPolicy": "coerce"',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("reject incompatible runtime values"),
        ),
      ),
  );
});

test("rejects missing collection conversion coverage", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        "packages/ui-angular/src/forms-value-models.test.ts",
        '"vf-multi-select", ["alpha", 2]',
        '"vf-multi-select", ["alpha", "2"]',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("conversion suite"),
        ),
      ),
  );
});

test("rejects missing template-driven Forms evidence", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        "tests/consumers/angular/src/app/app.component.html",
        '[(ngModel)]="notifications"',
        '[checked]="notifications"',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("[(ngModel)]"),
        ),
      ),
  );
});

test("rejects missing packed validation-message evidence", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        "tests/consumers/angular/src/app/app.component.html",
        "message={{ ownerValidationMessage }}",
        "message=removed",
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("ownerValidationMessage"),
        ),
      ),
  );
});

test("rejects Angular dependency leakage into shared foundations", () => {
  withRepositoryCopy(
    (root) => {
      const target = path.join(root, "packages/ui-elements/package.json");
      const packageJson = JSON.parse(readFileSync(target, "utf8"));
      packageJson.dependencies["@angular/forms"] = "22.0.8";
      writeFileSync(target, `${JSON.stringify(packageJson, null, 2)}\n`);
    },
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("Angular-independent"),
        ),
      ),
  );
});

test("rejects missing disabled-state runtime evidence", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
        "disabled=true",
        "disabled-state-removed",
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("disabled=true"),
        ),
      ),
  );
});

test("rejects Angular host-listener metadata over typed Custom Element unions", () => {
  withRepositoryCopy(
    (root) =>
      replaceInFile(
        root,
        directivePath,
        "private readonly listenerCleanup",
        'host: { "(vf-value-change)": "handleValueChange($event)" };\n  private readonly listenerCleanup',
      ),
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("host: {"),
        ),
      ),
  );
});

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
        "tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts",
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

test("rejects Angular dependency leakage into ui-elements", () => {
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
          failure.includes("must not depend on Angular"),
        ),
      ),
  );
});

test("rejects an invented published Angular package", () => {
  withRepositoryCopy(
    (root) => {
      const target = path.join(
        root,
        "docs/metadata/angular-forms-adapter.json",
      );
      const metadata = JSON.parse(readFileSync(target, "utf8"));
      metadata.adapter.publishedPackage = "@vyrnforge/angular";
      writeFileSync(target, `${JSON.stringify(metadata, null, 2)}\n`);
    },
    (root) =>
      assert.ok(
        verifyAngularFormsAdapter(root).some((failure) =>
          failure.includes("must not invent a published Angular package"),
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
        "tests/consumers/angular/src/app/vyrnforge-form-control.directive.ts",
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

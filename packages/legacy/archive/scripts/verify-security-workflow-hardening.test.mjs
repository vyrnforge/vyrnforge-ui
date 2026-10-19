import assert from "node:assert/strict";
import test from "node:test";

import { findMissingMarkers } from "./security-workflow-hardening.mjs";

test("accepts a complete mandatory security marker set", () => {
  assert.deepEqual(
    findMissingMarkers("dependency-review CodeQL actionlint ShellCheck", [
      "dependency-review",
      "CodeQL",
      "actionlint",
      "ShellCheck",
    ]),
    [],
  );
});

test("reports every missing mandatory security marker", () => {
  assert.deepEqual(findMissingMarkers("CodeQL", ["CodeQL", "ShellCheck"]), [
    "ShellCheck",
  ]);
});

test("does not treat partial marker matches as complete", () => {
  assert.deepEqual(findMissingMarkers("action", ["actionlint"]), [
    "actionlint",
  ]);
});

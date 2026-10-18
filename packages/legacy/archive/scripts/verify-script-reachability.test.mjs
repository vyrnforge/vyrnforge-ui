import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  analyzeScriptReachability,
  verifyScriptReachability,
} from "./verify-script-reachability.mjs";

function fixture(files, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-script-reachability-"),
  );
  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const absolutePath = path.join(root, relativePath);
      mkdirSync(path.dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content);
    }
    callback(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("follows entrypoint imports and explicit script references", () =>
  fixture(
    {
      "package.json": '{"scripts":{"verify":"node scripts/entry.mjs"}}\n',
      "scripts/entry.mjs":
        'import "./helper.mjs";\nconst testFile = "scripts/check.test.mjs";\n',
      "scripts/helper.mjs": "export const value = true;\n",
      "scripts/check.test.mjs": 'import "./helper.mjs";\n',
    },
    (root) => {
      const analysis = analyzeScriptReachability({ root });
      assert.deepEqual(analysis.orphans, []);
      assert.deepEqual(analysis.reachable, [
        "scripts/check.test.mjs",
        "scripts/entry.mjs",
        "scripts/helper.mjs",
      ]);
    },
  ));

test("reports a genuinely unreachable script", () =>
  fixture(
    {
      "package.json": '{"scripts":{"verify":"node scripts/entry.mjs"}}\n',
      "scripts/entry.mjs": 'console.log("entry");\n',
      "scripts/orphan.mjs": 'console.log("orphan");\n',
    },
    (root) => {
      assert.deepEqual(verifyScriptReachability({ root }), [
        "scripts/orphan.mjs: script is unreachable from root npm/workflow entrypoints and is not an intentional scripts/fixtures file",
      ]);
    },
  ));

test("classifies scripts fixtures as intentional even when unreachable", () =>
  fixture(
    {
      "package.json": '{"scripts":{"verify":"node scripts/entry.mjs"}}\n',
      "scripts/entry.mjs": 'console.log("entry");\n',
      "scripts/fixtures/example/invalid.ts": "export const invalid = true;\n",
    },
    (root) => {
      const analysis = analyzeScriptReachability({ root });
      assert.deepEqual(analysis.orphans, []);
      assert.deepEqual(analysis.fixtureFiles, [
        "scripts/fixtures/example/invalid.ts",
      ]);
    },
  ));

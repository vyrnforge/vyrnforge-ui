import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { refContainsOrMatchesMain } from "./verify-lane-drift.mjs";

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd, file, content, message) {
  writeFileSync(path.join(cwd, file), content);
  git(cwd, "add", file);
  git(cwd, "commit", "-m", message);
  return git(cwd, "rev-parse", "HEAD");
}

function repository() {
  const cwd = mkdtempSync(path.join(tmpdir(), "vyrnforge-lane-drift-"));
  git(cwd, "init", "-b", "main");
  git(cwd, "config", "user.email", "ci@example.invalid");
  git(cwd, "config", "user.name", "VyrnForge CI");
  commit(cwd, "state.txt", "base\n", "base");
  return cwd;
}

test("accepts a lane that contains current main", () => {
  const cwd = repository();
  const main = commit(cwd, "state.txt", "main\n", "main change");
  git(cwd, "switch", "-c", "integration/test");
  commit(cwd, "lane.txt", "lane\n", "lane change");

  assert.deepEqual(
    refContainsOrMatchesMain(main, "integration/test", { cwd }),
    {
      current: true,
      reason: "contains-main",
    },
  );
});

test("accepts squash-equivalent lane trees", () => {
  const cwd = repository();
  const base = git(cwd, "rev-parse", "HEAD");
  const main = commit(cwd, "state.txt", "promoted\n", "main squash");
  git(cwd, "switch", "-c", "integration/test", base);
  commit(cwd, "state.txt", "promoted\n", "lane equivalent");

  assert.deepEqual(
    refContainsOrMatchesMain(main, "integration/test", { cwd }),
    {
      current: true,
      reason: "tree-equivalent",
    },
  );
});

test("rejects a lane missing current main content", () => {
  const cwd = repository();
  const base = git(cwd, "rev-parse", "HEAD");
  const main = commit(cwd, "state.txt", "main\n", "main change");
  git(cwd, "switch", "-c", "integration/test", base);
  commit(cwd, "lane.txt", "lane\n", "lane change");

  assert.deepEqual(
    refContainsOrMatchesMain(main, "integration/test", { cwd }),
    {
      current: false,
      reason: "missing-main",
    },
  );
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  refContainsOrMatchesMain,
  verifyPullRequestLaneDrift,
} from "./verify-lane-drift.mjs";

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
  git(cwd, "remote", "add", "origin", cwd);
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

test("accepts replayed current-main content plus lane-only work", () => {
  const cwd = repository();
  const base = git(cwd, "rev-parse", "HEAD");
  const main = commit(cwd, "state.txt", "promoted\n", "main promotion");
  git(cwd, "switch", "-c", "integration/test", base);
  commit(cwd, "state.txt", "promoted\n", "replay main content");
  commit(cwd, "lane.txt", "lane-only\n", "lane-only work");

  assert.deepEqual(
    refContainsOrMatchesMain(main, "integration/test", { cwd }),
    {
      current: true,
      reason: "contains-main-content",
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

test("accepts a sync branch containing current main when the target lane is stale", () => {
  const cwd = repository();
  const base = git(cwd, "rev-parse", "HEAD");
  const main = commit(cwd, "state.txt", "main\n", "main change");
  git(cwd, "branch", "-f", "main", main);
  git(cwd, "switch", "-c", "integration/platform", base);
  const lane = commit(cwd, "lane.txt", "lane\n", "lane work");
  git(cwd, "switch", "-c", "sync/platform-current-main", main);
  const sync = commit(cwd, "sync.txt", "sync\n", "sync work");

  assert.deepEqual(
    verifyPullRequestLaneDrift({
      baseRef: "integration/platform",
      baseSha: lane,
      headRef: "sync/platform-current-main",
      headSha: sync,
      mainRef: main,
      cwd,
    }),
    {
      mode: "lane-sync",
      current: true,
      reason: "contains-main",
    },
  );
});

test("rejects an ordinary task branch when the target lane is stale", () => {
  const cwd = repository();
  const base = git(cwd, "rev-parse", "HEAD");
  const main = commit(cwd, "state.txt", "main\n", "main change");
  git(cwd, "branch", "-f", "main", main);
  git(cwd, "switch", "-c", "integration/platform", base);
  const lane = commit(cwd, "lane.txt", "lane\n", "lane work");
  git(cwd, "switch", "-c", "feat/platform-task");
  const task = commit(cwd, "task.txt", "task\n", "task work");

  assert.throws(
    () =>
      verifyPullRequestLaneDrift({
        baseRef: "integration/platform",
        baseSha: lane,
        headRef: "feat/platform-task",
        headSha: task,
        mainRef: main,
        cwd,
      }),
    /integration\/platform is stale relative to main/u,
  );
});

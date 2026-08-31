import { execFileSync } from "node:child_process";

export const persistentIntegrationLanes = [
  "integration/foundation",
  "integration/native",
  "integration/react",
  "integration/angular",
  "integration/vue",
  "integration/data-grid",
  "integration/docs",
  "integration/platform",
];

function git(args, { cwd = process.cwd(), allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", allowFailure ? "pipe" : "inherit"],
    }).trim();
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

export function refContainsOrMatchesMain(mainRef, laneRef, options = {}) {
  const mainTree = git(["rev-parse", `${mainRef}^{tree}`], options);
  const laneTree = git(["rev-parse", `${laneRef}^{tree}`], options);
  if (mainTree === laneTree) {
    return { current: true, reason: "tree-equivalent" };
  }

  const ancestor = git(
    ["merge-base", "--is-ancestor", mainRef, laneRef],
    { ...options, allowFailure: true },
  );
  return ancestor !== null
    ? { current: true, reason: "contains-main" }
    : { current: false, reason: "missing-main" };
}

function fetchRef(remote, ref, options = {}) {
  git(["fetch", "--no-tags", "--prune", remote, ref], options);
}

export function verifyPullRequestLaneDrift({
  baseRef,
  baseSha,
  headRef,
  headSha,
  mainRef = "origin/main",
  remote = "origin",
  cwd = process.cwd(),
}) {
  if (!baseRef || !baseSha || !headRef || !headSha) {
    throw new Error("lane drift verification requires PR base/head refs and SHAs");
  }

  fetchRef(remote, "main", { cwd });

  if (baseRef.startsWith("integration/")) {
    if (headRef === "main") {
      return { mode: "lane-sync", current: true, reason: "main-sync-pr" };
    }
    const status = refContainsOrMatchesMain(mainRef, baseSha, { cwd });
    if (!status.current) {
      throw new Error(
        `${baseRef} is stale relative to main; synchronize main -> ${baseRef} before merging task work`,
      );
    }
    return { mode: "task", ...status };
  }

  if (baseRef === "main" && headRef.startsWith("integration/")) {
    const status = refContainsOrMatchesMain(baseSha, headSha, { cwd });
    if (!status.current) {
      throw new Error(
        `${headRef} does not contain current main; synchronize main into the lane before promotion`,
      );
    }
    return { mode: "promotion", ...status };
  }

  return { mode: "not-applicable", current: true, reason: "non-lane-pr" };
}

export function verifyAllPersistentLanes({
  remote = "origin",
  mainRef = "origin/main",
  cwd = process.cwd(),
} = {}) {
  fetchRef(remote, "main", { cwd });
  for (const lane of persistentIntegrationLanes) {
    fetchRef(remote, lane, { cwd });
  }

  const results = persistentIntegrationLanes.map((lane) => {
    const remoteLane = `${remote}/${lane}`;
    return { lane, ...refContainsOrMatchesMain(mainRef, remoteLane, { cwd }) };
  });
  const stale = results.filter((result) => !result.current);
  if (stale.length) {
    throw new Error(
      `persistent integration lanes are stale relative to main: ${stale.map(({ lane }) => lane).join(", ")}`,
    );
  }
  return results;
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function isMainModule() {
  return process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll("\\", "/"));
}

if (isMainModule()) {
  const cwd = argument("--cwd") ?? process.cwd();
  if (process.argv.includes("--all")) {
    const results = verifyAllPersistentLanes({ cwd });
    console.log(JSON.stringify(results, null, 2));
  } else {
    const result = verifyPullRequestLaneDrift({
      baseRef: argument("--base-ref") ?? process.env.PR_BASE_REF,
      baseSha: argument("--base-sha") ?? process.env.PR_BASE_SHA,
      headRef: argument("--head-ref") ?? process.env.PR_HEAD_REF,
      headSha: argument("--head-sha") ?? process.env.PR_HEAD_SHA,
      cwd,
    });
    console.log(JSON.stringify(result, null, 2));
  }
}

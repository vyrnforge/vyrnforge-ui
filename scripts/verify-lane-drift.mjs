import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function isShallowRepository(options = {}) {
  return (
    git(["rev-parse", "--is-shallow-repository"], {
      ...options,
      allowFailure: true,
    }) === "true"
  );
}

function fetchRef(remote, ref, { fullHistory = false, ...options } = {}) {
  const args = ["fetch", "--no-tags"];
  if (fullHistory) {
    args.push("--depth=2147483647");
  }
  git([...args, remote, ref], options);
}

function ensureCommit(remote, sha, { fullHistory = false, ...options } = {}) {
  if (fullHistory) {
    fetchRef(remote, sha, { ...options, fullHistory: true });
    return;
  }
  if (
    git(["cat-file", "-e", `${sha}^{commit}`], {
      ...options,
      allowFailure: true,
    }) !== null
  ) {
    return;
  }
  fetchRef(remote, sha, options);
}

export function refContainsOrMatchesMain(mainRef, laneRef, options = {}) {
  const mainTree = git(["rev-parse", `${mainRef}^{tree}`], options);
  const laneTree = git(["rev-parse", `${laneRef}^{tree}`], options);
  if (mainTree === laneTree) {
    return { current: true, reason: "tree-equivalent" };
  }

  const ancestor = git(["merge-base", "--is-ancestor", mainRef, laneRef], {
    ...options,
    allowFailure: true,
  });
  if (ancestor !== null) {
    return { current: true, reason: "contains-main" };
  }

  const firstParentTrees = git(
    ["log", "--first-parent", "--format=%T", laneRef],
    options,
  )
    ?.split("\n")
    .filter(Boolean);
  if (firstParentTrees?.includes(mainTree)) {
    return { current: true, reason: "contains-main-content" };
  }

  const mergedTree = git(["merge-tree", "--write-tree", mainRef, laneRef], {
    ...options,
    allowFailure: true,
  });
  if (mergedTree?.split("\n", 1)[0] === laneTree) {
    return { current: true, reason: "contains-main-content" };
  }

  return { current: false, reason: "missing-main" };
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
    throw new Error(
      "lane drift verification requires PR base/head refs and SHAs",
    );
  }

  const hydrateHistory = isShallowRepository({ cwd });
  fetchRef(remote, "main", { cwd, fullHistory: hydrateHistory });
  ensureCommit(remote, baseSha, { cwd, fullHistory: hydrateHistory });
  ensureCommit(remote, headSha, { cwd, fullHistory: hydrateHistory });

  if (baseRef.startsWith("integration/")) {
    if (headRef === "main") {
      return { mode: "lane-sync", current: true, reason: "main-sync-pr" };
    }

    const baseStatus = refContainsOrMatchesMain(mainRef, baseSha, { cwd });
    if (!baseStatus.current) {
      if (headRef.startsWith("sync/")) {
        const headStatus = refContainsOrMatchesMain(mainRef, headSha, { cwd });
        if (headStatus.current) {
          return { mode: "lane-sync", ...headStatus };
        }
      }
      throw new Error(
        `${baseRef} is stale relative to main; synchronize main -> ${baseRef} before merging task work`,
      );
    }
    return { mode: "task", ...baseStatus };
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
    return {
      lane,
      ...refContainsOrMatchesMain(mainRef, remoteLane, { cwd }),
    };
  });
  const stale = results.filter((result) => !result.current);
  if (stale.length) {
    throw new Error(
      `persistent integration lanes are stale relative to main: ${stale.map(({ lane }) => lane).join(", ")}`,
    );
  }
  return results;
}

export function readPullRequestCoordinatesFromGitHubEvent({
  eventName = process.env.GITHUB_EVENT_NAME,
  eventPath = process.env.GITHUB_EVENT_PATH,
} = {}) {
  if (eventName !== "pull_request") return null;
  if (!eventPath) {
    throw new Error(
      "GITHUB_EVENT_PATH is required for pull-request lane drift verification",
    );
  }
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  const pullRequest = event.pull_request;
  if (
    !pullRequest?.base?.ref ||
    !pullRequest?.base?.sha ||
    !pullRequest?.head?.ref ||
    !pullRequest?.head?.sha
  ) {
    throw new Error(
      "GitHub pull-request event is missing base/head coordinates",
    );
  }
  return {
    baseRef: pullRequest.base.ref,
    baseSha: pullRequest.base.sha,
    headRef: pullRequest.head.ref,
    headSha: pullRequest.head.sha,
  };
}

export function verifyCurrentGitHubPullRequestLaneDrift(options = {}) {
  const coordinates = readPullRequestCoordinatesFromGitHubEvent(options);
  if (!coordinates) {
    return { mode: "not-applicable", current: true, reason: "non-pr-event" };
  }
  return verifyPullRequestLaneDrift({ ...coordinates, ...options });
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function isMainModule() {
  return Boolean(
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isMainModule()) {
  const cwd = argument("--cwd") ?? process.cwd();
  if (process.argv.includes("--all")) {
    const results = verifyAllPersistentLanes({ cwd });
    console.log(JSON.stringify(results, null, 2));
  } else if (process.argv.includes("--github-event")) {
    const result = verifyCurrentGitHubPullRequestLaneDrift({ cwd });
    console.log(JSON.stringify(result, null, 2));
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

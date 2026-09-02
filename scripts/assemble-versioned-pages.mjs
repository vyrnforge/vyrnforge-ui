import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siteDirectory = path.join(repositoryRoot, "site");
const snapshotsDirectory = path.join(
  repositoryRoot,
  ".pages-release-snapshots",
);
const releaseGroupsPath = path.join(
  repositoryRoot,
  "docs/metadata/release-groups.json",
);
const releaseGroups = JSON.parse(readFileSync(releaseGroupsPath, "utf8"));
const releaseLineEntries = Object.entries(releaseGroups.releaseLines ?? {});
const primaryReleaseLine =
  releaseLineEntries.find(([id]) => id.startsWith("non-grid")) ??
  releaseLineEntries[0];

if (!primaryReleaseLine?.[1]?.version) {
  throw new Error("Missing primary release-line metadata for documentation.");
}

const [primaryReleaseLineId, primaryRelease] = primaryReleaseLine;

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
    ...options,
  });
}

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Expected Pages input does not exist: ${source}`);
  }
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function parseSemver(version) {
  const match = version.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/,
  );
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? "",
  };
}

function compareVersions(left, right) {
  const a = parseSemver(left.version);
  const b = parseSemver(right.version);
  if (!a || !b) return right.version.localeCompare(left.version);
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  if (a.patch !== b.patch) return b.patch - a.patch;
  if (!a.prerelease && b.prerelease) return -1;
  if (a.prerelease && !b.prerelease) return 1;
  return b.prerelease.localeCompare(a.prerelease, undefined, {
    numeric: true,
  });
}

function channelForVersion(version) {
  const prerelease = parseSemver(version)?.prerelease ?? "";
  if (prerelease.startsWith("alpha")) return "alpha";
  if (prerelease.startsWith("beta")) return "beta";
  if (prerelease.startsWith("rc")) return "rc";
  return "stable";
}

function discoverDocumentationReleases() {
  const refs = execFileSync(
    "git",
    ["for-each-ref", "--format=%(refname:strip=2)", "refs/tags"],
    { cwd: repositoryRoot, encoding: "utf8" },
  )
    .split(/\r?\n/u)
    .map((tag) => tag.trim())
    .filter(Boolean);

  const releases = [];
  const seenVersions = new Set();
  for (const tag of refs) {
    const canonical = tag.match(/^(non-grid[^/]*)\/v(.+)$/u);
    const legacy = tag.match(/^v(.+)$/u);
    const version = canonical?.[2] ?? legacy?.[1];
    if (!version || !parseSemver(version) || seenVersions.has(version)) {
      continue;
    }

    const releaseLine =
      canonical?.[1] ??
      (version === primaryRelease.version
        ? primaryReleaseLineId
        : "non-grid-legacy");
    releases.push({
      id: `v${version}`,
      releaseLine,
      version,
      channel: channelForVersion(version),
      tag,
      path: `/versions/v${version}/`,
      docsPath: `/versions/v${version}/`,
      playgroundPath: `/versions/v${version}/playground/`,
      legacy: Boolean(legacy && !canonical),
    });
    seenVersions.add(version);
  }

  return releases.sort(compareVersions);
}

function buildReleasedReference(release) {
  const worktree = path.join(
    repositoryRoot,
    `.pages-release-worktree-${release.version.replace(/[^0-9A-Za-z.-]/gu, "-")}`,
  );
  const snapshot = path.join(snapshotsDirectory, `v${release.version}`);
  rmSync(worktree, { recursive: true, force: true });
  rmSync(snapshot, { recursive: true, force: true });

  run("git", ["worktree", "add", "--detach", worktree, release.tag]);
  try {
    execFileSync("npm", ["ci"], {
      cwd: worktree,
      stdio: "inherit",
    });
    execFileSync("npm", ["run", "build:packages"], {
      cwd: worktree,
      stdio: "inherit",
    });
    execFileSync(
      "npm",
      ["run", "build", "--workspace", "@vyrnforge/ui-docs"],
      {
        cwd: worktree,
        env: {
          ...process.env,
          VITE_BASE_PATH: `/vyrnforge-ui/versions/v${release.version}/`,
          VITE_DOCS_ROOT_PATH: "/vyrnforge-ui/",
          VITE_DOCS_VERSION_ID: release.id,
          VITE_DOCS_RELEASE_LINE: release.releaseLine,
          VITE_DOCS_RELEASE_VERSION: release.version,
          VITE_DOCS_RELEASE_CHANNEL: release.channel,
        },
        stdio: "inherit",
      },
    );
    execFileSync(
      "npm",
      ["run", "build", "--workspace", "@vyrnforge/ui-data-grid-basic-playground"],
      {
        cwd: worktree,
        env: {
          ...process.env,
          VITE_BASE_PATH: `/vyrnforge-ui/versions/v${release.version}/playground/`,
          VITE_PLAYGROUND_ROOT_PATH: "/vyrnforge-ui/",
          VITE_PLAYGROUND_VERSION_ID: release.id,
          VITE_PLAYGROUND_RELEASE_LINE: release.releaseLine,
          VITE_PLAYGROUND_RELEASE_VERSION: release.version,
          VITE_PLAYGROUND_RELEASE_CHANNEL: release.channel,
        },
        stdio: "inherit",
      },
    );

    copyDirectory(path.join(worktree, "apps/docs/dist"), snapshot);
    copyDirectory(
      path.join(worktree, "examples/basic-playground/dist"),
      path.join(snapshot, "playground"),
    );
  } finally {
    run("git", ["worktree", "remove", "--force", worktree]);
  }
}

const releases = discoverDocumentationReleases();
if (releases.length === 0) {
  throw new Error("No SemVer non-grid documentation release tags were found.");
}

rmSync(snapshotsDirectory, { recursive: true, force: true });
mkdirSync(snapshotsDirectory, { recursive: true });
for (const release of releases) {
  buildReleasedReference(release);
}

rmSync(siteDirectory, { recursive: true, force: true });
mkdirSync(siteDirectory, { recursive: true });
copyDirectory(path.join(repositoryRoot, "apps/docs/dist"), siteDirectory);
copyDirectory(
  path.join(repositoryRoot, "examples/basic-playground/dist"),
  path.join(siteDirectory, "playground"),
);
for (const release of releases) {
  copyDirectory(
    path.join(snapshotsDirectory, `v${release.version}`),
    path.join(siteDirectory, "versions", `v${release.version}`),
  );
}
rmSync(snapshotsDirectory, { recursive: true, force: true });

const currentCommit =
  process.env.GITHUB_SHA ??
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
const current = {
  id: "next",
  releaseLine: primaryReleaseLineId,
  version: primaryRelease.version,
  channel: "next",
  sourceChannel: primaryRelease.channel,
  path: "/",
  docsPath: "/",
  playgroundPath: "/playground/",
  commit: currentCommit,
};
const releaseLines = releaseLineEntries.map(([id, releaseLine]) => ({
  id,
  intent: releaseLine.intent,
  channel: releaseLine.channel,
  version: releaseLine.version,
  distTag: releaseLine.distTag,
  publishable: Boolean(releaseLine.publication?.publishable),
  publishTogether: Boolean(releaseLine.publication?.publishTogether),
  packages: (releaseLine.packages ?? []).map(
    (packageEntry) => packageEntry.name,
  ),
}));
const versionCatalog = {
  schemaVersion: 2,
  generatedFrom: "docs/metadata/release-groups.json + Git release tags",
  current,
  releaseLines,
  releases,
};
const legacyDocsManifest = {
  schemaVersion: 1,
  current: {
    id: current.id,
    releaseLine: current.releaseLine,
    version: current.version,
    path: current.path,
  },
  releases,
};

writeFileSync(path.join(siteDirectory, ".nojekyll"), "");
writeFileSync(
  path.join(siteDirectory, "vyrnforge-versions.json"),
  `${JSON.stringify(versionCatalog, null, 2)}\n`,
);
writeFileSync(
  path.join(siteDirectory, "docs-versions.json"),
  `${JSON.stringify(legacyDocsManifest, null, 2)}\n`,
);

console.log(
  `Assembled Pages reference with current main and ${releases.length} retained release snapshot(s): ${releases
    .map((release) => release.version)
    .join(", ")}.`,
);

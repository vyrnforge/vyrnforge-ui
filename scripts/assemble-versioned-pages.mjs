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
const releaseSnapshotDirectory = path.join(
  repositoryRoot,
  ".pages-release-snapshot",
);
const releaseGroupsPath = path.join(
  repositoryRoot,
  "docs/metadata/release-groups.json",
);
const releaseGroups = JSON.parse(readFileSync(releaseGroupsPath, "utf8"));
const releaseLineId = "non-grid-beta";
const releaseLine = releaseGroups.releaseLines?.[releaseLineId];

if (!releaseLine?.version) {
  throw new Error(`Missing ${releaseLineId} release metadata.`);
}

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
    ...options,
  });
}

function hasGitRef(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], {
      cwd: repositoryRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function resolveReleaseTag() {
  const canonicalTemplate = releaseLine.tagIdentity?.tagTemplate;
  const canonicalTag = canonicalTemplate
    ?.replace("{releaseLineId}", releaseLineId)
    .replace("{version}", releaseLine.version);
  const legacyTag = `v${releaseLine.version}`;

  for (const candidate of [canonicalTag, legacyTag]) {
    if (candidate && hasGitRef(candidate)) return candidate;
  }

  throw new Error(
    `No release tag found for ${releaseLineId} ${releaseLine.version}. Tried ${[
      canonicalTag,
      legacyTag,
    ]
      .filter(Boolean)
      .join(", ")}.`,
  );
}

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Expected Pages input does not exist: ${source}`);
  }
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function buildReleasedDocs(releaseTag) {
  const worktree = path.join(repositoryRoot, ".pages-release-worktree");
  rmSync(worktree, { recursive: true, force: true });
  rmSync(releaseSnapshotDirectory, { recursive: true, force: true });

  run("git", ["worktree", "add", "--detach", worktree, releaseTag]);
  try {
    execFileSync("npm", ["ci"], {
      cwd: worktree,
      stdio: "inherit",
    });
    execFileSync("npm", ["run", "build", "--workspace", "@vyrnforge/ui-core"], {
      cwd: worktree,
      stdio: "inherit",
    });
    execFileSync(
      "npm",
      ["run", "build", "--workspace", "@vyrnforge/ui-components"],
      {
        cwd: worktree,
        stdio: "inherit",
      },
    );
    execFileSync("npm", ["run", "build", "--workspace", "@vyrnforge/ui-docs"], {
      cwd: worktree,
      env: {
        ...process.env,
        VITE_BASE_PATH: `/vyrnforge-ui/versions/v${releaseLine.version}/`,
      },
      stdio: "inherit",
    });
    copyDirectory(
      path.join(worktree, "apps/docs/dist"),
      releaseSnapshotDirectory,
    );
  } finally {
    run("git", ["worktree", "remove", "--force", worktree]);
  }
}

const releaseTag = resolveReleaseTag();
buildReleasedDocs(releaseTag);

rmSync(siteDirectory, { recursive: true, force: true });
mkdirSync(siteDirectory, { recursive: true });
copyDirectory(path.join(repositoryRoot, "apps/docs/dist"), siteDirectory);
copyDirectory(
  path.join(repositoryRoot, "examples/basic-playground/dist"),
  path.join(siteDirectory, "playground"),
);
copyDirectory(
  releaseSnapshotDirectory,
  path.join(siteDirectory, "versions", `v${releaseLine.version}`),
);
rmSync(releaseSnapshotDirectory, { recursive: true, force: true });

writeFileSync(path.join(siteDirectory, ".nojekyll"), "");
writeFileSync(
  path.join(siteDirectory, "docs-versions.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      current: {
        id: "next",
        releaseLine: releaseLineId,
        version: releaseLine.version,
        path: "/",
      },
      releases: [
        {
          id: `v${releaseLine.version}`,
          releaseLine: releaseLineId,
          version: releaseLine.version,
          channel: releaseLine.channel,
          tag: releaseTag,
          path: `/versions/v${releaseLine.version}/`,
        },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Assembled Pages site with next docs and ${releaseLineId} ${releaseLine.version} (${releaseTag}).`,
);

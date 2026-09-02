import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const siteDirectory = path.resolve(repositoryRoot, process.argv[2] ?? "site");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireFile(relativePath) {
  const absolutePath = path.join(siteDirectory, relativePath);
  assert(existsSync(absolutePath), `Missing Pages artifact: ${relativePath}`);
  return absolutePath;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(requireFile(relativePath), "utf8"));
}

function relativeSitePath(urlPath) {
  return urlPath.replace(/^\/+|\/+$/gu, "");
}

requireFile("index.html");
requireFile("playground/index.html");
requireFile(".nojekyll");

const catalog = readJson("vyrnforge-versions.json");
const legacyDocsManifest = readJson("docs-versions.json");

assert(catalog.schemaVersion === 2, "Unsupported VyrnForge version catalog schema.");
assert(
  catalog.current?.id === "next",
  "Version catalog must expose current main as next.",
);
assert(
  typeof catalog.current?.commit === "string" &&
    catalog.current.commit.length >= 7,
  "Version catalog current entry must be commit-bound.",
);
assert(
  Array.isArray(catalog.releaseLines) && catalog.releaseLines.length > 0,
  "Version catalog must expose canonical release lines.",
);
assert(
  Array.isArray(catalog.releases) && catalog.releases.length > 0,
  "Version catalog must expose at least one tagged release.",
);
assert(
  legacyDocsManifest.schemaVersion === 1,
  "Legacy docs version manifest must remain schema version 1 while apps/docs consumes it.",
);

for (const release of catalog.releases) {
  assert(
    release.id === `v${release.version}`,
    `Invalid release id for ${release.version}.`,
  );
  assert(release.tag, `Release ${release.version} must identify its Git tag.`);
  assert(release.docsPath, `Release ${release.version} must expose docsPath.`);
  assert(
    release.playgroundPath,
    `Release ${release.version} must expose playgroundPath.`,
  );
  requireFile(path.join(relativeSitePath(release.docsPath), "index.html"));
  requireFile(
    path.join(relativeSitePath(release.playgroundPath), "index.html"),
  );
}

const legacyReleaseIds = new Set(
  (legacyDocsManifest.releases ?? []).map((release) => release.id),
);
for (const release of catalog.releases) {
  assert(
    legacyReleaseIds.has(release.id),
    `docs-versions.json is missing ${release.id}.`,
  );
}

console.log(
  `Verified Pages reference artifact: current ${catalog.current.commit.slice(0, 12)}, ${catalog.releaseLines.length} release line(s), ${catalog.releases.length} retained release(s).`,
);

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

function verifyCurrentReferenceBundle() {
  const index = readFileSync(requireFile("index.html"), "utf8");
  const scriptMatch = index.match(
    /<script[^>]+src=["']([^"']*\/assets\/index-[^"']+\.js)["']/u,
  );
  assert(
    scriptMatch,
    "Pages root index must reference the built Reference bundle.",
  );

  const scriptUrl = scriptMatch[1];
  assert(
    scriptUrl.startsWith("/vyrnforge-ui/"),
    "Pages root bundle must use the production /vyrnforge-ui/ base path.",
  );
  const bundlePath = scriptUrl.replace(/^\/vyrnforge-ui\//u, "");
  const bundle = readFileSync(requireFile(bundlePath), "utf8");

  for (const marker of [
    "Icon catalog",
    "Search icons",
    "icon-reference",
    "packages/ui-core/src/icons.ts",
  ]) {
    assert(
      bundle.includes(marker),
      `Pages current Reference bundle is missing Icons catalog marker: ${marker}`,
    );
  }
}

requireFile("index.html");
requireFile(".nojekyll");

const catalog = readJson("vyrnforge-versions.json");
const legacyDocsManifest = readJson("docs-versions.json");

assert(
  catalog.schemaVersion === 3,
  "Unsupported VyrnForge version catalog schema.",
);
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
for (const releaseLine of catalog.releaseLines) {
  assert(
    releaseLine.frameworkReadiness &&
      typeof releaseLine.frameworkReadiness === "object",
    `Release line ${releaseLine.id} must expose framework readiness.`,
  );
}
assert(
  catalog.current.frameworkReadiness &&
    typeof catalog.current.frameworkReadiness === "object",
  "Version catalog current entry must expose framework readiness.",
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
    release.frameworkReadiness &&
      typeof release.frameworkReadiness === "object",
    `Release ${release.version} must expose framework readiness.`,
  );
  requireFile(path.join(relativeSitePath(release.docsPath), "index.html"));
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

verifyCurrentReferenceBundle();

console.log(
  `Verified Pages reference artifact: current ${catalog.current.commit.slice(0, 12)}, ${catalog.releaseLines.length} release line(s), ${catalog.releases.length} retained release(s), current Icons catalog bundle present.`,
);

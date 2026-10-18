import { readFileSync, writeFileSync } from "node:fs";
import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
} from "./release-groups.mjs";
import { buildReleaseNotes } from "./release-notes.mjs";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const releaseGroupId = readArgument("--release-group");
const version = readArgument("--version");
const distTag = readArgument("--dist-tag");
const commit = readArgument("--commit") ?? process.env.GITHUB_SHA ?? "unknown";
const output = readArgument("--output");

if (!releaseGroupId || !version || !distTag || !output) {
  throw new Error(
    "usage: create-release-notes.mjs --release-group <group> --version <version> --dist-tag <tag> --output <file>",
  );
}

const manifest = readReleaseGroups();
const releaseGroup = getReleaseGroup(releaseGroupId, { manifest });
const packageMap = getReleasePackageMap(manifest);
if (version !== releaseGroup.version || distTag !== releaseGroup.distTag) {
  throw new Error(
    `${releaseGroupId} requires ${releaseGroup.version} with the ${releaseGroup.distTag} dist-tag`,
  );
}

const waiverManifest = JSON.parse(
  readFileSync(
    "docs/metadata/assistive-technology-release-waivers.json",
    "utf8",
  ),
);
const activeWaiver = (waiverManifest.waivers ?? []).find(
  (waiver) =>
    waiver.status === "active" &&
    waiver.releaseGroup === releaseGroupId &&
    waiver.version === version,
);
const notes = buildReleaseNotes({
  releaseGroupId,
  releaseGroup,
  packageMap,
  version,
  distTag,
  commit,
  activeWaiver,
});
writeFileSync(output, notes);

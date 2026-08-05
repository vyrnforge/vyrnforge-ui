import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const releaseGroupsPath = "docs/metadata/release-groups.json";

export function readReleaseGroups({ root = repositoryRoot } = {}) {
  return JSON.parse(readFileSync(path.join(root, releaseGroupsPath), "utf8"));
}

export function getReleaseGroup(
  releaseGroupId,
  { root = repositoryRoot, manifest = readReleaseGroups({ root }) } = {},
) {
  const releaseGroup = manifest.groups?.[releaseGroupId];
  if (!releaseGroup) {
    throw new Error(`unknown release group: ${releaseGroupId}`);
  }
  return releaseGroup;
}

export function getReleasePackageMap(manifest) {
  const entries = Object.entries(manifest.groups ?? {}).flatMap(
    ([releaseGroupId, releaseGroup]) =>
      (releaseGroup.packages ?? []).map((packageInfo) => [
        packageInfo.name,
        {
          ...packageInfo,
          releaseGroupId,
          version: releaseGroup.version,
          channel: releaseGroup.channel,
          distTag: releaseGroup.distTag,
        },
      ]),
  );
  return new Map(entries);
}

export function getReleasePackageNames(releaseGroup) {
  return (releaseGroup.packages ?? []).map((packageInfo) => packageInfo.name);
}

import releaseGroupsRaw from "../../../../docs/metadata/release-groups.json?raw";
import multiFrameworkRaw from "../../../../docs/metadata/multi-framework.json?raw";

export type PlaygroundFrameworkId = "native-html" | "react" | "angular" | "vue";

export type PlaygroundFramework = {
  id: PlaygroundFrameworkId;
  label: string;
  renderer: string;
  supportLevel: string;
};

type ReleaseGroupsMetadata = {
  releaseLines: Record<string, { channel: string; version: string }>;
};

type MultiFrameworkMetadata = {
  frameworks: Array<{
    id: PlaygroundFrameworkId;
    renderer: string;
    supportLevel: string;
  }>;
};

const releaseGroups = JSON.parse(releaseGroupsRaw) as ReleaseGroupsMetadata;
const multiFramework = JSON.parse(multiFrameworkRaw) as MultiFrameworkMetadata;

const frameworkLabels: Record<PlaygroundFrameworkId, string> = {
  react: "React",
  "native-html": "Native HTML",
  angular: "Angular",
  vue: "Vue",
};

export const playgroundFrameworks: PlaygroundFramework[] =
  multiFramework.frameworks.map((framework) => ({
    ...framework,
    label: frameworkLabels[framework.id],
  }));

export const playgroundVersions = Object.entries(
  releaseGroups.releaseLines,
).map(([id, releaseLine]) => ({
  id,
  label: `${releaseLine.version} · ${releaseLine.channel}`,
  version: releaseLine.version,
  channel: releaseLine.channel,
}));

export const defaultPlaygroundFramework: PlaygroundFrameworkId = "react";

export const defaultPlaygroundVersion =
  playgroundVersions.find((releaseLine) =>
    releaseLine.id.startsWith("non-grid"),
  ) ?? playgroundVersions[0];

import releaseGroupsRaw from "../../../docs/metadata/release-groups.json?raw";
import multiFrameworkRaw from "../../../docs/metadata/multi-framework.json?raw";

export type DocsFrameworkId = "native-html" | "react" | "angular" | "vue";

export type DocsFramework = {
  id: DocsFrameworkId;
  label: string;
  language: string;
  renderer: string;
  supportLevel: string;
  guidance: string;
};

export type DocsVersion = {
  id: string;
  label: string;
  releaseLine: string;
  channel: string;
  version: string;
  path: string;
};

type ReleaseGroupsMetadata = {
  releaseLines: Record<
    string,
    {
      channel: string;
      version: string;
    }
  >;
};

type MultiFrameworkMetadata = {
  frameworks: Array<{
    id: DocsFrameworkId;
    supportLevel: string;
    renderer: string;
  }>;
};

const releaseGroups = JSON.parse(releaseGroupsRaw) as ReleaseGroupsMetadata;
const multiFramework = JSON.parse(multiFrameworkRaw) as MultiFrameworkMetadata;

const frameworkPresentation: Record<
  DocsFrameworkId,
  Pick<DocsFramework, "label" | "language" | "guidance">
> = {
  "native-html": {
    label: "Native HTML",
    language: "HTML / JavaScript",
    guidance:
      "Use registered VyrnForge Custom Elements directly with shared tokens, DOM events, slots, methods, and form contracts.",
  },
  react: {
    label: "React",
    language: "TypeScript / JSX",
    guidance:
      "Use the React renderer while keeping behavior, tokens, accessibility, and public contracts aligned with the shared VyrnForge foundation.",
  },
  angular: {
    label: "Angular",
    language: "TypeScript / Templates",
    guidance:
      "Use the verified Angular consumer and adapter contracts over the shared VyrnForge element surface; do not invent framework-only behavior.",
  },
  vue: {
    label: "Vue",
    language: "TypeScript / SFC",
    guidance:
      "Use the verified Vue consumer and model-adapter contracts over the shared VyrnForge element surface; keep events and state semantics portable.",
  },
};

export const docsFrameworks: DocsFramework[] = multiFramework.frameworks.map(
  (framework) => ({
    ...framework,
    ...frameworkPresentation[framework.id],
  }),
);

const primaryReleaseLine = "non-grid-beta";
const primaryRelease = releaseGroups.releaseLines[primaryReleaseLine];

export const docsVersions: DocsVersion[] = [
  {
    id: "next",
    label: `Next (${primaryRelease.version} source)`,
    releaseLine: primaryReleaseLine,
    channel: "next",
    version: primaryRelease.version,
    path: "/",
  },
  {
    id: `v${primaryRelease.version}`,
    label: `${primaryRelease.version} (${primaryRelease.channel})`,
    releaseLine: primaryReleaseLine,
    channel: primaryRelease.channel,
    version: primaryRelease.version,
    path: `/versions/v${primaryRelease.version}/`,
  },
];

export const defaultDocsFramework: DocsFrameworkId = "react";

export function getFramework(frameworkId: string | null | undefined) {
  return (
    docsFrameworks.find((framework) => framework.id === frameworkId) ??
    docsFrameworks.find((framework) => framework.id === defaultDocsFramework) ??
    docsFrameworks[0]
  );
}

export function getDocsVersion(versionId: string | null | undefined) {
  return (
    docsVersions.find((version) => version.id === versionId) ?? docsVersions[0]
  );
}

export function getCurrentDocsVersionId() {
  const configuredVersion = import.meta.env.VITE_DOCS_VERSION_ID as
    string | undefined;
  return configuredVersion ?? "next";
}

export function getRepositoryPagesRoot() {
  const configuredRoot = import.meta.env.VITE_DOCS_ROOT_PATH as
    string | undefined;
  if (configuredRoot) {
    return configuredRoot.endsWith("/") ? configuredRoot : `${configuredRoot}/`;
  }

  const base = import.meta.env.BASE_URL || "/";
  const versionsMarker = "/versions/";
  const markerIndex = base.indexOf(versionsMarker);
  return markerIndex >= 0 ? base.slice(0, markerIndex + 1) : base;
}

export function getVersionHref(
  version: DocsVersion,
  frameworkId: DocsFrameworkId,
) {
  const root = getRepositoryPagesRoot();
  const versionPath =
    version.id === "next" ? "" : version.path.replace(/^\//, "");
  const query = new URLSearchParams({ framework: frameworkId });
  return `${root}${versionPath}?${query.toString()}${window.location.hash}`;
}

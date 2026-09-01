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
  tag?: string;
  legacy?: boolean;
};

export type ReleaseLineVersion = {
  id: string;
  channel: string;
  version: string;
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

type DocsVersionManifest = {
  schemaVersion: number;
  releases: Array<{
    id: string;
    releaseLine: string;
    version: string;
    channel: string;
    tag: string;
    path: string;
    legacy?: boolean;
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

export const releaseLineVersions: ReleaseLineVersion[] = Object.entries(
  releaseGroups.releaseLines,
).map(([id, releaseLine]) => ({
  id,
  channel: releaseLine.channel,
  version: releaseLine.version,
}));

const primaryReleaseLine =
  releaseLineVersions.find((releaseLine) => releaseLine.id.startsWith("non-grid")) ??
  releaseLineVersions[0];

if (!primaryReleaseLine) {
  throw new Error("VyrnForge docs require at least one release line.");
}

function versionLabel(version: Omit<DocsVersion, "label">) {
  return `${version.releaseLine} · ${version.version} (${version.channel}${version.legacy ? ", legacy tag" : ""})`;
}

const nextDocsVersion: DocsVersion = {
  id: "next",
  label: `Next · ${releaseLineVersions
    .map((releaseLine) => `${releaseLine.id} ${releaseLine.version}`)
    .join(" / ")}`,
  releaseLine: primaryReleaseLine.id,
  channel: "next",
  version: primaryReleaseLine.version,
  path: "/",
};

function configuredDocsVersion(): DocsVersion | null {
  const id = import.meta.env.VITE_DOCS_VERSION_ID as string | undefined;
  if (!id || id === "next") return null;

  const releaseLine =
    (import.meta.env.VITE_DOCS_RELEASE_LINE as string | undefined) ??
    primaryReleaseLine.id;
  const version =
    (import.meta.env.VITE_DOCS_RELEASE_VERSION as string | undefined) ??
    primaryReleaseLine.version;
  const channel =
    (import.meta.env.VITE_DOCS_RELEASE_CHANNEL as string | undefined) ??
    primaryReleaseLine.channel;
  const path = import.meta.env.BASE_URL || `/versions/${releaseLine}/v${version}/`;
  const configured = {
    id,
    releaseLine,
    channel,
    version,
    path,
  };

  return {
    ...configured,
    label: versionLabel(configured),
  };
}

const configuredVersion = configuredDocsVersion();

export const docsVersions: DocsVersion[] = [
  nextDocsVersion,
  ...(configuredVersion ? [configuredVersion] : []),
];

export const defaultDocsFramework: DocsFrameworkId = "react";

export function getFramework(frameworkId: string | null | undefined) {
  return (
    docsFrameworks.find((framework) => framework.id === frameworkId) ??
    docsFrameworks.find((framework) => framework.id === defaultDocsFramework) ??
    docsFrameworks[0]
  );
}

export function getDocsVersion(
  versionId: string | null | undefined,
  versions = docsVersions,
) {
  return (
    versions.find((version) => version.id === versionId) ??
    configuredVersion ??
    versions[0] ??
    nextDocsVersion
  );
}

export function getCurrentDocsVersionId() {
  const configuredVersionId = import.meta.env.VITE_DOCS_VERSION_ID as
    | string
    | undefined;
  return configuredVersionId ?? "next";
}

export function getRepositoryPagesRoot() {
  const configuredRoot = import.meta.env.VITE_DOCS_ROOT_PATH as
    | string
    | undefined;
  if (configuredRoot) {
    return configuredRoot.endsWith("/") ? configuredRoot : `${configuredRoot}/`;
  }

  const base = import.meta.env.BASE_URL || "/";
  const versionsMarker = "/versions/";
  const markerIndex = base.indexOf(versionsMarker);
  return markerIndex >= 0 ? base.slice(0, markerIndex + 1) : base;
}

export async function loadDocsVersions() {
  try {
    const response = await fetch(`${getRepositoryPagesRoot()}docs-versions.json`, {
      cache: "no-store",
    });
    if (!response.ok) return docsVersions;

    const manifest = (await response.json()) as DocsVersionManifest;
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.releases)) {
      return docsVersions;
    }

    const releases = manifest.releases.map((release) => ({
      ...release,
      label: versionLabel(release),
    }));
    const unique = new Map<string, DocsVersion>();
    for (const version of [nextDocsVersion, ...releases]) {
      unique.set(version.id, version);
    }
    return [...unique.values()];
  } catch {
    return docsVersions;
  }
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

import releaseGroupsRaw from "../../../docs/metadata/release-groups.json?raw";
import multiFrameworkRaw from "../../../docs/metadata/multi-framework.json?raw";
import referenceModelRaw from "../../../docs/generated/reference-model.json?raw";
import {
  getReferenceFramework,
  getReferenceLocationHref,
  parseReferenceModel,
  type ReferenceFrameworkId,
} from "../../../docs/reference/referenceRuntime";

export type DocsFrameworkId = ReferenceFrameworkId;
export type DocumentationReadinessStatus =
  | "stable"
  | "preview"
  | "maintenance"
  | "deprecated"
  | "unavailable"
  | "internal-not-ready";

export type DocsFramework = {
  id: DocsFrameworkId;
  label: string;
  language: string;
  renderer: string;
  supportLevel: string;
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
  frameworkReadiness: Record<DocsFrameworkId, DocumentationReadinessStatus>;
};

export type ReleaseLineVersion = {
  id: string;
  channel: string;
  version: string;
  frameworkReadiness: Record<
    DocsFrameworkId,
    DocumentationReadinessStatus
  >;
};

type ReleaseGroupsMetadata = {
  releaseLines: Record<
    string,
    {
      channel: string;
      version: string;
      documentation: {
        readiness: Record<
          DocsFrameworkId,
          DocumentationReadinessStatus
        >;
      };
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

type VersionCatalogEntry = {
  id: string;
  releaseLine: string;
  version: string;
  channel: string;
  docsPath: string;
  tag?: string;
  legacy?: boolean;
  frameworkReadiness: Record<DocsFrameworkId, DocumentationReadinessStatus>;
};

type DocsVersionManifest = {
  schemaVersion: number;
  current: VersionCatalogEntry;
  releases: VersionCatalogEntry[];
};

const releaseGroups = JSON.parse(releaseGroupsRaw) as ReleaseGroupsMetadata;
const multiFramework = JSON.parse(multiFrameworkRaw) as MultiFrameworkMetadata;

export const referenceModel = parseReferenceModel(referenceModelRaw);

export const docsFrameworks: DocsFramework[] = referenceModel.frameworks.map(
  (framework) => {
    const support = multiFramework.frameworks.find(
      (candidate) => candidate.id === framework.id,
    );

    if (!support) {
      throw new Error(
        `Missing framework support metadata for ${framework.id}.`,
      );
    }

    return {
      id: framework.id,
      label: framework.label,
      language: framework.language,
      renderer: support.renderer,
      supportLevel: support.supportLevel,
    };
  },
);

export const releaseLineVersions: ReleaseLineVersion[] = Object.entries(
  releaseGroups.releaseLines,
).map(([id, releaseLine]) => ({
  id,
  channel: releaseLine.channel,
  version: releaseLine.version,
  frameworkReadiness: releaseLine.documentation.readiness,
}));

const primaryReleaseLine =
  releaseLineVersions.find((releaseLine) =>
    releaseLine.id.startsWith("non-grid"),
  ) ?? releaseLineVersions[0];

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
  frameworkReadiness: primaryReleaseLine.frameworkReadiness,
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
  const path =
    import.meta.env.BASE_URL || `/versions/${releaseLine}/v${version}/`;
  const configuredReleaseLine = releaseLineVersions.find(
    (candidate) => candidate.id === releaseLine,
  );
  const configured = {
    id,
    releaseLine,
    channel,
    version,
    path,
    frameworkReadiness:
      configuredReleaseLine?.frameworkReadiness ??
      primaryReleaseLine.frameworkReadiness,
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

export const defaultDocsFramework = referenceModel.frameworkContext.default;

export function getFramework(frameworkId: string | null | undefined) {
  const framework = getReferenceFramework(referenceModel, frameworkId);
  return docsFrameworks.find((candidate) => candidate.id === framework.id)!;
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

export function getDocumentationReadiness(
  version: DocsVersion,
  frameworkId: DocsFrameworkId,
) {
  return version.frameworkReadiness[frameworkId] ?? "internal-not-ready";
}

export function isDocumentationReady(
  status: DocumentationReadinessStatus,
) {
  return status !== "unavailable" && status !== "internal-not-ready";
}

export function getDocsVersionsForFramework(
  frameworkId: DocsFrameworkId,
  versions = docsVersions,
) {
  return versions.filter((version) =>
    isDocumentationReady(getDocumentationReadiness(version, frameworkId)),
  );
}

export function getCurrentDocsVersionId() {
  const configuredVersionId = import.meta.env.VITE_DOCS_VERSION_ID as
    string | undefined;
  return configuredVersionId ?? "next";
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

export async function loadDocsVersions() {
  try {
    const response = await fetch(
      `${getRepositoryPagesRoot()}${referenceModel.versionContext.catalog}`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) return docsVersions;

    const manifest = (await response.json()) as DocsVersionManifest;
    if (
      manifest.schemaVersion !== 3 ||
      !manifest.current?.docsPath ||
      !Array.isArray(manifest.releases)
    ) {
      return docsVersions;
    }

    const entries = [manifest.current, ...manifest.releases].map((entry) => ({
      id: entry.id,
      releaseLine: entry.releaseLine,
      version: entry.version,
      channel: entry.channel,
      path: entry.docsPath,
      tag: entry.tag,
      legacy: entry.legacy,
      frameworkReadiness: entry.frameworkReadiness,
    }));
    const unique = new Map<string, DocsVersion>();
    for (const version of entries) {
      unique.set(version.id, {
        ...version,
        label:
          version.id === "next" ? nextDocsVersion.label : versionLabel(version),
      });
    }
    return [...unique.values()];
  } catch {
    return docsVersions;
  }
}

export function getVersionHref(
  version: DocsVersion,
  frameworkId: DocsFrameworkId,
  pathname: string,
  member: string | null,
) {
  const root = getRepositoryPagesRoot();
  const versionPath =
    version.id === "next" ? "" : version.path.replace(/^\//, "");
  const contextHref = getReferenceLocationHref(referenceModel, {
    frameworkId,
    pathname,
    member,
  });
  return `${root}${versionPath}${contextHref}`;
}

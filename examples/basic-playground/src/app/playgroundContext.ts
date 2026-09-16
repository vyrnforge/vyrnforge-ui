import multiFrameworkRaw from "../../../../docs/metadata/multi-framework.json?raw";
import referenceModelRaw from "../../../../docs/generated/reference-model.json?raw";
import {
  getReferenceFramework,
  parseReferenceModel,
  type ReferenceFrameworkId,
} from "../../../../docs/reference/referenceRuntime";

export type PlaygroundFrameworkId = ReferenceFrameworkId;

export type PlaygroundFramework = {
  id: PlaygroundFrameworkId;
  label: string;
  language: string;
  renderer: string;
  supportLevel: string;
};

export type PlaygroundVersion = {
  id: string;
  label: string;
  version: string;
  channel: string;
  playgroundPath: string;
};

type MultiFrameworkMetadata = {
  frameworks: Array<{
    id: PlaygroundFrameworkId;
    renderer: string;
    supportLevel: string;
  }>;
};

type VersionCatalogEntry = {
  id: string;
  version: string;
  channel: string;
  playgroundPath: string;
};

type VersionCatalog = {
  schemaVersion: number;
  current: VersionCatalogEntry;
  releases: VersionCatalogEntry[];
};

const multiFramework = JSON.parse(multiFrameworkRaw) as MultiFrameworkMetadata;

export const referenceModel = parseReferenceModel(referenceModelRaw);

export const playgroundFrameworks: PlaygroundFramework[] =
  referenceModel.frameworks.map((framework) => {
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
  });

export const defaultPlaygroundFramework =
  referenceModel.frameworkContext.default;

const configuredVersionId =
  import.meta.env.VITE_PLAYGROUND_VERSION_ID || "next";
const configuredReleaseVersion =
  import.meta.env.VITE_PLAYGROUND_RELEASE_VERSION || "Next";
const configuredReleaseChannel =
  import.meta.env.VITE_PLAYGROUND_RELEASE_CHANNEL || "next";

export const defaultPlaygroundVersion: PlaygroundVersion = {
  id: configuredVersionId,
  label:
    configuredVersionId === "next"
      ? "Next"
      : `${configuredReleaseVersion} · ${configuredReleaseChannel}`,
  version: configuredReleaseVersion,
  channel: configuredReleaseChannel,
  playgroundPath: import.meta.env.BASE_URL,
};

function versionLabel(entry: VersionCatalogEntry) {
  return entry.id === "next" ? "Next" : `${entry.version} · ${entry.channel}`;
}

export function getPlaygroundFramework(
  frameworkId: string | null | undefined,
) {
  const framework = getReferenceFramework(referenceModel, frameworkId);
  return playgroundFrameworks.find(
    (candidate) => candidate.id === framework.id,
  )!;
}

export async function loadPlaygroundVersions(): Promise<PlaygroundVersion[]> {
  const rootPath = import.meta.env.VITE_PLAYGROUND_ROOT_PATH;
  if (!rootPath) {
    return [defaultPlaygroundVersion];
  }

  const catalogUrl = `${rootPath.replace(/\/$/u, "")}/${referenceModel.versionContext.catalog}`;

  try {
    const response = await fetch(catalogUrl, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Version catalog returned ${response.status}.`);
    }

    const catalog = (await response.json()) as VersionCatalog;
    if (catalog.schemaVersion !== 2 || !catalog.current?.playgroundPath) {
      throw new Error("Unsupported VyrnForge version catalog.");
    }

    return [catalog.current, ...(catalog.releases ?? [])].map((entry) => ({
      ...entry,
      label: versionLabel(entry),
    }));
  } catch (error) {
    console.warn("Unable to load the VyrnForge version catalog.", error);
    return [defaultPlaygroundVersion];
  }
}

export function playgroundVersionHref(version: PlaygroundVersion) {
  const rootPath = import.meta.env.VITE_PLAYGROUND_ROOT_PATH;
  const relativePath = version.playgroundPath.startsWith("/")
    ? version.playgroundPath
    : `/${version.playgroundPath}`;
  const pathname = rootPath
    ? `${rootPath.replace(/\/$/u, "")}${relativePath}`
    : relativePath;
  const query = new URLSearchParams(window.location.search);

  return `${pathname}${query.size ? `?${query.toString()}` : ""}${window.location.hash}`;
}

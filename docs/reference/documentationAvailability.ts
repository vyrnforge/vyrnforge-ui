export type DocumentationReadinessStatus =
  | "stable"
  | "preview"
  | "maintenance"
  | "deprecated"
  | "unavailable"
  | "internal-not-ready";

export type FrameworkReadinessMap<FrameworkId extends string = string> = Record<
  FrameworkId,
  DocumentationReadinessStatus
>;

export type FrameworkVersionEntry<FrameworkId extends string = string> = {
  id: string;
  frameworkReadiness: FrameworkReadinessMap<FrameworkId>;
};

export function isDocumentationReadyStatus(
  status: DocumentationReadinessStatus,
) {
  return status !== "unavailable" && status !== "internal-not-ready";
}

export function getFrameworkReadiness<FrameworkId extends string>(
  version: FrameworkVersionEntry<FrameworkId>,
  frameworkId: FrameworkId,
) {
  return version.frameworkReadiness[frameworkId] ?? "internal-not-ready";
}

export function filterVersionsForFramework<FrameworkId extends string>(
  versions: FrameworkVersionEntry<FrameworkId>[],
  frameworkId: FrameworkId,
) {
  return versions.filter((version) =>
    isDocumentationReadyStatus(getFrameworkReadiness(version, frameworkId)),
  );
}

export function resolveFrameworkSwitch<FrameworkId extends string>(
  currentVersionId: string,
  targetFrameworkId: FrameworkId,
  versions: FrameworkVersionEntry<FrameworkId>[],
) {
  const currentVersion = versions.find(
    (version) => version.id === currentVersionId,
  );
  const status = currentVersion
    ? getFrameworkReadiness(currentVersion, targetFrameworkId)
    : "internal-not-ready";
  const alternatives = filterVersionsForFramework(
    versions,
    targetFrameworkId,
  ).map((version) => version.id);

  return {
    frameworkId: targetFrameworkId,
    versionId: currentVersionId,
    status,
    alternatives,
  };
}

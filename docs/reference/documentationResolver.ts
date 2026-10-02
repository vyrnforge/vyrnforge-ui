import {
  isDocumentationReadyStatus,
  type DocumentationReadinessStatus,
} from "./documentationAvailability";

export type DocumentationAvailability = {
  framework: string;
  releaseLine: string;
  version: string;
  status: DocumentationReadinessStatus;
};

export type DocumentationLayer = {
  title?: string;
  description?: string;
  sourcePath?: string;
  renderer?: string;
  exampleId?: string;
  tags?: string[];
};

export type ResolvableDocumentationPage = DocumentationLayer & {
  id: string;
  releaseLine: string;
  availability: DocumentationAvailability[];
  layers?: {
    frameworks?: Record<string, DocumentationLayer>;
    versions?: Record<string, DocumentationLayer>;
    frameworkVersions?: Record<string, DocumentationLayer>;
  };
  [key: string]: unknown;
};

export type DocumentationResolutionContext = {
  frameworkId: string;
  releaseLine: string;
  version: string;
  versionId?: string;
};

function matchingAvailability(
  page: ResolvableDocumentationPage,
  context: DocumentationResolutionContext,
) {
  const candidates = page.availability.filter(
    (entry) => entry.framework === context.frameworkId,
  );
  if (context.versionId === "next") {
    return candidates.find((entry) => entry.releaseLine === page.releaseLine);
  }
  return candidates.find(
    (entry) =>
      entry.releaseLine === context.releaseLine &&
      entry.version === context.version,
  );
}

export function resolveDocumentationPage(
  page: ResolvableDocumentationPage,
  context: DocumentationResolutionContext,
) {
  const availability = matchingAvailability(page, context);
  const alternatives = page.availability.filter((entry) =>
    isDocumentationReadyStatus(entry.status),
  );

  if (!availability || !isDocumentationReadyStatus(availability.status)) {
    return {
      kind: "unavailable" as const,
      documentId: page.id,
      status: availability?.status ?? ("unavailable" as const),
      alternatives,
    };
  }

  const frameworkLayer = page.layers?.frameworks?.[context.frameworkId] ?? {};
  const versionLayer =
    page.layers?.versions?.[context.version] ??
    page.layers?.versions?.[context.versionId ?? ""] ??
    {};
  const frameworkVersionLayer =
    page.layers?.frameworkVersions?.[
      `${context.frameworkId}@${context.version}`
    ] ??
    page.layers?.frameworkVersions?.[
      `${context.frameworkId}@${context.versionId ?? ""}`
    ] ??
    {};

  return {
    kind: "resolved" as const,
    availability,
    document: {
      ...page,
      ...frameworkLayer,
      ...versionLayer,
      ...frameworkVersionLayer,
      layers: page.layers,
    },
  };
}

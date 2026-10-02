import type { DocumentationReadinessStatus } from "./documentationAvailability";
import type { ReferenceFrameworkId } from "./referenceRuntime";

export type DocumentationContentLayer = {
  title?: string;
  description?: string;
  renderer?: string;
  sourcePath?: string;
  exampleId?: string;
  tags?: string[];
  lifecycle?: {
    introduced?: string;
    deprecated?: string;
    removed?: string;
  };
};

export type DocumentationContentLayers = {
  shared?: DocumentationContentLayer;
  frameworks?: Partial<Record<ReferenceFrameworkId, DocumentationContentLayer>>;
  versions?: Record<string, DocumentationContentLayer>;
  frameworkVersions?: Record<string, DocumentationContentLayer>;
};

export type DocumentationAvailabilityEntry = {
  framework: ReferenceFrameworkId;
  releaseLine: string;
  version: string;
  status: DocumentationReadinessStatus;
};

export type DocumentationRegistryDocument = {
  id: string;
  title: string;
  section: string;
  group: string;
  order: number;
  type: string;
  description?: string;
  renderer: string;
  sourcePath: string;
  exampleId?: string;
  tags?: string[];
  lifecycle?: {
    introduced?: string;
    deprecated?: string;
    removed?: string;
  };
  availability: DocumentationAvailabilityEntry[];
  contentLayers?: DocumentationContentLayers;
};

export type DocumentationResolutionContext = {
  frameworkId: ReferenceFrameworkId;
  version: string;
};

export type DocumentationAlternative = {
  frameworkId: ReferenceFrameworkId;
  version: string;
  releaseLine: string;
  status: DocumentationReadinessStatus;
};

export type ResolvedDocumentationDocument = Omit<
  DocumentationRegistryDocument,
  "availability" | "contentLayers"
> & {
  resolution: {
    frameworkId: ReferenceFrameworkId;
    version: string;
    status: DocumentationReadinessStatus;
    appliedLayers: Array<
      "base" | "shared" | "framework" | "version" | "framework-version"
    >;
  };
};

export type DocumentationResolution =
  | {
      available: true;
      status: DocumentationReadinessStatus;
      document: ResolvedDocumentationDocument;
      alternatives: DocumentationAlternative[];
    }
  | {
      available: false;
      status: DocumentationReadinessStatus;
      document: null;
      alternatives: DocumentationAlternative[];
    };

function isReady(status: DocumentationReadinessStatus) {
  return status !== "unavailable" && status !== "internal-not-ready";
}

function frameworkVersionKey(
  frameworkId: ReferenceFrameworkId,
  version: string,
) {
  return `${frameworkId}@${version}`;
}

function mergeLayer(
  document: ResolvedDocumentationDocument,
  layer: DocumentationContentLayer | undefined,
) {
  if (!layer) return document;

  const next = {
    ...document,
    ...layer,
    resolution: document.resolution,
  };

  if (layer.lifecycle) {
    next.lifecycle = {
      ...document.lifecycle,
      ...layer.lifecycle,
    };
  }

  return next;
}

export function resolveDocumentationDocument(
  page: DocumentationRegistryDocument,
  context: DocumentationResolutionContext,
): DocumentationResolution {
  const availability = page.availability.find(
    (entry) =>
      entry.framework === context.frameworkId &&
      entry.version === context.version,
  );
  const status = availability?.status ?? "internal-not-ready";
  const alternatives = page.availability
    .filter((entry) => isReady(entry.status))
    .map((entry) => ({
      frameworkId: entry.framework,
      version: entry.version,
      releaseLine: entry.releaseLine,
      status: entry.status,
    }));

  if (!isReady(status)) {
    return {
      available: false,
      status,
      document: null,
      alternatives,
    };
  }

  const layers = page.contentLayers;
  const frameworkLayer = layers?.frameworks?.[context.frameworkId];
  const versionLayer = layers?.versions?.[context.version];
  const frameworkVersionLayer =
    layers?.frameworkVersions?.[
      frameworkVersionKey(context.frameworkId, context.version)
    ];

  let document: ResolvedDocumentationDocument = {
    id: page.id,
    title: page.title,
    section: page.section,
    group: page.group,
    order: page.order,
    type: page.type,
    description: page.description,
    renderer: page.renderer,
    sourcePath: page.sourcePath,
    exampleId: page.exampleId,
    tags: page.tags,
    lifecycle: page.lifecycle,
    resolution: {
      frameworkId: context.frameworkId,
      version: context.version,
      status,
      appliedLayers: ["base"],
    },
  };

  const orderedLayers: Array<{
    id: "shared" | "framework" | "version" | "framework-version";
    value: DocumentationContentLayer | undefined;
  }> = [
    { id: "shared", value: layers?.shared },
    { id: "framework", value: frameworkLayer },
    { id: "version", value: versionLayer },
    { id: "framework-version", value: frameworkVersionLayer },
  ];

  for (const layer of orderedLayers) {
    if (!layer.value) continue;
    document = mergeLayer(document, layer.value);
    document.resolution.appliedLayers.push(layer.id);
  }

  return {
    available: true,
    status,
    document,
    alternatives,
  };
}

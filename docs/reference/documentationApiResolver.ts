export type DocumentationApiFrameworkId =
  | "native-html"
  | "react"
  | "angular"
  | "vue";

export type DocumentationApiSurfaceId =
  | "native"
  | "react"
  | "angular"
  | "vue";

export type DocumentationApiComponent = {
  id: string;
  [key: string]: unknown;
};

export type DocumentationApiReference = {
  generated: {
    editable: boolean;
    generator: string;
    sources: string[];
  };
  surfaces: Record<
    DocumentationApiSurfaceId,
    {
      package: string;
      components: DocumentationApiComponent[];
    }
  >;
};

export type DocumentationApiContext = {
  componentId: string;
  frameworkId: DocumentationApiFrameworkId;
  version: string;
};

export type DocumentationApiResolution =
  | {
      available: true;
      component: DocumentationApiComponent;
      context: DocumentationApiContext;
      surfaceId: DocumentationApiSurfaceId;
      package: string;
      provenance: {
        generator: string;
        sources: string[];
      };
    }
  | {
      available: false;
      component: null;
      context: DocumentationApiContext;
      surfaceId: DocumentationApiSurfaceId;
      package: string;
      provenance: {
        generator: string;
        sources: string[];
      };
    };

const apiSurfaceByFramework: Record<
  DocumentationApiFrameworkId,
  DocumentationApiSurfaceId
> = {
  "native-html": "native",
  react: "react",
  angular: "angular",
  vue: "vue",
};

export function resolveDocumentationApi(
  reference: DocumentationApiReference,
  context: DocumentationApiContext,
): DocumentationApiResolution {
  if (!context.version.trim()) {
    throw new Error("Documentation API resolution requires a concrete version.");
  }

  const surfaceId = apiSurfaceByFramework[context.frameworkId];
  const surface = reference.surfaces[surfaceId];
  if (!surface) {
    throw new Error(
      `Generated API reference is missing framework surface ${surfaceId}.`,
    );
  }

  const provenance = {
    generator: reference.generated.generator,
    sources: [...reference.generated.sources],
  };
  const component = surface.components.find(
    (candidate) => candidate.id === context.componentId,
  );

  if (!component) {
    return {
      available: false,
      component: null,
      context,
      surfaceId,
      package: surface.package,
      provenance,
    };
  }

  return {
    available: true,
    component,
    context,
    surfaceId,
    package: surface.package,
    provenance,
  };
}

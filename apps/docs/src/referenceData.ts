import consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";
import componentDocumentationRaw from "../../../docs/metadata/component-documentation.json?raw";
import packageMetadataRaw from "../../../docs/metadata/packages.json?raw";

export type ReferenceGuidance = {
  useWhen: string;
  avoidWhen: string;
  aiUsageNotes: string;
  relatedComponents: string[];
};

export type ReferenceContractType = {
  kind?: string;
  typeName?: string;
};

export type ReferenceContractProperty = {
  name: string;
  type?: ReferenceContractType | string;
  required?: boolean;
  default?: unknown;
};

export type ReferenceContract = {
  properties: ReferenceContractProperty[];
  attributes: unknown[];
  events: unknown[];
  slots: unknown[];
  methods: unknown[];
  accessibility: string[];
  formAssociation: string;
};

export type ReferenceFrameworkId = "native-html" | "react" | "angular" | "vue";

export type ReferenceFrameworkUsage = {
  label: string;
  status: string;
  package: string | null;
  setup: string;
  example: string;
  note: string;
};

export type ComponentReferenceRecord = {
  id: string;
  displayName: string;
  package: string;
  category: string;
  maturity: string;
  availability: string;
  purpose: string;
  guidance: ReferenceGuidance;
  accessibilityNotes: string;
  knownLimitations: string[];
  styling: {
    classes: string[];
    variables: string[];
  };
  docsPath: string | null;
  playgroundPath: string | null;
  nativeDeclaration: {
    name: string;
    tagName: string;
    description: string;
  } | null;
  contract: ReferenceContract | null;
  frameworks: Record<ReferenceFrameworkId, ReferenceFrameworkUsage>;
};

export type ComponentDocumentationControl = {
  property: string;
  label: string;
  kind: "select" | "boolean";
  values?: string[];
  publicType?: {
    name: string;
    path: string;
  };
};

export type ComponentDocumentationRecord = {
  id: string;
  specimen: {
    kind: "standalone" | "pattern" | "none";
    renderer?: string;
  };
  controls: ComponentDocumentationControl[];
  anatomy: string[];
};

type ComponentDocumentationMetadata = {
  schemaVersion: number;
  components: ComponentDocumentationRecord[];
};

type GeneratedPackageRecord = {
  name: string;
  purpose: string;
  status: string;
  releaseTrack: string | null;
  runtime: string | null;
  cssImport: string | null;
};

type ConsumerKnowledge = {
  packages: GeneratedPackageRecord[];
  patterns: Array<{
    id: string;
    displayName: string;
    components: string[];
    playgroundRoute?: string | null;
  }>;
  components: ComponentReferenceRecord[];
};

type CanonicalPackageRecord = {
  name: string;
  purpose: string;
  owns: string[];
  doesNotOwn: string[];
  cssImport: string;
  apiDoc: string;
  dependsOn: string[];
  mustNotDependOn: string[];
  status: string;
  publicEntryPoints: string[];
  notes: string;
  releaseTrack: string;
};

type PackageMetadata = {
  packages: CanonicalPackageRecord[];
  dependencyRules: string[];
};

export type PackageReferenceRecord = GeneratedPackageRecord &
  Pick<
    CanonicalPackageRecord,
    | "owns"
    | "doesNotOwn"
    | "apiDoc"
    | "dependsOn"
    | "mustNotDependOn"
    | "publicEntryPoints"
    | "notes"
  >;

const knowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
const componentDocumentation = JSON.parse(
  componentDocumentationRaw,
) as ComponentDocumentationMetadata;
const packageMetadata = JSON.parse(packageMetadataRaw) as PackageMetadata;
const canonicalPackageByName = new Map(
  packageMetadata.packages.map((entry) => [entry.name, entry]),
);
const documentationByComponentId = new Map(
  componentDocumentation.components.map((entry) => [entry.id, entry]),
);

export const componentReferenceRecords = knowledge.components;

for (const documentation of componentDocumentation.components) {
  const component = componentReferenceRecords.find(
    (entry) => entry.id === documentation.id,
  );
  if (!component) {
    throw new Error(
      `Component documentation metadata references unknown public component ${documentation.id}.`,
    );
  }
  const publicProperties = new Set(
    (component.contract?.properties ?? []).map((property) => property.name),
  );
  for (const control of documentation.controls) {
    if (!publicProperties.has(control.property)) {
      throw new Error(
        `${documentation.id}: documentation control ${control.property} is not present in the canonical public contract.`,
      );
    }
    if (
      control.kind === "select" &&
      ((control.values?.length ?? 0) === 0 || !control.publicType)
    ) {
      throw new Error(
        `${documentation.id}: select control ${control.property} requires verified public type values.`,
      );
    }
  }
}

export const packageReferenceRecords: PackageReferenceRecord[] =
  knowledge.packages.map((generated) => {
    const canonical = canonicalPackageByName.get(generated.name);
    if (!canonical) {
      throw new Error(
        `Generated package registry is missing canonical metadata for ${generated.name}.`,
      );
    }
    if (
      generated.purpose !== canonical.purpose ||
      generated.status !== canonical.status ||
      generated.releaseTrack !== canonical.releaseTrack ||
      generated.cssImport !== canonical.cssImport
    ) {
      throw new Error(
        `Generated package registry has drifted from canonical metadata for ${generated.name}.`,
      );
    }

    return {
      ...generated,
      owns: canonical.owns,
      doesNotOwn: canonical.doesNotOwn,
      apiDoc: canonical.apiDoc,
      dependsOn: canonical.dependsOn,
      mustNotDependOn: canonical.mustNotDependOn,
      publicEntryPoints: canonical.publicEntryPoints,
      notes: canonical.notes,
    };
  });

if (packageReferenceRecords.length !== packageMetadata.packages.length) {
  throw new Error(
    "Generated package registry does not cover every canonical VyrnForge package.",
  );
}

export const packageDependencyRules = packageMetadata.dependencyRules;

export function getComponentReferenceRecord(componentId: string) {
  return componentReferenceRecords.find(
    (component) => component.id === componentId,
  );
}

export function getComponentDocumentation(componentId: string) {
  return documentationByComponentId.get(componentId) ?? null;
}

export function getContractProperty(
  component: ComponentReferenceRecord,
  propertyName: string,
) {
  return component.contract?.properties.find(
    (property) => property.name === propertyName,
  );
}

export function getDocumentationControlValues(
  componentId: string,
  propertyName: string,
) {
  return (
    getComponentDocumentation(componentId)?.controls.find(
      (control) => control.property === propertyName,
    )?.values ?? []
  );
}

export function getContractEnumValues(
  component: ComponentReferenceRecord,
  propertyName: string,
) {
  return getDocumentationControlValues(component.id, propertyName);
}

export function getPackageReferenceRecord(packageName: string) {
  return packageReferenceRecords.find((entry) => entry.name === packageName);
}

export function getRelatedPatterns(componentId: string) {
  return knowledge.patterns.filter((pattern) =>
    pattern.components.includes(componentId),
  );
}

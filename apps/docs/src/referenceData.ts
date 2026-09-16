import consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";
import packageMetadataRaw from "../../../docs/metadata/packages.json?raw";

export type ReferenceGuidance = {
  useWhen: string;
  avoidWhen: string;
  aiUsageNotes: string;
  relatedComponents: string[];
};

export type ReferenceContract = {
  properties: string[];
  attributes: string[];
  events: string[];
  slots: string[];
  methods: string[];
  accessibility: string[];
  formAssociation: string;
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
const packageMetadata = JSON.parse(packageMetadataRaw) as PackageMetadata;
const canonicalPackageByName = new Map(
  packageMetadata.packages.map((entry) => [entry.name, entry]),
);

export const componentReferenceRecords = knowledge.components;

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
  return componentReferenceRecords.find((component) => component.id === componentId);
}

export function getPackageReferenceRecord(packageName: string) {
  return packageReferenceRecords.find((entry) => entry.name === packageName);
}

export function getRelatedPatterns(componentId: string) {
  return knowledge.patterns.filter((pattern) =>
    pattern.components.includes(componentId),
  );
}

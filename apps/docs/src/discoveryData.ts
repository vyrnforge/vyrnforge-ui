import designTokensRaw from "../../../docs/metadata/design-tokens.json?raw";
import patternsRaw from "../../../docs/metadata/patterns.json?raw";
import {
  componentReferenceRecords,
  packageReferenceRecords,
} from "./referenceData";

export type DesignTokenRecord = {
  name: string;
  purpose: string;
  themeScoped?: boolean;
};

export type DesignTokenCategory = {
  id: string;
  purpose: string;
  sourceFile: string;
  tokens: DesignTokenRecord[];
};

type DesignTokenMetadata = {
  schemaVersion: number;
  sourceOfTruth: {
    canonical: boolean;
    implementation: string;
    typedExport: string;
  };
  categories: DesignTokenCategory[];
};

export type PatternReferenceRecord = {
  id: string;
  displayName: string;
  category: string;
  purpose: string;
  useWhen: string;
  avoidWhen: string;
  components: string[];
  playgroundRoute: string;
  exampleFramework: string;
  frameworkNeutral: boolean;
  aiKeywords: string[];
};

type PatternMetadata = {
  schemaVersion: number;
  sourceOfTruth: {
    canonical: boolean;
    documentation: string;
  };
  patterns: PatternReferenceRecord[];
};

export type AccessibilityReferenceRecord = {
  id: string;
  displayName: string;
  package: string;
  notes: string;
  contract: string[];
  knownLimitations: string[];
};

const designTokens = JSON.parse(designTokensRaw) as DesignTokenMetadata;
const patterns = JSON.parse(patternsRaw) as PatternMetadata;

if (designTokens.schemaVersion !== 1 || !designTokens.sourceOfTruth.canonical) {
  throw new Error("Unsupported VyrnForge design-token discovery contract.");
}
if (patterns.schemaVersion !== 1 || !patterns.sourceOfTruth.canonical) {
  throw new Error("Unsupported VyrnForge pattern discovery contract.");
}

export const designTokenCategories = designTokens.categories;
export const designTokenSource = designTokens.sourceOfTruth;
export const patternReferenceRecords = patterns.patterns;
export const patternDocumentation = patterns.sourceOfTruth.documentation;

export const accessibilityReferenceRecords: AccessibilityReferenceRecord[] =
  componentReferenceRecords.map((component) => ({
    id: component.id,
    displayName: component.displayName,
    package: component.package,
    notes: component.accessibilityNotes,
    contract: component.contract?.accessibility ?? [],
    knownLimitations: component.knownLimitations,
  }));

export const discoveryPackages = packageReferenceRecords;
export const discoveryComponents = componentReferenceRecords;

export function getDesignTokenCategory(categoryId: string) {
  return designTokenCategories.find((category) => category.id === categoryId);
}

export function getPatternReferenceRecord(patternId: string) {
  return patternReferenceRecords.find((pattern) => pattern.id === patternId);
}

export function getAccessibilityReferenceRecord(componentId: string) {
  return accessibilityReferenceRecords.find((component) => component.id === componentId);
}

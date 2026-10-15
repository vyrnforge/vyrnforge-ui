import designTokensRaw from "../../../docs/generated/design-token-reference.json?raw";
import patternsRaw from "../../../docs/metadata/patterns.json?raw";

export type DesignTokenRecord = {
  name: string;
  purpose: string;
  themeScoped: boolean;
};

export type DesignTokenCategory = {
  id: string;
  task: string;
  sourceFile: string;
  purpose: string;
  tokens: DesignTokenRecord[];
};

type DesignTokenReference = {
  schemaVersion: number;
  sourceOfTruth: {
    canonical: false;
    generated: true;
    owner: "@vyrnforge/ui-core";
    authority: string;
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

const designTokens = JSON.parse(designTokensRaw) as DesignTokenReference;
const patterns = JSON.parse(patternsRaw) as PatternMetadata;

if (
  designTokens.schemaVersion !== 1 ||
  designTokens.sourceOfTruth.canonical ||
  !designTokens.sourceOfTruth.generated ||
  designTokens.sourceOfTruth.owner !== "@vyrnforge/ui-core"
) {
  throw new Error("Unsupported VyrnForge generated design-token reference.");
}
if (patterns.schemaVersion !== 1 || !patterns.sourceOfTruth.canonical) {
  throw new Error("Unsupported VyrnForge pattern discovery contract.");
}

export const designTokenCategories = designTokens.categories;
export const designTokenSource = designTokens.sourceOfTruth;
export const patternReferenceRecords = patterns.patterns;
export const patternDocumentation = patterns.sourceOfTruth.documentation;

export function getDesignTokenCategory(categoryId: string) {
  return designTokenCategories.find((category) => category.id === categoryId);
}

export function getPatternReferenceRecord(patternId: string) {
  return patternReferenceRecords.find((pattern) => pattern.id === patternId);
}

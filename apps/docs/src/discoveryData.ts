import {
  vyrnForgeDesignTokenCategories,
  vyrnForgeDesignTokenSource,
  type VyrnForgeDesignTokenCategory,
  type VyrnForgeDesignTokenRecord,
} from "@vyrnforge/ui-core";
import patternsRaw from "../../../docs/metadata/patterns.json?raw";

export type DesignTokenRecord = VyrnForgeDesignTokenRecord;
export type DesignTokenCategory = VyrnForgeDesignTokenCategory;

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

const patterns = JSON.parse(patternsRaw) as PatternMetadata;

if (patterns.schemaVersion !== 1 || !patterns.sourceOfTruth.canonical) {
  throw new Error("Unsupported VyrnForge pattern discovery contract.");
}

export const designTokenCategories = vyrnForgeDesignTokenCategories;
export const designTokenSource = vyrnForgeDesignTokenSource;
export const patternReferenceRecords = patterns.patterns;
export const patternDocumentation = patterns.sourceOfTruth.documentation;

export function getDesignTokenCategory(categoryId: string) {
  return designTokenCategories.find((category) => category.id === categoryId);
}

export function getPatternReferenceRecord(patternId: string) {
  return patternReferenceRecords.find((pattern) => pattern.id === patternId);
}

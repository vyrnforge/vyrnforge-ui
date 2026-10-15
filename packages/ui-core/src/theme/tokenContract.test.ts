import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  vyrnForgeCanonicalDensities,
  vyrnForgeCompatibilityAliases,
  vyrnForgeCompatibilitySourceTokens,
  vyrnForgeDesignTokenCategories,
  vyrnForgeLayerOrder,
  vyrnForgePrimitiveTokenGroups,
  vyrnForgeSemanticTokenGroups,
} from "../index";

function readStyle(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function extractCustomProperties(source: string) {
  return new Set(
    [...source.matchAll(/(--vf-[a-z0-9-]+)\s*:/gu)].map((match) => match[1]),
  );
}

describe("VyrnForge token contract", () => {
  it("accounts for every ui-core token declaration in the canonical registry", () => {
    const tokenCss = readStyle("../styles/tokens.css");
    const declarations = extractCustomProperties(tokenCss);
    const registered = new Set([
      ...Object.values(vyrnForgePrimitiveTokenGroups).flat(),
      ...vyrnForgeCompatibilitySourceTokens,
      ...Object.values(vyrnForgeSemanticTokenGroups).flat(),
      ...vyrnForgeCompatibilityAliases.map(({ name }) => name),
    ]);

    expect([...declarations].sort()).toEqual([...registered].sort());
  });

  it("derives reader categories from the semantic token groups", () => {
    expect(vyrnForgeDesignTokenCategories.map(({ id }) => id)).toEqual(
      Object.keys(vyrnForgeSemanticTokenGroups),
    );
    for (const category of vyrnForgeDesignTokenCategories) {
      expect(category.tokens.map(({ name }) => name)).toEqual([
        ...vyrnForgeSemanticTokenGroups[category.id],
      ]);
    }
  });

  it("keeps semantic token names unique across groups", () => {
    const tokens = Object.values(vyrnForgeSemanticTokenGroups).flat();

    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("keeps primitive token names unique across groups", () => {
    const tokens = Object.values(vyrnForgePrimitiveTokenGroups).flat();

    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("keeps layer levels unique and strictly increasing", () => {
    const levels = vyrnForgeLayerOrder.map(({ level }) => level);

    expect(new Set(levels).size).toBe(levels.length);
    expect(levels).toEqual([...levels].sort((left, right) => left - right));
  });

  it("supports canonical and compatibility density selectors", () => {
    const densityCss = readStyle("../styles/density.css");

    for (const density of vyrnForgeCanonicalDensities) {
      expect(densityCss).toContain(`[data-density="${density}"]`);
      expect(densityCss).toContain(`.vf-density-${density}`);
    }

    expect(densityCss).toContain('[data-density="standard"]');
    expect(densityCss).toContain('[data-density="comfortable"]');
  });

  it("defines automatic and explicit reduced-motion fallbacks", () => {
    const accessibilityCss = readStyle("../styles/accessibility.css");

    expect(accessibilityCss).toContain(
      "@media (prefers-reduced-motion: reduce)",
    );
    expect(accessibilityCss).toContain('[data-motion="reduced"]');
    expect(accessibilityCss).toContain(".vf-motion-reduced");
    expect(accessibilityCss).toContain("--vf-motion-duration-standard: 1ms");
  });
});

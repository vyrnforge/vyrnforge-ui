import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  vyrnForgeCanonicalDensities,
  vyrnForgeLayerOrder,
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

describe("VyrnForge semantic token contract", () => {
  it("declares every exported semantic token in ui-core CSS", () => {
    const source = [
      readStyle("../styles/tokens.css"),
      readStyle("../styles/themes.css"),
      readStyle("../styles/density.css"),
      readStyle("../styles/accessibility.css"),
    ].join("\n");
    const declarations = extractCustomProperties(source);

    for (const tokens of Object.values(vyrnForgeSemanticTokenGroups)) {
      for (const token of tokens) {
        expect(declarations.has(token), `${token} must be declared`).toBe(true);
      }
    }
  });

  it("keeps semantic token names unique across groups", () => {
    const tokens = Object.values(vyrnForgeSemanticTokenGroups).flat();

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

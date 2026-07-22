import { describe, expect, it } from "vitest";

import {
  createVyrnForgeTheme,
  getVyrnForgeThemePreset,
  mergeVyrnForgeTheme,
  normalizeVyrnForgeDensity,
  toVyrnForgeThemeStyle,
  vyrnForgeCanonicalDensities,
  vyrnForgeDarkTheme,
  vyrnForgeDensityAliases,
  vyrnForgeEnterpriseTheme,
  vyrnForgeLightTheme,
  vyrnForgeThemeColorTokens,
} from "../index";

describe("VyrnForge theme helpers", () => {
  it("creates an independent theme value", () => {
    const input = { "--vf-primary": "#123456" } as const;
    const theme = createVyrnForgeTheme(input);

    expect(theme).toEqual(input);
    expect(theme).not.toBe(input);
  });

  it("merges overrides without mutating the base theme", () => {
    const base = { "--vf-bg": "#ffffff", "--vf-primary": "#2563eb" } as const;
    const merged = mergeVyrnForgeTheme(base, {
      "--vf-primary": "#1d4ed8",
    });

    expect(merged).toEqual({
      "--vf-bg": "#ffffff",
      "--vf-primary": "#1d4ed8",
    });
    expect(base["--vf-primary"]).toBe("#2563eb");
    expect(mergeVyrnForgeTheme(base)).toEqual(base);
  });

  it("converts defined variables to a React-compatible style object", () => {
    expect(
      toVyrnForgeThemeStyle({
        "--vf-control-height": 36,
        "--vf-primary": "#2563eb",
        "--vf-surface": undefined,
      }),
    ).toEqual({
      "--vf-control-height": 36,
      "--vf-primary": "#2563eb",
    });
    expect(toVyrnForgeThemeStyle()).toBeUndefined();
  });

  it("resolves all named theme presets with light as the system fallback", () => {
    expect(getVyrnForgeThemePreset("dark")).toBe(vyrnForgeDarkTheme);
    expect(getVyrnForgeThemePreset("enterprise")).toBe(
      vyrnForgeEnterpriseTheme,
    );
    expect(getVyrnForgeThemePreset("light")).toBe(vyrnForgeLightTheme);
    expect(getVyrnForgeThemePreset("system")).toBe(vyrnForgeLightTheme);
  });

  it("keeps every theme preset complete for theme-scoped semantic roles", () => {
    for (const theme of [
      vyrnForgeLightTheme,
      vyrnForgeDarkTheme,
      vyrnForgeEnterpriseTheme,
    ]) {
      for (const token of vyrnForgeThemeColorTokens) {
        expect(
          theme[token],
          `${token} must exist in every theme preset`,
        ).toEqual(expect.any(String));
      }
    }
  });

  it("normalizes legacy density names to the canonical S3 contract", () => {
    expect(vyrnForgeCanonicalDensities).toEqual([
      "compact",
      "balanced",
      "spacious",
    ]);
    expect(vyrnForgeDensityAliases).toEqual({
      standard: "balanced",
      comfortable: "spacious",
    });
    expect(normalizeVyrnForgeDensity("compact")).toBe("compact");
    expect(normalizeVyrnForgeDensity("balanced")).toBe("balanced");
    expect(normalizeVyrnForgeDensity("spacious")).toBe("spacious");
    expect(normalizeVyrnForgeDensity("standard")).toBe("balanced");
    expect(normalizeVyrnForgeDensity("comfortable")).toBe("spacious");
  });
});
